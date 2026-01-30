import { Building2, Car, Calendar, Maximize, Check, Droplets, Flame, Mountain, TreePine, Ruler } from "lucide-react";
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const statusLabels: Record<string, string> = {
    ativo: "Disponível",
    vendido: "Vendido",
    inativo: "Indisponível",
  };

  // Section: General Info
  const generalInfo = [
    { label: "Código", value: property.listingCode || property.id.slice(0, 8).toUpperCase() },
    { label: "Tipo", value: property.propertyType || "Residencial" },
    { label: "Status", value: statusLabels[property.status] || property.status },
    { label: "Região", value: property.regiao || property.bairro || "-" },
    { label: "Comercializado por", value: construtoraNome || "-" },
    property.dataPublicacao && { label: "Publicado em", value: formatDate(property.dataPublicacao) },
  ].filter(Boolean) as { label: string; value: string }[];

  // Section: Dimensions & Land
  const dimensionsInfo = [
    { label: "Área Total", value: property.areaTotal ? `${formatNumber(property.areaTotal)} m²` : "-", icon: Maximize },
    { label: "Área Privativa", value: property.areaPrivativa ? `${formatNumber(property.areaPrivativa)} m²` : "-", icon: Ruler },
    { label: "Área do Lote", value: property.lotSize ? `${formatNumber(property.lotSize)} ${property.lotSizeUnit}` : "-", icon: Ruler },
    { label: "Ano de Construção", value: property.yearBuilt || "-", icon: Calendar },
    { label: "Vagas", value: property.vagasDescricao || (property.parkingSpaces || property.vagas) || "-", icon: Car },
  ];

  // Section: Structure
  const structureInfo = [
    property.estiloArquitetonico && { label: "Estilo Arquitetônico", value: property.estiloArquitetonico },
    property.estruturaConstrucao && { label: "Estrutura/Construção", value: property.estruturaConstrucao },
    property.tipoPiso.length > 0 && { label: "Tipo de Piso", value: property.tipoPiso.join(", ") },
  ].filter(Boolean) as { label: string; value: string }[];

  // Section: Utilities
  const utilitiesInfo = [
    property.aquecimento.length > 0 && { label: "Aquecimento", value: property.aquecimento.join(", "), icon: Flame },
    property.abastecimentoAgua && { label: "Abastecimento de Água", value: property.abastecimentoAgua, icon: Droplets },
    property.sistemaEsgoto && { label: "Sistema de Esgoto", value: property.sistemaEsgoto, icon: Droplets },
  ].filter(Boolean) as { label: string; value: string; icon?: any }[];

  // Lists
  const hasInteriorFeatures = property.featuresInterior && property.featuresInterior.length > 0;
  const hasExteriorFeatures = property.featuresExterior && property.featuresExterior.length > 0;
  const hasAmenities = property.amenities && property.amenities.length > 0;
  const hasVista = property.vista && property.vista.length > 0;
  const hasCaracteristicasTerreno = property.caracteristicasTerreno && property.caracteristicasTerreno.length > 0;

  return (
    <section id="section-details" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <Building2 className="h-6 w-6 text-accent" />
          <h2 className="text-2xl md:text-3xl font-bold text-primary">
            Detalhes do Imóvel
          </h2>
        </div>

        {/* Main Grid - 2 columns */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* General Info */}
          <div className="bg-muted/30 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Informações Gerais
            </h3>
            <div className="space-y-3">
              {generalInfo.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-muted last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-primary text-right max-w-[60%]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="bg-muted/30 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Dimensões e Terreno
            </h3>
            <div className="space-y-3">
              {dimensionsInfo.map((item, index) => {
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
            {(property.condominio || property.iptu || property.impostosAnuais) && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Custos</h4>
                <div className="space-y-2">
                  {property.condominio && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Condomínio</span>
                      <span className="font-medium text-primary">{formatCurrency(property.condominio)}/mês</span>
                    </div>
                  )}
                  {property.iptu && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">IPTU</span>
                      <span className="font-medium text-primary">{formatCurrency(property.iptu)}/ano</span>
                    </div>
                  )}
                  {property.impostosAnuais && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Impostos Anuais</span>
                      <span className="font-medium text-primary">{formatCurrency(property.impostosAnuais)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Structure & Utilities Row */}
        {(structureInfo.length > 0 || utilitiesInfo.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {structureInfo.length > 0 && (
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Estrutura
                </h3>
                <div className="space-y-3">
                  {structureInfo.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-muted last:border-0">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="font-medium text-primary text-right max-w-[60%]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {utilitiesInfo.length > 0 && (
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  Utilidades
                </h3>
                <div className="space-y-3">
                  {utilitiesInfo.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-muted last:border-0">
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                        </div>
                        <span className="font-medium text-primary text-right max-w-[50%]">{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vista & Terrain */}
        {(hasVista || hasCaracteristicasTerreno) && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {hasVista && (
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Mountain className="h-4 w-4" />
                  Vista
                </h3>
                <div className="flex flex-wrap gap-2">
                  {property.vista.map((item, index) => (
                    <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm text-primary">
                      <Check className="h-3.5 w-3.5 text-accent" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hasCaracteristicasTerreno && (
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                  <TreePine className="h-4 w-4" />
                  Características do Terreno
                </h3>
                <div className="flex flex-wrap gap-2">
                  {property.caracteristicasTerreno.map((item, index) => (
                    <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm text-primary">
                      <Check className="h-3.5 w-3.5 text-accent" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features Lists */}
        {(hasInteriorFeatures || hasExteriorFeatures || hasAmenities) && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
