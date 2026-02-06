import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import { 
  htmlEncode, 
  isValidEmail, 
  isValidUUID, 
  isValidBrazilianPhone,
  sanitizeInput,
  corsHeaders, 
  errorResponse, 
  successResponse 
} from "../_shared/security.ts";
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from "../_shared/rate-limiter.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface VisitNotificationRequest {
  clienteNome: string;
  clienteEmail: string;
  clienteTelefone: string;
  opcaoData1: string;
  opcaoData2: string;
  observacoes: string | null;
  imovelTitulo: string;
  imovelEndereco: string;
  imobiliariaId: string | null;
  construtoraId: string;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatWhatsAppMessage(
  clienteNome: string,
  clienteTelefone: string,
  imovelTitulo: string,
  imovelEndereco: string,
  data1: string,
  data2: string,
  origem: string | null
): string {
  return `🏠 *Nova Solicitação de Visita*

*Cliente:* ${clienteNome}
*Telefone:* ${clienteTelefone}

*Imóvel:* ${imovelTitulo}
*Endereço:* ${imovelEndereco}

*Datas Solicitadas:*
📅 Opção 1: ${data1}
📅 Opção 2: ${data2}
${origem ? `\n*Via:* ${origem}` : ""}

_Acesse o painel para confirmar a visita._`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const clientId = getClientIdentifier(req);
    const rateLimitResult = await checkRateLimit(supabase, clientId, "send-visit-notification");
    
    if (!rateLimitResult.allowed) {
      console.log(`[send-visit-notification] Rate limit exceeded for ${clientId}`);
      return rateLimitResponse(rateLimitResult.resetAt);
    }

    const data: VisitNotificationRequest = await req.json();

    // ===== INPUT VALIDATION =====
    
    // Validate required fields
    if (!data.clienteNome || !data.clienteEmail || !data.clienteTelefone || 
        !data.opcaoData1 || !data.opcaoData2 || !data.imovelTitulo || !data.construtoraId) {
      return errorResponse("Campos obrigatórios não fornecidos", 400);
    }

    // Validate UUID formats
    if (!isValidUUID(data.construtoraId)) {
      return errorResponse("ID da construtora inválido", 400);
    }
    if (data.imobiliariaId && !isValidUUID(data.imobiliariaId)) {
      return errorResponse("ID da imobiliária inválido", 400);
    }

    // Validate email format
    if (!isValidEmail(data.clienteEmail)) {
      return errorResponse("E-mail do cliente inválido", 400);
    }

    // Validate phone format
    if (!isValidBrazilianPhone(data.clienteTelefone)) {
      return errorResponse("Telefone do cliente inválido", 400);
    }

    // Validate string lengths
    if (data.clienteNome.length > 100) {
      return errorResponse("Nome muito longo (máximo 100 caracteres)", 400);
    }
    if (data.imovelTitulo.length > 200) {
      return errorResponse("Título do imóvel muito longo", 400);
    }
    if (data.observacoes && data.observacoes.length > 1000) {
      return errorResponse("Observações muito longas (máximo 1000 caracteres)", 400);
    }

    // Validate date formats
    const date1 = new Date(data.opcaoData1);
    const date2 = new Date(data.opcaoData2);
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      return errorResponse("Formato de data inválido", 400);
    }

    // Sanitize inputs for HTML templates
    const safeNome = htmlEncode(data.clienteNome);
    const safeEmail = htmlEncode(data.clienteEmail);
    const safeTelefone = htmlEncode(data.clienteTelefone);
    const safeTitulo = htmlEncode(data.imovelTitulo);
    const safeEndereco = htmlEncode(data.imovelEndereco || 'Endereço não informado');
    const safeObservacoes = sanitizeInput(data.observacoes, 1000);

    // Verificar construtora (reuse supabase from rate limit check)

    // Verify construtora exists
    const { data: construtora, error: construtoraError } = await supabase
      .from("construtoras")
      .select("nome_empresa, email_contato, telefone")
      .eq("id", data.construtoraId)
      .single();

    if (construtoraError || !construtora) {
      return errorResponse("Construtora não encontrada", 404);
    }

    // Buscar dados da imobiliária (se houver)
    let imobiliaria = null;
    if (data.imobiliariaId) {
      const { data: imobData } = await supabase
        .from("imobiliarias")
        .select("nome_empresa, email_contato, telefone")
        .eq("id", data.imobiliariaId)
        .single();
      imobiliaria = imobData;
    }

    const data1Formatted = formatDate(data.opcaoData1);
    const data2Formatted = formatDate(data.opcaoData2);

    // Extrair informações do corretor (se disponível no banco)
    const corretorNome = imobiliaria?.nome_empresa || construtora?.nome_empresa || "Equipe de Vendas";
    const corretorTelefone = imobiliaria?.telefone || construtora?.telefone || "";
    const safeTelefoneCorretor = htmlEncode(corretorTelefone);

    // ===== EMAIL PARA O CLIENTE =====
    const clienteEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">✅ Sua visita foi confirmada!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; color: #333; line-height: 1.6; margin-bottom: 25px;">
              Olá <strong>${safeNome}</strong>,
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">🏠 <strong>Imóvel:</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">${safeTitulo}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">📅 <strong>Data:</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">${data1Formatted.split(' às ')[0] || data1Formatted}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">🕐 <strong>Horário:</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">${data1Formatted.includes(' às ') ? data1Formatted.split(' às ')[1] : 'A confirmar'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">📍 <strong>Endereço:</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">${safeEndereco}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">👤 <strong>Corretor:</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">${htmlEncode(corretorNome)}</td>
              </tr>
              ${corretorTelefone ? `
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">📞 <strong>Tel:</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">${safeTelefoneCorretor}</td>
              </tr>
              ` : ''}
            </table>
            
            <p style="font-size: 18px; color: #1e3a5f; text-align: center; font-weight: bold; margin: 25px 0;">
              Nos vemos lá! 🎉
            </p>
            
            ${corretorTelefone ? `
            <div style="margin-top: 25px; text-align: center;">
              <a href="https://wa.me/55${corretorTelefone.replace(/\D/g, "")}" 
                 style="display: inline-block; background: #25d366; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                📱 Falar via WhatsApp
              </a>
            </div>
            ` : ""}
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
            
            <p style="font-size: 14px; color: #888; text-align: center;">
              ${htmlEncode(corretorNome)}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // ===== EMAIL PARA A IMOBILIÁRIA =====
    const imobiliariaEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #b8860b 0%, #d4a017 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏠 Nova Solicitação de Visita!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <strong>⚡ Ação necessária:</strong> Confirmar uma das datas propostas pelo cliente.
            </div>
            
            <h3 style="color: #1e3a5f; margin-bottom: 15px;">Dados do Cliente:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Nome:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${safeNome}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>E-mail:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Telefone:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="tel:${safeTelefone}">${safeTelefone}</a></td>
              </tr>
            </table>
            
            <h3 style="color: #1e3a5f; margin-top: 25px; margin-bottom: 15px;">Imóvel:</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
              <strong>${safeTitulo}</strong><br>
              <span style="color: #666;">📍 ${safeEndereco}</span>
            </div>
            
            <h3 style="color: #1e3a5f; margin-top: 25px; margin-bottom: 15px;">Opções de Data/Horário:</h3>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="background: #d4edda; border: 1px solid #28a745; padding: 15px; border-radius: 8px;">
                <strong>📅 Opção 1:</strong><br>
                ${data1Formatted}
              </div>
              <div style="background: #d4edda; border: 1px solid #28a745; padding: 15px; border-radius: 8px;">
                <strong>📅 Opção 2:</strong><br>
                ${data2Formatted}
              </div>
            </div>
            
            ${safeObservacoes ? `
            <h3 style="color: #1e3a5f; margin-top: 25px; margin-bottom: 15px;">Observações do Cliente:</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-style: italic;">
              "${safeObservacoes}"
            </div>
            ` : ""}
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="https://wa.me/55${data.clienteTelefone.replace(/\D/g, "")}" 
                 style="display: inline-block; background: #25d366; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 10px;">
                📱 WhatsApp Cliente
              </a>
              <a href="tel:${data.clienteTelefone}" 
                 style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                📞 Ligar
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // ===== EMAIL PARA A CONSTRUTORA =====
    const construtoraEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📊 Nova Solicitação de Visita</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <strong>ℹ️ Informativo:</strong> Um cliente solicitou visita através de ${imobiliaria ? `<strong>${htmlEncode(imobiliaria.nome_empresa)}</strong>` : "acesso direto"}.
            </div>
            
            <h3 style="color: #1e3a5f;">Resumo:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Cliente:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${safeNome}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Contato:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${safeEmail} | ${safeTelefone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Imóvel:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${safeTitulo}</td>
              </tr>
              ${imobiliaria ? `
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Imobiliária:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${htmlEncode(imobiliaria.nome_empresa)}</td>
              </tr>
              ` : ""}
            </table>
            
            <h3 style="color: #1e3a5f; margin-top: 25px;">Datas Solicitadas:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li><strong>Opção 1:</strong> ${data1Formatted}</li>
              <li><strong>Opção 2:</strong> ${data2Formatted}</li>
            </ul>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="https://wa.me/55${data.clienteTelefone.replace(/\D/g, "")}" 
                 style="display: inline-block; background: #25d366; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                📱 WhatsApp Cliente
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
            
            <p style="font-size: 14px; color: #888; text-align: center;">
              Acompanhe todos os agendamentos no painel administrativo.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailPromises = [];
    const whatsappLinks: string[] = [];
    const whatsappInserts: Record<string, unknown>[] = [];

    // Helper: registrar mensagem WhatsApp na tabela
    const buildWhatsappRecord = (
      telefone: string,
      nome: string,
      mensagem: string,
      tipo: string,
      construtoraId: string,
      imobiliariaId: string | null
    ): Record<string, unknown> => ({
      telefone_destino: telefone.replace(/\D/g, "").startsWith("55") ? telefone.replace(/\D/g, "") : `55${telefone.replace(/\D/g, "")}`,
      nome_destino: nome,
      tipo_mensagem: tipo,
      conteudo: mensagem,
      modo_envio: "wa_link",
      status: "enviado",
      enviado_em: new Date().toISOString(),
      construtora_id: construtoraId,
      imobiliaria_id: imobiliariaId,
    });

    // Mensagem WhatsApp para o cliente
    const clienteWhatsappMsg = `Olá ${data.clienteNome}! 👋\n\nSua solicitação de visita ao imóvel *${data.imovelTitulo}* foi recebida com sucesso! ✅\n\n📅 Opção 1: ${data1Formatted}\n📅 Opção 2: ${data2Formatted}\n\nEntraremos em contato para confirmar a melhor data.\n\nObrigado! 🏠`;
    const clientePhoneClean = data.clienteTelefone.replace(/\D/g, "");
    const clientePhoneFull = clientePhoneClean.startsWith("55") ? clientePhoneClean : `55${clientePhoneClean}`;
    whatsappLinks.push(`https://wa.me/${clientePhoneFull}?text=${encodeURIComponent(clienteWhatsappMsg)}`);
    whatsappInserts.push(buildWhatsappRecord(data.clienteTelefone, data.clienteNome, clienteWhatsappMsg, "agendamento", data.construtoraId, data.imobiliariaId));

    // 1. Enviar email para o CLIENTE
    console.log("Enviando email para cliente:", data.clienteEmail);
    emailPromises.push(
      resend.emails.send({
        from: "Agendamento <noreply@godoyprime.com.br>",
        to: [data.clienteEmail],
        subject: `✅ Solicitação de Visita Recebida - ${data.imovelTitulo}`,
        html: clienteEmailHtml,
      }).then(result => {
        console.log("Email cliente enviado:", result);
        return result;
      }).catch(err => {
        console.error("Erro ao enviar email para cliente:", err);
        throw err;
      })
    );

    // 2. Enviar email para a IMOBILIÁRIA (se houver)
    if (imobiliaria?.email_contato) {
      console.log("Enviando email para imobiliária:", imobiliaria.email_contato);
      emailPromises.push(
        resend.emails.send({
          from: "Sistema de Visitas <noreply@godoyprime.com.br>",
          to: [imobiliaria.email_contato],
          subject: `🏠 Nova Solicitação de Visita - ${data.clienteNome}`,
          html: imobiliariaEmailHtml,
        }).then(result => {
          console.log("Email imobiliária enviado:", result);
          return result;
        }).catch(err => {
          console.error("Erro ao enviar email para imobiliária:", err);
          throw err;
        })
      );
    }

    // WhatsApp para imobiliária
    if (imobiliaria?.telefone) {
      const whatsappMsg = formatWhatsAppMessage(
        data.clienteNome,
        data.clienteTelefone,
        data.imovelTitulo,
        data.imovelEndereco,
        data1Formatted,
        data2Formatted,
        null
      );
      whatsappLinks.push(`https://wa.me/55${imobiliaria.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMsg)}`);
      whatsappInserts.push(buildWhatsappRecord(imobiliaria.telefone, imobiliaria.nome_empresa, whatsappMsg, "agendamento", data.construtoraId, data.imobiliariaId));
    }

    // 3. Enviar email para a CONSTRUTORA
    if (construtora?.email_contato) {
      console.log("Enviando email para construtora:", construtora.email_contato);
      emailPromises.push(
        resend.emails.send({
          from: "Sistema de Visitas <noreply@godoyprime.com.br>",
          to: [construtora.email_contato],
          subject: `📊 Nova Solicitação de Visita - ${data.imovelTitulo}`,
          html: construtoraEmailHtml,
        }).then(result => {
          console.log("Email construtora enviado:", result);
          return result;
        }).catch(err => {
          console.error("Erro ao enviar email para construtora:", err);
          throw err;
        })
      );
    } else {
      console.log("Enviando email para construtora (fallback):", "contato@godoyprime.com.br");
      emailPromises.push(
        resend.emails.send({
          from: "Sistema de Visitas <noreply@godoyprime.com.br>",
          to: ["contato@godoyprime.com.br"],
          subject: `📊 Nova Solicitação de Visita - ${data.imovelTitulo}`,
          html: construtoraEmailHtml,
        })
      );
    }

    // WhatsApp para construtora
    if (construtora?.telefone) {
      const whatsappMsg = formatWhatsAppMessage(
        data.clienteNome,
        data.clienteTelefone,
        data.imovelTitulo,
        data.imovelEndereco,
        data1Formatted,
        data2Formatted,
        imobiliaria?.nome_empresa || null
      );
      whatsappLinks.push(`https://wa.me/55${construtora.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMsg)}`);
      whatsappInserts.push(buildWhatsappRecord(construtora.telefone, construtora.nome_empresa, whatsappMsg, "agendamento", data.construtoraId, null));
    }

    // Registrar mensagens WhatsApp no banco
    if (whatsappInserts.length > 0) {
      try {
        await supabase.from("whatsapp_messages").insert(whatsappInserts);
        console.log(`${whatsappInserts.length} mensagens WhatsApp registradas`);
      } catch (waErr) {
        console.error("Erro ao registrar WhatsApp messages:", waErr);
      }
    }

    const results = await Promise.allSettled(emailPromises);
    
    const successCount = results.filter(r => r.status === "fulfilled").length;
    const failedCount = results.filter(r => r.status === "rejected").length;

    console.log(`Emails enviados: ${successCount}/${results.length}`);

    return successResponse({
      success: true,
      emailsSent: successCount,
      emailsFailed: failedCount,
      whatsappLinks,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Error in send-visit-notification function:", errorMessage);
    return errorResponse(errorMessage, 500);
  }
};

serve(handler);
