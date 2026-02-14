import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

const SYSTEM_AUTH_URL = (import.meta.env.VITE_AUTH_BASE_URL || "").replace(/\/\/$/, "");

type SessionStatus = "pending" | "paid" | "paid_waiting_account" | "failed" | "expired" | "unknown";

export default function PagamentoRetorno() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session") || "";

    const [status, setStatus] = useState<SessionStatus>("pending");
    const [planId, setPlanId] = useState<string>("");
    const [error, setError] = useState<string>("");

    const pollRef = useRef<number | null>(null);
    const mountedRef = useRef(true);
    const pollCountRef = useRef(0);

    useEffect(() => {
        mountedRef.current = true;

        if (!sessionId || sessionId.length < 10) {
            setError("Sessão de pagamento inválida.");
            setStatus("unknown");
            return;
        }

        const poll = async () => {
            try {
                const { data, error: fnErr } = await supabase.functions.invoke(
                    "check-payment-status",
                    { body: { session_id: sessionId } },
                );

                if (!mountedRef.current) return;

                if (fnErr) {
                    // keep polling — might be transient
                    pollCountRef.current += 1;
                    if (pollCountRef.current > 60) {
                        setStatus("unknown");
                        setError("Não foi possível verificar o pagamento. Tente novamente mais tarde.");
                        return;
                    }
                    schedulePoll();
                    return;
                }

                const s = (data as any)?.status as string | undefined;
                const pl = (data as any)?.plan_id as string | undefined;
                if (pl) setPlanId(pl);

                if (s === "paid" || s === "paid_waiting_account") {
                    const created = (data as any)?.created_user_at;
                    if (created) {
                        setStatus("paid");
                    } else {
                        setStatus("paid_waiting_account");
                    }
                    return; // stop polling
                }
                if (s === "failed" || s === "expired") {
                    setStatus(s as SessionStatus);
                    return; // stop polling
                }

                // still pending — poll again
                pollCountRef.current += 1;
                if (pollCountRef.current > 60) {
                    setStatus("unknown");
                    setError("O pagamento ainda não foi confirmado. Tente verificar mais tarde.");
                    return;
                }
                schedulePoll();
            } catch {
                if (!mountedRef.current) return;
                pollCountRef.current += 1;
                if (pollCountRef.current > 60) {
                    setStatus("unknown");
                    setError("Não foi possível verificar o pagamento.");
                    return;
                }
                schedulePoll();
            }
        };

        const schedulePoll = () => {
            pollRef.current = window.setTimeout(poll, 3000);
        };

        // Initial poll immediately
        poll();

        return () => {
            mountedRef.current = false;
            if (pollRef.current) clearTimeout(pollRef.current);
        };
    }, [sessionId]);

    const handleGoToSystem = () => {
        try {
            if (window.top) {
                window.top.location.href = SYSTEM_AUTH_URL;
                return;
            }
        } catch { /* fallback */ }
        window.open(SYSTEM_AUTH_URL, "_blank");
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Status do Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6 py-8">
                    {/* Pending */}
                    {status === "pending" && (
                        <>
                            <Loader2 className="w-16 h-16 text-primary animate-spin" />
                            <div className="text-center space-y-2">
                                <p className="text-lg font-semibold">Aguardando confirmação do pagamento…</p>
                                <p className="text-sm text-muted-foreground">
                                    Não feche esta página. Verificaremos o status automaticamente.
                                </p>
                            </div>
                        </>
                    )}

                    {/* Paid Waiting Account */}
                    {status === "paid_waiting_account" && (
                        <>
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                            <div className="text-center space-y-2">
                                <p className="text-lg font-semibold text-green-600">Pagamento confirmado!</p>
                                <p className="text-sm text-muted-foreground">
                                    Para finalizar, defina sua senha de acesso.
                                </p>
                            </div>
                            <Button asChild size="lg" className="w-full max-w-xs text-base">
                                <Link to={`/criar-senha?session=${sessionId}`}>
                                    Criar minha senha
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                        </>
                    )}

                    {/* Paid */}
                    {status === "paid" && (
                        <>
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                            <div className="text-center space-y-2">
                                <p className="text-lg font-semibold text-green-600">Pagamento confirmado! ✅</p>
                                <p className="text-sm text-muted-foreground">
                                    Seu acesso ao{" "}
                                    <span className="font-medium">
                                        {planId === "pro_ia" ? "Plano PRO + IA" : "Plano Profissional"}
                                    </span>{" "}
                                    já está ativo.
                                </p>
                            </div>
                            <Button onClick={handleGoToSystem} size="lg" className="w-full max-w-xs text-base">
                                Ir para o sistema
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </>
                    )}

                    {/* Failed / Expired */}
                    {(status === "failed" || status === "expired") && (
                        <>
                            <XCircle className="w-16 h-16 text-destructive" />
                            <div className="text-center space-y-2">
                                <p className="text-lg font-semibold text-destructive">
                                    {status === "expired" ? "Pagamento expirado" : "Pagamento não concluído"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Não identificamos o pagamento. Tente novamente.
                                </p>
                            </div>
                            <Button asChild variant="outline" size="lg" className="w-full max-w-xs">
                                <Link to="/planos">Tentar novamente</Link>
                            </Button>
                        </>
                    )}

                    {/* Unknown / Error */}
                    {status === "unknown" && (
                        <>
                            <XCircle className="w-16 h-16 text-muted-foreground" />
                            <div className="text-center space-y-2">
                                <p className="text-lg font-semibold">{error || "Erro desconhecido"}</p>
                                <p className="text-sm text-muted-foreground">
                                    Verifique seu email ou entre em contato conosco.
                                </p>
                            </div>
                            <Button asChild variant="outline" size="lg" className="w-full max-w-xs">
                                <Link to="/planos">Voltar aos planos</Link>
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
