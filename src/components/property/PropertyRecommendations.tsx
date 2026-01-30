import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bed, Bath, Maximize, ArrowRight } from "lucide-react";
import type { PropertyData } from "@/types/property-page";

interface PropertyRecommendationsProps {
  currentProperty: PropertyData;
  imobiliariaId: string;
}

interface RecommendedProperty {
  id: string;
  titulo: string;
  bairro: string | null;
  cidade: string | null;
  valor: number | null;
  suites: number | null;
  banheiros: number | null;
  area_privativa: number | null;
  imagens: { url: string; alt?: string }[];
  url_slug: string;
}

export function PropertyRecommendations({ currentProperty, imobiliariaId }: PropertyRecommendationsProps) {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["property-recommendations", currentProperty.id, imobiliariaId],
    queryFn: async () => {
      // Get other properties this imobiliaria has access to
      const { data, error } = await supabase
        .from("imobiliaria_imovel_access")
        .select(`
          url_slug,
          imoveis (
            id,
            titulo,
            bairro,
            cidade,
            valor,
            suites,
            banheiros,
            area_privativa,
            imagens,
            status
          )
        `)
        .eq("imobiliaria_id", imobiliariaId)
        .eq("status", "active")
        .neq("imovel_id", currentProperty.id)
        .limit(4);

      if (error) throw error;

      return (data || [])
        .filter((item: any) => item.imoveis?.status === "ativo")
        .map((item: any) => ({
          ...item.imoveis,
          url_slug: item.url_slug,
          imagens: Array.isArray(item.imoveis?.imagens) ? item.imoveis.imagens : [],
        })) as RecommendedProperty[];
    },
    enabled: !!imobiliariaId,
  });

  const formatCurrency = (value: number | null) => {
    if (!value) return "Consultar";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8">
            Continue sua busca
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary">
              Continue sua busca
            </h2>
            <p className="text-muted-foreground mt-1">
              Outros imóveis que podem te interessar
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((property) => (
            <Link
              key={property.id}
              to={`/imovel/${property.url_slug}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
            >
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                {property.imagens?.[0]?.url ? (
                  <img
                    src={property.imagens[0].url}
                    alt={property.titulo}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Maximize className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-primary line-clamp-1 group-hover:text-accent transition-colors">
                  {property.titulo}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                  {property.bairro}, {property.cidade}
                </p>
                <p className="text-lg font-bold text-primary mt-2">
                  {formatCurrency(property.valor)}
                </p>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  {property.suites && (
                    <span className="flex items-center gap-1">
                      <Bed className="h-3.5 w-3.5" />
                      {property.suites}
                    </span>
                  )}
                  {property.banheiros && (
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5" />
                      {property.banheiros}
                    </span>
                  )}
                  {property.area_privativa && (
                    <span className="flex items-center gap-1">
                      <Maximize className="h-3.5 w-3.5" />
                      {property.area_privativa}m²
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
