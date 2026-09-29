import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PricingSection = () => {
  const plan = {
    name: "Plano Pro",
    price: "30",
    description: "Gestão completa para salões, barbearias, spas e estéticas",
    features: [
      "Estabelecimento com sistema de gestão completo",
      "Profissionais ilimitados",
      "Agenda online 24 horas por dia, 7 dias por semana",
      "Portal do cliente",
      "CRM de clientes",
      "Controle de estoque",
      "Comandas e vendas",
      "Sistema de remuneração",
      "Gestão financeira completa",
      "Relatórios avançados",
      "5 níveis de acesso",
      "Multi-estabelecimentos",
      "Controle de lançamentos",
      "Suporte via WhatsApp",
      "Treinamento personalizado",
    ],
  };

  return (
    <section id="precos" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Preços Simples e Justos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sem surpresas, sem taxas escondidas. Escolha o plano ideal para o seu negócio.
          </p>
        </motion.div>

        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-card rounded-2xl p-8 border border-primary glow-primary"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1 bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                <Star className="w-4 h-4 fill-current" />
                Oferta atual
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-muted-foreground">R$</span>
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button asChild className="w-full" size="lg">
              <Link to="/planos?plan=profissional">Escolher Plano Pro</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            🔒 Garantia de 7 dias ou seu dinheiro de volta. Sem perguntas.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
