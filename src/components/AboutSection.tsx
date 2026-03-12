import { motion } from "framer-motion";
import { Layers, MessageSquare, TrendingUp } from "lucide-react";

const AboutSection = () => {
  const cards = [
    {
      icon: Layers,
      title: "Multi-Nicho",
      description:
        "Funciona para qualquer negócio com agendamentos: salões, barbearias, spas, estética.",
    },
    {
      icon: MessageSquare,
      title: "IA no WhatsApp",
      description:
        "Atendente automático responde dúvidas, envia links de agendamento e funciona 24/7, mesmo quando você está fechado.",
    },
    {
      icon: TrendingUp,
      title: "Gestão Financeira",
      description:
        "Controle total das finanças, contas a pagar e a receber, relatórios detalhados, controle de caixa.",
    },
  ];

  return (
    <section id="sobre" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Sobre o Sistema</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conheça uma plataforma completa de gestão para o seu negócio. Com ela, você organiza agenda,
            clientes, vendas, financeiro e operação em um único sistema. O WhatsApp entra como canal de atendimento
            e automações com IA — sem substituir o sistema de gestão.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-card rounded-2xl p-6 md:p-7 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 max-w-sm w-full mx-auto"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <card.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3">{card.title}</h3>
              <p className="text-muted-foreground">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
