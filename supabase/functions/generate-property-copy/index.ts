import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Aja como um especialista em marketing imobiliário de alto padrão, com foco exclusivo no mercado do Rio de Janeiro. Sua tarefa é criar descrições e copys persuasivas para anúncios e sites imobiliários, com o objetivo de despertar o interesse do cliente e incentivá-lo a visitar o imóvel.

**Requisitos:**
1. **Foco:** Imóveis de alto padrão no Rio de Janeiro.
2. **Objetivo:** Gerar interesse para agendamento de visitas.
3. **Estilo de Escrita:**
   * Evite descrições genéricas e clichês (ex: "espetacular casa", "maravilhosa cobertura", "incrível", "deslumbrante").
   * Crie textos envolventes, cativantes e que destaquem os diferenciais únicos de cada imóvel.
   * Utilize linguagem que evoque sofisticação, exclusividade e o estilo de vida associado ao alto padrão no Rio de Janeiro.
   * As descrições não devem ser cansativas ou óbvias.
4. **Conteúdo:** Deve focar em despertar a atenção e o interesse do cliente, levando-o a querer saber mais e, consequentemente, visitar o imóvel.

**Estrutura a seguir (adaptar conforme o tipo de texto solicitado):**
* **Título Impactante:** (Curto, intrigante, relacionado à exclusividade ou localização)
* **Primeiras Linhas (Gancho):** (Descreva um sentimento, uma vista, uma experiência única)
* **Destaques (Evitando Clichês):** (Cite características que agregam valor e exclusividade, focando em benefícios e estilo de vida)
* **Localização (Contextualizada):** (Mencione o bairro com seus atributos de alto padrão e conveniências)
* **Chamada para Ação:** (Incentivo claro para agendar visita ou obter mais informações)

IMPORTANTE: Retorne APENAS o texto solicitado, sem marcações markdown, sem aspas, sem explicações adicionais. Apenas o texto puro e direto.`;

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
    
    const diferenciais = Array.isArray(dados_imovel.diferenciais) 
      ? dados_imovel.diferenciais.join(', ')
      : 'Não informados';

    let tipoInstrucao = '';
    switch (tipo) {
      case 'descricao':
        tipoInstrucao = 'Crie uma DESCRIÇÃO COMPLETA com 3-4 parágrafos, detalhada e envolvente, para ser usada na página principal do imóvel.';
        break;
      case 'headline':
        tipoInstrucao = 'Crie uma HEADLINE IMPACTANTE com no máximo 100 caracteres, que capture a essência única deste imóvel. Deve ser curta, memorável e intrigante.';
        break;
      case 'copy_anuncio':
        tipoInstrucao = 'Crie uma COPY PARA ANÚNCIO com 2-3 frases impactantes, ideal para redes sociais e portais imobiliários. Deve ser concisa mas persuasiva.';
        break;
      default:
        tipoInstrucao = 'Crie uma descrição persuasiva para este imóvel.';
    }

    const userPrompt = `
CONTEXTO DO IMÓVEL:
- Título: ${dados_imovel.titulo || 'Não informado'}
- Localização: ${dados_imovel.bairro || 'Não informado'}, ${dados_imovel.cidade || 'Rio de Janeiro'}
- Área Total: ${dados_imovel.area_total ? `${dados_imovel.area_total}m²` : 'Não informada'}
- Configuração: ${dados_imovel.suites || 0} suítes, ${dados_imovel.vagas || 0} vagas
- Valor: ${valorFormatado}
- Diferenciais: ${diferenciais}
${dados_imovel.palavras_chave_adicionais ? `- Palavras-chave extras: ${dados_imovel.palavras_chave_adicionais}` : ''}

TIPO DE TEXTO SOLICITADO:
${tipoInstrucao}

Gere o texto agora, seguindo as diretrizes do sistema.`;

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
