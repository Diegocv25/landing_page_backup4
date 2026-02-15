// Edge Function: start-email-verification
// Receives signup data, creates pending payment_session, sends verification email.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const schema = z.object({
    nome_estabelecimento: z.string().trim().min(1).max(200),
    endereco: z.string().trim().min(1).max(500),
    telefone: z.string().trim().min(1).max(50),
    nome_proprietario: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(254),
    cpf: z.string().trim().min(11).max(20), // tax_id
    plan_id: z.enum(["profissional", "pro_ia"]),
});

Deno.serve(async (req) => {
    // 1. Handle CORS Preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 2. Validate Environment Variables
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        const publicSiteUrl = Deno.env.get("PUBLIC_SITE_URL");
        const resendFrom = Deno.env.get("RESEND_FROM");
        const resendReplyTo = Deno.env.get("RESEND_REPLY_TO");
        const resendTestTo = Deno.env.get("RESEND_TEST_TO");

        const missingVars = [];
        if (!supabaseUrl) missingVars.push("SUPABASE_URL");
        if (!serviceRoleKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");
        if (!resendApiKey) missingVars.push("RESEND_API_KEY");
        if (!publicSiteUrl) missingVars.push("PUBLIC_SITE_URL");
        if (!resendFrom) missingVars.push("RESEND_FROM");

        if (missingVars.length > 0) {
            console.error(`Missing required environment variables: ${missingVars.join(", ")}`);
            return new Response(
                JSON.stringify({ success: false, error: "Configuração do servidor incompleta." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
            );
        }

        const admin = createClient(supabaseUrl!, serviceRoleKey!);

        // 3. Parse and Validate Body
        const body = await req.json();
        const parsed = schema.safeParse(body);

        if (!parsed.success) {
            return new Response(
                JSON.stringify({ success: false, error: parsed.error.issues[0].message }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
        }

        const { email, cpf, nome_estabelecimento, endereco, telefone, nome_proprietario, plan_id } = parsed.data;

        // Generate Verification Token (UUID)
        const verification_token = crypto.randomUUID();

        // Prepare tax_id (digits only)
        const tax_id = cpf.replace(/\D/g, "");

        // 4. Insert into payment_sessions
        const { data: session, error: dbError } = await admin
            .from("payment_sessions")
            .insert({
                user_email: email,
                nome_estabelecimento,
                endereco,
                telefone,
                nome_proprietario,
                plan_id,
                amount_cents: plan_id === "pro_ia" ? 34700 : 19700,
                status: "pending_verification",
                verification_token,
                tax_id,
            })
            .select("id")
            .single();

        if (dbError) {
            console.error("DB Insert Error:", dbError);
            return new Response(
                JSON.stringify({ success: false, error: "Erro ao iniciar o cadastro. Tente novamente." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
            );
        }

        // 5. Construct Verification Link
        const baseUrl = publicSiteUrl!.replace(/\/$/, "");
        const verificationLink = `${baseUrl}/verificar-email?token=${verification_token}`;

        // 6. Send Email via Resend
        // If RESEND_TEST_TO is set, use it. Otherwise use the real user email.
        const toAddress = resendTestTo ? [resendTestTo] : [email];

        if (resendTestTo) {
            console.warn(`[TEST MODE] Sending email to RESEND_TEST_TO: ${resendTestTo} instead of ${email}`);
        }

        const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: resendFrom,
                ...(resendReplyTo ? { reply_to: resendReplyTo } : {}),
                to: toAddress,
                subject: "Confirme seu e-mail — Nexus Automações",
                html: (() => {
                    const logoUrl = `${baseUrl}/nexus-logo.jpg`;
                    const planName = plan_id === "pro_ia" ? "PRO + IA" : "Profissional";
                    const whatsapp = "5548991015688";
                    const whatsappDisplay = "(48) 99101-5688";

                    return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0;padding:0;background:#0b0f19;">
  <tr>
    <td align="center" style="padding:32px 12px;">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.25);">
        <tr>
          <td style="padding:22px 24px;background:#0b0f19;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
                  <div style="display:flex;align-items:center;gap:12px;">
                    <img src="${logoUrl}" width="56" height="56" alt="Nexus Automações" style="display:block;border-radius:10px;" />
                    <div>
                      <div style="font-size:18px;line-height:22px;font-weight:700;">Nexus Automações</div>
                      <div style="font-size:13px;line-height:18px;color:#b7c0d6;">Confirmação de e-mail</div>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${resendTestTo ? `
        <tr>
          <td style="padding:10px 24px;background:#fff8d6;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7a5b00;">
            <strong>[TEST MODE]</strong> Destinatário original: ${email}
          </td>
        </tr>
        ` : ""}

        <tr>
          <td style="padding:26px 24px 8px 24px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
            <div style="font-size:22px;line-height:28px;font-weight:800;margin:0 0 10px 0;">Confirme seu e-mail para continuar</div>
            <div style="font-size:15px;line-height:22px;color:#374151;">Olá <strong>${nome_proprietario}</strong>, recebemos seu cadastro para o plano <strong>${planName}</strong>.</div>
          </td>
        </tr>

        <tr>
          <td style="padding:14px 24px;font-family:Arial,Helvetica,sans-serif;color:#374151;font-size:15px;line-height:22px;">
            Para prosseguir com o pagamento, clique no botão abaixo:
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:8px 24px 22px 24px;">
            <a href="${verificationLink}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:14px 20px;border-radius:10px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;">
              Confirmar e continuar
            </a>
          </td>
        </tr>

        <tr>
          <td style="padding:0 24px 18px 24px;font-family:Arial,Helvetica,sans-serif;font-size:12.5px;line-height:18px;color:#6b7280;">
            Se o botão não funcionar, copie e cole este link no navegador:<br/>
            <a href="${verificationLink}" style="color:#2563eb;word-break:break-all;">${verificationLink}</a>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 24px;background:#f9fafb;font-family:Arial,Helvetica,sans-serif;font-size:12.5px;line-height:18px;color:#6b7280;">
            Precisa de ajuda? Fale com a gente no WhatsApp:
            <a href="https://wa.me/${whatsapp}" style="color:#111827;font-weight:700;text-decoration:none;">${whatsappDisplay}</a>
            <br/>
            <span style="color:#9ca3af;">Nexus Automações</span>
          </td>
        </tr>
      </table>

      <div style="max-width:600px;margin:10px auto 0 auto;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#94a3b8;">
        Se você não solicitou este cadastro, pode ignorar este e-mail.
      </div>
    </td>
  </tr>
</table>
                    `;
                })(),
            }),
        });

        if (!resendRes.ok) {
            const resendBody = await resendRes.text();
            console.error(`Resend API Error (${resendRes.status}):`, resendBody);

            return new Response(
                JSON.stringify({ success: false, error: "Falha ao enviar o email de verificação." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: "Email de verificação enviado." }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );

    } catch (err: any) {
        console.error("Internal Server Error:", err);
        return new Response(
            JSON.stringify({ success: false, error: "Erro interno do servidor." }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});
