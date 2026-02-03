import { useRef } from "react";
import type { PropertyPageData } from "@/types/property-page";
import type { Integracao } from "@/types/integrations";
import { TemplateWrapper } from "./TemplateWrapper";
import { getTemplateStyles } from "./templateStyles";
import { BarraAcoesImovel } from "@/components/property/BarraAcoesImovel";
import { PropertyHeroNew } from "@/components/property/PropertyHeroNew";
import { ResumoMetricasImovel } from "@/components/property/ResumoMetricasImovel";
import { PropertyTabs } from "@/components/property/PropertyTabs";
import { PropertyOverview } from "@/components/property/PropertyOverview";
import { PropertyLocation } from "@/components/property/PropertyLocation";
import { PropertyDetailsNew } from "@/components/property/PropertyDetailsNew";
import { BlocoCorretoresImovel } from "@/components/property/BlocoCorretoresImovel";
import { PropertyRecommendations } from "@/components/property/PropertyRecommendations";
import { PropertyContactSection } from "@/components/property/PropertyContactSection";
import { SofiaAssistentSection } from "@/components/property/SofiaAssistentSection";
import { DynamicGallery } from "@/components/property/DynamicGallery";
import { DynamicVideoSection } from "@/components/property/DynamicVideoSection";

interface TemplateModernoProps {
  data: PropertyPageData;
  integracoes?: Integracao[];
}

export default function TemplateModerno({ data, integracoes = [] }: TemplateModernoProps) {
  const { property, branding, construtora, imobiliariaId, accessId } = data;
  const contactRef = useRef<HTMLDivElement>(null);

  const styles = getTemplateStyles("moderno", property.customizacaoTemplate as any);

  const scrollToContact = () => {
    const element = document.getElementById("section-contact");
    if (element) {
      const offset = 80;
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const openGallery = () => {
    const element = document.getElementById("gallery");
    if (element) {
      const offset = 80;
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <TemplateWrapper data={data} templateType="moderno" integracoes={integracoes}>
      <style>{`
        [data-template="moderno"] {
          background: #ffffff;
        }
        [data-template="moderno"] h1,
        [data-template="moderno"] h2,
        [data-template="moderno"] h3 {
          font-family: var(--template-font-heading);
          color: ${styles.colorPrimary};
        }
        [data-template="moderno"] section {
          padding: ${styles.sectionPadding} 0;
        }
        [data-template="moderno"] .btn-primary {
          background: linear-gradient(135deg, ${styles.colorPrimary}, ${styles.colorSecondary});
          color: white;
          border-radius: ${styles.buttonRadius};
          box-shadow: 0 4px 15px rgba(0,102,255,0.3);
          transition: all ${styles.transitionDuration} ${styles.transitionEasing};
        }
        [data-template="moderno"] .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,102,255,0.4);
        }
        [data-template="moderno"] .hero-section {
          height: ${styles.heroHeight};
        }
        [data-template="moderno"] .card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        [data-template="moderno"] .accent-bar {
          background: linear-gradient(90deg, ${styles.colorPrimary}, ${styles.colorSecondary});
          height: 4px;
        }
      `}</style>

      <BarraAcoesImovel property={property} onGalleryClick={openGallery} />

      <div className="hero-section">
        <PropertyHeroNew
          property={property}
          branding={branding}
          onContactClick={scrollToContact}
          onGalleryOpen={openGallery}
        />
      </div>

      <div className="accent-bar" />

      <ResumoMetricasImovel property={property} />

      <PropertyTabs />

      <PropertyOverview property={property} />

      {property.imagens && property.imagens.length > 1 && (
        <div id="gallery" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2
              className="text-2xl md:text-3xl font-bold mb-8"
              style={{ fontFamily: styles.fontHeading, color: styles.colorPrimary }}
            >
              Galeria de Fotos
            </h2>
            <DynamicGallery images={property.imagens} />
          </div>
        </div>
      )}

      {((property.videos && property.videos.length > 0) || property.tour360Url) && (
        <DynamicVideoSection videos={property.videos} tour360Url={property.tour360Url} />
      )}

      <PropertyLocation property={property} />

      <PropertyDetailsNew property={property} construtoraNome={construtora.nome} />

      <BlocoCorretoresImovel property={property} branding={branding} />

      <PropertyRecommendations currentProperty={property} imobiliariaId={imobiliariaId} />

      <SofiaAssistentSection 
        propertyTitle={property.titulo}
        imovelId={property.id}
        imobiliariaId={imobiliariaId}
        construtorId={property.construtoraId}
        imobiliariaNome={branding?.imobiliariaNome}
      />

      <div ref={contactRef}>
        <PropertyContactSection
          property={property}
          branding={branding}
          imobiliariaId={imobiliariaId}
          accessId={accessId}
        />
      </div>
    </TemplateWrapper>
  );
}
