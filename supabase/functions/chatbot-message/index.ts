import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, mensagem_usuario, imovel_id, imobiliaria_id, construtora_id } =
      await req.json();

    if (!session_id || !mensagem_usuario || !imovel_id) {
      throw new Error("Parâmetros obrigatórios ausentes");
    }

    // 1. Fetch property data
    const { data: imovel, error: imovelError } = await supabase
      .from("imoveis")
      .select(`
        *,
        construtoras (nome_empresa, telefone, email_contato)
      `)
      .eq("id", imovel_id)
      .single();

    if (imovelError || !imovel) {
      throw new Error("Imóvel não encontrado");
    }

    // Get imobiliaria info if available
    let imobiliaria = null;
    if (imobiliaria_id) {
      const { data } = await supabase
        .from("imobiliarias")
        .select("nome_empresa, telefone, email_contato")
        .eq("id", imobiliaria_id)
        .single();
      imobiliaria = data;
    }

    const empresaNome = imobiliaria?.nome_empresa || imovel.construtoras?.nome_empresa || "nossa empresa";
    const empresaTelefone = imobiliaria?.telefone || imovel.construtoras?.telefone || "não informado";
    const empresaEmail = imobiliaria?.email_contato || imovel.construtoras?.email_contato || "não informado";

    // 2. Get or create conversation
    let { data: conversa } = await supabase
      .from("conversas_chatbot")
      .select("*")
      .eq("session_id", session_id)
      .single();

    if (!conversa) {
      const { data: novaConversa, error: insertError } = await supabase
        .from("conversas_chatbot")
        .insert({
          session_id,
          imovel_id,
          imobiliaria_id: imobiliaria_id || null,
          construtora_id: construtora_id || imovel.construtora_id,
          mensagens: [],
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating conversation:", insertError);
        throw new Error("Erro ao criar conversa");
      }

      conversa = novaConversa;
    }

    const mensagensAnteriores = (conversa?.mensagens || []) as Array<{
      role: string;
      content: string;
    }>;

    // 3. Build system prompt with property context
    const valorFormatado = imovel.valor
      ? `R$ ${Number(imovel.valor).toLocaleString("pt-BR")}`
      : "Sob consulta";

    const diferenciais = Array.isArray(imovel.diferenciais)
      ? imovel.diferenciais.join(", ")
      : "Não informado";

    const amenities = Array.isArray(imovel.amenities)
      ? imovel.amenities.join(", ")
      : "";

    const systemPrompt = `Você é um assistente virtual especializado em imóveis de alto padrão, representando a ${empresaNome}.

IMÓVEL EM QUESTÃO:
- Título: ${imovel.titulo}
- Headline: ${imovel.headline || "N/A"}
- Localização: ${imovel.endereco || ""}, ${imovel.bairro || ""}, ${imovel.cidade || ""} - ${imovel.estado || ""}
- Valor: ${valorFormatado}
- Condomínio: ${imovel.condominio ? `R$ ${Number(imovel.condominio).toLocaleString("pt-BR")}` : "N/A"}
- IPTU: ${imovel.iptu ? `R$ ${Number(imovel.iptu).toLocaleString("pt-BR")}` : "N/A"}
- Área Total: ${imovel.area_total || "N/A"}m²
- Área Privativa: ${imovel.area_privativa || "N/A"}m²
- Suítes: ${imovel.suites || "N/A"}
- Banheiros: ${imovel.banheiros || "N/A"}
- Vagas: ${imovel.vagas || "N/A"} ${imovel.vagas_descricao || ""}
- Ano de Construção: ${imovel.year_built || "N/A"}

DESCRIÇÃO:
${imovel.descricao || "Não disponível"}

DIFERENCIAIS:
${diferenciais}

AMENIDADES:
${amenities || "Não informado"}

CONTATO:
- Empresa: ${empresaNome}
- Telefone: ${empresaTelefone}
- E-mail: ${empresaEmail}

SUAS RESPONSABILIDADES:
1. Responder perguntas sobre o imóvel com precisão baseado nas informações fornecidas
2. Destacar diferenciais relevantes quando apropriado
3. Ser cordial, profissional e consultivo
4. Quando não souber uma informação específica, sugira entrar em contato com a equipe
5. Oferecer agendamento de visita quando cliente demonstrar interesse

REGRAS:
- NÃO invente informações não fornecidas
- Se não souber, diga "Vou verificar com nossa equipe e retorno"
- Use "nós" ao referir-se à empresa
- Seja conciso: máximo 2-3 parágrafos por resposta
- Use emojis moderadamente (máximo 2 por mensagem)
- Sempre que capturar interesse, pergunte nome e telefone para contato
- Para agendar visita, solicite nome, telefone e preferência de data

IDIOMA: Português brasileiro
TOM: Profissional, consultivo, amigável`;

    // 4. Build messages array for AI
    const messages: ChatMessage[] = [{ role: "system", content: systemPrompt }];

    // Add last 10 messages for context
    const ultimasMensagens = mensagensAnteriores.slice(-10);
    ultimasMensagens.forEach((msg) => {
      messages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    });

    // Add current user message
    messages.push({
      role: "user",
      content: mensagem_usuario,
    });

    // 5. Call Lovable AI Gateway
    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lovableApiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      throw new Error("Erro ao processar mensagem com IA");
    }

    const aiData = await aiResponse.json();
    const respostaIA = aiData.choices?.[0]?.message?.content || 
      "Desculpe, não consegui processar sua mensagem. Tente novamente.";

    // 6. Save messages to database
    const novaMensagemUser = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      role: "user",
      content: mensagem_usuario,
    };

    const novaMensagemAssistant = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      role: "assistant",
      content: respostaIA,
      metadata: {
        model: "google/gemini-2.5-flash",
        tokens: aiData.usage?.total_tokens || 0,
      },
    };

    const mensagensAtualizadas = [
      ...mensagensAnteriores,
      novaMensagemUser,
      novaMensagemAssistant,
    ];

    // Update conversation in database
    const { error: updateError } = await supabase
      .from("conversas_chatbot")
      .update({
        mensagens: mensagensAtualizadas,
        total_mensagens: mensagensAtualizadas.length,
        ultima_mensagem_em: new Date().toISOString(),
      })
      .eq("id", conversa.id);

    if (updateError) {
      console.error("Error updating conversation:", updateError);
    }

    // 7. Analyze for lead qualification (simple keyword detection)
    const mensagemLower = mensagem_usuario.toLowerCase();
    const interesseAlto = 
      mensagemLower.includes("agendar") ||
      mensagemLower.includes("visita") ||
      mensagemLower.includes("quero conhecer") ||
      mensagemLower.includes("comprar") ||
      mensagemLower.includes("meu telefone") ||
      mensagemLower.includes("meu email");

    if (interesseAlto && !conversa.intencao_detectada) {
      await supabase
        .from("conversas_chatbot")
        .update({
          intencao_detectada: "alto_interesse",
          score_qualificacao: 70,
        })
        .eq("id", conversa.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        resposta: respostaIA,
        mensagem_id: novaMensagemAssistant.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chatbot error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        resposta:
          "Desculpe, ocorreu um erro. Por favor, tente novamente ou entre em contato diretamente conosco.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
