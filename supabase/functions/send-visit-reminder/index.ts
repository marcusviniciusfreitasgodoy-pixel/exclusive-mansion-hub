import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { 
  htmlEncode, 
  corsHeaders, 
  errorResponse, 
  successResponse 
} from "../_shared/security.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

function formatShortDate(isoDate: string): { data: string; horario: string } {
  const date = new Date(isoDate);
  const data = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const horario = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { data, horario };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔔 Iniciando verificação de lembretes de visita...");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calcular janela de 24 horas
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    console.log(`Buscando visitas entre ${in24Hours.toISOString()} e ${in25Hours.toISOString()}`);

    // Buscar visitas confirmadas que acontecerão nas próximas 24-25 horas
    // e que ainda não receberam lembrete
    const { data: visitas, error: visitasError } = await supabase
      .from("agendamentos_visitas")
      .select(`
        id,
        cliente_nome,
        cliente_email,
        cliente_telefone,
        data_confirmada,
        corretor_nome,
        corretor_email,
        imovel_id,
        imobiliaria_id,
        construtora_id,
        lembrete_24h_enviado,
        imoveis:imovel_id (
          titulo,
          endereco,
          bairro,
          cidade
        ),
        imobiliarias:imobiliaria_id (
          nome_empresa,
          telefone
        ),
        construtoras:construtora_id (
          nome_empresa,
          telefone
        )
      `)
      .eq("status", "confirmado")
      .eq("lembrete_24h_enviado", false)
      .gte("data_confirmada", in24Hours.toISOString())
      .lte("data_confirmada", in25Hours.toISOString());

    if (visitasError) {
      console.error("Erro ao buscar visitas:", visitasError);
      return errorResponse(`Erro ao buscar visitas: ${visitasError.message}`, 500);
    }

    if (!visitas || visitas.length === 0) {
      console.log("✅ Nenhuma visita encontrada para lembrete neste momento.");
      return successResponse({ message: "Nenhum lembrete a enviar", count: 0 });
    }

    console.log(`📬 Encontradas ${visitas.length} visita(s) para enviar lembrete.`);

    const results = [];

    for (const visita of visitas) {
      try {
        // Type assertion para os dados relacionados
        const imovel = visita.imoveis as unknown as { 
          titulo: string; 
          endereco: string; 
          bairro: string; 
          cidade: string; 
        } | null;
        
        const imobiliaria = visita.imobiliarias as unknown as { 
          nome_empresa: string; 
          telefone: string; 
        } | null;
        
        const construtora = visita.construtoras as unknown as { 
          nome_empresa: string; 
          telefone: string; 
        } | null;

        if (!imovel) {
          console.error(`Imóvel não encontrado para visita ${visita.id}`);
          continue;
        }

        const { data: dataFormatada, horario } = formatShortDate(visita.data_confirmada!);
        
        // Sanitizar dados para HTML
        const safeNome = htmlEncode(visita.cliente_nome);
        const safeTitulo = htmlEncode(imovel.titulo);
        const safeEndereco = htmlEncode(
          [imovel.endereco, imovel.bairro, imovel.cidade]
            .filter(Boolean)
            .join(", ") || "Endereço a confirmar"
        );
        const safeCorretor = htmlEncode(
          visita.corretor_nome || imobiliaria?.nome_empresa || construtora?.nome_empresa || "Equipe de Vendas"
        );
        const telefoneCorretor = imobiliaria?.telefone || construtora?.telefone || "";
        const safeTelefoneCorretor = htmlEncode(telefoneCorretor);

        // Template de e-mail de lembrete
        const reminderEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Lembrete: Sua visita é amanhã!</h1>
              </div>
              
              <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="font-size: 18px; color: #333; line-height: 1.6; margin-bottom: 25px;">
                  Olá <strong>${safeNome}</strong>,
                </p>
                
                <p style="font-size: 16px; color: #666; line-height: 1.6; margin-bottom: 20px;">
                  Estamos ansiosos para recebê-lo(a)! Sua visita ao imóvel está marcada para <strong>amanhã</strong>.
                </p>
                
                <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 25px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; color: #92400e;">🏠 <strong>Imóvel:</strong></td>
                      <td style="padding: 10px 0; color: #78350f; text-align: right;">${safeTitulo}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #92400e;">📅 <strong>Data:</strong></td>
                      <td style="padding: 10px 0; color: #78350f; text-align: right;">${htmlEncode(dataFormatada)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #92400e;">🕐 <strong>Horário:</strong></td>
                      <td style="padding: 10px 0; color: #78350f; text-align: right;">${horario}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #92400e;">📍 <strong>Endereço:</strong></td>
                      <td style="padding: 10px 0; color: #78350f; text-align: right;">${safeEndereco}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #92400e;">👤 <strong>Corretor:</strong></td>
                      <td style="padding: 10px 0; color: #78350f; text-align: right;">${safeCorretor}</td>
                    </tr>
                    ${telefoneCorretor ? `
                    <tr>
                      <td style="padding: 10px 0; color: #92400e;">📞 <strong>Contato:</strong></td>
                      <td style="padding: 10px 0; color: #78350f; text-align: right;">${safeTelefoneCorretor}</td>
                    </tr>
                    ` : ''}
                  </table>
                </div>
                
                <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #166534; font-size: 14px;">
                    💡 <strong>Dica:</strong> Lembre-se de levar um documento com foto para acesso ao imóvel.
                  </p>
                </div>
                
                ${telefoneCorretor ? `
                <div style="margin-top: 25px; text-align: center;">
                  <p style="color: #666; margin-bottom: 15px;">Precisa reagendar ou tem dúvidas?</p>
                  <a href="https://wa.me/55${telefoneCorretor.replace(/\D/g, "")}" 
                     style="display: inline-block; background: #25d366; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    📱 Falar com ${safeCorretor}
                  </a>
                </div>
                ` : ""}
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="font-size: 14px; color: #888; text-align: center; margin: 0;">
                  Nos vemos amanhã! 🎉
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Enviar e-mail de lembrete
        console.log(`📧 Enviando lembrete para ${visita.cliente_email}...`);
        
        const emailResult = await resend.emails.send({
          from: "Lembrete de Visita <noreply@godoyprime.com.br>",
          to: [visita.cliente_email],
          subject: `⏰ Lembrete: Sua visita ao ${imovel.titulo} é amanhã!`,
          html: reminderEmailHtml,
        });

        console.log(`✅ Lembrete enviado para ${visita.cliente_email}:`, emailResult);

        // Marcar lembrete como enviado
        const { error: updateError } = await supabase
          .from("agendamentos_visitas")
          .update({ lembrete_24h_enviado: true })
          .eq("id", visita.id);

        if (updateError) {
          console.error(`Erro ao marcar lembrete como enviado para visita ${visita.id}:`, updateError);
        } else {
          console.log(`✅ Visita ${visita.id} marcada com lembrete_24h_enviado = true`);
        }

        results.push({
          visitaId: visita.id,
          clienteEmail: visita.cliente_email,
          status: "enviado",
        });

      } catch (emailError) {
        console.error(`Erro ao enviar lembrete para visita ${visita.id}:`, emailError);
        results.push({
          visitaId: visita.id,
          clienteEmail: visita.cliente_email,
          status: "erro",
          error: emailError instanceof Error ? emailError.message : "Erro desconhecido",
        });
      }
    }

    console.log(`📊 Resumo: ${results.filter(r => r.status === "enviado").length}/${results.length} lembretes enviados com sucesso.`);

    return successResponse({ 
      message: `${results.filter(r => r.status === "enviado").length} lembrete(s) enviado(s)`,
      count: results.length,
      results 
    });

  } catch (error) {
    console.error("Erro geral na função de lembretes:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Erro desconhecido",
      500
    );
  }
};

serve(handler);
