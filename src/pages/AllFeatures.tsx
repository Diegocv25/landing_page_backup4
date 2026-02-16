import { FEATURES } from "@/data/features";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";

function FeatureFullCard({ feature }: { feature: (typeof FEATURES)[number] }) {
  const Icon = feature.icon;

  return (
    <article className="rounded-2xl border border-border bg-card p-6 md:p-7 shadow-sm">
      <header className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>

        <div className="min-w-0">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">{feature.title}</h2>
          {feature.highlight ? (
            <p className="mt-1 text-sm font-medium text-primary">{feature.highlight}</p>
          ) : null}
        </div>
      </header>

      <div className="mt-5 space-y-5">
        <ul className="space-y-3">
          {feature.bullets.map((item) => (
            <li key={item} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-primary" />
              <span className="text-sm text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-foreground">
            <span className="font-semibold text-primary">Resultado:</span> {feature.result}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function AllFeatures() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const handleBack = () => {
    if (from) {
      navigate(from);
      return;
    }

    navigate("/");
    requestAnimationFrame(() => {
      window.location.hash = "#funcionalidades";
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary" aria-hidden="true" />
              <span className="font-bold text-lg">
                Nexus<span className="text-primary">Automações</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleBack} aria-label="Voltar">
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-10">
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <header className="text-center mb-10 md:mb-14">
              <h1 className="text-3xl md:text-4xl font-bold">Todas as Funcionalidades</h1>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                Conheça em detalhes cada funcionalidade do sistema Nexus Automações. Veja tudo o que o sistema oferece
                para transformar a gestão do seu negócio.
              </p>
            </header>

            <div className="space-y-5 md:space-y-6">
              {FEATURES.map((feature) => (
                <FeatureFullCard key={feature.title} feature={feature} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold">Pronto para começar?</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Teste todas essas funcionalidades gratuitamente por 7 dias. Sem compromisso, sem cartão de crédito.
            </p>

            <div className="mt-8 flex justify-center">
              <Button type="button" onClick={handleBack}>
                Voltar para Home
              </Button>
            </div>

            <div className="mt-10 border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">© 2026 Nexus Automações. Todos os direitos reservados.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
