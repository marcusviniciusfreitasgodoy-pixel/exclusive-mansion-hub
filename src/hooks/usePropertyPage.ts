import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { PropertyPageData, PropertyData, PropertyBranding, Corretor } from "@/types/property-page";
import type { Integracao } from "@/types/integrations";

interface UsePropertyPageResult {
  data: PropertyPageData | null;
  isLoading: boolean;
  error: string | null;
  integracoes: Integracao[];
}

export function usePropertyPage(): UsePropertyPageResult {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PropertyPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [integracoes, setIntegracoes] = useState<Integracao[]>([]);

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
              email_contato,
              favicon_url
            ),
            imoveis (
              id,
              titulo,
              headline,
              endereco,
              bairro,
              cidade,
              estado,
              cep,
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
              condicoes_pagamento,
              imagens,
              videos,
              tour_360_url,
              status,
              construtora_id,
              listing_code,
              property_type,
              year_built,
              lot_size,
              lot_size_unit,
              parking_spaces,
              features_interior,
              features_exterior,
              amenities,
              price_secondary,
              price_secondary_currency,
              price_on_request,
              latitude,
              longitude,
              flag_destaque,
              flag_novo_anuncio,
              flag_exclusividade,
              flag_off_market,
              flag_lancamento,
              flag_alto_padrao,
              data_publicacao,
              origem_cadastro,
              regiao,
              distrito,
              estilo_arquitetonico,
              estrutura_construcao,
              tipo_piso,
              caracteristicas_terreno,
              vista,
              aquecimento,
              sistema_esgoto,
              abastecimento_agua,
              vagas_descricao,
              impostos_anuais,
              seo_titulo,
              seo_descricao,
              tags,
              corretores,
              template_escolhido,
              customizacao_template,
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

        // Parse JSON fields with safe defaults - handles both native arrays and stringified JSON
        const parseJsonField = (field: any): any[] => {
          if (Array.isArray(field)) return field;
          if (typeof field === 'string') {
            try {
              const parsed = JSON.parse(field);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          }
          return [];
        };

        const parseJsonArray = (field: any): string[] => parseJsonField(field);
        
        const parseImagens = (field: any): { url: string; alt?: string }[] => {
          const arr = parseJsonField(field);
          return arr.map((img: any) => {
            if (typeof img === 'string') return { url: img };
            return { url: img.url || '', alt: img.alt };
          });
        };

        const parseVideos = (field: any): { url: string; tipo?: string }[] => {
          const arr = parseJsonField(field);
          return arr.map((vid: any) => {
            if (typeof vid === 'string') return { url: vid };
            return { url: vid.url || '', tipo: vid.tipo, isUploaded: vid.isUploaded, orientation: vid.orientation };
          });
        };

        const parseCorretores = (field: any): Corretor[] => {
          if (!Array.isArray(field)) return [];
          return field.map((c: any) => ({
            nome: c.nome || "",
            cargo: c.cargo,
            fotoUrl: c.fotoUrl,
            telefone: c.telefone,
            email: c.email,
            miniBio: c.miniBio,
          }));
        };

        const property: PropertyData = {
          id: imovel.id,
          construtoraId: imovel.construtora_id,
          titulo: imovel.titulo,
          headline: imovel.headline,
          endereco: imovel.endereco,
          bairro: imovel.bairro,
          cidade: imovel.cidade,
          estado: imovel.estado || "RJ",
          cep: imovel.cep,
          valor: imovel.valor,
          condominio: imovel.condominio,
          iptu: imovel.iptu,
          areaTotal: imovel.area_total,
          areaPrivativa: imovel.area_privativa,
          suites: imovel.suites,
          banheiros: imovel.banheiros,
          vagas: imovel.vagas,
          descricao: imovel.descricao,
          diferenciais: parseJsonArray(imovel.diferenciais),
          memorialDescritivo: imovel.memorial_descritivo,
          condicoesPagamento: imovel.condicoes_pagamento,
          imagens: parseImagens(imovel.imagens),
          videos: parseVideos(imovel.videos),
          tour360Url: imovel.tour_360_url,
          status: imovel.status,
          // Sotheby's fields
          listingCode: imovel.listing_code,
          propertyType: imovel.property_type,
          yearBuilt: imovel.year_built,
          lotSize: imovel.lot_size,
          lotSizeUnit: imovel.lot_size_unit || 'm²',
          parkingSpaces: imovel.parking_spaces,
          featuresInterior: parseJsonArray(imovel.features_interior),
          featuresExterior: parseJsonArray(imovel.features_exterior),
          amenities: parseJsonArray(imovel.amenities),
          priceSecondary: imovel.price_secondary,
          priceSecondaryCurrency: imovel.price_secondary_currency || 'USD',
          priceOnRequest: imovel.price_on_request || false,
          latitude: imovel.latitude,
          longitude: imovel.longitude,
          // New The Agency fields
          flagDestaque: imovel.flag_destaque || false,
          flagNovoAnuncio: imovel.flag_novo_anuncio || false,
          flagExclusividade: imovel.flag_exclusividade || false,
          flagOffMarket: imovel.flag_off_market || false,
          flagLancamento: imovel.flag_lancamento || false,
          flagAltoPadrao: imovel.flag_alto_padrao || false,
          dataPublicacao: imovel.data_publicacao,
          origemCadastro: imovel.origem_cadastro,
          regiao: imovel.regiao,
          distrito: imovel.distrito,
          estiloArquitetonico: imovel.estilo_arquitetonico,
          estruturaConstrucao: imovel.estrutura_construcao,
          tipoPiso: parseJsonArray(imovel.tipo_piso),
          caracteristicasTerreno: parseJsonArray(imovel.caracteristicas_terreno),
          vista: parseJsonArray(imovel.vista),
          aquecimento: parseJsonArray(imovel.aquecimento),
          sistemaEsgoto: imovel.sistema_esgoto,
          abastecimentoAgua: imovel.abastecimento_agua,
          vagasDescricao: imovel.vagas_descricao,
          impostosAnuais: imovel.impostos_anuais,
          seoTitulo: imovel.seo_titulo,
          seoDescricao: imovel.seo_descricao,
          tags: parseJsonArray(imovel.tags),
          corretores: parseCorretores(imovel.corretores),
          // Template fields
          templateEscolhido: imovel.template_escolhido || 'moderno',
          customizacaoTemplate: typeof imovel.customizacao_template === 'object' 
            ? imovel.customizacao_template || {} 
            : {},
        };

        const branding: PropertyBranding = {
          imobiliariaLogo: imobiliaria?.logo_url || null,
          imobiliariaNome: imobiliaria?.nome_empresa || "",
          corPrimaria: imobiliaria?.cor_primaria || "#1e3a5f",
          telefone: imobiliaria?.telefone || null,
          emailContato: imobiliaria?.email_contato || null,
          faviconUrl: imobiliaria?.favicon_url || null,
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

        // Fetch active integrations for the imobiliaria
        try {
          const { data: integracoesData } = await supabase
            .from("integracoes")
            .select("*")
            .eq("imobiliaria_id", accessData.imobiliaria_id)
            .eq("ativa", true);
          
          if (integracoesData) {
            setIntegracoes(integracoesData as unknown as Integracao[]);
          }
        } catch (integrationError) {
          console.warn("Could not fetch integrations:", integrationError);
        }

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

  return { data, isLoading, error, integracoes };
}
