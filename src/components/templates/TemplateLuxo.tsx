import { useRef } from "react";
import type { PropertyPageData } from "@/types/property-page";
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

interface TemplateLuxoProps {
  data: PropertyPageData;
}

export default function TemplateLuxo({ data }: TemplateLuxoProps) {
  const { property, branding, construtora, imobiliariaId, accessId } = data;
  const contactRef = useRef<HTMLDivElement>(null);

  const styles = getTemplateStyles("luxo", property.customizacaoTemplate as any);

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
    <TemplateWrapper data={data} templateType="luxo">
      <style>{`
        [data-template="luxo"] {
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
        }
        [data-template="luxo"] h1,
        [data-template="luxo"] h2,
        [data-template="luxo"] h3 {
          font-family: var(--template-font-heading);
          color: ${styles.colorSecondary};
          letter-spacing: 0.05em;
        }
        [data-template="luxo"] section {
          padding: ${styles.sectionPadding} 0;
        }
        [data-template="luxo"] .btn-primary {
          background: transparent;
          border: 1px solid ${styles.colorSecondary};
          color: ${styles.colorSecondary};
          border-radius: ${styles.buttonRadius};
          transition: all ${styles.transitionDuration} ${styles.transitionEasing};
        }
        [data-template="luxo"] .btn-primary:hover {
          background: ${styles.colorSecondary};
          color: #000;
        }
        [data-template="luxo"] .hero-section {
          height: ${styles.heroHeight};
        }
        [data-template="luxo"] .card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(212,175,55,0.2);
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

      <div className="bg-black/90">
        <ResumoMetricasImovel property={property} />
      </div>

      <PropertyTabs />

      <div className="bg-gradient-to-b from-black to-gray-900 text-white">
        <PropertyOverview property={property} />
      </div>

      {property.imagens && property.imagens.length > 1 && (
        <div id="gallery" className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <h2
              className="text-3xl md:text-4xl font-bold mb-12 text-center"
              style={{ fontFamily: styles.fontHeading, color: styles.colorSecondary }}
            >
              Galeria Exclusiva
            </h2>
            <DynamicGallery images={property.imagens} />
          </div>
        </div>
      )}

      {((property.videos && property.videos.length > 0) || property.tour360Url) && (
        <div className="bg-gray-900">
          <DynamicVideoSection videos={property.videos} tour360Url={property.tour360Url} />
        </div>
      )}

      <div className="bg-black">
        <PropertyLocation property={property} />
      </div>

      <div className="bg-gray-900">
        <PropertyDetailsNew property={property} construtoraNome={construtora.nome} />
      </div>

      <BlocoCorretoresImovel property={property} branding={branding} />

      <PropertyRecommendations currentProperty={property} imobiliariaId={imobiliariaId} />

      <SofiaAssistentSection propertyTitle={property.titulo} />

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
