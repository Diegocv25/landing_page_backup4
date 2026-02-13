// Edge Function: check-payment-status
// Public endpoint (verify_jwt=false). Frontend polls this to show payment status.
// Returns status + paid_at + created_user_at.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

function json(body: unknown, init: ResponseInit, cors: Record<string, string>) {
    return new Response(JSON.stringify(body), {
        ...init,
        headers: { "Content-Type": "application/json", ...cors, ...(init.headers ?? {}) },
    });
}

function buildCorsHeaders(req: Request) {
    const origin = req.headers.get("origin") ?? "*";
    return {
        "Access-Control-Allow-Origin": origin,
        Vary: "Origin",
        "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    };
}

Deno.serve(async (req) => {
    const cors = buildCorsHeaders(req);
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") {
        return json({ error: "Método não permitido" }, { status: 405 }, cors);
    }

    try {
        const body = await req.json();
        const sessionId = body?.session_id as string | undefined;

        if (!sessionId || typeof sessionId !== "string" || sessionId.length < 10) {
            return json({ error: "session_id inválido" }, { status: 400 }, cors);
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (!supabaseUrl || !serviceRoleKey) {
            return json({ error: "Configuração ausente" }, { status: 500 }, cors);
        }

        const admin = createClient(supabaseUrl, serviceRoleKey);

        const { data: session, error } = await admin
            .from("payment_sessions")
            .select("status, paid_at, plan_id, created_user_at, user_email")
            .eq("id", sessionId)
            .maybeSingle();

        if (error || !session) {
            return json({ error: "Sessão não encontrada" }, { status: 404 }, cors);
        }

        return json(
            {
                status: session.status,
                paid_at: session.paid_at,
                plan_id: session.plan_id,
                created_user_at: session.created_user_at,
                user_email: session.user_email,
            },
            { status: 200 },
            cors,
        );
    } catch {
        return json({ error: "Erro interno" }, { status: 500 }, buildCorsHeaders(req));
    }
});
