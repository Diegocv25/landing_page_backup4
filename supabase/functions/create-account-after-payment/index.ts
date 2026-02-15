// Edge Function: create-account-after-payment
// Public endpoint.
// Creates Auth User and resources after payment is confirmed.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const schema = z.object({
    session_id: z.string().uuid(),
    password: z.string().min(8).max(72),
    confirm_password: z.string().min(8).max(72),
}).refine((data) => data.password === data.confirm_password, {
    message: "As senhas não conferem",
    path: ["confirm_password"],
});

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const admin = createClient(supabaseUrl, serviceRoleKey);

        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        const resendFrom = Deno.env.get("RESEND_FROM");
        const resendReplyTo = Deno.env.get("RESEND_REPLY_TO");
        const resendTestTo = Deno.env.get("RESEND_TEST_TO");
        const authBaseUrl = (Deno.env.get("AUTH_BASE_URL") || "").replace(/\/+$/, "");
        let emailSendResult: any = null;

        const body = await req.json();
        const parsed = schema.safeParse(body);

        if (!parsed.success) {
            return new Response(
                JSON.stringify({ success: false, error: parsed.error.issues[0].message }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
        }

        const { session_id, password } = parsed.data;

        // 1) Fetch Session
        const { data: session, error: sessErr } = await admin
            .from("payment_sessions")
            .select("*")
            .eq("id", session_id)
            .single();

        if (sessErr || !session) {
            return new Response(
                JSON.stringify({ success: false, error: "Sessão não encontrada." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
            );
        }

        // 2) Verify Payment Status
        if (session.status !== "paid" && session.status !== "paid_waiting_account") {
            return new Response(
                JSON.stringify({ success: false, error: "Pagamento não confirmado ainda." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
        }

        // 3) Idempotency: User already created for this session?
        if (session.created_user_at) {
            return new Response(
                JSON.stringify({ success: false, error: "Conta já foi criada para este pagamento." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
        }

        // 4) Create Auth User
        const { data: created, error: createErr } = await admin.auth.admin.createUser({
            email: session.user_email,
            password: password,
            email_confirm: true, // Already verified via token
            user_metadata: {
                nome: session.nome_proprietario
            }
        });

        if (createErr) {
            const msg = createErr.message.toLowerCase();
            if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
                return new Response(
                    JSON.stringify({ success: false, error: "Este email já possui conta. Por favor, faça login." }),
                    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
                );
            }
            console.error("Auth Create Error:", createErr);
            return new Response(
                JSON.stringify({ success: false, error: "Erro ao criar usuário." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
            );
        }

        const userId = created.user!.id;

        // 5) Create Resources (Salao, Roles, Cadastro)

        // Create Salao
        const salaoNome = session.nome_estabelecimento || "Meu Estabelecimento";
        const { data: newSalao, error: salaoErr } = await admin
            .from("saloes")
            .insert({
                nome: salaoNome,
                telefone: session.telefone,
                endereco: session.endereco,
                created_by_user_id: userId,
            })
            .select("id")
            .single();

        if (salaoErr) {
            console.error("Salao Create Error:", salaoErr);
            // Should we rollback user? ideally yes, but complex. 
            // For MVP, if this fails, user exists but no salao. Log error.
            // We can try to proceed or return error.
            return new Response(
                JSON.stringify({ success: false, error: "Conta criada, mas erro ao configurar estabelecimento. Contate suporte." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
            );
        }

        // Create User Role
        await admin.from("user_roles").upsert(
            { user_id: userId, role: "admin", salao_id: newSalao.id },
            { onConflict: "user_id,salao_id,role" }
        );

        // Upsert Cadastro
        const accessUntil = new Date();
        accessUntil.setDate(accessUntil.getDate() + 30);

        await admin.from("cadastros_estabelecimento").upsert(
            {
                user_id: userId,
                nome_estabelecimento: session.nome_estabelecimento,
                endereco: session.endereco,
                telefone: session.telefone,
                nome_proprietario: session.nome_proprietario,
                email: session.user_email,
                plano_atual: session.plan_id || "profissional",
                status: "active",
                acesso_ate: accessUntil.toISOString(),
            },
            { onConflict: "user_id" }
        );

        // 6) Update Session
        await admin
            .from("payment_sessions")
            .update({
                created_user_at: new Date().toISOString(),
                status: "paid" // Ensure it's marked as fully paid/complete
            })
            .eq("id", session_id);



        // 7) Send access email (best-effort)
        try {
            if (!resendApiKey || !resendFrom) {
                emailSendResult = { ok: false, skipped: true, reason: "missing_RESEND_API_KEY_or_RESEND_FROM" };
                console.warn("[email] RESEND_API_KEY/RESEND_FROM not set; skipping access email");
            } else if (!authBaseUrl) {
                emailSendResult = { ok: false, skipped: true, reason: "missing_AUTH_BASE_URL" };
                console.warn("[email] AUTH_BASE_URL not set; skipping access email");
            } else {
                const accessLink = `${authBaseUrl}/auth`;
                const toAddress = resendTestTo ? [resendTestTo] : [session.user_email];

                const publicSiteUrl = (Deno.env.get("PUBLIC_SITE_URL") || "").replace(/\/+$/, "");
                const logoUrl = publicSiteUrl ? `${publicSiteUrl}/nexus-logo.jpg` : null;

                const whatsapp = "5548991015688";
                const whatsappDisplay = "(48) 99101-5688";
                const brand = "Nexus Automações";

                const html = `
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
                    ${logoUrl ? `<img src="${logoUrl}" width="56" height="56" alt="${brand}" style="display:block;border-radius:10px;" />` : ""}
                    <div>
                      <div style="font-size:18px;line-height:22px;font-weight:700;">${brand}</div>
                      <div style="font-size:13px;line-height:18px;color:#b7c0d6;">Pagamento confirmado — acesso ao sistema</div>
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
            <strong>[TEST MODE]</strong> Destinatário original: ${session.user_email}
          </td>
        </tr>
        ` : ""}

        <tr>
          <td style="padding:26px 24px 8px 24px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
            <div style="font-size:22px;line-height:28px;font-weight:800;margin:0 0 10px 0;">Pagamento confirmado ✅</div>
            <div style="font-size:15px;line-height:22px;color:#374151;">Olá <strong>${session.nome_proprietario || ""}</strong>, seu pagamento foi confirmado e seu cadastro está ativo.</div>
          </td>
        </tr>

        <tr>
          <td style="padding:14px 24px;font-family:Arial,Helvetica,sans-serif;color:#374151;font-size:15px;line-height:22px;">
            Para acessar o sistema de gestão, use o link abaixo:
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:8px 24px 22px 24px;">
            <a href="${accessLink}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:14px 20px;border-radius:10px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;">
              Acessar o sistema
            </a>
          </td>
        </tr>

        <tr>
          <td style="padding:0 24px 18px 24px;font-family:Arial,Helvetica,sans-serif;font-size:12.5px;line-height:18px;color:#6b7280;">
            Ou copie o link:<br/>
            <a href="${accessLink}" style="color:#2563eb;word-break:break-all;">${accessLink}</a>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 24px;background:#f9fafb;font-family:Arial,Helvetica,sans-serif;font-size:12.5px;line-height:18px;color:#6b7280;">
            Dúvidas? WhatsApp:
            <a href="https://wa.me/${whatsapp}" style="color:#111827;font-weight:700;text-decoration:none;">${whatsappDisplay}</a>
            <br/>
            <span style="color:#9ca3af;">${brand}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
                `;

                const payload: any = {
                    from: resendFrom,
                    to: toAddress,
                    subject: "Seu acesso ao sistema — Nexus Automações",
                    html,
                };
                if (resendReplyTo) payload.reply_to = resendReplyTo;

                console.log("[email] sending", JSON.stringify({ to: toAddress, hasApiKey: Boolean(resendApiKey), hasFrom: Boolean(resendFrom), authBaseUrlSet: Boolean(authBaseUrl) }));

                const r = await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${resendApiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                const t = await r.text();
                let parsed: any = null;
                try { parsed = t ? JSON.parse(t) : null; } catch { parsed = t; }

                emailSendResult = { ok: r.ok, status: r.status, body: parsed };

                if (!r.ok) {
                    console.error("[email] Resend send failed", r.status, parsed);
                } else {
                    console.log("[email] Resend send ok", r.status);
                }
            }
        } catch (e) {
            emailSendResult = { ok: false, exception: String(e) };
            console.error("[email] send exception", e);
        }
        return new Response(
            JSON.stringify({ success: true, message: "Conta criada com sucesso!", ...(resendTestTo ? { email_send: emailSendResult } : {}) }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );

    } catch (err: any) {
        console.error("Internal Error:", err);
        return new Response(
            JSON.stringify({ success: false, error: "Erro interno do servidor" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});
