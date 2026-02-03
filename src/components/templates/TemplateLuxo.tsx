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

// Luxo-specific components (Sotheby's Style)
import { LuxoHero, LuxoGallery, LuxoDetailsGrid, LuxoFooter } from "@/components/property/luxo";

interface TemplateLuxoProps {
  data: PropertyPageData;
  integracoes?: Integracao[];
}

export default function TemplateLuxo({ data, integracoes = [] }: TemplateLuxoProps) {
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
      <div data-template="luxo" className="min-h-screen bg-white">
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
          {/* Load Fonts */}
          <link
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </Helmet>

        {/* Analytics Scripts Injection */}
        {integracoes.length > 0 && <AnalyticsScripts integracoes={integracoes} />}

        {/* Scoped Luxo Styles (Sotheby's-inspired) */}
        <style>{`
          [data-template="luxo"] {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #333333;
          }
          [data-template="luxo"] h1,
          [data-template="luxo"] h2,
          [data-template="luxo"] h3,
          [data-template="luxo"] h4 {
            font-family: 'Times New Roman', 'Georgia', serif;
          }
          [data-template="luxo"] section {
            padding: ${styles.sectionPadding} 0;
          }
          [data-template="luxo"] .btn-luxo {
            background: #D4AF37;
            color: #000000;
            border-radius: 8px;
            transition: all 500ms ease-out;
          }
          [data-template="luxo"] .btn-luxo:hover {
            box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4);
            transform: translateY(-2px);
          }
          /* Fade-in animation on scroll */
          [data-template="luxo"] .fade-section {
            opacity: 0;
            transform: translateY(20px);
            animation: luxoFadeIn 0.5s ease-out forwards;
          }
          @keyframes luxoFadeIn {
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

          {/* Hero Section - 70vh with overlay */}
          <LuxoHero
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

          {/* Details Section - 2 columns (Sotheby's style) */}
          <LuxoDetailsGrid property={property} construtoraNome={construtora.nome} />

          {/* Gallery Section - Grid responsive */}
          {property.imagens && property.imagens.length > 1 && (
            <section id="gallery" className="py-20 bg-white">
              <div className="container mx-auto px-5 md:px-10 lg:px-20">
                <h2
                  className="mb-12 text-center text-3xl font-bold uppercase tracking-wide md:text-4xl"
                  style={{
                    fontFamily: "'Times New Roman', 'Georgia', serif",
                    color: "#D4AF37",
                  }}
                >
                  Galeria Exclusiva
                </h2>
                <LuxoGallery images={property.imagens} />
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

          {/* Footer - 4 columns (Sotheby's style) */}
          <LuxoFooter branding={branding} construtora={construtora} />
        </main>
      </div>
    </HelmetProvider>
  );
}
