import { Helmet, HelmetProvider } from "react-helmet-async";
import { usePropertyPage } from "@/hooks/usePropertyPage";
import { DynamicNavbar } from "@/components/property/DynamicNavbar";
import { DynamicHero } from "@/components/property/DynamicHero";
import { DynamicPropertyDetails } from "@/components/property/DynamicPropertyDetails";
import { DynamicDescription } from "@/components/property/DynamicDescription";
import { DynamicGallery } from "@/components/property/DynamicGallery";
import { DynamicVideoSection } from "@/components/property/DynamicVideoSection";
import { DynamicContact } from "@/components/property/DynamicContact";
import { DynamicFooter } from "@/components/property/DynamicFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { Loader2 } from "lucide-react";

export default function PropertyPage() {
  const { data, isLoading, error } = usePropertyPage();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !data) {
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
          className="mt-8 inline-block rounded-lg bg-accent px-6 py-3 font-semibold text-primary transition-smooth hover:bg-accent/90"
        >
          Voltar ao início
        </a>
      </div>
    );
  }

  const { property, branding, construtora, imobiliariaId, accessId } = data;

  // SEO meta data
  const title = `${property.titulo} - ${branding.imobiliariaNome}`;
  const description = property.descricao
    ? property.descricao.substring(0, 160)
    : `${property.titulo} - Imóvel exclusivo em ${property.bairro || property.cidade || "localização privilegiada"}`;
  const ogImage = property.imagens?.[0]?.url || "";

  // Custom CSS variables for branding
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

        <main className="min-h-screen">
          <DynamicNavbar branding={branding} />
          <ScrollToTop />
          
          {/* Floating WhatsApp with imobiliaria phone */}
          {branding.telefone && (
            <FloatingWhatsApp phoneNumber={branding.telefone.replace(/\D/g, "")} />
          )}

          <div id="hero">
            <DynamicHero property={property} branding={branding} />
          </div>

          <div id="details">
            <DynamicPropertyDetails property={property} />
          </div>

          <div id="description">
            <DynamicDescription property={property} />
          </div>

          {property.imagens && property.imagens.length > 0 && (
            <div id="gallery">
              <DynamicGallery images={property.imagens} />
            </div>
          )}

          {((property.videos && property.videos.length > 0) ||
            property.tour360Url) && (
            <div id="video">
              <DynamicVideoSection
                videos={property.videos}
                tour360Url={property.tour360Url}
              />
            </div>
          )}

          <DynamicContact
            property={property}
            branding={branding}
            imobiliariaId={imobiliariaId}
            accessId={accessId}
          />

          <DynamicFooter branding={branding} construtora={construtora} />
        </main>
      </div>
    </HelmetProvider>
  );
}
