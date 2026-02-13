// Edge Function: verify-email-token
// Validates token and marks session as verified.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { token } = await req.json();

        if (!token) {
            return new Response(
                JSON.stringify({ success: false, error: "Token inválido" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const admin = createClient(supabaseUrl, serviceRoleKey);

        // Find session
        const { data: session, error: findError } = await admin
            .from("payment_sessions")
            .select("id, status, email_verified_at")
            .eq("verification_token", token)
            .maybeSingle();

        if (findError || !session) {
            return new Response(
                JSON.stringify({ success: false, error: "Token não encontrado ou expirado." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
            );
        }

        if (session.email_verified_at) {
            // Already verified, just return success
            return new Response(
                JSON.stringify({ success: true, session_id: session.id, message: "Email já verificado." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
            );
        }

        // Update session
        const { error: updateError } = await admin
            .from("payment_sessions")
            .update({
                email_verified_at: new Date().toISOString(),
                status: "pending_payment"
            })
            .eq("id", session.id);

        if (updateError) {
            console.error("Update error:", updateError);
            return new Response(
                JSON.stringify({ success: false, error: "Erro ao verificar email." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
            );
        }

        return new Response(
            JSON.stringify({ success: true, session_id: session.id }),
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
