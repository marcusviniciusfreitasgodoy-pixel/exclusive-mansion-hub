import { Bed, Bath, Car, Ruler, Building2, Calendar, MapPin } from "lucide-react";
import type { PropertyData } from "@/types/property-page";

interface AltoPadraoDetailsGridProps {
  property: PropertyData;
  construtoraNome: string;
}

export function AltoPadraoDetailsGrid({ property, construtoraNome }: AltoPadraoDetailsGridProps) {
  const amenities = [
    { icon: Bed, label: "Suítes", value: property.suites },
    { icon: Bath, label: "Banheiros", value: property.banheiros },
    { icon: Car, label: "Vagas", value: property.vagas || property.parkingSpaces },
    { icon: Ruler, label: "Área Total", value: property.areaTotal ? `${property.areaTotal}m²` : null },
    { icon: Building2, label: "Área Privativa", value: property.areaPrivativa ? `${property.areaPrivativa}m²` : null },
    { icon: Calendar, label: "Ano", value: property.yearBuilt },
  ].filter((item) => item.value);

  return (
    <section
      className="py-20"
      style={{ backgroundColor: "#fafafa" }}
    >
      <div className="container mx-auto px-5 md:px-10 lg:px-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left Column - Narrative Description */}
          <div>
            <h2
              className="mb-8 text-3xl font-semibold uppercase tracking-wide"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                color: "#0c4a6e",
              }}
            >
              Sobre o Imóvel
            </h2>
            
            {property.descricao && (
              <p
                className="mb-8 text-lg leading-relaxed"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  color: "#262626",
                  lineHeight: "1.75",
                }}
              >
                {property.descricao}
              </p>
            )}

            {/* Diferenciais */}
            {property.diferenciais && property.diferenciais.length > 0 && (
              <div className="mt-8">
                <h3
                  className="mb-4 text-xl font-semibold"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "#0c4a6e",
                  }}
                >
                  Diferenciais
                </h3>
                <ul className="grid grid-cols-2 gap-3">
                  {property.diferenciais.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm"
                      style={{ 
                        color: "#262626",
                        fontFamily: "'Roboto', sans-serif",
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Specs & Map */}
          <div>
            {/* Amenities Grid */}
            <div className="mb-10 rounded-xl bg-white p-8 shadow-md">
              <h3
                className="mb-6 text-xl font-semibold uppercase tracking-wide"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: "#0c4a6e",
                }}
              >
                Especificações
              </h3>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                {amenities.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-[#22c55e]" />
                    <div>
                      <p className="text-xs uppercase text-[#737373]" style={{ fontFamily: "'Roboto', sans-serif" }}>
                        {item.label}
                      </p>
                      <p className="text-lg font-semibold text-[#262626]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Info */}
            <div className="rounded-xl bg-white p-8 shadow-md">
              <div className="flex items-start gap-3">
                <MapPin className="h-6 w-6 flex-shrink-0 text-[#22c55e]" />
                <div>
                  <h3
                    className="mb-2 text-xl font-semibold uppercase tracking-wide"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      color: "#0c4a6e",
                    }}
                  >
                    Localização
                  </h3>
                  <p className="text-[#737373]" style={{ fontFamily: "'Roboto', sans-serif" }}>
                    {[property.endereco, property.bairro, property.cidade, property.estado]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {property.regiao && (
                    <p className="mt-1 text-sm text-[#737373]">Região: {property.regiao}</p>
                  )}
                </div>
              </div>

              {/* Map Placeholder */}
              {property.latitude && property.longitude && (
                <div className="mt-6 h-48 rounded-lg bg-gray-200 overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${property.latitude},${property.longitude}&zoom=15`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização do imóvel"
                  />
                </div>
              )}
            </div>

            {/* Developer Info */}
            {construtoraNome && (
              <div className="mt-6 text-center">
                <p className="text-sm text-[#737373]" style={{ fontFamily: "'Roboto', sans-serif" }}>
                  Desenvolvido por{" "}
                  <span className="font-semibold text-[#0c4a6e]">{construtoraNome}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
