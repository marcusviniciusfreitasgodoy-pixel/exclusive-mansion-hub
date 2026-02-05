import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from "../_shared/rate-limiter.ts";

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
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
}

// Tool definitions for function calling
const tools = [
  {
    type: "function",
    function: {
      name: "capturar_dados_lead",
      description: "Captura informações de contato do cliente quando ele fornece nome, email ou telefone durante a conversa. Use esta função assim que detectar qualquer dado de contato.",
      parameters: {
        type: "object",
        properties: {
          nome: {
            type: "string",
            description: "Nome completo do cliente"
          },
          email: {
            type: "string",
            description: "Endereço de e-mail do cliente"
          },
          telefone: {
            type: "string",
            description: "Número de telefone ou WhatsApp do cliente"
          },
          nivel_interesse: {
            type: "string",
            enum: ["alto", "medio", "baixo"],
            description: "Nível de interesse detectado baseado na conversa"
          },
          contexto: {
            type: "string",
            description: "Breve resumo do contexto da conversa e interesse do cliente"
          }
        },
        required: ["contexto"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "solicitar_agendamento",
      description: "Solicita agendamento de visita quando o cliente confirma interesse em visitar o imóvel e fornece opções de data/horário",
      parameters: {
        type: "object",
        properties: {
          opcao_data_1: {
            type: "string",
            description: "Primeira opção de data e horário mencionada pelo cliente"
          },
          opcao_data_2: {
            type: "string",
            description: "Segunda opção de data e horário mencionada pelo cliente"
          },
          observacoes: {
            type: "string",
            description: "Observações ou preferências do cliente para a visita"
          }
        },
        required: ["opcao_data_1"]
      }
    }
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, mensagem_usuario, imovel_id, imobiliaria_id, construtora_id, input_type } =
      await req.json();

    if (!session_id || !mensagem_usuario || !imovel_id) {
      throw new Error("Parâmetros obrigatórios ausentes");
    }

    // Rate limiting check
    const clientId = session_id || getClientIdentifier(req);
    const rateLimitResult = await checkRateLimit(supabase, clientId, "chatbot-message");
    
    if (!rateLimitResult.allowed) {
      console.log(`[chatbot-message] Rate limit exceeded for ${clientId}`);
      return rateLimitResponse(rateLimitResult.resetAt);
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

    // 2. Fetch global knowledge base
    const { data: knowledgeBase } = await supabase
      .from("chatbot_knowledge_base")
      .select("categoria, titulo, conteudo")
      .eq("ativo", true)
      .order("prioridade", { ascending: false })
      .limit(50);

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

    // Format knowledge base for prompt
    let knowledgeBaseSection = "";
    if (knowledgeBase && knowledgeBase.length > 0) {
      const kbByCategory: Record<string, string[]> = {};
      for (const kb of knowledgeBase) {
        if (!kbByCategory[kb.categoria]) {
          kbByCategory[kb.categoria] = [];
        }
        kbByCategory[kb.categoria].push(`- ${kb.titulo}: ${kb.conteudo}`);
      }
      
      knowledgeBaseSection = "\n\nBASE DE CONHECIMENTO ADICIONAL:";
      for (const [categoria, items] of Object.entries(kbByCategory)) {
        knowledgeBaseSection += `\n\n[${categoria.toUpperCase()}]\n${items.join("\n")}`;
      }
    }

    // Add property-specific AI context if available
    const contextoAdicionalImovel = imovel.contexto_adicional_ia 
      ? `\n\nCONTEXTO ESPECÍFICO DO IMÓVEL:\n${imovel.contexto_adicional_ia}`
      : "";

    const systemPrompt = `Você é Sofia, uma assistente virtual especializada em imóveis de alto padrão, representando a ${empresaNome}.

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
${amenities || "Não informado"}${contextoAdicionalImovel}${knowledgeBaseSection}

CONTATO:
- Empresa: ${empresaNome}
- Telefone: ${empresaTelefone}
- E-mail: ${empresaEmail}

DADOS JÁ CAPTURADOS DO CLIENTE:
- Nome: ${conversa.nome_visitante || "Não informado ainda"}
- Email: ${conversa.email_visitante || "Não informado ainda"}
- Telefone: ${conversa.telefone_visitante || "Não informado ainda"}

SUAS RESPONSABILIDADES:
1. Responder perguntas sobre o imóvel com precisão baseado nas informações fornecidas
2. Destacar diferenciais relevantes quando apropriado
3. Ser cordial, profissional e consultivo
4. **IMPORTANTE**: Quando o cliente mencionar QUALQUER dado de contato (nome, email OU telefone), use IMEDIATAMENTE a função capturar_dados_lead
5. Quando não souber uma informação específica, sugira entrar em contato com a equipe
6. Oferecer agendamento de visita quando cliente demonstrar interesse
7. Para agendar visita, use a função solicitar_agendamento
8. Utilize a BASE DE CONHECIMENTO para responder perguntas sobre financiamento, processos de compra, materiais, etc.

REGRAS DE CAPTURA DE DADOS:
- Se o cliente disser "Meu nome é João" → Chame capturar_dados_lead com nome="João"
- Se o cliente fornecer email como "joao@email.com" → Chame capturar_dados_lead com email="joao@email.com"  
- Se o cliente der telefone "11999999999" → Chame capturar_dados_lead com telefone="11999999999"
- Você pode capturar dados parciais (apenas nome, ou apenas telefone) - não precisa ter todos
- Após capturar, agradeça naturalmente e continue a conversa

REGRAS GERAIS:
- NÃO invente informações não fornecidas
- Se não souber, diga "Vou verificar com nossa equipe e retorno"
- Use "nós" ao referir-se à empresa
- Seja conciso: máximo 2-3 parágrafos por resposta
- Use emojis moderadamente (máximo 2 por mensagem)

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

    // 5. Call Lovable AI Gateway with tools
    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lovableApiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: messages,
          tools: tools,
          tool_choice: "auto",
          temperature: 0.7,
          max_tokens: 800,
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "rate_limit",
            resposta: "Estamos com muitas solicitações no momento. Por favor, aguarde alguns segundos e tente novamente." 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "payment_required",
            resposta: "Serviço temporariamente indisponível. Por favor, tente novamente mais tarde." 
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Erro ao processar mensagem com IA");
    }

    const aiData = await aiResponse.json();
    const choice = aiData.choices?.[0];
    const responseMessage = choice?.message;
    
    let respostaIA = responseMessage?.content || "";
    let functionResults: any[] = [];

    // 6. Process tool calls if any
    if (responseMessage?.tool_calls && responseMessage.tool_calls.length > 0) {
      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function?.name;
        let functionArgs: any = {};
        
        try {
          functionArgs = JSON.parse(toolCall.function?.arguments || "{}");
        } catch (e) {
          console.error("Error parsing function arguments:", e);
          continue;
        }

        console.log(`Processing tool call: ${functionName}`, functionArgs);

        if (functionName === "capturar_dados_lead") {
          // Update conversation with captured data
          const updateData: any = {};
          
          if (functionArgs.nome) {
            updateData.nome_visitante = functionArgs.nome;
          }
          if (functionArgs.email) {
            updateData.email_visitante = functionArgs.email;
          }
          if (functionArgs.telefone) {
            updateData.telefone_visitante = functionArgs.telefone;
          }
          if (functionArgs.nivel_interesse) {
            updateData.intencao_detectada = functionArgs.nivel_interesse;
            updateData.score_qualificacao = 
              functionArgs.nivel_interesse === "alto" ? 80 : 
              functionArgs.nivel_interesse === "medio" ? 50 : 20;
          }

          // Merge with existing data
          const nomeCompleto = functionArgs.nome || conversa.nome_visitante;
          const emailCompleto = functionArgs.email || conversa.email_visitante;
          const telefoneCompleto = functionArgs.telefone || conversa.telefone_visitante;

          // Update conversation
          if (Object.keys(updateData).length > 0) {
            await supabase
              .from("conversas_chatbot")
              .update(updateData)
              .eq("id", conversa.id);
            
            // Update local conversa object
            Object.assign(conversa, updateData);
          }

          // Create lead if we have enough data (at least email or phone)
          if ((emailCompleto || telefoneCompleto) && !conversa.lead_gerado) {
            const leadData: any = {
              imovel_id,
              nome: nomeCompleto || "Visitante via Chat",
              email: emailCompleto || `chatbot-${session_id.slice(0, 8)}@temp.lead`,
              telefone: telefoneCompleto,
              origem: "chat_ia",
              mensagem: functionArgs.contexto || "Lead capturado via chatbot com IA",
              status: "novo",
            };

            if (imobiliaria_id) {
              leadData.imobiliaria_id = imobiliaria_id;
            }

            const { data: leadCriado, error: leadError } = await supabase
              .from("leads")
              .insert(leadData)
              .select()
              .single();

            if (!leadError && leadCriado) {
              // Update conversation with lead reference
              await supabase
                .from("conversas_chatbot")
                .update({
                  lead_id: leadCriado.id,
                  lead_gerado: true,
                  status: "lead_capturado",
                })
                .eq("id", conversa.id);

              conversa.lead_id = leadCriado.id;
              conversa.lead_gerado = true;

              functionResults.push({
                tipo: "lead_capturado",
                lead_id: leadCriado.id,
                dados_capturados: {
                  nome: nomeCompleto,
                  email: emailCompleto,
                  telefone: telefoneCompleto,
                },
              });

              console.log("Lead created successfully:", leadCriado.id);
            } else {
              console.error("Error creating lead:", leadError);
            }
          } else {
            functionResults.push({
              tipo: "dados_atualizados",
              dados_capturados: {
                nome: nomeCompleto,
                email: emailCompleto,
                telefone: telefoneCompleto,
              },
            });
          }
        } 
        else if (functionName === "solicitar_agendamento") {
          // Check if we have lead data for scheduling
          if (!conversa.nome_visitante || (!conversa.email_visitante && !conversa.telefone_visitante)) {
            functionResults.push({
              tipo: "agendamento_pendente",
              mensagem: "Dados de contato incompletos para agendamento",
            });
          } else {
            // Create visit scheduling request
            const agendamentoData = {
              imovel_id,
              construtora_id: construtora_id || imovel.construtora_id,
              imobiliaria_id: imobiliaria_id || null,
              lead_id: conversa.lead_id,
              cliente_nome: conversa.nome_visitante,
              cliente_email: conversa.email_visitante || `chatbot-${session_id.slice(0, 8)}@temp.lead`,
              cliente_telefone: conversa.telefone_visitante || "",
              opcao_data_1: functionArgs.opcao_data_1 || new Date().toISOString(),
              opcao_data_2: functionArgs.opcao_data_2 || new Date().toISOString(),
              observacoes: functionArgs.observacoes || "Agendamento solicitado via chatbot IA",
              status: "pendente",
            };

            const { data: agendamento, error: agendamentoError } = await supabase
              .from("agendamentos_visitas")
              .insert(agendamentoData)
              .select()
              .single();

            if (!agendamentoError && agendamento) {
              await supabase
                .from("conversas_chatbot")
                .update({
                  agendamento_gerado: true,
                  status: "agendamento_solicitado",
                })
                .eq("id", conversa.id);

              functionResults.push({
                tipo: "agendamento_criado",
                agendamento_id: agendamento.id,
              });

              console.log("Scheduling created successfully:", agendamento.id);
            } else {
              console.error("Error creating scheduling:", agendamentoError);
            }
          }
        }
      }

      // If AI only called tools without text response, make a follow-up call
      if (!respostaIA || respostaIA.trim() === "") {
        // Add tool results to messages and get a text response
        messages.push({
          role: "assistant",
          content: "",
          tool_call_id: responseMessage.tool_calls[0].id,
        });
        
        messages.push({
          role: "tool",
          tool_call_id: responseMessage.tool_calls[0].id,
          content: JSON.stringify({ success: true, results: functionResults }),
        });

        // Get follow-up response without tools
        const followUpResponse = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${lovableApiKey}`,
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: messages,
              temperature: 0.7,
              max_tokens: 500,
            }),
          }
        );

        if (followUpResponse.ok) {
          const followUpData = await followUpResponse.json();
          respostaIA = followUpData.choices?.[0]?.message?.content || 
            "Obrigado pelas informações! Como posso ajudá-lo mais?";
        }
      }
    }

    // Fallback response if still empty
    if (!respostaIA || respostaIA.trim() === "") {
      respostaIA = "Desculpe, não consegui processar sua mensagem. Pode reformular?";
    }

    // 7. Save messages to database
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
        model: "google/gemini-3-flash-preview",
        tokens: aiData.usage?.total_tokens || 0,
        tool_calls: responseMessage?.tool_calls?.map((tc: any) => tc.function?.name) || [],
        function_results: functionResults,
      },
    };

    const mensagensAtualizadas = [
      ...mensagensAnteriores,
      novaMensagemUser,
      novaMensagemAssistant,
    ];

    // Update conversation in database
    await supabase
      .from("conversas_chatbot")
      .update({
        mensagens: mensagensAtualizadas,
        total_mensagens: mensagensAtualizadas.length,
        ultima_mensagem_em: new Date().toISOString(),
      })
      .eq("id", conversa.id);

    return new Response(
      JSON.stringify({
        success: true,
        resposta: respostaIA,
        mensagem_id: novaMensagemAssistant.id,
        function_results: functionResults.length > 0 ? functionResults : undefined,
        should_speak: input_type === "voice",
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
