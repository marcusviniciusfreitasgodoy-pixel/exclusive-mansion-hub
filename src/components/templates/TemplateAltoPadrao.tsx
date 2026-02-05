import { useRef } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import type { PropertyPageData } from "@/types/property-page";
import type { Integracao } from "@/types/integrations";
import { getTemplateStyles } from "./templateStyles";
import { DynamicNavbar } from "@/components/property/DynamicNavbar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { AnalyticsScripts } from "@/components/integrations/AnalyticsScripts";
import { BarraAcoesImovel } from "@/components/property/BarraAcoesImovel";
import { ResumoMetricasImovel } from "@/components/property/ResumoMetricasImovel";
import { PropertyTabs } from "@/components/property/PropertyTabs";
import { BlocoCorretoresImovel } from "@/components/property/BlocoCorretoresImovel";
import { PropertyRecommendations } from "@/components/property/PropertyRecommendations";
import { PropertyContactSection } from "@/components/property/PropertyContactSection";
import { SofiaAssistentSection } from "@/components/property/SofiaAssistentSection";
import { DynamicVideoSection } from "@/components/property/DynamicVideoSection";

// Promotional materials sections
import { PropertyBookSection } from "@/components/property/PropertyBookSection";
import { PropertyROISection } from "@/components/property/PropertyROISection";
import { PropertyPriceTableSection } from "@/components/property/PropertyPriceTableSection";
import { PropertyFloorPlanSection } from "@/components/property/PropertyFloorPlanSection";
import { PropertySecuritySection } from "@/components/property/PropertySecuritySection";
import { PropertySustainabilitySection } from "@/components/property/PropertySustainabilitySection";
import { PropertyInfrastructureSection } from "@/components/property/PropertyInfrastructureSection";
import { PropertyCustomizationSection } from "@/components/property/PropertyCustomizationSection";

// Alto Padrão-specific components (Ocean/Nature Style)
import { AltoPadraoHero, AltoPadraoGallery, AltoPadraoDetailsGrid, AltoPadraoFooter } from "@/components/property/altopadrao";

interface TemplateAltoPadraoProps {
  data: PropertyPageData;
  integracoes?: Integracao[];
}

export default function TemplateAltoPadrao({ data, integracoes = [] }: TemplateAltoPadraoProps) {
  const { property, branding, construtora, imobiliariaId, accessId } = data;
  const contactRef = useRef<HTMLDivElement>(null);

  const styles = getTemplateStyles("alto_padrao", property.customizacaoTemplate as any);

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

  // SEO meta data
  const title =
    property.seoTitulo ||
    `${property.headline || property.titulo} - ${branding.imobiliariaNome}`;
  const description =
    property.seoDescricao ||
    (property.descricao
      ? property.descricao.substring(0, 160)
      : `${property.titulo} - Imóvel exclusivo em ${property.bairro || property.cidade || "localização privilegiada"}`);
  const ogImage = property.imagens?.[0]?.url || "";

  return (
    <HelmetProvider>
      <div data-template="altopadrao" className="min-h-screen bg-white">
        <Helmet>
          <title>{title}</title>
          {branding.faviconUrl ? (
            <link rel="icon" href={branding.faviconUrl} />
          ) : (
            <link rel="icon" href="/favicon.ico" />
          )}
          <meta name="description" content={description} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          {ogImage && <meta property="og:image" content={ogImage} />}
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          {ogImage && <meta name="twitter:image" content={ogImage} />}
          {/* Load Fonts - Montserrat and Roboto */}
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;600&display=swap"
            rel="stylesheet"
          />
        </Helmet>

        {/* Analytics Scripts Injection */}
        {integracoes.length > 0 && <AnalyticsScripts integracoes={integracoes} />}

        {/* Scoped Alto Padrão Styles (Ocean/Nature-inspired) */}
        <style>{`
          [data-template="altopadrao"] {
            font-family: 'Roboto', sans-serif;
            color: #262626;
          }
          [data-template="altopadrao"] h1,
          [data-template="altopadrao"] h2,
          [data-template="altopadrao"] h3,
          [data-template="altopadrao"] h4 {
            font-family: 'Montserrat', sans-serif;
            color: #0c4a6e;
          }
          [data-template="altopadrao"] section {
            padding: ${styles.sectionPadding} 0;
          }
          [data-template="altopadrao"] .btn-altopadrao {
            background: #0284c7;
            color: #ffffff;
            border-radius: 12px;
            transition: all 300ms ease-in-out;
          }
          [data-template="altopadrao"] .btn-altopadrao:hover {
            box-shadow: 0 4px 20px rgba(2, 132, 199, 0.4);
            transform: translateY(-2px);
          }
          [data-template="altopadrao"] .icon-accent {
            color: #22c55e;
          }
          /* Fade-in animation on scroll */
          [data-template="altopadrao"] .fade-section {
            opacity: 0;
            transform: translateY(20px);
            animation: altoPadraoFadeIn 0.5s ease-out forwards;
          }
          @keyframes altoPadraoFadeIn {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        <main>
          <DynamicNavbar branding={branding} />
          <ScrollToTop />

          {branding.telefone && (
            <FloatingWhatsApp
              phoneNumber={branding.telefone.replace(/\D/g, "")}
            />
          )}

          <ChatbotWidget
            imovelId={property.id}
            imobiliariaId={imobiliariaId}
            construtorId={property.construtoraId}
            imovelTitulo={property.titulo}
            imobiliariaNome={branding.imobiliariaNome}
          />

          {/* Action Bar */}
          <BarraAcoesImovel property={property} onGalleryClick={openGallery} />

          {/* Hero Section - 70vh with ocean blue overlay */}
          <AltoPadraoHero
            property={property}
            branding={branding}
            onContactClick={scrollToContact}
            onGalleryOpen={openGallery}
          />

          {/* Metrics Summary */}
          <div className="bg-white border-b border-gray-100">
            <ResumoMetricasImovel property={property} />
          </div>

          {/* Navigation Tabs */}
          <PropertyTabs />

          {/* Details Section - 2 columns (Ocean/Nature style) */}
          <AltoPadraoDetailsGrid property={property} construtoraNome={construtora.nome} />

          {/* Gallery Section - Grid responsive */}
          {property.imagens && property.imagens.length > 1 && (
            <section id="gallery" className="py-20 bg-white">
              <div className="container mx-auto px-5 md:px-10 lg:px-20">
                <h2
                  className="mb-12 text-center text-3xl font-semibold uppercase tracking-wide md:text-4xl"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "#0c4a6e",
                  }}
                >
                  Galeria Exclusiva
                </h2>
                <AltoPadraoGallery images={property.imagens} />
              </div>
            </section>
          )}

          {/* Video Section */}
          {((property.videos && property.videos.length > 0) || property.tour360Url) && (
            <div className="bg-gray-50">
              <DynamicVideoSection videos={property.videos} tour360Url={property.tour360Url} />
            </div>
          )}

          {/* Promotional Materials - Conditional Sections */}
          {property.materiaisPromocionais?.bookDigital?.url && (
            <PropertyBookSection data={property.materiaisPromocionais.bookDigital} propertyTitle={property.titulo} />
          )}

          {property.materiaisPromocionais?.estudoRentabilidade?.url && (
            <PropertyROISection data={property.materiaisPromocionais.estudoRentabilidade} />
          )}

          {property.materiaisPromocionais?.tabelaVendas?.url && (
            <PropertyPriceTableSection data={property.materiaisPromocionais.tabelaVendas} />
          )}

          {property.materiaisPromocionais?.plantaUnidade?.url && (
            <PropertyFloorPlanSection data={property.materiaisPromocionais.plantaUnidade} areaPrivativa={property.areaPrivativa} />
          )}

          {property.materiaisPromocionais?.seguranca && property.materiaisPromocionais.seguranca.length > 0 && (
            <PropertySecuritySection items={property.materiaisPromocionais.seguranca} />
          )}

          {property.materiaisPromocionais?.sustentabilidade && property.materiaisPromocionais.sustentabilidade.length > 0 && (
            <PropertySustainabilitySection items={property.materiaisPromocionais.sustentabilidade} />
          )}

          {property.materiaisPromocionais?.infraestrutura && property.materiaisPromocionais.infraestrutura.length > 0 && (
            <PropertyInfrastructureSection items={property.materiaisPromocionais.infraestrutura} />
          )}

          {property.materiaisPromocionais?.personalizacao && property.materiaisPromocionais.personalizacao.length > 0 && (
            <PropertyCustomizationSection items={property.materiaisPromocionais.personalizacao} />
          )}

          {/* Corretores */}
          <BlocoCorretoresImovel property={property} branding={branding} />

          {/* Recommendations */}
          <PropertyRecommendations currentProperty={property} imobiliariaId={imobiliariaId} />

          {/* Sofia Assistant */}
          <SofiaAssistentSection
            propertyTitle={property.titulo}
            imovelId={property.id}
            imobiliariaId={imobiliariaId}
            construtorId={property.construtoraId}
            imobiliariaNome={branding?.imobiliariaNome}
          />

          {/* Contact Section */}
          <div ref={contactRef}>
            <PropertyContactSection
              property={property}
              branding={branding}
              imobiliariaId={imobiliariaId}
              accessId={accessId}
            />
          </div>

          {/* Footer - 4 columns (Ocean/Nature style) */}
          <AltoPadraoFooter branding={branding} construtora={construtora} />
        </main>
      </div>
    </HelmetProvider>
  );
}
