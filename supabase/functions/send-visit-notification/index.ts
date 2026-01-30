import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: VisitNotificationRequest = await req.json();

    const {
      clienteNome,
      clienteEmail,
      clienteTelefone,
      opcaoData1,
      opcaoData2,
      observacoes,
      imovelTitulo,
      imovelEndereco,
      imobiliariaId,
      construtoraId,
    } = data;

    // Criar cliente Supabase para buscar dados
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar dados da construtora
    const { data: construtora } = await supabase
      .from("construtoras")
      .select("nome_empresa")
      .eq("id", construtoraId)
      .single();

    // Buscar dados da imobiliária (se houver)
    let imobiliaria = null;
    if (imobiliariaId) {
      const { data: imobData } = await supabase
        .from("imobiliarias")
        .select("nome_empresa, email_contato, telefone")
        .eq("id", imobiliariaId)
        .single();
      imobiliaria = imobData;
    }

    const data1Formatted = formatDate(opcaoData1);
    const data2Formatted = formatDate(opcaoData2);

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
            <h1 style="color: white; margin: 0; font-size: 24px;">📅 Solicitação Recebida!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Olá <strong>${clienteNome}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Recebemos sua solicitação de visita para o imóvel:
            </p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #b8860b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h3 style="margin: 0 0 10px 0; color: #1e3a5f;">${imovelTitulo}</h3>
              <p style="margin: 0; color: #666;">📍 ${imovelEndereco}</p>
            </div>
            
            <h3 style="color: #1e3a5f; margin-top: 25px;">Suas opções de horário:</h3>
            
            <div style="display: flex; flex-direction: column; gap: 10px; margin: 15px 0;">
              <div style="background: #e8f4fd; padding: 12px 15px; border-radius: 8px;">
                <strong>Opção 1:</strong> ${data1Formatted}
              </div>
              <div style="background: #e8f4fd; padding: 12px 15px; border-radius: 8px;">
                <strong>Opção 2:</strong> ${data2Formatted}
              </div>
            </div>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 25px;">
              Nossa equipe analisará sua disponibilidade e entrará em contato em breve 
              para confirmar a melhor data.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
            
            <p style="font-size: 14px; color: #888; text-align: center;">
              ${imobiliaria ? imobiliaria.nome_empresa : construtora?.nome_empresa || "Equipe de Vendas"}
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
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${clienteNome}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>E-mail:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${clienteEmail}">${clienteEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Telefone:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="tel:${clienteTelefone}">${clienteTelefone}</a></td>
              </tr>
            </table>
            
            <h3 style="color: #1e3a5f; margin-top: 25px; margin-bottom: 15px;">Imóvel:</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
              <strong>${imovelTitulo}</strong><br>
              <span style="color: #666;">📍 ${imovelEndereco}</span>
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
            
            ${observacoes ? `
            <h3 style="color: #1e3a5f; margin-top: 25px; margin-bottom: 15px;">Observações do Cliente:</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-style: italic;">
              "${observacoes}"
            </div>
            ` : ""}
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="https://wa.me/55${clienteTelefone.replace(/\D/g, "")}" 
                 style="display: inline-block; background: #25d366; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 10px;">
                📱 WhatsApp
              </a>
              <a href="tel:${clienteTelefone}" 
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
              <strong>ℹ️ Informativo:</strong> Um cliente solicitou visita através de ${imobiliaria ? `<strong>${imobiliaria.nome_empresa}</strong>` : "acesso direto"}.
            </div>
            
            <h3 style="color: #1e3a5f;">Resumo:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Cliente:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${clienteNome}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Contato:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${clienteEmail} | ${clienteTelefone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Imóvel:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${imovelTitulo}</td>
              </tr>
              ${imobiliaria ? `
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Imobiliária:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${imobiliaria.nome_empresa}</td>
              </tr>
              ` : ""}
            </table>
            
            <h3 style="color: #1e3a5f; margin-top: 25px;">Datas Solicitadas:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li><strong>Opção 1:</strong> ${data1Formatted}</li>
              <li><strong>Opção 2:</strong> ${data2Formatted}</li>
            </ul>
            
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

    // Enviar para o cliente
    emailPromises.push(
      resend.emails.send({
        from: "Agendamento <noreply@godoyprime.com.br>",
        to: [clienteEmail],
        subject: `✅ Solicitação de Visita Recebida - ${imovelTitulo}`,
        html: clienteEmailHtml,
      })
    );

    // Enviar para a imobiliária (se houver)
    if (imobiliaria?.email_contato) {
      emailPromises.push(
        resend.emails.send({
          from: "Sistema de Visitas <noreply@godoyprime.com.br>",
          to: [imobiliaria.email_contato],
          subject: `🏠 Nova Solicitação de Visita - ${clienteNome}`,
          html: imobiliariaEmailHtml,
        })
      );
    }

    // Enviar para a construtora (email fixo por enquanto - idealmente buscar do banco)
    emailPromises.push(
      resend.emails.send({
        from: "Sistema de Visitas <noreply@godoyprime.com.br>",
        to: ["contato@godoyprime.com.br"],
        subject: `📊 Nova Solicitação de Visita - ${imovelTitulo}`,
        html: construtoraEmailHtml,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    
    const successCount = results.filter(r => r.status === "fulfilled").length;
    console.log(`Emails enviados: ${successCount}/${results.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent: successCount,
        totalEmails: results.length 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Erro em send-visit-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
