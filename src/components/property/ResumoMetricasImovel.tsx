import { Bed, Bath, Maximize, Home, Tag, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PropertyData } from "@/types/property-page";

interface ResumoMetricasImovelProps {
  property: PropertyData;
}

export function ResumoMetricasImovel({ property }: ResumoMetricasImovelProps) {
  const formatCurrency = (value: number | null) => {
    if (property.priceOnRequest || !value) return "Sob Consulta";
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

  const statusConfig: Record<string, { label: string; className: string }> = {
    ativo: { label: "Disponível", className: "bg-green-100 text-green-800 border-green-200" },
    vendido: { label: "Vendido", className: "bg-blue-100 text-blue-800 border-blue-200" },
    inativo: { label: "Indisponível", className: "bg-gray-100 text-gray-600 border-gray-200" },
  };

  const status = statusConfig[property.status] || statusConfig.ativo;

  const metrics = [
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
      value: property.areaTotal ? `${formatNumber(property.areaTotal)}` : "-",
      label: "m² Total",
    },
    {
      icon: Home,
      value: property.propertyType || "Residencial",
      label: "Tipo",
    },
    {
      icon: Tag,
      value: property.listingCode || property.id.slice(0, 8).toUpperCase(),
      label: "Código",
    },
  ];

  // Add parking if available
  if (property.vagas || property.parkingSpaces) {
    metrics.splice(3, 0, {
      icon: Car,
      value: property.parkingSpaces || property.vagas || "-",
      label: "Vagas",
    });
  }

  const fullAddress = [
    property.endereco,
    property.bairro,
    `${property.cidade} - ${property.estado}`,
  ].filter(Boolean).join(", ");

  return (
    <section className="bg-white border-b">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Title & Address */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <p className="text-xs sm:text-sm font-semibold tracking-widest text-accent uppercase">
              {property.bairro?.toUpperCase() || "LOCALIZAÇÃO"}
            </p>
            <Badge variant="outline" className={`${status.className} text-xs`}>
              {status.label}
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1.5 sm:mb-2 leading-tight">
            {property.headline || property.titulo}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {fullAddress}
          </p>
        </div>

        {/* Price */}
        <div className="mb-4 sm:mb-6">
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
            {formatCurrency(property.valor)}
          </p>
          {property.priceSecondary && (
            <p className="text-sm text-muted-foreground mt-0.5 sm:mt-1">
              ≈ {property.priceSecondaryCurrency} {formatNumber(property.priceSecondary)}
            </p>
          )}
          {(property.condominio || property.iptu) && (
            <div className="flex flex-wrap gap-2 sm:gap-4 mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
              {property.condominio && (
                <span>Cond: {formatCurrency(property.condominio)}</span>
              )}
              {property.iptu && (
                <span>IPTU: {formatCurrency(property.iptu)}/ano</span>
              )}
            </div>
          )}
        </div>

        {/* Metrics Grid - 2 cols on small mobile, 3 on medium, 6 on desktop */}
        <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          {metrics.slice(0, 6).map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="rounded-lg sm:rounded-xl bg-muted/50 p-2.5 sm:p-4 text-center transition-all hover:bg-muted"
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1.5 sm:mb-2 text-accent" />
                <p className="text-base sm:text-lg md:text-xl font-bold text-primary truncate">
                  {metric.value}
                </p>
                <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">
                  {metric.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
