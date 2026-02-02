import { useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import type { PropertyPageData } from "@/types/property-page";
import { getTemplateStyles, applyTemplateStyles } from "./templateStyles";
import { DynamicNavbar } from "@/components/property/DynamicNavbar";
import { DynamicFooter } from "@/components/property/DynamicFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

interface TemplateWrapperProps {
  data: PropertyPageData;
  children: React.ReactNode;
  templateType: "luxo" | "moderno" | "classico";
}

export function TemplateWrapper({ data, children, templateType }: TemplateWrapperProps) {
  const { property, branding, construtora } = data;

  const styles = getTemplateStyles(
    templateType,
    property.customizacaoTemplate as any
  );

  // Load Google Fonts dynamically
  useEffect(() => {
    const fonts = [
      styles.fontHeading.split(",")[0].replace(/'/g, ""),
      styles.fontBody.split(",")[0].replace(/'/g, ""),
    ].filter((f) => f && !["Georgia", "Arial"].includes(f));

    if (fonts.length > 0) {
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css2?${fonts
        .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700`)
        .join("&")}&display=swap`;
      link.rel = "stylesheet";
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
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

          {children}

          <DynamicFooter branding={branding} construtora={construtora} />
        </main>
      </div>
    </HelmetProvider>
  );
}
