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

interface TemplateClassicoProps {
  data: PropertyPageData;
  integracoes?: Integracao[];
}

export default function TemplateClassico({ data, integracoes = [] }: TemplateClassicoProps) {
  const { property, branding, construtora, imobiliariaId, accessId } = data;
  const contactRef = useRef<HTMLDivElement>(null);

  const styles = getTemplateStyles("classico", property.customizacaoTemplate as any);

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
    <TemplateWrapper data={data} templateType="classico" integracoes={integracoes}>
      <style>{`
        [data-template="classico"] {
          background: #F5F5DC;
        }
        [data-template="classico"] h1,
        [data-template="classico"] h2,
        [data-template="classico"] h3 {
          font-family: var(--template-font-heading);
          color: ${styles.colorSecondary};
        }
        [data-template="classico"] section {
          padding: ${styles.sectionPadding} 0;
        }
        [data-template="classico"] .btn-primary {
          background: ${styles.colorSecondary};
          color: white;
          border-radius: ${styles.buttonRadius};
          transition: all ${styles.transitionDuration} ${styles.transitionEasing};
        }
        [data-template="classico"] .btn-primary:hover {
          background: ${styles.colorPrimary};
        }
        [data-template="classico"] .hero-section {
          height: ${styles.heroHeight};
        }
        [data-template="classico"] .card {
          background: white;
          border: 1px solid #ddd;
        }
        [data-template="classico"] .divider {
          border-top: 2px solid ${styles.colorSecondary};
          width: 60px;
          margin: 1rem auto;
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

      <ResumoMetricasImovel property={property} />

      <PropertyTabs />

      <div className="bg-white">
        <PropertyOverview property={property} />
      </div>

      {property.imagens && property.imagens.length > 1 && (
        <div id="gallery" className="py-12 bg-[#F5F5DC]">
          <div className="container mx-auto px-4">
            <h2
              className="text-2xl md:text-3xl font-bold mb-2 text-center"
              style={{ fontFamily: styles.fontHeading, color: styles.colorSecondary }}
            >
              Galeria de Imagens
            </h2>
            <div className="divider" />
            <div className="mt-8">
              <DynamicGallery images={property.imagens} />
            </div>
          </div>
        </div>
      )}

      {((property.videos && property.videos.length > 0) || property.tour360Url) && (
        <div className="bg-white">
          <DynamicVideoSection videos={property.videos} tour360Url={property.tour360Url} />
        </div>
      )}

      <div className="bg-[#F5F5DC]">
        <PropertyLocation property={property} />
      </div>

      <div className="bg-white">
        <PropertyDetailsNew property={property} construtoraNome={construtora.nome} />
      </div>

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
