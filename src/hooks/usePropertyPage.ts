import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { PropertyPageData, PropertyData, PropertyBranding } from "@/types/property-page";

interface UsePropertyPageResult {
  data: PropertyPageData | null;
  isLoading: boolean;
  error: string | null;
}

export function usePropertyPage(): UsePropertyPageResult {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PropertyPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("Slug não encontrado");
      setIsLoading(false);
      return;
    }

    async function fetchPropertyData() {
      try {
        // Fetch access record by slug
        const { data: accessData, error: accessError } = await supabase
          .from("imobiliaria_imovel_access")
          .select(`
            id,
            imobiliaria_id,
            imovel_id,
            status,
            imobiliarias (
              id,
              nome_empresa,
              logo_url,
              cor_primaria,
              telefone,
              email_contato
            ),
            imoveis (
              id,
              titulo,
              endereco,
              bairro,
              cidade,
              estado,
              valor,
              condominio,
              iptu,
              area_total,
              area_privativa,
              suites,
              banheiros,
              vagas,
              descricao,
              diferenciais,
              memorial_descritivo,
              imagens,
              videos,
              tour_360_url,
              status,
              construtora_id,
              construtoras (
                nome_empresa,
                logo_url
              )
            )
          `)
          .eq("url_slug", slug)
          .eq("status", "active")
          .single();

        if (accessError || !accessData) {
          setError("Imóvel não encontrado");
          setIsLoading(false);
          return;
        }

        const imobiliaria = accessData.imobiliarias as any;
        const imovel = accessData.imoveis as any;
        const construtora = imovel?.construtoras as any;

        if (!imovel || imovel.status !== "ativo") {
          setError("Imóvel não disponível");
          setIsLoading(false);
          return;
        }

        // Parse JSON fields
        const diferenciais = Array.isArray(imovel.diferenciais)
          ? imovel.diferenciais
          : [];
        const imagens = Array.isArray(imovel.imagens) ? imovel.imagens : [];
        const videos = Array.isArray(imovel.videos) ? imovel.videos : [];

        const property: PropertyData = {
          id: imovel.id,
          titulo: imovel.titulo,
          endereco: imovel.endereco,
          bairro: imovel.bairro,
          cidade: imovel.cidade,
          estado: imovel.estado || "RJ",
          valor: imovel.valor,
          condominio: imovel.condominio,
          iptu: imovel.iptu,
          areaTotal: imovel.area_total,
          areaPrivativa: imovel.area_privativa,
          suites: imovel.suites,
          banheiros: imovel.banheiros,
          vagas: imovel.vagas,
          descricao: imovel.descricao,
          diferenciais,
          memorialDescritivo: imovel.memorial_descritivo,
          imagens,
          videos,
          tour360Url: imovel.tour_360_url,
          status: imovel.status,
        };

        const branding: PropertyBranding = {
          imobiliariaLogo: imobiliaria?.logo_url || null,
          imobiliariaNome: imobiliaria?.nome_empresa || "",
          corPrimaria: imobiliaria?.cor_primaria || "#1e3a5f",
          telefone: imobiliaria?.telefone || null,
          emailContato: imobiliaria?.email_contato || null,
        };

        setData({
          property,
          branding,
          construtora: {
            nome: construtora?.nome_empresa || "",
            logo: construtora?.logo_url || null,
          },
          accessId: accessData.id,
          imobiliariaId: accessData.imobiliaria_id,
        });

        // Track pageview with localStorage deduplication (24h)
        const viewKey = `viewed_${imovel.id}_${accessData.imobiliaria_id}`;
        const lastViewed = localStorage.getItem(viewKey);
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (!lastViewed || (now - parseInt(lastViewed, 10)) > twentyFourHours) {
          await supabase.from("pageviews").insert({
            imovel_id: imovel.id,
            imobiliaria_id: accessData.imobiliaria_id,
            access_id: accessData.id,
            user_agent: navigator.userAgent,
            referrer: document.referrer || null,
          });

          // Increment visit counter on access record
          await supabase
            .from("imobiliaria_imovel_access")
            .update({ visitas: (accessData as any).visitas + 1 })
            .eq("id", accessData.id);

          localStorage.setItem(viewKey, now.toString());
        }

      } catch (err) {
        console.error("Error fetching property:", err);
        setError("Erro ao carregar dados do imóvel");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPropertyData();
  }, [slug]);

  return { data, isLoading, error };
}
