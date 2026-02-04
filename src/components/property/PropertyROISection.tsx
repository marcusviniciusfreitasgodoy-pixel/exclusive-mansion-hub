import { useState } from 'react';
import { TrendingUp, ZoomIn, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { MaterialArquivo } from '@/types/materiais-promocionais';

interface PropertyROISectionProps {
  data: MaterialArquivo;
}

export function PropertyROISection({ data }: PropertyROISectionProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const isImage = data.tipo === 'image' || data.url.match(/\.(jpg|jpeg|png|webp|gif)$/i);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = data.url;
    link.download = data.nome || 'estudo-rentabilidade';
    link.click();
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Estudo de Rentabilidade
              </h2>
              <p className="text-muted-foreground">Análise de Retorno de Investimento</p>
            </div>
          </div>

          <div className="bg-muted/30 rounded-xl border overflow-hidden">
            <div className="p-6">
              <p className="text-muted-foreground mb-6">
                Investimento inteligente com projeções de rentabilidade detalhadas para operação em short-stay ou aluguel tradicional.
              </p>

              {isImage ? (
                <div className="relative group">
                  <img
                    src={data.url}
                    alt={data.nome || 'Estudo de Rentabilidade'}
                    className="w-full rounded-lg border shadow-sm cursor-pointer transition-transform hover:scale-[1.01]"
                    onClick={() => setIsZoomed(true)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-black/50 px-4 py-2 rounded-full text-white text-sm flex items-center gap-2">
                      <ZoomIn className="h-4 w-4" />
                      Clique para ampliar
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-background rounded-lg border p-8 text-center">
                  <TrendingUp className="h-16 w-16 text-green-500/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Documento PDF com análise completa
                  </p>
                  <Button onClick={() => window.open(data.url, '_blank')} className="gap-2">
                    <ZoomIn className="h-4 w-4" />
                    Ver Estudo Completo
                  </Button>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={handleDownload} size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-auto">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background"
              onClick={() => setIsZoomed(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={data.url}
              alt={data.nome || 'Estudo de Rentabilidade'}
              className="w-full h-auto"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
