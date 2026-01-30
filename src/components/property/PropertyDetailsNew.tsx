import { Building2, Car, Calendar, Maximize, Check } from "lucide-react";
import type { PropertyData } from "@/types/property-page";

interface PropertyDetailsNewProps {
  property: PropertyData;
  construtoraNome: string;
}

export function PropertyDetailsNew({ property, construtoraNome }: PropertyDetailsNewProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
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

  const statusLabels: Record<string, string> = {
    ativo: "Disponível",
    vendido: "Vendido",
    inativo: "Indisponível",
  };

  const listingDetails = [
    { label: "Código", value: property.listingCode || property.id.slice(0, 8).toUpperCase() },
    { label: "Valor", value: property.priceOnRequest ? "Sob Consulta" : formatCurrency(property.valor) },
    { label: "Tipo", value: property.propertyType || "Imóvel Residencial" },
    { label: "Status", value: statusLabels[property.status] || property.status },
    { label: "Comercializado por", value: construtoraNome || "-" },
  ];

  const buildingDetails = [
    { label: "Ano de Construção", value: property.yearBuilt || "-", icon: Calendar },
    { label: "Área Total", value: property.areaTotal ? `${formatNumber(property.areaTotal)} m²` : "-", icon: Maximize },
    { label: "Área do Lote", value: property.lotSize ? `${formatNumber(property.lotSize)} ${property.lotSizeUnit}` : "-", icon: Maximize },
    { label: "Vagas", value: property.parkingSpaces || property.vagas || "-", icon: Car },
  ];

  const hasInteriorFeatures = property.featuresInterior && property.featuresInterior.length > 0;
  const hasExteriorFeatures = property.featuresExterior && property.featuresExterior.length > 0;
  const hasAmenities = property.amenities && property.amenities.length > 0;

  return (
    <section id="section-details" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <Building2 className="h-6 w-6 text-accent" />
          <h2 className="text-2xl md:text-3xl font-bold text-primary">
            Detalhes do Imóvel
          </h2>
        </div>

        {/* Main Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Listing Details */}
          <div className="bg-muted/30 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Informações do Anúncio
            </h3>
            <div className="space-y-3">
              {listingDetails.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-muted last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-primary">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Building Details */}
          <div className="bg-muted/30 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Características do Imóvel
            </h3>
            <div className="space-y-3">
              {buildingDetails.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-muted last:border-0">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="font-medium text-primary">{item.value}</span>
                  </div>
                );
              })}
            </div>

            {/* Monthly Costs */}
            {(property.condominio || property.iptu) && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Custos Mensais</h4>
                <div className="space-y-2">
                  {property.condominio && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Condomínio</span>
                      <span className="font-medium text-primary">{formatCurrency(property.condominio)}</span>
                    </div>
                  )}
                  {property.iptu && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">IPTU (anual)</span>
                      <span className="font-medium text-primary">{formatCurrency(property.iptu)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        {(hasInteriorFeatures || hasExteriorFeatures || hasAmenities) && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Interior Features */}
            {hasInteriorFeatures && (
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Características Internas
                </h3>
                <ul className="space-y-2">
                  {property.featuresInterior.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exterior Features */}
            {hasExteriorFeatures && (
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Características Externas
                </h3>
                <ul className="space-y-2">
                  {property.featuresExterior.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Amenities */}
            {hasAmenities && (
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Comodidades
                </h3>
                <ul className="space-y-2">
                  {property.amenities.map((amenity, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      <span className="text-foreground">{amenity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
