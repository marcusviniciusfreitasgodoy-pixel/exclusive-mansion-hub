import { Helmet, HelmetProvider } from "react-helmet-async";
import { useRef, useState, lazy, Suspense } from "react";
import { usePropertyPage } from "@/hooks/usePropertyPage";
import { DynamicNavbar } from "@/components/property/DynamicNavbar";
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
import { DynamicFooter } from "@/components/property/DynamicFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { Loader2 } from "lucide-react";

// Lazy load templates for better performance
const TemplateLuxo = lazy(() => import("@/components/templates/TemplateLuxo"));
const TemplateModerno = lazy(() => import("@/components/templates/TemplateModerno"));
const TemplateClassico = lazy(() => import("@/components/templates/TemplateClassico"));

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}

function ErrorPage({ error }: { error: string | null }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary px-6 text-center">
      <h1 className="mb-4 text-4xl font-bold text-white">
        Imóvel não encontrado
      </h1>
      <p className="text-lg text-white/60">
        {error || "O imóvel que você está procurando não está disponível."}
      </p>
      <a
        href="/"
        className="mt-8 inline-block rounded-lg bg-accent px-6 py-3 font-semibold text-primary transition-colors hover:bg-accent/90"
      >
        Voltar ao início
      </a>
    </div>
  );
}

// Legacy/Default template (when no template is specified)
function DefaultTemplate({ data }: { data: NonNullable<ReturnType<typeof usePropertyPage>['data']> }) {
  const { property, branding, construtora, imobiliariaId, accessId } = data;
  const contactRef = useRef<HTMLDivElement>(null);

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
  const title = property.seoTitulo || `${property.headline || property.titulo} - ${branding.imobiliariaNome}`;
  const description = property.seoDescricao || (property.descricao
    ? property.descricao.substring(0, 160)
    : `${property.titulo} - Imóvel exclusivo em ${property.bairro || property.cidade || "localização privilegiada"}`);
  const ogImage = property.imagens?.[0]?.url || "";

  const brandingStyles = {
    "--brand-primary": branding.corPrimaria,
  } as React.CSSProperties;

  return (
    <HelmetProvider>
      <div style={brandingStyles}>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          {ogImage && <meta property="og:image" content={ogImage} />}
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          {ogImage && <meta name="twitter:image" content={ogImage} />}
        </Helmet>

        <main className="min-h-screen bg-background">
          <DynamicNavbar branding={branding} />
          <ScrollToTop />
          
          <BarraAcoesImovel 
            property={property} 
            onGalleryClick={openGallery}
          />

          {branding.telefone && (
            <FloatingWhatsApp phoneNumber={branding.telefone.replace(/\D/g, "")} />
          )}

          <PropertyHeroNew 
            property={property} 
            branding={branding} 
            onContactClick={scrollToContact}
            onGalleryOpen={openGallery}
          />

          <ResumoMetricasImovel property={property} />
          <PropertyTabs />
          <PropertyOverview property={property} />

          {property.imagens && property.imagens.length > 1 && (
            <div id="gallery" className="py-12 md:py-16 bg-muted/30">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8">
                  Galeria de Fotos
                </h2>
                <DynamicGallery images={property.imagens} />
              </div>
            </div>
          )}

          {((property.videos && property.videos.length > 0) || property.tour360Url) && (
            <DynamicVideoSection
              videos={property.videos}
              tour360Url={property.tour360Url}
            />
          )}

          <PropertyLocation property={property} />
          <PropertyDetailsNew 
            property={property} 
            construtoraNome={construtora.nome}
          />
          <BlocoCorretoresImovel 
            property={property}
            branding={branding}
          />
          <PropertyRecommendations 
            currentProperty={property}
            imobiliariaId={imobiliariaId}
          />
          <SofiaAssistentSection 
            propertyTitle={property.titulo}
          />
          <div ref={contactRef}>
            <PropertyContactSection
              property={property}
              branding={branding}
              imobiliariaId={imobiliariaId}
              accessId={accessId}
            />
          </div>
          <DynamicFooter branding={branding} construtora={construtora} />
        </main>
      </div>
    </HelmetProvider>
  );
}

export default function PropertyPage() {
  const { data, isLoading, error } = usePropertyPage();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return <ErrorPage error={error} />;
  }

  const templateType = data.property.templateEscolhido || 'moderno';

  // Render the appropriate template based on template_escolhido
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {templateType === 'luxo' && <TemplateLuxo data={data} />}
      {templateType === 'moderno' && <TemplateModerno data={data} />}
      {templateType === 'classico' && <TemplateClassico data={data} />}
      {!['luxo', 'moderno', 'classico'].includes(templateType) && <DefaultTemplate data={data} />}
    </Suspense>
  );
}