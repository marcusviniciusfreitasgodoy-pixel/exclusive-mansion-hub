import { useState } from 'react';
import { Menu, X, Phone, Mail } from 'lucide-react';

interface NavLink {
  label: string;
  href: string;
}

interface NavigationBarProps {
  logo?: string;
  logoAlt?: string;
  links?: NavLink[];
  telefone?: string;
  email?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

const defaultLinks: NavLink[] = [
  { label: 'Início', href: '#inicio' },
  { label: 'O Empreendimento', href: '#empreendimento' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'Localização', href: '#localizacao' },
  { label: 'Contato', href: '#contato' },
];

const NavigationBar = ({
  logo,
  logoAlt = 'Logo',
  links = defaultLinks,
  telefone,
  email,
  ctaLabel = 'Agendar Visita',
  ctaHref = '#contato',
  className = '',
}: NavigationBarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className={`bg-[#0c4a6e] sticky top-0 z-50 ${className}`}>
      {/* Top bar - Contact info (desktop only) */}
      {(telefone || email) && (
        <div className="hidden lg:block bg-[#075985] text-white/80">
          <div className="container mx-auto px-6 py-2 flex justify-end gap-6 text-sm font-['Roboto']">
            {telefone && (
              <a href={`tel:${telefone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5" />
                {telefone}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5" />
                {email}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#inicio" className="flex-shrink-0">
            {logo ? (
              <img src={logo} alt={logoAlt} className="h-10 lg:h-12 w-auto" />
            ) : (
              <span className="font-['Montserrat'] font-bold text-xl lg:text-2xl text-white">
                Alto Padrão
              </span>
            )}
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-['Roboto'] text-sm text-white/90 hover:text-white relative py-2 transition-colors
                  after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 
                  after:bg-[#22c55e] after:scale-x-0 hover:after:scale-x-100 
                  after:transition-transform after:duration-300 after:origin-left"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Button (Desktop) */}
          <a
            href={ctaHref}
            className="hidden lg:inline-flex items-center px-6 py-2.5 
              bg-[#22c55e] hover:bg-[#16a34a] text-white font-['Montserrat'] font-semibold text-sm
              rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#22c55e]/30"
          >
            {ctaLabel}
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
          lg:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="container mx-auto px-6 py-4 border-t border-white/10">
          {/* Mobile Links */}
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="font-['Roboto'] text-white/90 hover:text-white hover:bg-white/10 
                  px-4 py-3 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile Contact Info */}
          {(telefone || email) && (
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
              {telefone && (
                <a
                  href={`tel:${telefone}`}
                  className="flex items-center gap-3 text-white/80 hover:text-white px-4 py-2 font-['Roboto'] text-sm"
                >
                  <Phone className="w-4 h-4 text-[#22c55e]" />
                  {telefone}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 text-white/80 hover:text-white px-4 py-2 font-['Roboto'] text-sm"
                >
                  <Mail className="w-4 h-4 text-[#22c55e]" />
                  {email}
                </a>
              )}
            </div>
          )}

          {/* Mobile CTA */}
          <a
            href={ctaHref}
            onClick={() => setIsMenuOpen(false)}
            className="mt-4 flex items-center justify-center px-6 py-3 
              bg-[#22c55e] hover:bg-[#16a34a] text-white font-['Montserrat'] font-semibold
              rounded-xl transition-all duration-300"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
