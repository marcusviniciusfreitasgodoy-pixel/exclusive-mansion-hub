import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PropertyBranding } from "@/types/property-page";

interface DynamicNavbarProps {
  branding: PropertyBranding;
}

export const DynamicNavbar = ({ branding }: DynamicNavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: "Detalhes", id: "details" },
    { label: "Galeria", id: "gallery" },
    { label: "Vídeos", id: "video" },
    { label: "Contato", id: "contact" },
  ];

  const whatsappNumber = branding.telefone?.replace(/\D/g, "") || "";
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/55${whatsappNumber}`
    : null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-primary/95 backdrop-blur-md shadow-elegant"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            {branding.imobiliariaLogo ? (
              <img
                src={branding.imobiliariaLogo}
                alt={branding.imobiliariaNome}
                className="h-10 object-contain"
              />
            ) : (
              <span className="text-xl font-bold text-white">
                {branding.imobiliariaNome}
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-sm font-medium text-white/80 hover:text-accent transition-smooth uppercase tracking-wider"
              >
                {link.label}
              </button>
            ))}
            {whatsappUrl && (
              <Button
                size="sm"
                className="bg-accent text-primary hover:bg-accent/90"
                onClick={() => window.open(whatsappUrl, "_blank")}
              >
                Agendar Visita
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-primary/95 backdrop-blur-md pb-6">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-sm font-medium text-white/80 hover:text-accent transition-smooth uppercase tracking-wider py-2"
                >
                  {link.label}
                </button>
              ))}
              {whatsappUrl && (
                <Button
                  size="sm"
                  className="bg-accent text-primary hover:bg-accent/90 mt-2"
                  onClick={() => window.open(whatsappUrl, "_blank")}
                >
                  Agendar Visita
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
