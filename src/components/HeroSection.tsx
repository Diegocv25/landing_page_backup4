import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DemoVideoDialog from "@/components/DemoVideoDialog";
import { useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import ScrollFrames from "@/components/ScrollFrames";

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const features = [
    "Agenda online para seus clientes",
    "Gestão financeira e administrativa",
    "CRM, estoque, vendas e relatórios",
  ];
  return <section ref={sectionRef} className="hero-scroll-section">
    <div ref={stageRef} className="hero-stage">
      <ScrollFrames sectionRef={sectionRef} stageRef={stageRef} />
      <div className="hero-scrim" aria-hidden="true" />

      <div className="hero-content container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="hero-copy text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm text-primary font-medium">Funciona para: Salão • Barbearia • Spa • Estética</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Sistema Completo de Gestão
            <br />
            <span className="gradient-text">para o seu Negócio</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Organize agenda, clientes, vendas, estoque, comissões e financeiro em um sistema simples e intuitivo. Tenha controle da operação e informações para decidir melhor em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button asChild size="lg" className="group text-base px-8 animate-pulse-glow">
              <Link to="/cadastro" onClick={() => trackEvent("click_primary_cta", { cta_location: "hero" })}>
                Quero Testar por 30 Dias
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <DemoVideoDialog />
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {features.map(feature => <div key={feature} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-3 h-3 text-primary" /></div>
              <span>{feature}</span>
            </div>)}
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>;
};
export default HeroSection;
