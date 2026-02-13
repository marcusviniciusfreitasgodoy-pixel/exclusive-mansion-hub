import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, errorResponse, isValidUUID } from "../_shared/security.ts";
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from "../_shared/rate-limiter.ts";

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const allowed = [
      `${new URL(supabaseUrl).hostname}`,
      "supabase.co",
      "supabase.in",
    ];
    return allowed.some(d => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

async function fetchWithSizeLimit(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Não foi possível baixar o PDF");
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_PDF_SIZE) {
    response.body?.cancel();
    throw new Error("PAYLOAD_TOO_LARGE");
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const chunks: Uint8Array[] = [];
  let totalSize = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalSize += value.byteLength;
    if (totalSize > MAX_PDF_SIZE) {
      reader.cancel();
      throw new Error("PAYLOAD_TOO_LARGE");
    }
    chunks.push(value);
  }

  const result = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

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
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return errorResponse("Não autorizado", 401);
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return errorResponse("Token inválido", 401);
    }
    const userId = claimsData.claims.sub as string;

    // Role check
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "construtora")
      .maybeSingle();

    if (!roleData) {
      return errorResponse("Acesso restrito a construtoras", 403);
    }

    // Rate limiting
    const clientId = getClientIdentifier(req);
    const rateResult = await checkRateLimit(supabase, clientId, "process-knowledge-pdf", {
      maxRequests: 5,
      windowSeconds: 60,
    });
    if (!rateResult.allowed) {
      return rateLimitResponse(rateResult.resetAt);
    }

    const { pdf_url, imovel_id, file_name } = await req.json();

    if (!pdf_url) {
      return errorResponse("PDF URL é obrigatório", 400);
    }

    // URL validation
    if (!isAllowedUrl(pdf_url)) {
      return errorResponse("URL não permitida. Use arquivos do storage do projeto.", 400);
    }

    // Validate imovel_id if provided
    if (imovel_id && !isValidUUID(imovel_id)) {
      return errorResponse("imovel_id inválido", 400);
    }

    console.log(`[process-knowledge-pdf] Processing PDF: ${file_name || pdf_url}`);

    // Fetch with size limit
    let pdfBytes: Uint8Array;
    try {
      pdfBytes = await fetchWithSizeLimit(pdf_url);
    } catch (e: any) {
      if (e.message === "PAYLOAD_TOO_LARGE") {
        return errorResponse("PDF excede o limite de 10MB", 413);
      }
      throw e;
    }

    const pdfBase64 = bytesToBase64(pdfBytes);

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
                { type: "text", text: extractionPrompt },
                {
                  type: "image_url",
                  image_url: { url: `data:application/pdf;base64,${pdfBase64}` },
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

    let extractedEntries: ExtractedEntry[] = [];
    try {
      let jsonStr = responseContent.trim();
      if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
      else if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);
      jsonStr = jsonStr.trim();

      if (jsonStr.startsWith("[")) {
        extractedEntries = JSON.parse(jsonStr);
      } else {
        const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
        if (arrayMatch) extractedEntries = JSON.parse(arrayMatch[0]);
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.log("Raw response:", responseContent.slice(0, 500));
    }

    const validCategories = ["FAQ", "Especificacao", "Financiamento", "Documentacao", "Outros"];
    const validEntries = extractedEntries
      .filter(entry => entry.titulo && entry.conteudo && validCategories.includes(entry.categoria))
      .map(entry => ({
        categoria: entry.categoria,
        titulo: entry.titulo.slice(0, 200),
        conteudo: entry.conteudo.slice(0, 2000),
        tags: Array.isArray(entry.tags) ? entry.tags.slice(0, 5) : [],
      }));

    console.log(`[process-knowledge-pdf] Extracted ${validEntries.length} valid entries`);

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
        prioridade: validEntries.length - idx,
      }));

      const { error: insertError } = await supabase
        .from("imovel_knowledge_base")
        .insert(entriesWithMetadata);

      if (insertError) {
        console.error("Error saving entries:", insertError);
      } else {
        console.log(`[process-knowledge-pdf] Saved ${entriesWithMetadata.length} entries`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        entries: validEntries,
        total_extracted: validEntries.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[process-knowledge-pdf] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro ao processar PDF",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
