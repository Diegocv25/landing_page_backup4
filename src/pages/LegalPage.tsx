import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type LegalPageProps = {
  title: string;
  updatedAt: string;
  children: ReactNode;
};

export default function LegalPage({ title, updatedAt, children }: LegalPageProps) {
  return (
    <div className="landing-page min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-28 pb-16">
        <article className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-6 shadow-sm md:p-10">
          <header className="mb-10 border-b border-border pb-8">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-primary">
              Nexus Automação
            </p>
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">{title}</h1>
            <p className="mt-4 text-sm text-muted-foreground">Última atualização: {updatedAt}</p>
          </header>
          <div className="legal-content space-y-8 text-base leading-8 text-muted-foreground">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold text-foreground md:text-2xl">{title}</h2>
      {children}
    </section>
  );
}
