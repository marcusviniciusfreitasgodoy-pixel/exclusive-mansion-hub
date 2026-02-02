import { useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import type { PropertyPageData } from "@/types/property-page";
import type { Integracao } from "@/types/integrations";
import { getTemplateStyles, applyTemplateStyles } from "./templateStyles";
import { DynamicNavbar } from "@/components/property/DynamicNavbar";
import { DynamicFooter } from "@/components/property/DynamicFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { AnalyticsScripts } from "@/components/integrations/AnalyticsScripts";

interface TemplateWrapperProps {
  data: PropertyPageData;
  children: React.ReactNode;
  templateType: "luxo" | "moderno" | "classico";
  integracoes?: Integracao[];
}

export function TemplateWrapper({ data, children, templateType, integracoes = [] }: TemplateWrapperProps) {
  const { property, branding, construtora } = data;

  const styles = getTemplateStyles(
    templateType,
    property.customizacaoTemplate as any
  );

  // Load Google Fonts dynamically
  useEffect(() => {
    const fontHeading = styles.fontHeading.split(",")[0].replace(/'/g, "").trim();
    const fontBody = styles.fontBody.split(",")[0].replace(/'/g, "").trim();
    const systemFonts = ["Georgia", "Arial", "sans-serif", "serif"];

    // Remove old font links to prevent duplicates
    document.querySelectorAll('link[data-template-font]').forEach(el => el.remove());

    // Add heading font
    if (fontHeading && !systemFonts.includes(fontHeading)) {
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css2?family=${fontHeading.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
      link.rel = "stylesheet";
      link.setAttribute("data-template-font", "heading");
      document.head.appendChild(link);
    }

    // Add body font only if different from heading
    if (fontBody && fontBody !== fontHeading && !systemFonts.includes(fontBody)) {
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css2?family=${fontBody.replace(/ /g, "+")}:wght@400;500;600&display=swap`;
      link.rel = "stylesheet";
      link.setAttribute("data-template-font", "body");
      document.head.appendChild(link);
    }

    return () => {
      document.querySelectorAll('link[data-template-font]').forEach(el => el.remove());
    };
  }, [styles.fontHeading, styles.fontBody]);

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

  const cssVars = {
    ...applyTemplateStyles(styles),
    "--brand-primary": branding.corPrimaria,
  } as React.CSSProperties;

  return (
    <HelmetProvider>
      <div style={cssVars} data-template={templateType}>
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

        {/* Analytics Scripts Injection */}
        {integracoes.length > 0 && <AnalyticsScripts integracoes={integracoes} />}

        <main
          className="min-h-screen"
          style={{
            fontFamily: styles.fontBody,
            color: styles.colorText,
          }}
        >
          <DynamicNavbar branding={branding} />
          <ScrollToTop />

          {branding.telefone && (
            <FloatingWhatsApp
              phoneNumber={branding.telefone.replace(/\D/g, "")}
            />
          )}

          <ChatbotWidget
            imovelId={property.id}
            imobiliariaId={data.imobiliariaId}
            construtorId={property.construtoraId}
            imovelTitulo={property.titulo}
            imobiliariaNome={branding.imobiliariaNome}
          />

          {children}

          <DynamicFooter branding={branding} construtora={construtora} />
        </main>
      </div>
    </HelmetProvider>
  );
}
