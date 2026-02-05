import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import { 
  htmlEncode, 
  isValidEmail, 
  isValidUUID,
  corsHeaders, 
  errorResponse, 
  successResponse 
} from "../_shared/security.ts";
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from "../_shared/rate-limiter.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface FeedbackRequestData {
  feedbackId: string;
  token: string;
  clienteNome: string;
  clienteEmail: string;
  imovelTitulo: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const clientId = getClientIdentifier(req);
    const rateLimitResult = await checkRateLimit(supabase, clientId, "send-feedback-request");
    
    if (!rateLimitResult.allowed) {
      console.log(`[send-feedback-request] Rate limit exceeded for ${clientId}`);
      return rateLimitResponse(rateLimitResult.resetAt);
    }

    const data: FeedbackRequestData = await req.json();
    const { feedbackId, token, clienteNome, clienteEmail, imovelTitulo } = data;

    // ===== INPUT VALIDATION =====
    
    // Validate required fields
    if (!feedbackId || !token || !clienteNome || !clienteEmail || !imovelTitulo) {
      return errorResponse("Campos obrigatórios não fornecidos", 400);
    }

    // Validate UUID formats
    if (!isValidUUID(feedbackId)) {
      return errorResponse("ID do feedback inválido", 400);
    }
    if (!isValidUUID(token)) {
      return errorResponse("Token inválido", 400);
    }

    // Validate email format
    if (!isValidEmail(clienteEmail)) {
      return errorResponse("E-mail do cliente inválido", 400);
    }

    // Validate string lengths
    if (clienteNome.length > 100) {
      return errorResponse("Nome muito longo", 400);
    }
    if (imovelTitulo.length > 200) {
      return errorResponse("Título do imóvel muito longo", 400);
    }

    // Sanitize inputs for HTML templates
    const safeNome = htmlEncode(clienteNome);
    const safeTitulo = htmlEncode(imovelTitulo);

    // Verify the feedback exists and has the correct token (reuse supabase from rate limit check)

    // Verify the feedback exists and has the correct token
    const { data: feedback, error: feedbackError } = await supabase
      .from("feedbacks_visitas")
      .select("id, token_acesso_cliente")
      .eq("id", feedbackId)
      .eq("token_acesso_cliente", token)
      .single();

    if (feedbackError || !feedback) {
      console.error("Feedback not found or token mismatch:", feedbackId);
      return errorResponse("Feedback não encontrado ou token inválido", 404);
    }

    // Criar link de feedback
    const feedbackUrl = `${req.headers.get("origin") || "https://id-preview--6c4a0233-f323-4218-9d12-61d1660066ac.lovable.app"}/feedback-visita/${token}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📝 Sua Opinião é Importante!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Olá <strong>${safeNome}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Obrigado por visitar o imóvel <strong>${safeTitulo}</strong>!
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Gostaríamos muito de saber sua opinião sobre a visita. Seu feedback nos ajuda a 
              melhorar cada vez mais nosso atendimento e a encontrar o imóvel perfeito para você.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${feedbackUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #b8860b 0%, #d4a017 100%); color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(184, 134, 11, 0.3);">
                ⭐ Avaliar Visita
              </a>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>💡 Dica:</strong> O formulário leva menos de 2 minutos para preencher 
                e você ajuda outros clientes com sua experiência!
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
            
            <p style="font-size: 12px; color: #888; text-align: center;">
              Este link é exclusivo para você e expira em 7 dias.<br>
              Se não conseguir clicar no botão, copie e cole este link no navegador:<br>
              <a href="${feedbackUrl}" style="color: #1e3a5f;">${feedbackUrl}</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Feedback <noreply@godoyprime.com.br>",
      to: [clienteEmail],
      subject: `⭐ Como foi sua visita ao ${imovelTitulo}?`,
      html: emailHtml,
    });

    console.log("Email de feedback enviado:", emailResponse);

    return successResponse({ 
      success: true, 
      emailId: emailResponse.data?.id 
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro em send-feedback-request:", errorMessage);
    return errorResponse(errorMessage, 500);
  }
};

serve(handler);
