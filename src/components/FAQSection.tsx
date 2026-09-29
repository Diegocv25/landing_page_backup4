import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "Como os clientes fazem agendamentos?",
      answer:
        "Você pode disponibilizar o portal do cliente para que cada pessoa consulte horários e faça o agendamento online.",
    },
    {
      question: "Preciso ter conhecimento técnico?",
      answer:
        "Não! O sistema foi desenvolvido para ser simples e intuitivo. Em poucos minutos você configura tudo e está pronto para usar. Além disso, oferecemos suporte completo.",
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer:
        "Sim. Não há fidelidade nem multa. O cancelamento é feito na sua área de assinatura da Kiwify.",
    },
    {
      question: "O sistema funciona para qualquer tipo de negócio?",
      answer:
        "Sim! O Nexus Automação é flexível e pode ser adaptado para diversos segmentos: salões de beleza, barbearias, spas, estéticas e similares.",
    },
    {
      question: "Como funciona o suporte?",
      answer:
        "O suporte técnico é feito pelo WhatsApp.",
    },
  ];

  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tire suas dúvidas sobre o Nexus Automação.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/50"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
