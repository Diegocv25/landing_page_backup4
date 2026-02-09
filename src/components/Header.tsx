import { useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "#sobre", label: "Sobre" },
    { href: "#funcionalidades", label: "Funcionalidades" },
    { href: "#precos", label: "Preços" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-lg">
              Nexus<span className="text-primary">Automações</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

           <div className="hidden md:flex items-center gap-4">
             <Button asChild variant="outline" size="sm">
               <a
                 href="https://wa.me/554891015688"
                 target="_blank"
                 rel="noreferrer"
                 aria-label="Falar no WhatsApp"
               >
                 <MessageCircle className="w-4 h-4" />
                 WhatsApp
               </a>
             </Button>
             <Button size="sm">Teste grátis</Button>
           </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
               <div className="flex flex-col gap-2 pt-4 border-t border-border">
                 <Button asChild variant="outline" size="sm">
                   <a
                     href="https://wa.me/554891015688"
                     target="_blank"
                     rel="noreferrer"
                     aria-label="Falar no WhatsApp"
                   >
                     <MessageCircle className="w-4 h-4" />
                     WhatsApp
                   </a>
                 </Button>
                 <Button size="sm">Teste grátis</Button>
               </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
