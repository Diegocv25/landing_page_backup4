import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

import { Check, ArrowRight, Loader2, CreditCard, QrCode, Mail } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL?.replace(/\/+$/, "") ?? "";
const SYSTEM_AUTH_URL = AUTH_BASE.endsWith("/auth") ? AUTH_BASE : `${AUTH_BASE}/auth`;

const PLANS = {
    profissional: {
        id: "profissional",
        name: "Profissional",
        price: "197",
        priceCents: 19700,
        description: "Sistema completo de gestão para o seu negócio",
        features: [
            "Estabelecimento com gestão completa",
            "Profissionais ilimitados",
            "Agenda online 24/7",
            "CRM de clientes",
            "Gestão financeira",
            "Relatórios avançados",
            "5 níveis de acesso",
            "Suporte via WhatsApp",
        ],
    },
    pro_ia: {
        id: "pro_ia",
        name: "PRO + IA",
        price: "347",
        priceCents: 34700,
        description: "Tudo do Profissional + IA no WhatsApp",
        features: [
            "Tudo do plano Profissional",
            "🤖 IA Atendente no WhatsApp 24/7",
            "🤖 Respostas automáticas",
            "🤖 Lembretes automáticos",
            "🤖 Mensagens de retorno",
            "🤖 Aniversários automatizados",
            "🤖 Promoções e eventos via WhatsApp",
        ],
    },
} as const;

type PlanId = keyof typeof PLANS;

function formatPhoneBR(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (!digits) return "";
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (rest.length <= 8) {
        const p1 = rest.slice(0, 4);
        const p2 = rest.slice(4, 8);
        return `(${ddd}) ${p1}${p2 ? `-${p2}` : ""}`;
    }
    const p1 = rest.slice(0, 5);
    const p2 = rest.slice(5, 9);
    return `(${ddd}) ${p1}${p2 ? `-${p2}` : ""}`;
}

function formatCpfCnpj(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    if (digits.length <= 11) {
        // CPF
        return digits
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    // CNPJ
    return digits
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
}

const schema = z
    .object({
        nome_estabelecimento: z.string().trim().min(1, "Informe o nome do estabelecimento").max(200),
        rua: z.string().trim().min(1, "Informe a rua").max(200),
        numero: z.string().trim().min(1, "Informe o número").max(30),
        bairro: z.string().trim().min(1, "Informe o bairro").max(120),
        cep: z
            .string()
            .trim()
            .min(1, "Informe o CEP")
            .refine((v) => v.replace(/\D/g, "").length === 8, "CEP inválido"),
        cidade: z.string().trim().min(1, "Informe a cidade").max(120),
        estado: z
            .string()
            .trim()
            .min(1, "Informe o estado")
            .transform((v) => v.toUpperCase())
            .refine((v) => /^[A-Z]{2}$/.test(v), "Use a sigla (ex.: SP)"),
        telefone: z
            .string()
            .trim()
            .min(1, "Informe o telefone")
            .refine((v) => v.replace(/\D/g, "").length >= 10, "Telefone inválido"),
        taxId: z
            .string()
            .trim()
            .min(1, "Informe CPF ou CNPJ")
            .refine((v) => {
                const d = v.replace(/\D/g, "");
                return d.length === 11 || d.length === 14;
            }, "CPF (11) ou CNPJ (14) inválido"),
        nome_proprietario: z.string().trim().min(1, "Informe o nome do proprietário").max(200),
        email: z.string().trim().email("Email inválido").max(254),
    });

type FormValues = z.infer<typeof schema>;

export default function Planos() {
    const [searchParams] = useSearchParams();
    const initialPlan = (searchParams.get("plan") as PlanId) || "profissional";

    const [selectedPlan, setSelectedPlan] = useState<PlanId>(
        initialPlan in PLANS ? initialPlan : "profissional",
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const plan = PLANS[selectedPlan];

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            nome_estabelecimento: "",
            rua: "",
            numero: "",
            bairro: "",
            cep: "",
            cidade: "",
            estado: "",
            telefone: "",
            taxId: "",
            nome_proprietario: "",
            email: "",
        },
        mode: "onTouched",
    });

    // ── CEP autofill (same logic as Cadastro) ──
    const lastCepRef = useRef("");
    const cepAbortRef = useRef<AbortController | null>(null);
    const [isCepLoading, setIsCepLoading] = useState(false);

    const cepValue = useWatch({ control: form.control, name: "cep" });
    const ruaValue = useWatch({ control: form.control, name: "rua" });
    const bairroValue = useWatch({ control: form.control, name: "bairro" });
    const cidadeValue = useWatch({ control: form.control, name: "cidade" });
    const estadoValue = useWatch({ control: form.control, name: "estado" });

    const cepRef = useRef("");
    const ruaRef = useRef("");
    const bairroRef = useRef("");
    const cidadeRef = useRef("");
    const estadoRef = useRef("");

    useEffect(() => { cepRef.current = cepValue ?? ""; }, [cepValue]);
    useEffect(() => { ruaRef.current = ruaValue ?? ""; }, [ruaValue]);
    useEffect(() => { bairroRef.current = bairroValue ?? ""; }, [bairroValue]);
    useEffect(() => { cidadeRef.current = cidadeValue ?? ""; }, [cidadeValue]);
    useEffect(() => { estadoRef.current = estadoValue ?? ""; }, [estadoValue]);

    useEffect(() => {
        const digits = (cepValue ?? "").replace(/\D/g, "");
        if (digits.length !== 8) {
            lastCepRef.current = "";
            if (cepAbortRef.current) cepAbortRef.current.abort();
            return;
        }
        const anyEmpty =
            !ruaRef.current.trim() ||
            !bairroRef.current.trim() ||
            !cidadeRef.current.trim() ||
            !estadoRef.current.trim();
        if (lastCepRef.current === digits && !anyEmpty) return;

        const timeout = window.setTimeout(async () => {
            try {
                setIsCepLoading(true);
                if (cepAbortRef.current) cepAbortRef.current.abort();
                const controller = new AbortController();
                cepAbortRef.current = controller;
                const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
                    signal: controller.signal,
                    headers: { Accept: "application/json" },
                });
                if (!res.ok) return;
                const data: any = await res.json();
                if (data?.erro) return;
                if (!ruaRef.current.trim() && data?.logradouro?.trim()) form.setValue("rua", data.logradouro.trim(), { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                if (!bairroRef.current.trim() && data?.bairro?.trim()) form.setValue("bairro", data.bairro.trim(), { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                if (!cidadeRef.current.trim() && data?.localidade?.trim()) form.setValue("cidade", data.localidade.trim(), { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                if (!estadoRef.current.trim() && data?.uf?.trim()) form.setValue("estado", data.uf.trim().toUpperCase(), { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                lastCepRef.current = digits;
            } catch { /* fallback silencioso */ } finally {
                setIsCepLoading(false);
            }
        }, 350);
        return () => window.clearTimeout(timeout);
    }, [cepValue, form, ruaValue, bairroValue, cidadeValue, estadoValue]);

    // ── Build endereco ──
    const buildEndereco = (v: FormValues) => {
        const cepD = v.cep.replace(/\D/g, "");
        const cepFmt = cepD.length === 8 ? `${cepD.slice(0, 5)}-${cepD.slice(5)}` : v.cep;
        return `Rua ${v.rua}, Nº ${v.numero} - ${v.bairro} - CEP ${cepFmt} - ${v.cidade}/${v.estado}`.trim().slice(0, 500);
    };

    // ── Submit ──
    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                nome_estabelecimento: values.nome_estabelecimento,
                endereco: buildEndereco(values),
                telefone: values.telefone,
                cpf: values.taxId,
                nome_proprietario: values.nome_proprietario,
                email: values.email,
                plan_id: selectedPlan,
            };

            const { data, error } = await supabase.functions.invoke("start-email-verification", {
                body: payload,
            });

            if (error) {
                const status = (error as any)?.context?.status as number | undefined;

                // Try to get error message from response body or error object
                let serverMsg = (data as any)?.error || (error as any)?.message;
                try {
                    // Check if message is JSON string
                    if (serverMsg && typeof serverMsg === 'string' && serverMsg.startsWith('{')) {
                        const parsed = JSON.parse(serverMsg);
                        if (parsed.error) serverMsg = parsed.error;
                    }
                } catch { /* ignore */ }

                if (status === 409) {
                    toast({
                        title: "Email já cadastrado",
                        description: serverMsg || "Este email já está cadastrado. Faça login.",
                        variant: "destructive",
                    });
                    return;
                }

                toast({
                    title: "Erro ao iniciar cadastro",
                    description: serverMsg || "Tente novamente.",
                    variant: "destructive",
                });
                return;
            }

            // Debug friendly: surface server response in toast when available
            const emailSend = (data as any)?.email_send;
            if (emailSend) {
                toast({
                    title: "Envio de e-mail (Resend)",
                    description: `ok=${emailSend.ok} status=${emailSend.status} to=${(emailSend.to || []).join(", ")}`,
                });
            }

            setEmailSent(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-10 md:py-14">
                <header className="max-w-3xl">
                    <div className="flex items-center justify-between gap-4">
                        <h1 className="text-3xl md:text-4xl font-bold">Escolha seu plano</h1>
                        <Button asChild variant="outline" size="sm">
                            <Link to="/">Voltar</Link>
                        </Button>
                    </div>
                    <p className="mt-3 text-muted-foreground">
                        Selecione o plano ideal para o seu negócio e comece agora. Pagamento seguro via Pix ou Cartão de Crédito.
                    </p>
                </header>

                {/* ── Plan Selector ── */}
                <div className="mt-8 grid gap-4 md:grid-cols-2 max-w-3xl">
                    {(Object.keys(PLANS) as PlanId[]).map((key) => {
                        const p = PLANS[key];
                        const isSelected = selectedPlan === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setSelectedPlan(key)}
                                className={`text-left rounded-2xl p-6 border-2 transition-all duration-200 ${isSelected
                                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                                    : "border-border bg-card hover:border-primary/40"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold">{p.name}</h3>
                                    {key === "pro_ia" && (
                                        <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">{p.description}</p>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-muted-foreground text-sm">R$</span>
                                    <span className="text-3xl font-bold">{p.price}</span>
                                    <span className="text-muted-foreground text-sm">/mês</span>
                                </div>
                                <ul className="space-y-2">
                                    {p.features.slice(0, 4).map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                    {p.features.length > 4 && (
                                        <li className="text-xs text-primary font-medium">
                                            + {p.features.length - 4} funcionalidades
                                        </li>
                                    )}
                                </ul>
                            </button>
                        );
                    })}
                </div>

                {/* ── Form ── */}
                <div className="mt-10 grid gap-6 lg:grid-cols-12 max-w-5xl">
                    <section className="lg:col-span-7">
                        <Card>
                            <CardHeader>
                                <CardTitle>Dados do cadastro</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {emailSent ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
                                        <div className="bg-primary/10 p-4 rounded-full">
                                            <Mail className="w-16 h-16 text-primary" />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold">Verifique seu email</h2>
                                            <p className="text-muted-foreground max-w-md mx-auto">
                                                Enviamos um link de confirmação para <strong>{form.getValues("email")}</strong>.
                                                Clique no link para prosseguir com o pagamento.
                                            </p>
                                        </div>
                                        <div className="pt-4">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Não recebeu? Verifique sua caixa de spam ou:
                                            </p>
                                            <Button variant="outline" onClick={() => setEmailSent(false)}>
                                                Tentar novamente
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <form
                                        className="space-y-8"
                                        onSubmit={form.handleSubmit(onSubmit, (errors) => {
                                            const firstKey = Object.keys(errors ?? {})[0];
                                            const firstMsg = firstKey ? (errors as any)[firstKey]?.message : null;
                                            toast({
                                                title: "Formulário incompleto",
                                                description: firstMsg ? String(firstMsg) : "Revise os campos em vermelho.",
                                                variant: "destructive",
                                            });
                                        })}
                                    >
                                        {/* ── Estabelecimento ── */}
                                        <section className="space-y-4">
                                            <h2 className="text-lg font-semibold">Estabelecimento</h2>

                                            <div className="space-y-2">
                                                <Label htmlFor="nome_estabelecimento">Nome do estabelecimento</Label>
                                                <Input id="nome_estabelecimento" autoComplete="organization" {...form.register("nome_estabelecimento")} />
                                                {form.formState.errors.nome_estabelecimento && <p className="text-sm text-destructive">{form.formState.errors.nome_estabelecimento.message}</p>}
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="cep">CEP</Label>
                                                    <Input id="cep" inputMode="numeric" autoComplete="postal-code" {...form.register("cep")} />
                                                    {isCepLoading && <p className="text-sm text-muted-foreground">Buscando endereço…</p>}
                                                    {form.formState.errors.cep && <p className="text-sm text-destructive">{form.formState.errors.cep.message}</p>}
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label htmlFor="cidade">Cidade</Label>
                                                    <Input id="cidade" autoComplete="address-level2" {...form.register("cidade")} />
                                                    {form.formState.errors.cidade && <p className="text-sm text-destructive">{form.formState.errors.cidade.message}</p>}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="estado">Estado (UF)</Label>
                                                <Input
                                                    id="estado"
                                                    autoComplete="address-level1"
                                                    maxLength={2}
                                                    {...form.register("estado", {
                                                        onChange: (e) => form.setValue("estado", String(e.target.value).toUpperCase(), { shouldDirty: true, shouldTouch: true, shouldValidate: true }),
                                                    })}
                                                />
                                                {form.formState.errors.estado && <p className="text-sm text-destructive">{form.formState.errors.estado.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="rua">Rua</Label>
                                                <Input id="rua" autoComplete="address-line1" {...form.register("rua")} />
                                                {form.formState.errors.rua && <p className="text-sm text-destructive">{form.formState.errors.rua.message}</p>}
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="numero">Número</Label>
                                                    <Input id="numero" autoComplete="address-line2" {...form.register("numero")} />
                                                    {form.formState.errors.numero && <p className="text-sm text-destructive">{form.formState.errors.numero.message}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="bairro">Bairro</Label>
                                                    <Input id="bairro" autoComplete="address-level3" {...form.register("bairro")} />
                                                    {form.formState.errors.bairro && <p className="text-sm text-destructive">{form.formState.errors.bairro.message}</p>}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="telefone">Telefone</Label>
                                                <Input
                                                    id="telefone"
                                                    inputMode="tel"
                                                    autoComplete="tel"
                                                    {...form.register("telefone")}
                                                    onChange={(e) => form.setValue("telefone", e.target.value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
                                                    onBlur={(e) => form.setValue("telefone", formatPhoneBR(e.target.value), { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
                                                />
                                                {form.formState.errors.telefone && <p className="text-sm text-destructive">{form.formState.errors.telefone.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="taxId">CPF / CNPJ</Label>
                                                <Input
                                                    id="taxId"
                                                    placeholder="000.000.000-00"
                                                    inputMode="numeric"
                                                    {...form.register("taxId")}
                                                    onChange={(e) => form.setValue("taxId", formatCpfCnpj(e.target.value), { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
                                                />
                                                {form.formState.errors.taxId && <p className="text-sm text-destructive">{form.formState.errors.taxId.message}</p>}
                                            </div>
                                        </section>

                                        {/* ── Proprietário ── */}
                                        <section className="space-y-4">
                                            <h2 className="text-lg font-semibold">Proprietário</h2>

                                            <div className="space-y-2">
                                                <Label htmlFor="nome_proprietario">Nome do proprietário</Label>
                                                <Input id="nome_proprietario" autoComplete="name" {...form.register("nome_proprietario")} />
                                                {form.formState.errors.nome_proprietario && <p className="text-sm text-destructive">{form.formState.errors.nome_proprietario.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
                                                <p className="text-sm text-muted-foreground">Este email será seu login no sistema</p>
                                                {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                                            </div>
                                        </section>

                                        {/* ── Senha Removed ── */}

                                        <div className="flex flex-col gap-3">
                                            <Button type="submit" disabled={isSubmitting} className="w-full text-base" size="lg">
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Enviando...
                                                    </>
                                                ) : (
                                                    <>
                                                        Confirmar Email e Continuar
                                                        <ArrowRight className="ml-2 w-4 h-4" />
                                                    </>
                                                )}
                                            </Button>

                                            <Button asChild type="button" variant="link" className="w-full">
                                                <a href={SYSTEM_AUTH_URL} target="_blank" rel="noreferrer">
                                                    Já tem uma conta? Fazer login
                                                </a>
                                            </Button>
                                        </div>

                                        {/* Payment Methods Icons */}
                                        <div className="flex items-center justify-center gap-6 pt-4 text-muted-foreground">
                                            <div className="flex items-center gap-2" title="Pagamento via Pix">
                                                <QrCode className="w-5 h-5" />
                                                <span className="text-sm font-medium">Pix</span>
                                            </div>
                                            <div className="flex items-center gap-2" title="Pagamento via Cartão de Crédito">
                                                <CreditCard className="w-5 h-5" />
                                                <span className="text-sm font-medium">Cartão</span>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    {/* ── Sidebar ── */}
                    <aside className="lg:col-span-5">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Plano {plan.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-muted-foreground">R$</span>
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground">/mês</span>
                                </div>

                                <ul className="space-y-3">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <div className="pt-4 border-t border-border space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <span className="flex gap-1" aria-hidden="true">
                                            <QrCode className="w-4 h-4" />
                                            <CreditCard className="w-4 h-4" />
                                        </span>
                                        <p>Pagamento via Pix ou Cartão</p>
                                    </div>
                                    <p>✅ Acesso imediato após confirmação</p>
                                    <p>✅ Cancele quando quiser</p>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </main >
        </div >
    );
}
