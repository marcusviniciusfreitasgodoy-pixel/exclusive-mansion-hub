import { Bed, Bath, Car, Maximize, MapPin } from "lucide-react";
import type { PropertyData } from "@/types/property-page";

interface DynamicPropertyDetailsProps {
  property: PropertyData;
}

export const DynamicPropertyDetails = ({ property }: DynamicPropertyDetailsProps) => {
  const formatCurrency = (value: number | null) => {
    if (!value) return "Sob consulta";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatArea = (value: number | null) => {
    if (!value) return "-";
    return `${value.toLocaleString("pt-BR")}m²`;
  };

  const details = [
    property.areaTotal && {
      icon: Maximize,
      label: "Área Total",
      value: formatArea(property.areaTotal),
    },
    property.areaPrivativa && {
      icon: Maximize,
      label: "Área Privativa",
      value: formatArea(property.areaPrivativa),
    },
    property.suites && {
      icon: Bed,
      label: "Suítes",
      value: String(property.suites),
    },
    property.banheiros && {
      icon: Bath,
      label: "Banheiros",
      value: String(property.banheiros),
    },
    property.vagas && {
      icon: Car,
      label: "Vagas",
      value: String(property.vagas),
    },
  ].filter(Boolean) as { icon: typeof Maximize; label: string; value: string }[];

  const location = [property.bairro, property.cidade, property.estado]
    .filter(Boolean)
    .join(", ");

  return (
    <section id="details" className="relative py-24 bg-luxury-cream">
      <div className="container mx-auto px-6">
        {/* Location */}
        <div className="mb-16 text-center animate-fade-in">
          <div className="mb-4 inline-flex items-center gap-2 text-primary">
            <MapPin className="h-5 w-5" />
            <span className="text-sm uppercase tracking-widest">
              Localização Premium
            </span>
          </div>
          <h2 className="mb-4 text-4xl font-bold text-primary md:text-5xl lg:text-6xl">
            {property.endereco || property.bairro || "Localização Privilegiada"}
          </h2>
          {location && (
            <p className="text-xl text-muted-foreground">{location}</p>
          )}
        </div>

        {/* Price Section */}
        {property.valor && (
          <div className="mb-16 text-center">
            <div className="inline-block luxury-gradient rounded-2xl px-12 py-8 shadow-gold animate-scale-in">
              <p className="mb-2 text-sm uppercase tracking-widest text-accent text-center">
                VALOR DO IMÓVEL
              </p>
              <p className="text-5xl font-bold text-white md:text-6xl">
                {formatCurrency(property.valor)}
              </p>
              {(property.condominio || property.iptu) && (
                <div className="mt-4 flex justify-center gap-8 text-sm text-white/80">
                  {property.condominio && (
                    <span>Condomínio: {formatCurrency(property.condominio)}</span>
                  )}
                  {property.iptu && (
                    <span>IPTU: {formatCurrency(property.iptu)}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Details Grid */}
        {details.length > 0 && (
          <div
            className={`grid gap-6 md:grid-cols-${Math.min(details.length, 5)} lg:gap-8`}
            style={{
              gridTemplateColumns: `repeat(${Math.min(details.length, 5)}, minmax(0, 1fr))`,
            }}
          >
            {details.map((detail, index) => {
              const Icon = detail.icon;
              return (
                <div
                  key={detail.label}
                  className="group rounded-xl bg-white p-6 text-center shadow-elegant transition-elegant hover:-translate-y-2 hover:shadow-gold animate-fade-in"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent transition-smooth group-hover:bg-accent group-hover:text-primary">
                    <Icon className="h-7 w-7" />
                  </div>
                  <p className="mb-1 text-sm uppercase tracking-wide text-muted-foreground">
                    {detail.label}
                  </p>
                  <p className="text-3xl font-bold text-primary">{detail.value}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
