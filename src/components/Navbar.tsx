import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo-negativo.png";
import logoDark from "@/assets/logo-principal.png";

export const Navbar = () => {
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
    { label: "Início", id: "hero" },
    { label: "Detalhes", id: "details" },
    { label: "Descrição", id: "description" },
    { label: "Galeria", id: "gallery" },
    { label: "Vídeo", id: "video" },
    { label: "Contato", id: "contact" },
  ];

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-elegant ${
        isScrolled
          ? "bg-white shadow-elegant"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex-shrink-0"
          >
            <img
              src={isScrolled ? logoDark : logo}
              alt="Godoy Prime Realty"
              className="h-10 transition-elegant md:h-12"
            />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`text-sm font-medium uppercase tracking-wide transition-smooth hover:text-accent ${
                  isScrolled ? "text-primary" : "text-white"
                }`}
              >
                {link.label}
              </button>
            ))}
            <Button
              className="bg-accent text-primary hover:bg-accent/90 shadow-gold"
              onClick={() => scrollToSection("contact")}
            >
              Agendar Visita
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden ${isScrolled ? "text-primary" : "text-white"}`}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-border/10 bg-white lg:hidden">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-left text-base font-medium text-primary transition-smooth hover:text-accent"
                >
                  {link.label}
                </button>
              ))}
              <Button
                className="mt-2 w-full bg-accent text-primary hover:bg-accent/90"
                onClick={() => scrollToSection("contact")}
              >
                Agendar Visita
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
