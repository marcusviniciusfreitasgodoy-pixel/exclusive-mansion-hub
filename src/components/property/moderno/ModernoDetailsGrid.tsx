import { Bed, Bath, Car, Ruler, Building2, Calendar, MapPin, Waves, Trees, Mountain } from "lucide-react";
import type { PropertyData } from "@/types/property-page";

interface ModernoDetailsGridProps {
  property: PropertyData;
  construtoraNome: string;
}

export function ModernoDetailsGrid({ property, construtoraNome }: ModernoDetailsGridProps) {
  const specs = [
    { icon: Bed, label: "Suítes", value: property.suites },
    { icon: Bath, label: "Banheiros", value: property.banheiros },
    { icon: Car, label: "Vagas", value: property.vagas || property.parkingSpaces },
    { icon: Ruler, label: "Área Total", value: property.areaTotal ? `${property.areaTotal}m²` : null },
    { icon: Building2, label: "Área Privativa", value: property.areaPrivativa ? `${property.areaPrivativa}m²` : null },
    { icon: Calendar, label: "Ano", value: property.yearBuilt },
  ].filter((item) => item.value);

  const amenityIcons: Record<string, typeof Waves> = {
    piscina: Waves,
    jardim: Trees,
    vista: Mountain,
  };

  return (
    <section
      className="py-12"
      style={{ backgroundColor: "#F9FAFB" }}
    >
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Column 1 - Lifestyle Description */}
          <div className="lg:col-span-1">
            <h2
              className="mb-6 text-2xl font-bold capitalize"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                color: "#1E3A8A",
              }}
            >
              Sobre o imóvel
            </h2>
            
            {property.descricao && (
              <p
                className="mb-6 text-base leading-relaxed"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: "#374151",
                  lineHeight: "1.6",
                }}
              >
                {property.descricao}
              </p>
            )}

            {/* Diferenciais */}
            {property.diferenciais && property.diferenciais.length > 0 && (
              <div className="mt-6">
                <h3
                  className="mb-3 text-lg font-semibold"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "#374151",
                  }}
                >
                  Diferenciais
                </h3>
                <ul className="space-y-2">
                  {property.diferenciais.slice(0, 8).map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "#374151" }}
                    >
                      <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Column 2 - Technical Specs */}
          <div className="lg:col-span-1">
            <h3
              className="mb-6 text-lg font-semibold capitalize"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                color: "#374151",
              }}
            >
              Especificações técnicas
            </h3>
            
            <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
              {specs.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-[#10B981]" />
                    <span
                      className="text-sm text-gray-600"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span
                    className="text-base font-semibold text-gray-800"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Amenities Tags */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="mt-6">
                <h4
                  className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Comodidades
                </h4>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.slice(0, 6).map((amenity, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-[#10B981]/10 px-3 py-1 text-xs font-medium text-[#10B981]"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Column 3 - Map & Location */}
          <div className="lg:col-span-1">
            <h3
              className="mb-6 text-lg font-semibold capitalize"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                color: "#374151",
              }}
            >
              Localização
            </h3>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <MapPin className="h-5 w-5 flex-shrink-0 text-[#10B981]" />
                <div>
                  <p
                    className="text-sm text-gray-700"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {[property.endereco, property.bairro, property.cidade, property.estado]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {property.regiao && (
                    <p className="mt-1 text-xs text-gray-500">Região: {property.regiao}</p>
                  )}
                </div>
              </div>

              {/* Map */}
              {property.latitude && property.longitude && (
                <div className="h-40 overflow-hidden rounded-lg bg-gray-100">
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

            {/* Developer Credit */}
            {construtoraNome && (
              <p
                className="mt-4 text-center text-xs text-gray-500"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Desenvolvido por{" "}
                <span className="font-medium text-gray-700">{construtoraNome}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
