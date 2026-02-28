import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle, ArrowRight } from "lucide-react";

const AUTH_BASE_FALLBACK = "https://gestaobackup4.vercel.app";
const AUTH_BASE = (import.meta.env.VITE_AUTH_BASE_URL?.replace(/\/+$/, "") || AUTH_BASE_FALLBACK).replace(/\/+$/, "");
const SYSTEM_AUTH_URL = AUTH_BASE.endsWith("/auth") ? AUTH_BASE : `${AUTH_BASE}/auth`;

export default function ConfirmarTrial() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const nav = useNavigate();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const didRun = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    if (didRun.current) return;
    didRun.current = true;

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("confirm-trial-email", {
          body: { token },
        });

        if (error || !(data as any)?.success) {
          setStatus("error");
          return;
        }

        setStatus("success");
      } catch {
        setStatus("error");
      }
    })();
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Ativar Teste Grátis</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 py-8">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-lg font-medium">Confirmando seu e-mail...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-green-600">E-mail confirmado!</p>
                <p className="text-sm text-muted-foreground">
                  Seu teste grátis foi ativado. Você já pode entrar no sistema.
                </p>
              </div>
              <Button
                size="lg"
                className="w-full max-w-xs text-base"
                onClick={() => {
                  try {
                    if (window.top) {
                      window.top.location.href = SYSTEM_AUTH_URL;
                      return;
                    }
                  } catch {
                    // ignore
                  }
                  window.location.href = SYSTEM_AUTH_URL;
                }}
              >
                Entrar no sistema
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-destructive" />
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-destructive">Falha na confirmação</p>
                <p className="text-sm text-muted-foreground">O link pode ter expirado ou já foi usado.</p>
              </div>
              <Button variant="outline" onClick={() => nav("/cadastro")}>Voltar</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
