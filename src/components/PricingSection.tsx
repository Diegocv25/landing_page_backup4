import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const PricingSection = () => {
  const plans = [
    {
      name: "Profissional",
      price: "197",
      description: "Para profissionais autônomos e pequenos negócios",
      features: [
        "1 Número de WhatsApp",
        "Chatbot com IA",
        "Agendamento automático",
        "Gestão financeira básica",
        "CRM de clientes",
        "Suporte por e-mail",
        "1 Usuário",
      ],
      popular: false,
    },
    {
      name: "PRO + IA",
      price: "347",
      description: "Para empresas que querem escalar com inteligência artificial",
      features: [
        "3 Números de WhatsApp",
        "IA Avançada com GPT-4",
        "Agendamento inteligente",
        "Gestão financeira completa",
        "CRM avançado",
        "Relatórios detalhados",
        "Suporte prioritário 24/7",
        "5 Usuários",
        "Integrações extras",
        "Treinamento personalizado",
      ],
      popular: true,
    },
  ];

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

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-card rounded-2xl p-8 border ${
                plan.popular
                  ? "border-primary glow-primary"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-current" />
                    Mais Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {plan.description}
                </p>
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

              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                size="lg"
              >
                {plan.popular ? "Começar Agora" : "Escolher Plano"}
              </Button>
            </motion.div>
          ))}
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
