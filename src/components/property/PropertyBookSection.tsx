import { useState } from 'react';
import { BookOpen, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MaterialArquivo } from '@/types/materiais-promocionais';
import { PDFViewerModal } from './PDFViewerModal';

interface PropertyBookSectionProps {
  data: MaterialArquivo;
  propertyTitle: string;
}

export function PropertyBookSection({ data, propertyTitle }: PropertyBookSectionProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = data.url;
    link.download = data.nome || 'book-digital.pdf';
    link.click();
  };

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Apresentação do Empreendimento
              </h2>
              <p className="text-muted-foreground">Book Digital Completo</p>
            </div>
          </div>

          <div className="bg-background rounded-xl shadow-lg border overflow-hidden">
            <div className="md:flex">
              {/* PDF Preview/Thumbnail */}
              <div className="md:w-1/3 bg-muted flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-24 h-32 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-primary/30">
                    <BookOpen className="h-12 w-12 text-primary/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{data.nome}</p>
                  {data.tamanho_bytes && (
                    <p className="text-xs text-muted-foreground">
                      {(data.tamanho_bytes / 1024 / 1024).toFixed(1)} MB
                    </p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="md:w-2/3 p-6 md:p-8">
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {propertyTitle}
                </h3>
                <p className="text-muted-foreground mb-6">
                  Conheça todos os detalhes do empreendimento:
                </p>
                <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Conceito arquitetônico e design
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Plantas de todas as unidades
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Renders e perspectivas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Especificações técnicas
                  </li>
                </ul>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setIsViewerOpen(true)} className="gap-2">
                    <Eye className="h-4 w-4" />
                    Ver Book Digital
                  </Button>
                  <Button variant="outline" onClick={handleDownload} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>

                <PDFViewerModal
                  isOpen={isViewerOpen}
                  onClose={() => setIsViewerOpen(false)}
                  url={data.url}
                  title={`Book Digital - ${propertyTitle}`}
                  fileName={data.nome}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
