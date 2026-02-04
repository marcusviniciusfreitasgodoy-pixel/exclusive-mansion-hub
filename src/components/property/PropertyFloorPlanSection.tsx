import { useState } from 'react';
import { LayoutGrid, ZoomIn, Download, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { MaterialArquivo } from '@/types/materiais-promocionais';

interface PropertyFloorPlanSectionProps {
  data: MaterialArquivo;
  areaPrivativa?: number | null;
}

export function PropertyFloorPlanSection({ data, areaPrivativa }: PropertyFloorPlanSectionProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const isImage = data.tipo === 'image' || data.url.match(/\.(jpg|jpeg|png|webp|gif)$/i);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = data.url;
    link.download = data.nome || 'planta-unidade';
    link.click();
  };

  return (
    <section id="planta" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <LayoutGrid className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Planta da Unidade
              </h2>
              <p className="text-muted-foreground">Layout e distribuição dos ambientes</p>
            </div>
          </div>

          <div className="bg-muted/30 rounded-xl border overflow-hidden">
            {isImage ? (
              <>
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => setIsZoomed(true)}
                >
                  <img
                    src={data.url}
                    alt={data.nome || 'Planta da Unidade'}
                    className="w-full transition-transform group-hover:scale-[1.01]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/60 px-4 py-2 rounded-full text-white text-sm flex items-center gap-2">
                      <ZoomIn className="h-4 w-4" />
                      Clique para ampliar
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t bg-background">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-foreground">{data.nome}</h3>
                      {areaPrivativa && (
                        <p className="text-sm text-muted-foreground">
                          Área Privativa: {areaPrivativa} m²
                        </p>
                      )}
                    </div>
                    <Button variant="outline" onClick={handleDownload} size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <LayoutGrid className="h-16 w-16 text-blue-500/50 mx-auto mb-4" />
                <h3 className="font-medium text-lg text-foreground mb-2">{data.nome}</h3>
                {areaPrivativa && (
                  <p className="text-muted-foreground mb-4">
                    Área Privativa: {areaPrivativa} m²
                  </p>
                )}
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button onClick={() => window.open(data.url, '_blank')} className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Ver Planta
                  </Button>
                  <Button variant="outline" onClick={handleDownload} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
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
              alt={data.nome || 'Planta da Unidade'}
              className="w-full h-auto"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
