import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Crown, Zap, Home, Palette, Eye, ExternalLink, Building2 } from 'lucide-react';
import type { TemplateType, TemplateCustomization } from '@/types/database';
import { TemplateCustomizationModal } from '@/components/templates/TemplateCustomizationModal';

export interface Step6Data {
  templateEscolhido: TemplateType;
  customizacaoTemplate: TemplateCustomization;
}

interface Step6TemplateProps {
  defaultValues?: Partial<Step6Data>;
  propertyData?: {
    titulo?: string;
    bairro?: string;
    cidade?: string;
    valor?: number;
    imagens?: { url?: string; alt?: string }[];
  };
  // Mode 1: Complete wizard step (used in EditarImovel)
  onComplete?: (data: Step6Data) => void;
  // Mode 2: Inline step (used in NovoImovel)
  formData?: any;
  onTemplateChange?: (template: TemplateType) => void;
  onCustomizationChange?: (custom: TemplateCustomization) => void;
  onNext?: () => void;
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
    textColor: string;
  };
  showcaseUrl: string;
}[] = [
  {
    id: 'luxo',
    name: 'Luxo',
    description: 'Elegante e sofisticado, inspirado na Sotheby\'s',
    target: 'Coberturas, mansões, penthouses',
    icon: <Crown className="h-6 w-6" />,
    preview: {
      bg: 'bg-black',
      accent: 'bg-amber-500',
      textColor: 'text-amber-400',
    },
    showcaseUrl: '/templates?template=luxo',
  },
  {
    id: 'moderno',
    name: 'Moderno',
    description: 'Vibrante e dinâmico, inspirado na The Agency',
    target: 'Apartamentos modernos, lofts',
    icon: <Zap className="h-6 w-6" />,
    preview: {
      bg: 'bg-slate-900',
      accent: 'bg-blue-500',
      textColor: 'text-blue-400',
    },
    showcaseUrl: '/templates?template=moderno',
  },
  {
    id: 'classico',
    name: 'Clássico',
    description: 'Tradicional e conservador',
    target: 'Casas familiares, residenciais',
    icon: <Home className="h-6 w-6" />,
    preview: {
      bg: 'bg-amber-50',
      accent: 'bg-amber-700',
      textColor: 'text-amber-800',
    },
    showcaseUrl: '/templates?template=classico',
  },
  {
    id: 'alto_padrao',
    name: 'Alto Padrão',
    description: 'Oceânico e natural, inspirado em golf & praia',
    target: 'Empreendimentos de alto padrão, resorts',
    icon: <Building2 className="h-6 w-6" />,
    preview: {
      bg: 'bg-sky-900',
      accent: 'bg-emerald-500',
      textColor: 'text-emerald-400',
    },
    showcaseUrl: '/templates?template=alto_padrao',
  },
];

export function Step6Template({ 
  defaultValues, 
  onComplete,
  formData,
  onTemplateChange,
  onCustomizationChange,
  onNext
}: Step6TemplateProps) {
  // Support both modes: defaultValues from wizard OR formData from inline step
  const initialTemplate = defaultValues?.templateEscolhido || formData?.template_escolhido || 'luxo';
  const initialCustomization = defaultValues?.customizacaoTemplate || formData?.customizacao_template || {};

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(initialTemplate);
  const [customization, setCustomization] = useState<TemplateCustomization>(initialCustomization);
  const [showCustomization, setShowCustomization] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateType>('luxo');

  useEffect(() => {
    if (defaultValues?.templateEscolhido) {
      setSelectedTemplate(defaultValues.templateEscolhido);
    } else if (formData?.template_escolhido) {
      setSelectedTemplate(formData.template_escolhido);
    }
    if (defaultValues?.customizacaoTemplate) {
      setCustomization(defaultValues.customizacaoTemplate);
    } else if (formData?.customizacao_template) {
      setCustomization(formData.customizacao_template);
    }
  }, [defaultValues, formData]);

  const handlePreview = (templateId: TemplateType) => {
    setPreviewTemplate(templateId);
    setPreviewOpen(true);
  };

  const handleSubmit = () => {
    if (onComplete) {
      // Mode 1: Complete wizard step
      onComplete({
        templateEscolhido: selectedTemplate,
        customizacaoTemplate: customization,
      });
    } else {
      // Mode 2: Inline step - callbacks already called on change, just navigate
      onNext?.();
    }
  };

  const handleTemplateSelect = (template: TemplateType) => {
    setSelectedTemplate(template);
    onTemplateChange?.(template);
  };

  const handleCustomizationSave = (custom: TemplateCustomization) => {
    setCustomization(custom);
    onCustomizationChange?.(custom);
  };

  const getTemplatePreviewUrl = (templateId: TemplateType) => {
    return `/templates?template=${templateId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Escolha o Estilo Visual</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Selecione o template que melhor representa este imóvel. Você pode visualizar cada estilo antes de escolher.
      </p>

      <RadioGroup
        value={selectedTemplate}
        onValueChange={(v) => handleTemplateSelect(v as TemplateType)}
        className="grid grid-cols-1 gap-4"
      >
        {templates.map((template) => (
          <Label
            key={template.id}
            htmlFor={`template-${template.id}`}
            className="cursor-pointer"
          >
            <Card
              className={`overflow-hidden transition-all hover:shadow-lg ${
                selectedTemplate === template.id
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'hover:ring-1 hover:ring-muted-foreground/20'
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Preview Area */}
                <div className={`h-32 md:h-auto md:w-48 ${template.preview.bg} relative flex-shrink-0`}>
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1.5 ${template.preview.accent}`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`p-4 rounded-full ${template.preview.accent}/20 ${template.preview.textColor}`}>
                      {template.icon}
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <RadioGroupItem
                          value={template.id}
                          id={`template-${template.id}`}
                        />
                        <span className="font-semibold text-lg">{template.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {template.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ideal para: {template.target}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePreview(template.id);
                      }}
                      className="gap-2 flex-shrink-0"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          </Label>
        ))}
      </RadioGroup>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowCustomization(true)}
          className="flex-1 gap-2"
        >
          <Palette className="h-4 w-4" />
          Personalizar Cores e Fontes
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          className="flex-1 gap-2"
        >
          Continuar
        </Button>
      </div>

      {/* Template Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-background">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview: Template {templates.find(t => t.id === previewTemplate)?.name}
                </DialogTitle>
                <DialogDescription>
                  Visualize como seu imóvel ficará com este estilo
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(getTemplatePreviewUrl(previewTemplate), '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir em Nova Aba
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 h-full">
            <iframe
              src={getTemplatePreviewUrl(previewTemplate)}
              className="w-full h-full border-0"
              title={`Preview do template ${previewTemplate}`}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Customization Modal */}
      <TemplateCustomizationModal
        open={showCustomization}
        onOpenChange={setShowCustomization}
        templateType={selectedTemplate}
        customization={customization}
        onSave={handleCustomizationSave}
      />
    </div>
  );
}
