import { useState } from "react";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from "lucide-react";
import type { PropertyBranding } from "@/types/property-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoWhite from "@/assets/logo-godoy-negativo.png";

interface LuxoFooterProps {
  branding: PropertyBranding;
  construtora: {
    nome: string;
    logo: string | null;
  };
}

export function LuxoFooter({ branding, construtora }: LuxoFooterProps) {
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
    { label: "Buy", href: "#" },
    { label: "Sell", href: "#" },
    { label: "Rent", href: "#" },
    { label: "Agents", href: "#" },
  ];

  return (
    <footer className="bg-black text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16 md:px-10 lg:px-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 - Navigation */}
          <div>
            <h4
              className="mb-6 text-sm font-semibold uppercase tracking-wider"
              style={{ color: "#D4AF37" }}
            >
              Navigation
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-[#D4AF37]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 - Contact */}
          <div>
            <h4
              className="mb-6 text-sm font-semibold uppercase tracking-wider"
              style={{ color: "#D4AF37" }}
            >
              Contact
            </h4>
            <ul className="space-y-4">
              {branding.telefone && (
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <Phone className="h-4 w-4 text-[#D4AF37]" />
                  <span>{branding.telefone}</span>
                </li>
              )}
              {branding.emailContato && (
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <Mail className="h-4 w-4 text-[#D4AF37]" />
                  <span>{branding.emailContato}</span>
                </li>
              )}
              <li className="flex items-start gap-3 text-sm text-white/70">
                <MapPin className="h-4 w-4 flex-shrink-0 text-[#D4AF37]" />
                <span>{branding.imobiliariaNome}</span>
              </li>
            </ul>
          </div>

          {/* Column 3 - Social Media */}
          <div>
            <h4
              className="mb-6 text-sm font-semibold uppercase tracking-wider"
              style={{ color: "#D4AF37" }}
            >
              Follow Us
            </h4>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="rounded-full border border-[#D4AF37]/30 p-2 text-[#D4AF37] transition-all hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 4 - Newsletter */}
          <div>
            <h4
              className="mb-6 text-sm font-semibold uppercase tracking-wider"
              style={{ color: "#D4AF37" }}
            >
              Newsletter
            </h4>
            <p className="mb-4 text-sm text-white/70">
              Subscribe to receive exclusive listings and market insights.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-[#D4AF37]"
                required
              />
              <Button
                type="submit"
                className="bg-[#D4AF37] px-4 text-black hover:bg-[#D4AF37]/90"
                style={{ borderRadius: "8px" }}
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto h-px w-full max-w-6xl bg-white/10" />

      {/* Bottom Section */}
      <div className="container mx-auto px-6 py-8 md:px-10 lg:px-20">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo/Branding */}
          <div className="flex items-center gap-4">
            {branding.imobiliariaLogo ? (
              <img
                src={branding.imobiliariaLogo}
                alt={branding.imobiliariaNome}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span
                className="text-lg font-semibold"
                style={{
                  fontFamily: "'Times New Roman', 'Georgia', serif",
                  color: "#D4AF37",
                }}
              >
                {branding.imobiliariaNome}
              </span>
            )}
          </div>

          {/* Powered by Godoy Prime */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Tecnologia</span>
            <img
              src={logoWhite}
              alt="Godoy Prime Realty"
              className="h-6 object-contain opacity-60"
            />
          </div>

          {/* Copyright & Legal */}
          <div className="text-center md:text-right">
            <p className="text-xs text-white/50">
              © {currentYear} {branding.imobiliariaNome}. All rights reserved.
            </p>
            <div className="mt-2 flex justify-center gap-4 text-xs text-white/40 md:justify-end">
              <a
                href="https://docs.google.com/document/d/1WKh-v-HKJz5rHLhqzaPRlj34YzSe78NhhiQgTnRShls/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="italic hover:text-[#D4AF37]"
              >
                Privacy Policy
              </a>
              <span>|</span>
              <a
                href="https://docs.google.com/document/d/1JqColkt5uzQnajZDWVPTdy423kJlVDEpQepGRGlGFp8/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="italic hover:text-[#D4AF37]"
              >
                Terms of Use
              </a>
            </div>
          </div>
        </div>

        {/* Developer Credit */}
        {construtora.nome && (
          <p className="mt-6 text-center text-xs text-white/30">
            Property marketed by {construtora.nome}
          </p>
        )}
      </div>
    </footer>
  );
}
