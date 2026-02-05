import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface ExtractedEntry {
  categoria: string;
  titulo: string;
  conteudo: string;
  tags: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdf_url, imovel_id, file_name } = await req.json();

    if (!pdf_url) {
      throw new Error("PDF URL é obrigatório");
    }

    console.log(`[process-knowledge-pdf] Processing PDF: ${file_name || pdf_url}`);

    // Fetch PDF content
    const pdfResponse = await fetch(pdf_url);
    if (!pdfResponse.ok) {
      throw new Error("Não foi possível baixar o PDF");
    }

    const pdfBlob = await pdfResponse.blob();
    const pdfBase64 = await blobToBase64(pdfBlob);

    // Call Gemini Vision to extract content
    const extractionPrompt = `Analise este documento PDF sobre um imóvel/empreendimento imobiliário e extraia as informações mais relevantes que seriam úteis para um chatbot de vendas responder perguntas de clientes.

Para cada informação importante encontrada, retorne EXATAMENTE no formato JSON abaixo (sem markdown, apenas o array JSON puro):
[
  {
    "categoria": "FAQ|Especificacao|Financiamento|Documentacao|Outros",
    "titulo": "Título curto e descritivo (máximo 100 caracteres)",
    "conteudo": "Conteúdo detalhado da informação (máximo 1000 caracteres)",
    "tags": ["tag1", "tag2"]
  }
]

EXTRAIA INFORMAÇÕES COMO:
- Especificações técnicas (metragem, materiais, acabamentos)
- Condições de pagamento e financiamento
- Diferenciais do empreendimento
- Regras e normas do condomínio
- Informações sobre entrega e cronograma
- FAQs comuns sobre o imóvel
- Localização e entorno
- Infraestrutura e amenidades

REGRAS:
1. Extraia entre 5 e 20 entradas relevantes
2. Cada entrada deve ser autocontida e fazer sentido isoladamente
3. Use categorias apropriadas para cada tipo de informação
4. O conteúdo deve ser informativo e útil para vendas
5. Retorne APENAS o array JSON, sem texto adicional
6. Se não encontrar informações relevantes, retorne um array vazio []`;

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
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: extractionPrompt,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:application/pdf;base64,${pdfBase64}`,
                  },
                },
              ],
            },
          ],
          temperature: 0.3,
          max_tokens: 4000,
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error("Erro ao processar PDF com IA");
    }

    const aiData = await aiResponse.json();
    const responseContent = aiData.choices?.[0]?.message?.content || "";

    console.log("[process-knowledge-pdf] AI response length:", responseContent.length);

    // Parse JSON response
    let extractedEntries: ExtractedEntry[] = [];
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      let jsonStr = responseContent.trim();
      
      // Remove markdown code blocks if present
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.slice(0, -3);
      }
      
      jsonStr = jsonStr.trim();
      
      if (jsonStr.startsWith("[")) {
        extractedEntries = JSON.parse(jsonStr);
      } else {
        // Try to find array in the response
        const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          extractedEntries = JSON.parse(arrayMatch[0]);
        }
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.log("Raw response:", responseContent.slice(0, 500));
    }

    // Validate and clean entries
    const validCategories = ["FAQ", "Especificacao", "Financiamento", "Documentacao", "Outros"];
    const validEntries = extractedEntries
      .filter(entry => 
        entry.titulo && 
        entry.conteudo && 
        validCategories.includes(entry.categoria)
      )
      .map(entry => ({
        categoria: entry.categoria,
        titulo: entry.titulo.slice(0, 200),
        conteudo: entry.conteudo.slice(0, 2000),
        tags: Array.isArray(entry.tags) ? entry.tags.slice(0, 5) : [],
      }));

    console.log(`[process-knowledge-pdf] Extracted ${validEntries.length} valid entries`);

    // If we have an imovel_id, save entries to database
    if (imovel_id && validEntries.length > 0) {
      const entriesWithMetadata = validEntries.map((entry, idx) => ({
        imovel_id,
        categoria: entry.categoria,
        titulo: entry.titulo,
        conteudo: entry.conteudo,
        fonte_tipo: "pdf_extraido",
        fonte_arquivo_url: pdf_url,
        fonte_arquivo_nome: file_name || "uploaded.pdf",
        tags: entry.tags,
        ativo: true,
        prioridade: validEntries.length - idx, // Higher priority for earlier entries
      }));

      const { error: insertError } = await supabase
        .from("imovel_knowledge_base")
        .insert(entriesWithMetadata);

      if (insertError) {
        console.error("Error saving entries:", insertError);
        // Don't throw - still return the entries for preview
      } else {
        console.log(`[process-knowledge-pdf] Saved ${entriesWithMetadata.length} entries to database`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        entries: validEntries,
        total_extracted: validEntries.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[process-knowledge-pdf] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro ao processar PDF",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
