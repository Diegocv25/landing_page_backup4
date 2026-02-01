import { motion } from "framer-motion";
import { UserPlus, Settings, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      icon: UserPlus,
      title: "Faça seu Cadastro",
      description: "Crie sua conta em menos de 2 minutos. Processo simples e rápido.",
    },
    {
      number: "2",
      icon: Settings,
      title: "Configure seu Negócio",
      description: "Personalize o sistema de acordo com as necessidades do seu negócio.",
    },
    {
      number: "3",
      icon: Rocket,
      title: "Comece a Usar",
      description: "Pronto! Sua IA está ativa e trabalhando por você 24 horas por dia.",
    },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Começar</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Em apenas 3 passos simples, sua empresa estará funcionando com inteligência artificial.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-primary/10" />
              )}
              
              <div className="relative z-10 w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-primary-foreground">
                {step.number}
              </div>
              <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button size="lg" className="text-base px-8">
            Começar Agora
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
