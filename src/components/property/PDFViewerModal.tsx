import { useState } from 'react';
import { X, Download, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  fileName?: string;
}

export function PDFViewerModal({ isOpen, onClose, url, title, fileName }: PDFViewerModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'documento.pdf';
    link.click();
  };

  const handleOpenNewTab = () => {
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-[90vh] p-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
          <h3 className="font-semibold text-foreground truncate flex-1 mr-4">{title}</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleOpenNewTab} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Nova aba</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 relative bg-muted">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Carregando documento...</p>
              </div>
            </div>
          )}
          <iframe
            src={`${url}#view=FitH`}
            className="w-full h-full border-0"
            title={title}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
