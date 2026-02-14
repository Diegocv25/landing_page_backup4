// Edge Function: create-abacate-checkout
// Public endpoint (verify_jwt=false).
// Creates AbacatePay billing for an existing, verified payment_session.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const schema = z.object({
    session_id: z.string().uuid(),
});

function normalizePhoneBR(raw: string) {
  const digits = (raw || "").replace(/\D/g, "");
  // Expect BR local digits: 10 (landline) or 11 (mobile)
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return (raw || "").trim() || digits;
}

function normalizeTaxId(raw: string) {
  return (raw || "").replace(/\D/g, "");
}

function isValidCPF(d: string) {
  // d: 11 digits
  if (!/^\d{11}$/.test(d)) return false;
  if (/^(\d){10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10) r = 0;
  if (r !== parseInt(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10) r = 0;
  return r === parseInt(d[10]);
}

function isValidCNPJ(d: string) {
  // d: 14 digits
  if (!/^\d{14}$/.test(d)) return false;
  if (/^(\d){13}$/.test(d)) return false;
  const calc = (base: string) => {
    const weights = base.length === 12
      ? [5,4,3,2,9,8,7,6,5,4,3,2]
      : [6,5,4,3,2,9,8,7,6,5,4,3,2];
    let sum = 0;
    for (let i = 0; i < weights.length; i++) sum += parseInt(base[i]) * weights[i];
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };
  const d1 = calc(d.slice(0, 12));
  if (d1 !== parseInt(d[12])) return false;
  const d2 = calc(d.slice(0, 13));
  return d2 === parseInt(d[13]);
}

function isValidTaxIdDigits(d: string) {
  return d.length === 11 || d.length === 14; // CPF(11) or CNPJ(14)
}

function formatTaxIdBR(raw: string) {
  const d = normalizeTaxId(raw);
  if (d.length === 11) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length === 14) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  return (raw || "").trim() || d;
}

function redacted(obj: any) {
  try {
    const clone = JSON.parse(JSON.stringify(obj ?? {}));
    // redact any obvious secrets
    if (clone?.Authorization) clone.Authorization = "[REDACTED]";
    if (clone?.apikey) clone.apikey = "[REDACTED]";
    if (clone?.serviceRoleKey) clone.serviceRoleKey = "[REDACTED]";
    return clone;
  } catch {
    return { note: "[unserializable]" };
  }
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const abacateApiKey = Deno.env.get("ABACATEPAY_API_KEY");

        if (!abacateApiKey) {
            throw new Error("ABACATEPAY_API_KEY missing");
        }

        const admin = createClient(supabaseUrl, serviceRoleKey);
        const body = await req.json();
        const parsed = schema.safeParse(body);

        if (!parsed.success) {
            return new Response(
                JSON.stringify({ success: false, error: "ID da sessão inválido" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
        }

        const { session_id } = parsed.data;

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

        // 2) Verify Email Status
        if (!session.email_verified_at) {
            return new Response(
                JSON.stringify({ success: false, error: "Email não verificado. Por favor, verifique seu email antes de pagar." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
            );
        }

        // 3) Idempotency Check
        if (session.provider_checkout_url && session.status !== "paid" && session.status !== "canceled") {
            return new Response(
                JSON.stringify({
                    success: true,
                    checkout_url: session.provider_checkout_url,
                    session_id: session.id
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
            );
        }

        // 4) Prepare Abacate Payload
        // Determine info source
        const planName = session.plan_id === "pro_ia" ? "Plano PRO + IA" : "Plano Profissional";
        const amount = session.amount_cents;

        const customerName = (session.nome_proprietario ?? '').trim();
        const customerEmail = (session.user_email ?? '').trim();
        const customerPhone = normalizePhoneBR(session.telefone ?? '');
        const customerTaxIdDigits = normalizeTaxId(session.tax_id ?? '');
        const customerTaxId = formatTaxIdBR(session.tax_id ?? '');

        if (!customerName || !customerEmail) {
            return new Response(
                JSON.stringify({ success: false, error: 'Dados do cliente incompletos (nome/email).' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
        }
        if (!customerPhone || customerPhone.replace(/\D/g, "").length < 10) {
            return new Response(
                JSON.stringify({ success: false, error: 'Telefone inválido para cobrança.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
        }
        if (!customerTaxIdDigits || !isValidTaxIdDigits(customerTaxIdDigits) || (customerTaxIdDigits.length === 11 ? !isValidCPF(customerTaxIdDigits) : !isValidCNPJ(customerTaxIdDigits))) {
            return new Response(
                JSON.stringify({ success: false, error: 'CPF/CNPJ inválido para cobrança.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
        }

        const origin = req.headers.get("origin")
  || Deno.env.get("PAYMENT_RETURN_URL")
  || Deno.env.get("APP_BASE_URL")
  || Deno.env.get("LANDING_BASE_URL")
  || "http://localhost:8080";
        const returnUrl = `${origin}/pagamento/retorno`; // Redirect here after payment
        const completionUrl = `${origin}/pagamento/retorno?session=${session_id}`;

        const abacateBody = {
            frequency: "ONE_TIME",
            methods: ["PIX", "CARD"],
            products: [
                {
                    externalId: session_id,
                    name: planName,
                    description: `${planName} — 30 dias de acesso`,
                    quantity: 1,
                    price: amount,
                },
            ],
            returnUrl,
            completionUrl,
            customer: {
                name: customerName,
                email: customerEmail,
                cellphone: customerPhone,
                taxId: customerTaxId,
            },
            metadata: {
                session_id: session_id,
            },
        };

        // 5) Call AbacatePay
        console.log("[abacate] request", JSON.stringify({ endpoint: "https://api.abacatepay.com/v1/billing/create", returnUrl, completionUrl, hasApiKey: Boolean(abacateApiKey), body: redacted(abacateBody) }));
        const abacateRes = await fetch("https://api.abacatepay.com/v1/billing/create", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${abacateApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(abacateBody),
        });

        if (!abacateRes.ok) {
            const errText = await abacateRes.text();
            console.error("AbacatePay Error:", abacateRes.status, errText);
            return new Response(
                JSON.stringify({ success: false, error: `Erro na AbacatePay: ${errText}` }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
            );
        }

        const abacateText = await abacateRes.text();
        let abacateData: any = null;
        try { abacateData = abacateText ? JSON.parse(abacateText) : null; } catch { /* keep as text */ }
        const billId = abacateData?.data?.id;
        const checkoutUrl = abacateData?.data?.url;

        if (abacateData && abacateData.success === false) {
            return new Response(
                JSON.stringify({ success: false, error: "Erro na AbacatePay", provider_status: abacateRes.status, provider_body: abacateData ?? abacateText }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
            );
        }

        if (!billId || !checkoutUrl) {
            return new Response(
                JSON.stringify({ success: false, error: "Resposta inesperada do provedor.", provider_status: abacateRes.status, provider_body: abacateData ?? abacateText }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
            );
        }

        // 6) Update Session
        await admin
            .from("payment_sessions")
            .update({
                provider_bill_id: billId,
                provider_checkout_url: checkoutUrl,
            })
            .eq("id", session_id);

        return new Response(
            JSON.stringify({
                success: true,
                checkout_url: checkoutUrl,
                session_id: session_id
            }),
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
