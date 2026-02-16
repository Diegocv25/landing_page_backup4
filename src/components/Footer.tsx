import { MessageSquare, Instagram, Youtube, Linkedin } from "lucide-react";

const Footer = () => {
  const links = {
    produto: [
      { label: "Funcionalidades", href: "#funcionalidades" },
      { label: "Preços", href: "#precos" },
      { label: "FAQ", href: "#faq" },
    ],
    empresa: [
      { label: "Sobre", href: "#sobre" },
      { label: "Blog", href: "#" },
      { label: "Contato", href: "#" },
    ],
    legal: [
      { label: "Termos de Uso", href: "#" },
      { label: "Privacidade", href: "#" },
    ],
  };

  const socials = [
    { icon: MessageSquare, href: "https://wa.me/554891015688", label: "WhatsApp" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "Youtube" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-card border-t border-border py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-transparent">
                <img
                  src="/nexus-logo.jpg"
                  alt="Nexus Automações"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="font-bold text-lg">
                Nexus<span className="text-primary">Automações</span>
              </span>
            </a>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Sistema completo de gestão empresarial com inteligência artificial integrada ao WhatsApp.
            </p>
            <div className="flex gap-4">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-3">
              {links.produto.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-3">
              {links.empresa.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-muted-foreground text-xs text-center">
            © 2026 Nexus Automações. Todos os direitos reservados. • Feito com ❤️ no Brasil
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
