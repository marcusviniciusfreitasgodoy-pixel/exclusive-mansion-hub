import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  Share2, 
  Printer, 
  MapPin, 
  Camera, 
  Info,
  Copy,
  Facebook,
  Mail
} from "lucide-react";
import type { PropertyData } from "@/types/property-page";

interface BarraAcoesImovelProps {
  property: PropertyData;
  onGalleryClick: () => void;
}

export function BarraAcoesImovel({ property, onGalleryClick }: BarraAcoesImovelProps) {
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    // Check if already saved
    const savedList = JSON.parse(localStorage.getItem("saved_properties") || "[]");
    setIsSaved(savedList.includes(property.id));

    const handleScroll = () => {
      // Show after scrolling past hero (approximately 70vh)
      const heroHeight = window.innerHeight * 0.7;
      setIsVisible(window.scrollY > heroHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [property.id]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(`section-${id}`);
    if (element) {
      const offset = 140; // Height of sticky headers
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const handleSave = () => {
    const savedList = JSON.parse(localStorage.getItem("saved_properties") || "[]");
    if (!isSaved) {
      savedList.push(property.id);
      toast({ title: "Imóvel salvo", description: "Adicionado aos seus favoritos" });
    } else {
      const index = savedList.indexOf(property.id);
      if (index > -1) savedList.splice(index, 1);
      toast({ title: "Removido", description: "Removido dos favoritos" });
    }
    localStorage.setItem("saved_properties", JSON.stringify(savedList));
    setIsSaved(!isSaved);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copiado!", description: "Cole onde quiser compartilhar" });
    setShareDialogOpen(false);
  };

  const handleWhatsAppShare = () => {
    const formatCurrency = (value: number | null) => {
      if (!value) return "";
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(value);
    };
    const text = `Confira este imóvel: ${property.titulo} - ${formatCurrency(property.valor)}\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    setShareDialogOpen(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm animate-in slide-in-from-top duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Navigation Buttons */}
            <div className="hidden md:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollToSection("overview")}
                className="text-muted-foreground hover:text-primary"
              >
                <Info className="mr-1.5 h-4 w-4" />
                Informações
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollToSection("location")}
                className="text-muted-foreground hover:text-primary"
              >
                <MapPin className="mr-1.5 h-4 w-4" />
                Mapa
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onGalleryClick}
                className="text-muted-foreground hover:text-primary"
              >
                <Camera className="mr-1.5 h-4 w-4" />
                Fotos
              </Button>
            </div>

            {/* Mobile: Property Title */}
            <div className="md:hidden flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary truncate">
                {property.titulo}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrint}
                className="text-muted-foreground hover:text-primary hidden sm:flex"
              >
                <Printer className="h-4 w-4" />
                <span className="ml-1.5 hidden lg:inline">Imprimir</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className={isSaved ? "text-red-500" : "text-muted-foreground hover:text-primary"}
              >
                <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                <span className="ml-1.5 hidden lg:inline">{isSaved ? "Salvo" : "Salvar"}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShareDialogOpen(true)}
                className="text-muted-foreground hover:text-primary"
              >
                <Share2 className="h-4 w-4" />
                <span className="ml-1.5 hidden lg:inline">Compartilhar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartilhar Imóvel</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            <Button variant="outline" onClick={handleCopyLink} className="flex-col h-auto py-4">
              <Copy className="h-6 w-6 mb-2" />
              Copiar Link
            </Button>
            <Button variant="outline" onClick={handleWhatsAppShare} className="flex-col h-auto py-4 text-accent hover:text-accent/80">
              <svg className="h-6 w-6 mb-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank");
                setShareDialogOpen(false);
              }}
              className="flex-col h-auto py-4 text-primary hover:text-primary/80"
            >
              <Facebook className="h-6 w-6 mb-2" />
              Facebook
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                window.open(`mailto:?subject=${encodeURIComponent(property.titulo)}&body=${encodeURIComponent(`Confira este imóvel: ${window.location.href}`)}`, "_blank");
                setShareDialogOpen(false);
              }}
              className="flex-col h-auto py-4"
            >
              <Mail className="h-6 w-6 mb-2" />
              E-mail
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
