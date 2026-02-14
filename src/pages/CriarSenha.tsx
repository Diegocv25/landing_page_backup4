import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Loader2, ArrowRight, Lock } from "lucide-react";

// Same URL as Planos.tsx
const SYSTEM_AUTH_URL = (import.meta.env.VITE_AUTH_BASE_URL || "").replace(/\/\/$/, "");

const schema = z
    .object({
        password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
        confirmPassword: z.string().min(1, "Confirme a senha"),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    });

type FormValues = z.infer<typeof schema>;

export default function CriarSenha() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session") || "";
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [status, setStatus] = useState<"loading" | "ready" | "error" | "success">("loading");

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    useEffect(() => {
        if (!sessionId) {
            setStatus("error");
            toast({ title: "Sessão inválida", variant: "destructive" });
            return;
        }

        const checkSession = async () => {
            try {
                const { data, error } = await supabase.functions.invoke("check-payment-status", {
                    body: { session_id: sessionId },
                });

                if (error || !data) {
                    setStatus("error");
                    return;
                }

                if ((data as any).status !== "paid" && (data as any).status !== "paid_waiting_account") {
                    toast({ title: "Pagamento não confirmado", variant: "destructive" });
                    setStatus("error");
                    return;
                }

                if ((data as any).created_user_at) {
                    // Already created
                    setStatus("success");
                    return;
                }

                setUserEmail((data as any).user_email || "");
                setStatus("ready");

            } catch (err) {
                console.error(err);
                setStatus("error");
            }
        };

        checkSession();
    }, [sessionId]);

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase.functions.invoke("create-account-after-payment", {
                body: {
                    session_id: sessionId,
                    password: values.password,
                    confirm_password: values.confirmPassword,
                },
            });

            if (error || !(data as any)?.success) {
                const msg = (data as any)?.error;
                if ((error as any)?.context?.status === 409 || msg?.includes("já possui conta")) {
                    toast({
                        title: "Conta já existente",
                        description: "Este email já possui cadastro. Redirecionando para login...",
                    });
                    setStatus("success"); // Treat as success to show login button
                    return;
                }

                toast({
                    title: "Erro ao criar conta",
                    description: msg || "Tente novamente.",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Conta criada com sucesso!",
                description: "Seu acesso foi liberado.",
            });
            setStatus("success");

        } catch (err) {
            toast({
                title: "Erro de conexão",
                description: "Verifique sua internet.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoToLogin = () => {
        try {
            if (window.top) {
                window.top.location.href = SYSTEM_AUTH_URL;
                return;
            }
        } catch { /* fallback */ }
        window.location.href = SYSTEM_AUTH_URL;
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader><CardTitle className="text-destructive">Erro</CardTitle></CardHeader>
                    <CardContent>
                        <p className="mb-4">Não foi possível carregar os dados da sessão.</p>
                        <Button variant="outline" onClick={() => navigate("/planos")}>Voltar</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                            <Lock className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-700">Acesso Liberado!</CardTitle>
                        <CardDescription>Sua conta foi configurada com sucesso.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleGoToLogin} size="lg" className="w-full">
                            Entrar no Sistema <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Criar sua senha</CardTitle>
                    <CardDescription>Defina uma senha segura para acessar o sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={userEmail} disabled className="bg-muted" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input id="password" type="password" {...form.register("password")} />
                            {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                            <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} />
                            {form.formState.errors.confirmPassword && <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ativar Acesso"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
