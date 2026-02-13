import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, errorResponse } from "../_shared/security.ts";
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from "../_shared/rate-limiter.ts";

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
    throw new Error(`Failed to fetch PDF: ${response.statusText}`);
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
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await supabaseAdmin
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
    const rateResult = await checkRateLimit(supabaseAdmin, clientId, "extract-pdf-images", {
      maxRequests: 10,
      windowSeconds: 60,
    });
    if (!rateResult.allowed) {
      return rateLimitResponse(rateResult.resetAt);
    }

    const { pdfUrl, materialKey } = await req.json();

    if (!pdfUrl) {
      return errorResponse("pdfUrl é obrigatório", 400);
    }

    // URL validation
    if (!isAllowedUrl(pdfUrl)) {
      return errorResponse("URL não permitida. Use arquivos do storage do projeto.", 400);
    }

    // Fetch with size limit
    let pdfBytes: Uint8Array;
    try {
      pdfBytes = await fetchWithSizeLimit(pdfUrl);
    } catch (e: any) {
      if (e.message === "PAYLOAD_TOO_LARGE") {
        return errorResponse("PDF excede o limite de 10MB", 413);
      }
      throw e;
    }

    const pdfBase64 = btoa(String.fromCharCode(...pdfBytes));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this PDF document and identify all the professional real estate images (renders, photos of apartments, facades, common areas, etc.). 
                
For each image found, describe:
1. A short descriptive title (in Portuguese)
2. The approximate page number where it appears
3. Whether it's a good quality professional image suitable for a real estate website

Return ONLY a JSON array with objects like:
[
  {"title": "Fachada do empreendimento", "page": 1, "isGoodQuality": true},
  {"title": "Sala de estar integrada", "page": 3, "isGoodQuality": true}
]

If no suitable images are found, return an empty array: []`,
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
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";

    let extractedImages: Array<{ title: string; page: number; isGoodQuality: boolean }> = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        extractedImages = JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error("Failed to parse AI response:", content);
      extractedImages = [];
    }

    const goodImages = extractedImages.filter((img) => img.isGoodQuality);

    return new Response(
      JSON.stringify({
        success: true,
        totalImagesFound: extractedImages.length,
        goodQualityImages: goodImages.length,
        images: goodImages,
        materialKey,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error extracting images:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to extract images from PDF",
        success: false,
        images: [],
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
