// Edge Function: create-abacate-checkout
// Mantida por compatibilidade de nome.
// Agora retorna checkout da Kiwify conforme plano da sessão verificada.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const schema = z.object({
  session_id: z.string().uuid(),
});

const KIWIFY_CHECKOUTS = {
  profissional: "https://pay.kiwify.com.br/H5429N1",
  pro_ia: "https://pay.kiwify.com.br/Bru2N8Q",
} as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ success: false, error: "ID da sessão inválido" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    const { session_id } = parsed.data;

    const { data: session, error: sessErr } = await admin
      .from("payment_sessions")
      .select("id, plan_id, status, email_verified_at, provider_checkout_url")
      .eq("id", session_id)
      .single();

    if (sessErr || !session) {
      return new Response(
        JSON.stringify({ success: false, error: "Sessão não encontrada." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 },
      );
    }

    if (!session.email_verified_at) {
      return new Response(
        JSON.stringify({ success: false, error: "Email não verificado. Verifique seu email antes de pagar." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 },
      );
    }

    if (session.provider_checkout_url && session.status !== "paid" && session.status !== "canceled") {
      return new Response(
        JSON.stringify({ success: true, checkout_url: session.provider_checkout_url, session_id: session.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    const planId = session.plan_id === "pro_ia" ? "pro_ia" : "profissional";
    const checkoutUrl = KIWIFY_CHECKOUTS[planId];

    await admin
      .from("payment_sessions")
      .update({
        provider: "kiwify",
        provider_checkout_url: checkoutUrl,
      })
      .eq("id", session_id);

    return new Response(
      JSON.stringify({ success: true, checkout_url: checkoutUrl, session_id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    console.error("Internal Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno do servidor" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
