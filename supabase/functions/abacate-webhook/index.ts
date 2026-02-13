// Edge Function: abacate-webhook
// Public endpoint (verify_jwt=false). Receives AbacatePay webhook events.
// On billing.paid: marks session as paid_waiting_account.

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
        return json({ error: "Method not allowed" }, { status: 405 }, cors);
    }

    try {
        // 1) Validate webhook secret via query param
        const url = new URL(req.url);
        const secretParam = url.searchParams.get("webhookSecret");
        const expectedSecret = Deno.env.get("ABACATEPAY_WEBHOOK_SECRET");

        if (!expectedSecret || secretParam !== expectedSecret) {
            return json({ error: "Unauthorized" }, { status: 401 }, cors);
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (!supabaseUrl || !serviceRoleKey) {
            return json({ error: "Server config missing" }, { status: 500 }, cors);
        }

        const admin = createClient(supabaseUrl, serviceRoleKey);
        const event = await req.json();

        // 2) Only handle billing.paid
        if (event?.event !== "billing.paid") {
            return json({ received: true, ignored: true }, { status: 200 }, cors);
        }

        // 3) Extract billing id — supports billing.id OR pixQrCode.id
        const billId = event?.data?.billing?.id || event?.data?.pixQrCode?.id;

        if (!billId) {
            return json({ received: true, no_bill: true }, { status: 200 }, cors);
        }

        // 4) Find payment_sessions by provider_bill_id
        const { data: session, error: findErr } = await admin
            .from("payment_sessions")
            .select("*")
            .eq("provider_bill_id", billId)
            .maybeSingle();

        if (findErr || !session) {
            return json({ received: true, unknown_bill: true }, { status: 200 }, cors);
        }

        // 5) Idempotency: already paid or processed
        if (session.status === "paid" || session.status === "paid_waiting_account") {
            return json({ received: true, already_paid: true }, { status: 200 }, cors);
        }

        // 6) Mark session as paid_waiting_account
        const now = new Date();
        await admin
            .from("payment_sessions")
            .update({
                status: "paid_waiting_account",
                paid_at: now.toISOString()
            })
            .eq("id", session.id);

        return json({ received: true, status_updated: true }, { status: 200 }, cors);

    } catch (e) {
        console.error("Webhook error:", e);
        return json({ error: "Internal error" }, { status: 500 }, buildCorsHeaders(req));
    }
});
