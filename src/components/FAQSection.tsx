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
      question: "Como funciona o chatbot no WhatsApp?",
      answer:
        "Nosso chatbot utiliza inteligência artificial avançada para responder seus clientes automaticamente, agendar horários, enviar lembretes e muito mais. Ele funciona 24 horas por dia, 7 dias por semana.",
    },
    {
      question: "Preciso ter conhecimento técnico?",
      answer:
        "Não! O sistema foi desenvolvido para ser simples e intuitivo. Em poucos minutos você configura tudo e está pronto para usar. Além disso, oferecemos suporte completo.",
    },
    {
      question: "O WhatsApp precisa ficar conectado?",
      answer:
        "Sim, o WhatsApp precisa estar conectado ao nosso sistema através do WhatsApp Web. Fornecemos um QR Code para fazer a conexão de forma simples e segura.",
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer:
        "Sim! Não há fidelidade ou multa. Você pode cancelar sua assinatura a qualquer momento diretamente no painel do cliente.",
    },
    {
      question: "O sistema funciona para qualquer tipo de negócio?",
      answer:
        "Sim! O Nexus Automações é flexível e pode ser adaptado para diversos segmentos: salões de beleza, clínicas, consultórios, academias, escritórios, lojas e muito mais.",
    },
    {
      question: "Como funciona o suporte?",
      answer:
        "Oferecemos suporte por e-mail para o plano Profissional e suporte prioritário 24/7 para o plano PRO + IA, incluindo atendimento por WhatsApp.",
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
            Tire suas dúvidas sobre o Nexus Automações.
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
