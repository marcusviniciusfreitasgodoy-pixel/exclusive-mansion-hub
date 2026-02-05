import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Palette, Crown, Zap, Home, Building2, Eye } from "lucide-react";
import type { TemplateType, TemplateCustomization } from "@/types/database";
import { TemplateCustomizationModal } from "./TemplateCustomizationModal";
import { templateDefaults } from "./templateStyles";

interface TemplateSelectorProps {
  selectedTemplate: TemplateType;
  customization: TemplateCustomization;
  onTemplateChange: (template: TemplateType) => void;
  onCustomizationChange: (customization: TemplateCustomization) => void;
}

const templates: {
  id: TemplateType;
  name: string;
  description: string;
  target: string;
  icon: React.ReactNode;
  preview: {
    bg: string;
    accent: string;
  };
}[] = [
  {
    id: "luxo",
    name: "Luxo",
    description: "Elegante e sofisticado",
    target: "Coberturas, mansões, penthouses",
    icon: <Crown className="h-5 w-5" />,
    preview: {
      bg: "bg-black",
      accent: "bg-amber-500",
    },
  },
  {
    id: "moderno",
    name: "Moderno",
    description: "Vibrante e dinâmico",
    target: "Apartamentos modernos, lofts",
    icon: <Zap className="h-5 w-5" />,
    preview: {
      bg: "bg-white",
      accent: "bg-blue-500",
    },
  },
  {
    id: "classico",
    name: "Clássico",
    description: "Tradicional e conservador",
    target: "Casas familiares, residenciais",
    icon: <Home className="h-5 w-5" />,
    preview: {
      bg: "bg-amber-50",
      accent: "bg-amber-700",
    },
  },
  {
    id: "alto_padrao",
    name: "Alto Padrão",
    description: "Ocean e natureza",
    target: "Golf, praia, resorts exclusivos",
    icon: <Building2 className="h-5 w-5" />,
    preview: {
      bg: "bg-sky-900",
      accent: "bg-green-500",
    },
  },
];

export function TemplateSelector({
  selectedTemplate,
  customization,
  onTemplateChange,
  onCustomizationChange,
}: TemplateSelectorProps) {
  const [showCustomization, setShowCustomization] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Escolha o Template da Página</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Selecione o estilo visual para este imóvel:
      </p>

      <RadioGroup
        value={selectedTemplate}
        onValueChange={(v) => onTemplateChange(v as TemplateType)}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {templates.map((template) => (
          <Label
            key={template.id}
            htmlFor={`template-${template.id}`}
            className="cursor-pointer"
          >
            <Card
              className={`overflow-hidden transition-all hover:shadow-md ${
                selectedTemplate === template.id
                  ? "ring-2 ring-primary ring-offset-2"
                  : ""
              }`}
            >
              {/* Preview Area */}
              <div className={`h-24 ${template.preview.bg} relative`}>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 ${template.preview.accent}`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <div
                      className={`p-2 rounded-full ${
                        template.preview.bg === "bg-black"
                          ? "bg-amber-500/20 text-amber-500"
                          : template.preview.bg === "bg-white"
                          ? "bg-blue-500/20 text-blue-600"
                          : template.preview.bg === "bg-sky-900"
                          ? "bg-sky-500/20 text-sky-300"
                          : "bg-amber-700/20 text-amber-800"
                      }`}
                    >
                      {template.icon}
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <RadioGroupItem
                    value={template.id}
                    id={`template-${template.id}`}
                  />
                  <span className="font-medium">{template.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {template.target}
                </p>
              </CardContent>
            </Card>
          </Label>
        ))}
      </RadioGroup>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowCustomization(true)}
          className="flex-1"
        >
          <Palette className="mr-2 h-4 w-4" />
          Personalizar Cores e Fontes
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.open("/templates", "_blank")}
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver Preview
        </Button>
      </div>

      <TemplateCustomizationModal
        open={showCustomization}
        onOpenChange={setShowCustomization}
        templateType={selectedTemplate}
        customization={customization}
        onSave={onCustomizationChange}
      />
    </div>
  );
}
