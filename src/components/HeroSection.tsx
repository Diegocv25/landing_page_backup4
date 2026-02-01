import { motion } from "framer-motion";
import { ArrowRight, Play, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
const HeroSection = () => {
  const features = [
    "Agendamento automático via WhatsApp",
    "Atendimento inteligente com IA",
    "Gestão financeira e administrativa",
    "Relatórios e métricas",
  ];
  return <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="text-center max-w-4xl mx-auto">
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.1
        }} className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm text-primary font-medium">Funciona para: Salão • Barbearia • Clínica • Spa • Consultório</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Sistema Completo de Gestão
            <br />
            <span className="gradient-text">+ IA no WhatsApp</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Sua secretária virtual disponível 24 horas por dia. Fácil de usar, 
            revoluciona o atendimento dos seus clientes, gerencia sua agenda e cuida do seu 
            caixa financeiro.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="group text-base px-8 animate-pulse-glow">
              Quero Testar por 7 Dias
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8">
              <Play className="mr-2 w-4 h-4" />
              Ver Demonstração
            </Button>
          </div>

          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.4
        }} className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {features.map(feature => <div key={feature} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span>{feature}</span>
              </div>)}
          </motion.div>
        </motion.div>
      </div>
    </section>;
};
export default HeroSection;