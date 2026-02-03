// Template style definitions
import type { TemplateType, TemplateCustomization } from "@/types/database";

export interface TemplateStyles {
  // Colors
  colorPrimary: string;
  colorSecondary: string;
  colorText: string;
  // Typography
  fontHeading: string;
  fontBody: string;
  // Layout
  heroHeight: string;
  sectionPadding: string;
  buttonRadius: string;
  // Animations
  transitionDuration: string;
  transitionEasing: string;
  animationsEnabled: boolean;
}

export const templateDefaults: Record<TemplateType, TemplateStyles> = {
  luxo: {
    colorPrimary: "#D4AF37",    // Dourado (Sotheby's)
    colorSecondary: "#000000",  // Preto
    colorText: "#333333",
    fontHeading: "'Times New Roman', 'Georgia', serif",
    fontBody: "'Helvetica', 'Arial', sans-serif",
    heroHeight: "70vh",
    sectionPadding: "80px",
    buttonRadius: "8px",
    transitionDuration: "500ms",
    transitionEasing: "ease-out",
    animationsEnabled: true,
  },
  moderno: {
    colorPrimary: "#1E3A8A",    // Azul profundo (The Agency)
    colorSecondary: "#10B981",  // Verde natural
    colorText: "#374151",
    fontHeading: "'Montserrat', sans-serif",
    fontBody: "'Montserrat', sans-serif",
    heroHeight: "60vh",
    sectionPadding: "48px",
    buttonRadius: "12px",
    transitionDuration: "300ms",
    transitionEasing: "ease-in-out",
    animationsEnabled: true,
  },
  classico: {
    colorPrimary: "#666666",
    colorSecondary: "#8B4513",
    colorText: "#333333",
    fontHeading: "'Georgia', serif",
    fontBody: "'Arial', sans-serif",
    heroHeight: "60vh",
    sectionPadding: "40px",
    buttonRadius: "0px",
    transitionDuration: "150ms",
    transitionEasing: "ease",
    animationsEnabled: false,
  },
};

export function getTemplateStyles(
  template: TemplateType,
  customization?: TemplateCustomization
): TemplateStyles {
  const defaults = templateDefaults[template];

  // Calculate button radius based on style
  let buttonRadius = defaults.buttonRadius;
  if (customization?.estilo_botoes === "rounded") {
    buttonRadius = "8px";
  } else if (customization?.estilo_botoes === "pill") {
    buttonRadius = "9999px";
  } else if (customization?.estilo_botoes === "squared") {
    buttonRadius = "0px";
  }

  // Calculate hero height
  let heroHeight = defaults.heroHeight;
  if (customization?.tamanho_hero === "fullscreen") {
    heroHeight = "100vh";
  } else if (customization?.tamanho_hero === "grande") {
    heroHeight = "70vh";
  } else if (customization?.tamanho_hero === "medio") {
    heroHeight = "60vh";
  }

  return {
    colorPrimary: customization?.cor_primaria || defaults.colorPrimary,
    colorSecondary: customization?.cor_secundaria || defaults.colorSecondary,
    colorText: customization?.cor_texto || defaults.colorText,
    fontHeading: customization?.fonte_titulos
      ? `'${customization.fonte_titulos}', ${template === "classico" ? "serif" : "sans-serif"}`
      : defaults.fontHeading,
    fontBody: customization?.fonte_corpo
      ? `'${customization.fonte_corpo}', sans-serif`
      : defaults.fontBody,
    heroHeight,
    sectionPadding: defaults.sectionPadding,
    buttonRadius,
    transitionDuration: defaults.transitionDuration,
    transitionEasing: defaults.transitionEasing,
    animationsEnabled: customization?.animacoes_ativas ?? defaults.animationsEnabled,
  };
}

export function applyTemplateStyles(styles: TemplateStyles): React.CSSProperties {
  return {
    "--template-primary": styles.colorPrimary,
    "--template-secondary": styles.colorSecondary,
    "--template-text": styles.colorText,
    "--template-font-heading": styles.fontHeading,
    "--template-font-body": styles.fontBody,
    "--template-hero-height": styles.heroHeight,
    "--template-section-padding": styles.sectionPadding,
    "--template-button-radius": styles.buttonRadius,
    "--template-transition-duration": styles.transitionDuration,
    "--template-transition-easing": styles.transitionEasing,
  } as React.CSSProperties;
}

export const fontOptions = {
  headings: [
    "Playfair Display",
    "Cormorant Garamond",
    "Lora",
    "Merriweather",
    "Georgia",
    "Inter",
  ],
  body: ["Inter", "Poppins", "Open Sans", "Roboto", "Lato", "Arial"],
};
