import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageLoadingSpinner } from "@/components/ui/skeleton-loaders";

interface CustomDomainPageProps {
  entityType: "construtora" | "imobiliaria";
  entityId: string;
}

interface EntityData {
  nome_empresa: string;
  logo_url: string | null;
  cor_primaria: string | null;
  cor_secundaria?: string | null;
}

interface ImovelCard {
  id: string;
  titulo: string;
  cidade: string | null;
  bairro: string | null;
  valor: number | null;
  imagens: any;
  slug?: string;
}

export default function CustomDomainPage({ entityType, entityId }: CustomDomainPageProps) {
  const [entity, setEntity] = useState<EntityData | null>(null);
  const [imoveis, setImoveis] = useState<ImovelCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [entityType, entityId]);

  async function loadData() {
    try {
      if (entityType === "construtora") {
        const [entityRes, imoveisRes] = await Promise.all([
          supabase.from("construtoras").select("nome_empresa, logo_url, cor_primaria, cor_secundaria").eq("id", entityId).single(),
          supabase.from("imoveis").select("id, titulo, cidade, bairro, valor, imagens").eq("construtora_id", entityId).eq("status", "ativo"),
        ]);
        if (entityRes.data) setEntity(entityRes.data);
        if (imoveisRes.data) setImoveis(imoveisRes.data);
      } else {
        const entityRes = await supabase.from("imobiliarias").select("nome_empresa, logo_url, cor_primaria").eq("id", entityId).single();
        if (entityRes.data) setEntity(entityRes.data);

        // Get imoveis via access table
        const accessRes = await supabase
          .from("imobiliaria_imovel_access")
          .select("url_slug, imovel_id, imoveis(id, titulo, cidade, bairro, valor, imagens)")
          .eq("imobiliaria_id", entityId)
          .eq("status", "active");

        if (accessRes.data) {
          setImoveis(
            accessRes.data
              .filter((a: any) => a.imoveis)
              .map((a: any) => ({ ...a.imoveis, slug: a.url_slug }))
          );
        }
      }
    } catch (err) {
      console.error("Error loading domain page:", err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return <PageLoadingSpinner />;
  if (!entity) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Empresa não encontrada</div>;

  const primaryColor = entity.cor_primaria || "#1e3a5f";

  function getPrimaryImage(imagens: any): string {
    if (!imagens) return "/placeholder.svg";
    const arr = Array.isArray(imagens) ? imagens : [];
    const primary = arr.find((img: any) => img.isPrimary);
    return primary?.url || arr[0]?.url || "/placeholder.svg";
  }

  function formatPrice(val: number | null): string {
    if (!val) return "Sob consulta";
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          {entity.logo_url && (
            <img src={entity.logo_url} alt={entity.nome_empresa} className="h-10 object-contain" />
          )}
          <h1 className="text-xl font-bold text-white">{entity.nome_empresa}</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">
          {entityType === "construtora" ? "Nossos Empreendimentos" : "Imóveis Disponíveis"}
        </h2>

        {imoveis.length === 0 ? (
          <p className="text-muted-foreground">Nenhum imóvel disponível no momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imoveis.map((imovel) => (
              <a
                key={imovel.id}
                href={imovel.slug ? `/imovel/${imovel.slug}` : "#"}
                className="group block rounded-xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={getPrimaryImage(imovel.imagens)}
                    alt={imovel.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{imovel.titulo}</h3>
                  {(imovel.bairro || imovel.cidade) && (
                    <p className="text-sm text-muted-foreground">
                      {[imovel.bairro, imovel.cidade].filter(Boolean).join(", ")}
                    </p>
                  )}
                  <p className="font-bold text-lg" style={{ color: primaryColor }}>
                    {formatPrice(imovel.valor)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {entity.nome_empresa}. Todos os direitos reservados.
      </footer>
    </div>
  );
}
