import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { z } from "https://esm.sh/zod@3.25.76";

const schema = z.object({ token: z.string().min(10) });

function json(body: unknown, init: ResponseInit, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...(init.headers ?? {}) },
  });
}

function buildCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info, x-supabase-api-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const cors = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ success: false, error: "Método não permitido" }, { status: 405 }, cors);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ success: false, error: "Configuração ausente" }, { status: 500 }, cors);
  }
  const admin = createClient(supabaseUrl, serviceRoleKey);

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return json({ success: false, error: "Token inválido" }, { status: 400 }, cors);

    const tokenHash = await sha256Hex(parsed.data.token);

    const { data: row, error } = await admin
      .from("email_confirm_tokens")
      .select("user_id, expires_at, used_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (error || !row?.user_id) return json({ success: false, error: "Token inválido" }, { status: 400 }, cors);
    if (row.used_at) return json({ success: false, error: "Token já utilizado" }, { status: 400 }, cors);
    if (new Date(row.expires_at).getTime() < Date.now())
      return json({ success: false, error: "Token expirado" }, { status: 400 }, cors);

    const now = new Date();
    const trialFim = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // marca token como usado
    await admin.from("email_confirm_tokens").update({ used_at: now.toISOString() }).eq("token_hash", tokenHash);

    // ativa o trial no cadastro comercial
    await admin
      .from("cadastros_estabelecimento")
      .update({
        status: "trial",
        trial_inicio: now.toISOString(),
        trial_fim: trialFim.toISOString(),
        acesso_ate: trialFim.toISOString(),
      })
      .eq("user_id", row.user_id);

    return json({ success: true }, { status: 200 }, cors);
  } catch {
    return json({ success: false, error: "Erro interno" }, { status: 500 }, cors);
  }
});
