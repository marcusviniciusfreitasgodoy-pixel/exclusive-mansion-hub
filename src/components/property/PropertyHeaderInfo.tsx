import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  Share2, 
  Printer, 
  Star, 
  Bed, 
  Bath, 
  Maximize, 
  Home, 
  DollarSign,
  Copy,
  Facebook,
  Mail
} from "lucide-react";
import type { PropertyData } from "@/types/property-page";

interface PropertyHeaderInfoProps {
  property: PropertyData;
}

export function PropertyHeaderInfo({ property }: PropertyHeaderInfoProps) {
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const formatCurrency = (value: number | null) => {
    if (property.priceOnRequest || !value) return "Preço sob consulta";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
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
    const text = `Confira este imóvel: ${property.titulo} - ${formatCurrency(property.valor)}\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    setShareDialogOpen(false);
  };

  const location = [property.bairro, property.cidade].filter(Boolean).join(", ");
  const fullAddress = [
    property.endereco,
    property.bairro,
    `${property.cidade} - ${property.estado}`,
    property.cep,
    "Brasil"
  ].filter(Boolean).join(", ");

  const metrics = [
    {
      icon: DollarSign,
      value: formatCurrency(property.valor),
      label: "Valor",
      highlight: true,
    },
    {
      icon: Bed,
      value: property.suites || "-",
      label: "Suítes",
    },
    {
      icon: Bath,
      value: property.banheiros || "-",
      label: "Banheiros",
    },
    {
      icon: Maximize,
      value: property.areaTotal ? `${formatNumber(property.areaTotal)} m²` : "-",
      label: "Área Total",
    },
    {
      icon: Home,
      value: property.areaPrivativa ? `${formatNumber(property.areaPrivativa)} m²` : "-",
      label: "Área Privativa",
    },
  ];

  return (
    <section className="bg-white border-b">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Location */}
        <div className="mb-6">
          <p className="text-sm font-semibold tracking-widest text-accent uppercase mb-1">
            {property.bairro?.toUpperCase() || "LOCALIZAÇÃO"}
          </p>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">
            {property.headline || property.titulo}
          </h1>
          <p className="text-muted-foreground">
            {fullAddress}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className={`rounded-xl p-4 text-center transition-all ${
                  metric.highlight 
                    ? "bg-primary text-white" 
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <Icon className={`h-5 w-5 mx-auto mb-2 ${metric.highlight ? "text-accent" : "text-primary"}`} />
                <p className={`text-lg md:text-xl font-bold ${metric.highlight ? "text-white" : "text-primary"}`}>
                  {metric.value}
                </p>
                <p className={`text-xs uppercase tracking-wide ${metric.highlight ? "text-white/70" : "text-muted-foreground"}`}>
                  {metric.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Secondary Price */}
        {property.priceSecondary && (
          <p className="text-center text-muted-foreground mb-4">
            Aproximadamente {property.priceSecondaryCurrency} {formatNumber(property.priceSecondary)}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className={isSaved ? "text-red-500 border-red-200" : ""}
          >
            <Heart className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "Salvo" : "Salvar"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Imóvel</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            <Button variant="outline" onClick={handleCopyLink} className="flex-col h-auto py-4">
              <Copy className="h-6 w-6 mb-2" />
              Copiar Link
            </Button>
            <Button variant="outline" onClick={handleWhatsAppShare} className="flex-col h-auto py-4 text-green-600">
              <svg className="h-6 w-6 mb-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank")}
              className="flex-col h-auto py-4 text-blue-600"
            >
              <Facebook className="h-6 w-6 mb-2" />
              Facebook
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open(`mailto:?subject=${encodeURIComponent(property.titulo)}&body=${encodeURIComponent(`Confira este imóvel: ${window.location.href}`)}`, "_blank")}
              className="flex-col h-auto py-4"
            >
              <Mail className="h-6 w-6 mb-2" />
              E-mail
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
