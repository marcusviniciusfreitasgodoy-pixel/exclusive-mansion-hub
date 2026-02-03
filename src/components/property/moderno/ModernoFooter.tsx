import { useState } from "react";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone } from "lucide-react";
import type { PropertyBranding } from "@/types/property-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoWhite from "@/assets/logo-godoy-negativo.png";

interface ModernoFooterProps {
  branding: PropertyBranding;
  construtora: {
    nome: string;
    logo: string | null;
  };
}

export function ModernoFooter({ branding, construtora }: ModernoFooterProps) {
  const [email, setEmail] = useState("");
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter signup logic here
    setEmail("");
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  const navLinks = [
    { label: "Comprar", href: "#" },
    { label: "Vender", href: "#" },
    { label: "Alugar", href: "#" },
    { label: "Corretores", href: "#" },
  ];

  return (
    <footer
      className="text-gray-700"
      style={{ backgroundColor: "#E0F2FE" }}
    >
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Column 1 - Navigation & Branding */}
          <div>
            {/* Branding */}
            <div className="mb-6">
              {branding.imobiliariaLogo ? (
                <img
                  src={branding.imobiliariaLogo}
                  alt={branding.imobiliariaNome}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <span
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "#1E3A8A",
                  }}
                >
                  {branding.imobiliariaNome}
                </span>
              )}
            </div>

            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-[#1E3A8A]"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="mt-6 space-y-2">
              {branding.telefone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-[#10B981]" />
                  <span>{branding.telefone}</span>
                </div>
              )}
              {branding.emailContato && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-[#10B981]" />
                  <span>{branding.emailContato}</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 2 - Social Media */}
          <div className="flex flex-col items-center">
            <h4
              className="mb-4 text-sm font-semibold uppercase tracking-wide"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                color: "#374151",
              }}
            >
              Redes Sociais
            </h4>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="rounded-full bg-[#10B981]/20 p-2.5 text-[#10B981] transition-all hover:bg-[#10B981] hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Powered by Godoy Prime */}
            <div className="mt-8 flex items-center gap-2">
              <span className="text-xs text-gray-400">Tecnologia</span>
              <img
                src={logoWhite}
                alt="Godoy Prime Realty"
                className="h-5 object-contain opacity-40 brightness-0"
              />
            </div>
          </div>

          {/* Column 3 - Newsletter */}
          <div>
            <h4
              className="mb-4 text-sm font-semibold uppercase tracking-wide"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                color: "#374151",
              }}
            >
              Newsletter
            </h4>
            <p
              className="mb-4 text-sm text-gray-600"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Receba as melhores oportunidades diretamente no seu e-mail.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border-gray-300 bg-white text-gray-800 placeholder:text-gray-400 focus:border-[#1E3A8A]"
                style={{ borderRadius: "12px" }}
                required
              />
              <Button
                type="submit"
                className="px-4 text-white"
                style={{
                  backgroundColor: "#1E3A8A",
                  borderRadius: "12px",
                }}
              >
                Assinar
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto h-px w-full max-w-4xl bg-gray-300/50" />

      {/* Bottom Section */}
      <div className="container mx-auto px-6 py-6 md:px-12 lg:px-24">
        <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <p
            className="text-xs text-gray-500"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            © {currentYear} {branding.imobiliariaNome}. Todos os direitos reservados.
          </p>
          
          <div className="flex gap-4 text-xs text-gray-500">
            <a
              href="https://docs.google.com/document/d/1WKh-v-HKJz5rHLhqzaPRlj34YzSe78NhhiQgTnRShls/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1E3A8A]"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Política de Privacidade
            </a>
            <span>|</span>
            <a
              href="https://docs.google.com/document/d/1JqColkt5uzQnajZDWVPTdy423kJlVDEpQepGRGlGFp8/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1E3A8A]"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Termos de Uso
            </a>
          </div>
        </div>

        {/* Developer Credit */}
        {construtora.nome && (
          <p
            className="mt-4 text-center text-xs text-gray-400"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Imóvel comercializado por {construtora.nome}
          </p>
        )}
      </div>
    </footer>
  );
}
