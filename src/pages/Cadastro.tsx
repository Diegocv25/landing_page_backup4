import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

import { supabase } from "@/integrations/supabase/client";

const SYSTEM_AUTH_URL = "https://id-preview--2195ef19-036f-4926-9a8e-4b3085c4a170.lovable.app/auth";

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(input: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(digest);
}

function buildDeviceFingerprintSource() {
  const ua = navigator.userAgent ?? "";
  const lang = navigator.language ?? "";
  const w = String(screen?.width ?? "");
  const h = String(screen?.height ?? "");
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  const platform = (navigator as any).platform ?? "";
  const hc = String((navigator as any).hardwareConcurrency ?? "");

  // String “normalizada” (não envia os dados crus; só o hash)
  return [ua, lang, w, h, tz, platform, hc].map((s) => String(s).trim()).join("|");
}

function formatPhoneBR(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (rest.length <= 8) {
    // (XX) XXXX-XXXX
    const part1 = rest.slice(0, 4);
    const part2 = rest.slice(4, 8);
    return `(${ddd}) ${part1}${part2 ? `-${part2}` : ""}`;
  }

  // (XX) XXXXX-XXXX
  const part1 = rest.slice(0, 5);
  const part2 = rest.slice(5, 9);
  return `(${ddd}) ${part1}${part2 ? `-${part2}` : ""}`;
}

const schema = z
  .object({
    nome_estabelecimento: z.string().trim().min(1, "Informe o nome do estabelecimento").max(200),

    // Endereço (armazenado como texto único em `endereco` no backend)
    rua: z.string().trim().min(1, "Informe a rua").max(200),
    numero: z.string().trim().min(1, "Informe o número").max(30),
    bairro: z.string().trim().min(1, "Informe o bairro").max(120),
    cep: z
      .string()
      .trim()
      .min(1, "Informe o CEP")
      .refine((v) => v.replace(/\D/g, "").length === 8, "Informe um CEP válido"),
    cidade: z.string().trim().min(1, "Informe a cidade").max(120),
    estado: z
      .string()
      .trim()
      .min(1, "Informe o estado")
      .transform((v) => v.toUpperCase())
      .refine((v) => /^[A-Z]{2}$/.test(v), "Use a sigla do estado (ex.: SP)"),

    telefone: z
      .string()
      .trim()
      .min(1, "Informe o telefone")
      .refine((v) => v.replace(/\D/g, "").length >= 10, "Informe um telefone válido"),

    nome_proprietario: z.string().trim().min(1, "Informe o nome do proprietário").max(200),
    email: z.string().trim().email("Informe um email válido").max(254),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function Cadastro() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const compute = async () => {
      try {
        if (!crypto?.subtle) return;
        const source = buildDeviceFingerprintSource();
        if (!source) return;
        const fp = await sha256Hex(source);
        if (!cancelled) setDeviceFingerprint(fp);
      } catch {
        // Fallback silencioso: não pode quebrar o cadastro
      }
    };

    void compute();
    return () => {
      cancelled = true;
    };
  }, []);

  const badges = useMemo(
    () => ["7 dias grátis", "Plano Profissional", "Sem cartão", "Acesso imediato"],
    [],
  );

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
      nome_proprietario: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });


  const buildEndereco = (values: FormValues) => {
    const cepDigits = values.cep.replace(/\D/g, "");
    const cepFmt = cepDigits.length === 8 ? `${cepDigits.slice(0, 5)}-${cepDigits.slice(5)}` : values.cep;
    const endereco = `Rua ${values.rua}, Nº ${values.numero} - ${values.bairro} - CEP ${cepFmt} - ${values.cidade}/${values.estado}`;
    return endereco.trim().slice(0, 500);
  };

  const lastCepAutofilledRef = useRef<string>("");
  const cepAbortRef = useRef<AbortController | null>(null);
  const [isCepLoading, setIsCepLoading] = useState(false);

  useEffect(() => {
    const raw = form.watch("cep") ?? "";
    const digits = raw.replace(/\D/g, "");

    if (digits.length !== 8) return;
    if (lastCepAutofilledRef.current === digits) return;

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

        // Preenche o que vier da API (sem travar o usuário caso algo esteja faltando)
        if (typeof data?.logradouro === "string" && data.logradouro.trim()) {
          form.setValue("rua", data.logradouro.trim(), { shouldDirty: true, shouldTouch: true, shouldValidate: true });
        }
        if (typeof data?.bairro === "string" && data.bairro.trim()) {
          form.setValue("bairro", data.bairro.trim(), { shouldDirty: true, shouldTouch: true, shouldValidate: true });
        }
        if (typeof data?.localidade === "string" && data.localidade.trim()) {
          form.setValue("cidade", data.localidade.trim(), { shouldDirty: true, shouldTouch: true, shouldValidate: true });
        }
        if (typeof data?.uf === "string" && data.uf.trim()) {
          form.setValue("estado", String(data.uf).trim().toUpperCase(), {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }

        lastCepAutofilledRef.current = digits;
      } catch {
        // fallback silencioso: não pode quebrar a UX do cadastro
      } finally {
        setIsCepLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [form]);


  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        nome_estabelecimento: values.nome_estabelecimento,
        endereco: buildEndereco(values),
        telefone: values.telefone,
        nome_proprietario: values.nome_proprietario,
        email: values.email,
        password: values.password,
        device_fingerprint: deviceFingerprint || undefined,
      };

      const { data, error } = await supabase.functions.invoke("public-signup-trial", {
        body: payload,
      });

      if (error) {
        const status = (error as any)?.context?.status as number | undefined;
        const serverMsg = (data as any)?.error as string | undefined;

        if (status === 409) {
          const msg = (serverMsg ?? "").toLowerCase();
          const isEmailAlreadyRegistered = msg.includes("email já cadastrado") || msg.includes("email ja cadastrado");

          if (isEmailAlreadyRegistered) {
            toast({
              title: "Email já cadastrado",
              description: "Este email já está cadastrado. Faça login.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Teste grátis indisponível",
              description:
                "Teste grátis já utilizado para alguns dos dados informados. Se você já tem conta, faça login. Caso precise de acesso, entre em contato para assinar.",
              variant: "destructive",
            });
          }
          return;
        }

        if (status === 400 && serverMsg) {
          toast({
            title: "Dados inválidos",
            description: serverMsg,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Erro ao criar conta",
          description: "Erro ao criar conta. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      if ((data as any)?.success) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Conta criada com sucesso!",
        });

        // Tenta sair do embed do Lovable (iframe)
        try {
          if (window.top) {
            window.top.location.href = SYSTEM_AUTH_URL;
            return;
          }
        } catch {
          // fallback abaixo
        }

        window.location.href = SYSTEM_AUTH_URL;
        return;
      }

      toast({
        title: "Erro ao criar conta",
        description: (data as any)?.error ?? "Erro ao criar conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-10 md:py-14">
        <header className="max-w-2xl">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-bold">Comece seu teste gratuito</h1>
            <Button asChild variant="outline" size="sm">
              <Link to="/">Voltar</Link>
            </Button>
          </div>
          <p className="mt-3 text-muted-foreground">
            Crie sua conta e utilize o sistema no Plano Profissional por 7 dias gratuitamente. Sem cartão de crédito.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {badges.map((b) => (
              <Badge
                key={b}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {b}
              </Badge>
            ))}
          </div>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <section className="lg:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>Crie sua conta</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                  <section className="space-y-4">
                    <header>
                      <h2 className="text-lg font-semibold">Estabelecimento</h2>
                    </header>

                    <div className="space-y-2">
                      <Label htmlFor="nome_estabelecimento">Nome do estabelecimento</Label>
                      <Input id="nome_estabelecimento" autoComplete="organization" {...form.register("nome_estabelecimento")} />
                      {form.formState.errors.nome_estabelecimento ? (
                        <p className="text-sm text-destructive">{form.formState.errors.nome_estabelecimento.message}</p>
                      ) : null}
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="cep">CEP</Label>
                        <Input
                          id="cep"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          {...form.register("cep")}
                        />
                        {isCepLoading ? (
                          <p className="text-sm text-muted-foreground">Buscando endereço pelo CEP…</p>
                        ) : null}
                        {form.formState.errors.cep ? (
                          <p className="text-sm text-destructive">{form.formState.errors.cep.message}</p>
                        ) : null}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input id="cidade" autoComplete="address-level2" {...form.register("cidade")} />
                        {form.formState.errors.cidade ? (
                          <p className="text-sm text-destructive">{form.formState.errors.cidade.message}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado (UF)</Label>
                      <Input
                        id="estado"
                        autoComplete="address-level1"
                        maxLength={2}
                        {...form.register("estado", {
                          onChange: (e) => {
                            form.setValue("estado", String(e.target.value).toUpperCase(), {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            });
                          },
                        })}
                      />
                      {form.formState.errors.estado ? (
                        <p className="text-sm text-destructive">{form.formState.errors.estado.message}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rua">Rua</Label>
                      <Input id="rua" autoComplete="address-line1" {...form.register("rua")} />
                      {form.formState.errors.rua ? (
                        <p className="text-sm text-destructive">{form.formState.errors.rua.message}</p>
                      ) : null}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="numero">Número</Label>
                        <Input id="numero" autoComplete="address-line2" {...form.register("numero")} />
                        {form.formState.errors.numero ? (
                          <p className="text-sm text-destructive">{form.formState.errors.numero.message}</p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input id="bairro" autoComplete="address-level3" {...form.register("bairro")} />
                        {form.formState.errors.bairro ? (
                          <p className="text-sm text-destructive">{form.formState.errors.bairro.message}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        inputMode="tel"
                        autoComplete="tel"
                        {...form.register("telefone")}
                        onChange={(e) => {
                          const formatted = formatPhoneBR(e.target.value);
                          form.setValue("telefone", formatted, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                        }}
                      />
                      {form.formState.errors.telefone ? (
                        <p className="text-sm text-destructive">{form.formState.errors.telefone.message}</p>
                      ) : null}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <header>
                      <h2 className="text-lg font-semibold">Proprietário</h2>
                    </header>

                    <div className="space-y-2">
                      <Label htmlFor="nome_proprietario">Nome do proprietário</Label>
                      <Input id="nome_proprietario" autoComplete="name" {...form.register("nome_proprietario")} />
                      {form.formState.errors.nome_proprietario ? (
                        <p className="text-sm text-destructive">{form.formState.errors.nome_proprietario.message}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
                      <p className="text-sm text-muted-foreground">Este email será seu login no sistema</p>
                      {form.formState.errors.email ? (
                        <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                      ) : null}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <header>
                      <h2 className="text-lg font-semibold">Senha</h2>
                    </header>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="password">Senha</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? "Ocultar" : "Mostrar"}
                        </Button>
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        {...form.register("password")}
                      />
                      {form.formState.errors.password ? (
                        <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar senha</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        {...form.register("confirmPassword")}
                      />
                      {form.formState.errors.confirmPassword ? (
                        <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
                      ) : null}
                    </div>
                  </section>

                  <div className="flex flex-col gap-3">
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? "Criando..." : "Criar minha conta grátis"}
                    </Button>

                    <Button asChild type="button" variant="link" className="w-full">
                      <a href={SYSTEM_AUTH_URL} target="_blank" rel="noreferrer">
                        Já tem uma conta? Fazer login
                      </a>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </section>

          <aside className="lg:col-span-5">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>O que acontece depois?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>1) Você cria sua conta e seu salão é configurado automaticamente.</p>
                <p>2) Você entra no Plano Profissional por 7 dias (trial).</p>
                <p>3) Depois do cadastro, você será redirecionado para o login do sistema.</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
