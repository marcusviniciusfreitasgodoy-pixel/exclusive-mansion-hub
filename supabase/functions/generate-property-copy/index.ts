import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Aja como um especialista em marketing imobiliário de alto padrão, com foco exclusivo no mercado do Rio de Janeiro.

**REGRAS CRÍTICAS - VIOLAÇÃO É ABSOLUTAMENTE PROIBIDA:**
1. Use SOMENTE as informações fornecidas no contexto do imóvel
2. NUNCA invente ou altere características (tipo, metragem, quartos, localização)
3. Se o título indica "Duplex", a descrição DEVE mencionar "duplex" - JAMAIS descreva como "linear"
4. Se o título indica "Linear", a descrição DEVE mencionar "linear" - JAMAIS descreva como "duplex"
5. Se o título indica "Cobertura", NÃO descreva como "apartamento térreo" ou "casa"
6. Se uma característica NÃO foi informada, NÃO a mencione no texto
7. Números são EXATOS: se tem 4 suítes, escreva "4 suítes", não "5 amplos quartos"
8. Bairros devem ser mencionados EXATAMENTE como informados
9. Se não foi informada piscina, NÃO mencione piscina
10. Se não foi informado jardim, NÃO mencione jardim

**EXEMPLOS DO QUE VOCÊ NÃO DEVE FAZER:**
- Se o título diz "Cobertura Duplex", NÃO descreva como "linear" ou "térreo"
- Se tem 4 suítes, NÃO mencione "5 amplos dormitórios"
- Se não foi informada piscina, NÃO mencione piscina
- Se o imóvel está no Leblon, NÃO mencione Ipanema

**Objetivo:** Criar descrições persuasivas que despertem interesse para visitas, usando APENAS os dados fornecidos.

**Estilo de Escrita:**
- Evite clichês ("espetacular", "maravilhosa", "incrível", "deslumbrante")
- Use linguagem sofisticada e exclusiva
- Foque nos diferenciais REAIS fornecidos
- Textos envolventes mas ABSOLUTAMENTE FIÉIS aos dados

**Formato de Resposta:**
Retorne APENAS o texto solicitado, sem marcações markdown, sem aspas, sem explicações adicionais. Apenas o texto puro e direto.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tipo, dados_imovel } = await req.json();

    if (!tipo || !dados_imovel) {
      return new Response(
        JSON.stringify({ error: "Parâmetros obrigatórios: tipo e dados_imovel" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Serviço de IA não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context from property data
    const valorFormatado = dados_imovel.valor 
      ? `R$ ${dados_imovel.valor.toLocaleString('pt-BR')}`
      : 'Sob consulta';
    
    const diferenciaisArray = Array.isArray(dados_imovel.diferenciais) 
      ? dados_imovel.diferenciais
      : [];
    
    const diferenciaisFormatted = diferenciaisArray.length > 0
      ? diferenciaisArray.map((d: string) => `- ${d}`).join('\n')
      : 'Nenhum diferencial informado';

    let tipoInstrucao = '';
    switch (tipo) {
      case 'descricao':
        tipoInstrucao = 'Crie uma DESCRIÇÃO COMPLETA com 3-4 parágrafos, detalhada e envolvente, para ser usada na página principal do imóvel. Use APENAS os dados fornecidos acima.';
        break;
      case 'headline':
        tipoInstrucao = 'Crie uma HEADLINE IMPACTANTE com no máximo 100 caracteres, que capture a essência única deste imóvel. Deve ser curta, memorável e intrigante. Use APENAS os dados fornecidos acima.';
        break;
      case 'copy_anuncio':
        tipoInstrucao = 'Crie uma COPY PARA ANÚNCIO com 2-3 frases impactantes, ideal para redes sociais e portais imobiliários. Deve ser concisa mas persuasiva. Use APENAS os dados fornecidos acima.';
        break;
      default:
        tipoInstrucao = 'Crie uma descrição persuasiva para este imóvel usando APENAS os dados fornecidos.';
    }

    const userPrompt = `
═══════════════════════════════════════════════════════════
DADOS FACTUAIS DO IMÓVEL - NÃO ALTERE NENHUM DESTES DADOS
═══════════════════════════════════════════════════════════

IDENTIFICAÇÃO (RESPEITE O TIPO EXATAMENTE COMO ESTÁ NO TÍTULO):
- Título EXATO: ${dados_imovel.titulo || 'Não informado'}
- Tipo do Imóvel: ${dados_imovel.property_type || 'Extrair do título acima'}

LOCALIZAÇÃO (USE EXATAMENTE COMO INFORMADO):
- Bairro: ${dados_imovel.bairro || 'Não informado'}
- Cidade: ${dados_imovel.cidade || 'Rio de Janeiro'}

METRAGENS (NÚMEROS EXATOS - NÃO ARREDONDE):
- Área Total: ${dados_imovel.area_total ? `${dados_imovel.area_total}m²` : 'Não informada'}
- Área Privativa: ${dados_imovel.area_privativa ? `${dados_imovel.area_privativa}m²` : 'Não informada'}

CONFIGURAÇÃO (NÚMEROS EXATOS - NÃO ALTERE):
- Suítes: ${dados_imovel.suites || 'Não informado'}
- Banheiros: ${dados_imovel.banheiros || 'Não informado'}
- Vagas: ${dados_imovel.vagas || 'Não informado'}

VALOR:
- ${valorFormatado}

DIFERENCIAIS REAIS DO IMÓVEL (USE APENAS ESTES - NÃO INVENTE OUTROS):
${diferenciaisFormatted}

${dados_imovel.palavras_chave_adicionais ? `PALAVRAS-CHAVE EXTRAS FORNECIDAS:\n${dados_imovel.palavras_chave_adicionais}` : ''}

═══════════════════════════════════════════════════════════
INSTRUÇÕES DE GERAÇÃO
═══════════════════════════════════════════════════════════

${tipoInstrucao}

LEMBRETES CRÍTICOS:
- Use APENAS os dados acima. NÃO invente informações.
- Se o título diz "Duplex", o texto DEVE dizer "duplex".
- Se o título diz "Linear", o texto DEVE dizer "linear".
- Se o título diz "Cobertura", NÃO descreva como "apartamento" ou "casa".
- NÃO mencione características que não estão nos diferenciais listados.`;

    console.log("[generate-property-copy] Calling Lovable AI with tipo:", tipo);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[generate-property-copy] AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "rate_limit", 
            message: "Limite de requisições excedido. Por favor, aguarde alguns segundos e tente novamente." 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "payment_required", 
            message: "Créditos de IA esgotados. Entre em contato com o suporte." 
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Erro ao gerar texto com IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const textoGerado = data.choices?.[0]?.message?.content?.trim() || '';

    if (!textoGerado) {
      return new Response(
        JSON.stringify({ error: "IA não retornou texto" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[generate-property-copy] Successfully generated text, length:", textoGerado.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        texto_gerado: textoGerado,
        tipo: tipo
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[generate-property-copy] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
