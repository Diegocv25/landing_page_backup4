import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

import FeatureDetailsDialog from "@/components/FeatureDetailsDialog";
import { Button } from "@/components/ui/button";
import { FEATURES } from "@/data/features";
const FeaturesSection = () => {
  const location = useLocation();

  const from = `${location.pathname}${location.hash || "#funcionalidades"}`;

  return <section id="funcionalidades" className="py-24 bg-secondary/30">
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conheça todas as funcionalidades que vão transformar a gestão do seu negócio
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {FEATURES.map((feature, index) => <motion.div key={feature.title} initial={{
          opacity: 0,
          scale: 0.9
        }} whileInView={{
          opacity: 1,
          scale: 1
        }} viewport={{
          once: true
        }} transition={{
          delay: index * 0.05
          }} className="group rounded-2xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 text-center bg-card">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-primary transition-colors" />
              </div>
              <h3 className="font-semibold mb-2 text-sm md:text-base text-foreground">{feature.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">{feature.short}</p>
              <FeatureDetailsDialog feature={feature} />
            </motion.div>)}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild size="lg">
            <Link to="/funcionalidades" state={{ from }}>
              Ver todas as funcionalidades
            </Link>
          </Button>
        </div>
      </div>
    </section>;
};
export default FeaturesSection;