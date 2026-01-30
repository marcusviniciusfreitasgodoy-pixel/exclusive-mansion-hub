import { MapPin, ExternalLink, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PropertyData } from "@/types/property-page";

interface PropertyLocationProps {
  property: PropertyData;
}

export function PropertyLocation({ property }: PropertyLocationProps) {
  const fullAddress = [
    property.endereco,
    property.bairro,
    `${property.cidade} - ${property.estado}`,
    property.cep,
  ].filter(Boolean).join(", ");

  const hasCoordinates = property.latitude && property.longitude;
  
  // Google Maps URLs
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  const googleMapsEmbedUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&z=15&output=embed`;

  return (
    <section id="section-location" className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <MapPin className="h-6 w-6 text-accent" />
          <h2 className="text-2xl md:text-3xl font-bold text-primary">
            Localização
          </h2>
        </div>

        {/* Map Container */}
        <div className="relative rounded-xl overflow-hidden shadow-lg mb-6">
          <div className="aspect-[16/9] md:aspect-[21/9] bg-muted">
            <iframe
              src={googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização do imóvel"
              className="w-full h-full min-h-[300px] md:min-h-[400px]"
            />
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground mb-6 italic">
          ⚠️ A localização no mapa é aproximada e pode não representar o endereço exato do imóvel.
          Para informações precisas, entre em contato conosco.
        </p>

        {/* Address Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Endereço</p>
              <p className="text-lg font-semibold text-primary">{property.endereco || "Endereço não informado"}</p>
              <p className="text-muted-foreground">
                {property.bairro}, {property.cidade} - {property.estado}
              </p>
              {property.cep && (
                <p className="text-sm text-muted-foreground">CEP: {property.cep}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(googleMapsSearchUrl, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver no Google Maps
              </Button>
              {hasCoordinates && (
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`, "_blank")}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Como Chegar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
