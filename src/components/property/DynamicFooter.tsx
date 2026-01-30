import type { PropertyBranding } from "@/types/property-page";
import logoWhite from "@/assets/logo-negativo.png";

interface DynamicFooterProps {
  branding: PropertyBranding;
  construtora: {
    nome: string;
    logo: string | null;
  };
}

export const DynamicFooter = ({ branding, construtora }: DynamicFooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary py-12 text-center">
      <div className="container mx-auto px-6">
        {/* Imobiliaria Logo/Name */}
        {branding.imobiliariaLogo ? (
          <img
            src={branding.imobiliariaLogo}
            alt={branding.imobiliariaNome}
            className="mx-auto mb-4 h-10 object-contain"
          />
        ) : (
          <p className="mb-4 text-lg font-semibold text-white">
            {branding.imobiliariaNome}
          </p>
        )}

        {/* Divider */}
        <div className="mx-auto mb-6 h-px w-24 bg-accent/30" />

        {/* Powered by Godoy Prime */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-xs text-white/40">Tecnologia</span>
          <img
            src={logoWhite}
            alt="Godoy Prime Realty"
            className="h-8 object-contain opacity-60"
          />
        </div>

        <p className="text-sm text-white/60">
          © {currentYear} {branding.imobiliariaNome}. Todos os direitos
          reservados.
        </p>

        {construtora.nome && (
          <p className="mt-2 text-xs text-white/40">
            Imóvel comercializado por {construtora.nome}
          </p>
        )}

        <div className="mt-6 flex justify-center gap-4 text-xs text-white/40">
          <a
            href="https://docs.google.com/document/d/1WKh-v-HKJz5rHLhqzaPRlj34YzSe78NhhiQgTnRShls/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-smooth"
          >
            Política de Privacidade
          </a>
          <span>•</span>
          <a
            href="https://docs.google.com/document/d/1JqColkt5uzQnajZDWVPTdy423kJlVDEpQepGRGlGFp8/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-smooth"
          >
            Termos de Uso
          </a>
        </div>
      </div>
    </footer>
  );
};
