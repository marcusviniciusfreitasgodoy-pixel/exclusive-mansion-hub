import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Crown, Zap, Home, Building2, Eye, ExternalLink, Globe, Palette } from 'lucide-react';
import { DEMO_IMOVEIS } from '@/data/demo-data';

const templateInfo: Record<string, { name: string; icon: React.ReactNode; description: string; color: string; bgColor: string }> = {
  luxo: {
    name: 'Luxo',
    icon: <Crown className="h-5 w-5" />,
    description: 'Elegante e sofisticado, inspirado na Sotheby\'s',
    color: 'text-amber-500',
    bgColor: 'bg-black',
  },
  moderno: {
    name: 'Moderno',
    icon: <Zap className="h-5 w-5" />,
    description: 'Vibrante e dinâmico, inspirado na The Agency',
    color: 'text-blue-500',
    bgColor: 'bg-slate-900',
  },
  classico: {
    name: 'Clássico',
    icon: <Home className="h-5 w-5" />,
    description: 'Tradicional e conservador',
    color: 'text-amber-800',
    bgColor: 'bg-amber-50',
  },
  'alto-padrao': {
    name: 'Alto Padrão',
    icon: <Building2 className="h-5 w-5" />,
    description: 'Oceânico e natural, golf & praia',
    color: 'text-emerald-500',
    bgColor: 'bg-sky-900',
  },
  alto_padrao: {
    name: 'Alto Padrão',
    icon: <Building2 className="h-5 w-5" />,
    description: 'Oceânico e natural, golf & praia',
    color: 'text-emerald-500',
    bgColor: 'bg-sky-900',
  },
};

const allTemplates = [
  { id: 'luxo', name: 'Luxo', icon: <Crown className="h-6 w-6" />, description: 'Elegante e sofisticado, inspirado na Sotheby\'s', target: 'Coberturas, mansões, penthouses', bgColor: 'bg-black', accentColor: 'bg-amber-500', textColor: 'text-amber-400' },
  { id: 'moderno', name: 'Moderno', icon: <Zap className="h-6 w-6" />, description: 'Vibrante e dinâmico, inspirado na The Agency', target: 'Apartamentos modernos, lofts', bgColor: 'bg-slate-900', accentColor: 'bg-blue-500', textColor: 'text-blue-400' },
  { id: 'classico', name: 'Clássico', icon: <Home className="h-6 w-6" />, description: 'Tradicional e conservador', target: 'Casas familiares, residenciais', bgColor: 'bg-amber-50', accentColor: 'bg-amber-700', textColor: 'text-amber-800' },
  { id: 'alto_padrao', name: 'Alto Padrão', icon: <Building2 className="h-6 w-6" />, description: 'Oceânico e natural, golf & praia', target: 'Resorts, empreendimentos exclusivos', bgColor: 'bg-sky-900', accentColor: 'bg-emerald-500', textColor: 'text-emerald-400' },
];

export function DemoSitesContent() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState('luxo');
  const [previewTitle, setPreviewTitle] = useState('');

  const handlePreviewTemplate = (templateId: string, title?: string) => {
    setPreviewTemplate(templateId.replace('-', '_'));
    setPreviewTitle(title || `Template ${templateInfo[templateId]?.name || templateId}`);
    setPreviewOpen(true);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'A consultar';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-10">
      {/* Section 1: Templates disponíveis */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Templates Disponíveis</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Cada imóvel pode utilizar um dos templates abaixo. Clique para visualizar o site completo.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {allTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePreviewTemplate(template.id)}>
              <div className={`h-28 ${template.bgColor} relative flex items-center justify-center`}>
                <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${template.accentColor}`} />
                <div className={`p-3 rounded-full ${template.accentColor}/20 ${template.textColor}`}>
                  {template.icon}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">{template.name}</h3>
                <p className="text-xs text-muted-foreground mb-1">{template.description}</p>
                <p className="text-xs text-muted-foreground">Ideal para: {template.target}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Eye className="h-4 w-4" />
                  Ver Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 2: Sites dos imóveis demo */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Sites dos Imóveis</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Veja como cada imóvel ficaria com o template selecionado. Cada imóvel usa um estilo diferente para demonstrar as possibilidades.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {DEMO_IMOVEIS.map((imovel) => {
            const tplKey = imovel.template_escolhido || 'luxo';
            const tpl = templateInfo[tplKey] || templateInfo['luxo'];
            return (
              <Card key={imovel.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-48 h-40 sm:h-auto flex-shrink-0 relative">
                    {imovel.imagens[0]?.url ? (
                      <img src={imovel.imagens[0].url} alt={imovel.titulo} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className={`absolute top-2 left-2 ${tpl.bgColor} ${tpl.color} border-0 gap-1`}>
                      {tpl.icon}
                      {tpl.name}
                    </Badge>
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-base mb-1">{imovel.titulo}</h3>
                      <p className="text-sm text-muted-foreground mb-1">📍 {imovel.bairro}, {imovel.cidade}</p>
                      <p className="text-sm font-medium text-primary mb-2">{formatCurrency(imovel.valor)}</p>
                      <p className="text-xs text-muted-foreground">{tpl.description}</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => handlePreviewTemplate(tplKey, imovel.titulo)}
                      >
                        <Eye className="h-4 w-4" />
                        Ver Site
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/templates?template=${tplKey.replace('-', '_')}`, '_blank')}
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Template Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-6xl h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-background">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  {previewTitle}
                </DialogTitle>
                <DialogDescription>
                  Visualização do site com o template aplicado
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/templates?template=${previewTemplate}`, '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir em Nova Aba
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 h-full">
            <iframe
              src={`/templates?template=${previewTemplate}`}
              className="w-full h-full border-0"
              title={`Preview do template ${previewTemplate}`}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
