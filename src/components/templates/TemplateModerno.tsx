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

// Moderno-specific components (The Agency Style)
import { ModernoHero, ModernoGallery, ModernoDetailsGrid, ModernoFooter } from "@/components/property/moderno";

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
      <div data-template="moderno" className="min-h-screen bg-white">
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
          {/* Load Montserrat Font */}
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </Helmet>

        {/* Analytics Scripts Injection */}
        {integracoes.length > 0 && <AnalyticsScripts integracoes={integracoes} />}

        {/* Scoped Moderno Styles (The Agency-inspired) */}
        <style>{`
          [data-template="moderno"] {
            font-family: 'Montserrat', sans-serif;
            color: #374151;
          }
          [data-template="moderno"] h1,
          [data-template="moderno"] h2,
          [data-template="moderno"] h3,
          [data-template="moderno"] h4 {
            font-family: 'Montserrat', sans-serif;
          }
          [data-template="moderno"] section {
            padding: ${styles.sectionPadding} 0;
          }
          [data-template="moderno"] .btn-moderno {
            background: #1E3A8A;
            color: white;
            border-radius: 12px;
            transition: all 300ms ease-in-out;
          }
          [data-template="moderno"] .btn-moderno:hover {
            box-shadow: 0 4px 20px rgba(30, 58, 138, 0.4);
            transform: translateY(-2px);
          }
          /* Scroll-triggered animation */
          [data-template="moderno"] .fade-section {
            opacity: 0;
            transform: translateY(15px);
            animation: modernoFadeIn 0.3s ease-out forwards;
          }
          @keyframes modernoFadeIn {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          /* Green accent for icons */
          [data-template="moderno"] .icon-accent {
            color: #10B981;
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

          {/* Hero Section - 60vh with left-aligned content */}
          <ModernoHero
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

          {/* Details Section - 3 columns lifestyle-focused */}
          <ModernoDetailsGrid property={property} construtoraNome={construtora.nome} />

          {/* Gallery Section - Slider with autoplay */}
          {property.imagens && property.imagens.length > 1 && (
            <section id="gallery" className="py-16 bg-white">
              <div className="container mx-auto px-6 md:px-12 lg:px-24">
                <h2
                  className="mb-10 text-center text-2xl font-bold capitalize md:text-3xl"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "#1E3A8A",
                  }}
                >
                  Galeria de fotos
                </h2>
                <ModernoGallery images={property.imagens} />
              </div>
            </section>
          )}

          {/* Video Section */}
          {((property.videos && property.videos.length > 0) || property.tour360Url) && (
            <div className="bg-gray-50">
              <DynamicVideoSection videos={property.videos} tour360Url={property.tour360Url} />
            </div>
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

          {/* Footer - 3 columns with blue background */}
          <ModernoFooter branding={branding} construtora={construtora} />
        </main>
      </div>
    </HelmetProvider>
  );
}
