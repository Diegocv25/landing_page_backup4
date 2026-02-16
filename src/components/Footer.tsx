import { Instagram } from "lucide-react";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.52 0 .2 5.32.2 11.86c0 2.1.55 4.16 1.6 5.98L0 24l6.33-1.76a11.82 11.82 0 0 0 5.73 1.46h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.23-6.15-3.41-8.36Zm-8.46 18.2h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.76 1.04 1-3.67-.23-.38a9.84 9.84 0 0 1-1.51-5.22c0-5.44 4.43-9.87 9.88-9.87 2.64 0 5.13 1.03 7 2.9a9.83 9.83 0 0 1 2.9 7c0 5.45-4.43 9.89-9.87 9.89Zm5.42-7.42c-.3-.15-1.8-.89-2.08-.99-.28-.1-.49-.15-.7.15-.2.3-.79.99-.97 1.2-.18.2-.35.23-.65.08-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.48-1.74-1.65-2.03-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.7-1.69-.96-2.32-.25-.6-.5-.52-.7-.53h-.6c-.2 0-.53.07-.8.38-.28.3-1.06 1.03-1.06 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.13 3.26 5.15 4.57.72.31 1.29.5 1.73.64.73.23 1.4.2 1.92.12.59-.09 1.8-.74 2.05-1.45.25-.72.25-1.33.17-1.45-.08-.12-.28-.2-.58-.35Z" />
  </svg>
);

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
    { icon: WhatsAppIcon, href: "https://wa.me/554891015688", label: "WhatsApp" },
    { icon: Instagram, href: "#", label: "Instagram" },
  ];

  return (
    <footer className="bg-card border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-6">
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-3 mb-4">
              <div className="w-[72px] h-[72px] rounded-lg overflow-hidden bg-transparent">
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
