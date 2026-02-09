import { useMemo, useState } from "react";
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
    endereco: z.string().trim().min(1, "Informe o endereço").max(500),
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

  const badges = useMemo(
    () => ["7 dias grátis", "Plano Profissional", "Sem cartão", "Acesso imediato"],
    [],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome_estabelecimento: "",
      endereco: "",
      telefone: "",
      nome_proprietario: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        nome_estabelecimento: values.nome_estabelecimento,
        endereco: values.endereco,
        telefone: values.telefone,
        nome_proprietario: values.nome_proprietario,
        email: values.email,
        password: values.password,
      };

      const { data, error } = await supabase.functions.invoke("public-signup-trial", {
        body: payload,
      });

      if (error) {
        const status = (error as any)?.context?.status as number | undefined;
        const serverMsg = (data as any)?.error as string | undefined;

        if (status === 409) {
          toast({
            title: "Email já cadastrado",
            description: "Este email já está cadastrado. Faça login.",
            variant: "destructive",
          });
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
          description: "Conta criada com sucesso! 🎉",
        });
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
              <Badge key={b} variant="secondary">
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

                    <div className="space-y-2">
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input id="endereco" autoComplete="street-address" {...form.register("endereco")} />
                      {form.formState.errors.endereco ? (
                        <p className="text-sm text-destructive">{form.formState.errors.endereco.message}</p>
                      ) : null}
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
                          form.setValue("telefone", formatted, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
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
