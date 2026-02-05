import { useState } from 'react';
import { DollarSign, Download, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MaterialArquivo } from '@/types/materiais-promocionais';
import { PDFViewerModal } from './PDFViewerModal';

interface PropertyPriceTableSectionProps {
  data: MaterialArquivo;
}

export function PropertyPriceTableSection({ data }: PropertyPriceTableSectionProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = data.url;
    link.download = data.nome || 'tabela-vendas.pdf';
    link.click();
  };

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Tabela de Vendas
              </h2>
              <p className="text-muted-foreground">Valores e Condições de Pagamento</p>
            </div>
          </div>

          <div className="bg-background rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-20 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="h-8 w-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">
                    {data.nome}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Documento com todos os valores, condições de pagamento e disponibilidade das unidades.
                  </p>
                  {data.tamanho_bytes && (
                    <p className="text-xs text-muted-foreground">
                      Tamanho: {(data.tamanho_bytes / 1024 / 1024).toFixed(1)} MB
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-sm mb-2 text-foreground">Este documento contém:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Preços atualizados de todas as unidades</li>
                  <li>• Condições especiais de pagamento</li>
                  <li>• Disponibilidade em tempo real</li>
                  <li>• Observações e informações importantes</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setIsViewerOpen(true)} className="gap-2">
                  <Eye className="h-4 w-4" />
                  Ver Tabela de Vendas
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
                title="Tabela de Vendas"
                fileName={data.nome}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
