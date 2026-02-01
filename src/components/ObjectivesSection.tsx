import { motion } from "framer-motion";
import { TrendingUp, Clock, Eye } from "lucide-react";
const ObjectivesSection = () => {
  const objectives = [{
    icon: TrendingUp,
    title: "Aumentar seu Faturamento",
    description: "Gestão integrada de clientes, atendimentos automatizados pelo WhatsApp. Agenda cheia = mais lucro. Acompanhe métricas em tempo real e otimize seus resultados."
  }, {
    icon: Clock,
    title: "Economizar seu Tempo",
    description: "Automatize tarefas repetitivas, agende compromissos automaticamente, envie lembretes aos clientes e tenha uma secretária virtual trabalhando 24/7 por você."
  }, {
    icon: Eye,
    title: "Dar Visibilidade Total",
    description: "Relatórios completos de desempenho para decisões inteligentes. Visualize agendamentos, financeiro, evolução dos funcionários, clientes e atendimentos em um único lugar."
  }];
  return <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Nosso Objetivo</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-center">        Transformar a gestão do seu negócio com tecnologia e automação inteligente em:               algo simples, eficiente e lucrativo.</p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {objectives.map((objective, index) => <motion.div key={objective.title} initial={{
          opacity: 0,
          x: -20
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: index * 0.1
        }} className="group flex gap-6 p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
                <objective.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {objective.title}
                </h3>
                <p className="text-muted-foreground">{objective.description}</p>
              </div>
            </motion.div>)}
        </div>
      </div>
    </section>;
};
export default ObjectivesSection;