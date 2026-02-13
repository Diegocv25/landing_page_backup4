import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function VerificarEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Prevent double verification in Strict Mode
    const didVerify = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            return;
        }

        if (didVerify.current) return;
        didVerify.current = true;

        const verify = async () => {
            try {
                const { data, error } = await supabase.functions.invoke("verify-email-token", {
                    body: { token },
                });

                if (error || !(data as any)?.success) {
                    console.error("Verification error:", error || data);
                    setStatus("error");
                    return;
                }

                setSessionId((data as any).session_id);
                setStatus("success");
            } catch (err) {
                console.error("Verification exception:", err);
                setStatus("error");
            }
        };

        verify();
    }, [token]);

    const handleGoToPayment = async () => {
        if (!sessionId) return;
        setIsRedirecting(true);

        try {
            const { data, error } = await supabase.functions.invoke("create-abacate-checkout", {
                body: { session_id: sessionId },
            });

            if (error || !(data as any)?.success) {
                toast({
                    title: "Erro ao gerar pagamento",
                    description: (data as any)?.error || "Tente novamente.",
                    variant: "destructive",
                });
                setIsRedirecting(false);
                return;
            }

            const checkoutUrl = (data as any)?.checkout_url;
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                toast({
                    title: "Erro inesperado",
                    description: "Link de pagamento não recebido.",
                    variant: "destructive",
                });
                setIsRedirecting(false);
            }

        } catch (err) {
            toast({
                title: "Erro de conexão",
                description: "Verifique sua internet.",
                variant: "destructive",
            });
            setIsRedirecting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Verificação de Email</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6 py-8">
                    {status === "loading" && (
                        <>
                            <Loader2 className="w-16 h-16 text-primary animate-spin" />
                            <p className="text-lg font-medium">Verificando seu email...</p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                            <div className="text-center space-y-2">
                                <p className="text-lg font-semibold text-green-600">Email verificado com sucesso!</p>
                                <p className="text-sm text-muted-foreground">
                                    Agora você pode prosseguir para o pagamento seguro.
                                </p>
                            </div>
                            <Button
                                onClick={handleGoToPayment}
                                disabled={isRedirecting}
                                size="lg"
                                className="w-full max-w-xs text-base"
                            >
                                {isRedirecting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Iniciando Pagamento...
                                    </>
                                ) : (
                                    <>
                                        Ir para Pagamento
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <XCircle className="w-16 h-16 text-destructive" />
                            <div className="text-center space-y-2">
                                <p className="text-lg font-semibold text-destructive">Falha na verificação</p>
                                <p className="text-sm text-muted-foreground">
                                    O link pode ter expirado ou é inválido.
                                </p>
                            </div>
                            <Button variant="outline" onClick={() => navigate("/planos")}>
                                Voltar para Planos
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
