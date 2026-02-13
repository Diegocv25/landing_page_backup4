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
                subject: "Verifique seu email para continuar",
                html: `
          <div style="font-family: sans-serif; font-size: 16px; color: #333;">
            ${resendTestTo ? `<p style="background:#ffeb3b; padding:10px; font-weight:bold;">[TEST MODE] Original recipient: ${email}</p>` : ""}
            <h1>Confirme seu email</h1>
            <p>Olá <strong>${nome_proprietario}</strong>,</p>
            <p>Recebemos seu pedido de cadastro para o plano <strong>${plan_id === "pro_ia" ? "PRO + IA" : "Profissional"}</strong>.</p>
            <p>Para prosseguir com o pagamento, clique no botão abaixo:</p>
            <p>
              <a href="${verificationLink}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Confirmar Email e Continuar
              </a>
            </p>
            <p style="font-size: 14px; color: #666;">
              Ou copie este link: <br>
              <a href="${verificationLink}">${verificationLink}</a>
            </p>
          </div>
        `,
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
