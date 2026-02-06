import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, successResponse, errorResponse } from "../_shared/security.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // 1. Buscar feedbacks aguardando cliente há mais de 24h sem followup
    const { data: pendingCliente, error: errCliente } = await supabase
      .from("feedbacks_visitas")
      .select(`
        id, cliente_nome, cliente_email, cliente_telefone, token_acesso_cliente,
        construtora_id, imobiliaria_id,
        imoveis(titulo)
      `)
      .eq("status", "aguardando_cliente")
      .eq("followup_enviado_cliente", false)
      .lt("created_at", twentyFourHoursAgo)
      .limit(50);

    if (errCliente) {
      console.error("Erro ao buscar feedbacks pendentes (cliente):", errCliente);
    }

    // 2. Buscar feedbacks aguardando corretor há mais de 24h sem followup
    const { data: pendingCorretor, error: errCorretor } = await supabase
      .from("feedbacks_visitas")
      .select(`
        id, corretor_nome, corretor_email, cliente_nome,
        construtora_id, imobiliaria_id,
        imoveis(titulo)
      `)
      .eq("status", "aguardando_corretor")
      .eq("followup_enviado_corretor", false)
      .lt("feedback_cliente_em", twentyFourHoursAgo)
      .limit(50);

    if (errCorretor) {
      console.error("Erro ao buscar feedbacks pendentes (corretor):", errCorretor);
    }

    let emailsSent = 0;
    let whatsappSent = 0;

    // 3. Enviar lembretes para clientes
    if (pendingCliente && pendingCliente.length > 0) {
      for (const fb of pendingCliente) {
        const imovelTitulo = (fb.imoveis as any)?.titulo || "o imóvel";
        const feedbackUrl = `https://exclusive-mansion-hub.lovable.app/feedback-visita/${fb.token_acesso_cliente}`;

        // Email de lembrete
        try {
          await resend.emails.send({
            from: "Feedback <noreply@godoyprime.com.br>",
            to: [fb.cliente_email],
            subject: `🔔 Lembrete: Avalie sua visita ao ${imovelTitulo}`,
            html: `
              <!DOCTYPE html><html><head><meta charset="utf-8"></head>
              <body style="font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #1e3a5f, #2d5a8a); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🔔 Lembrete de Avaliação</h1>
                  </div>
                  <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
                    <p>Olá <strong>${fb.cliente_nome?.split(" ")[0]}</strong>,</p>
                    <p>Notamos que você ainda não avaliou sua visita ao imóvel <strong>${imovelTitulo}</strong>.</p>
                    <p>Sua opinião leva menos de 2 minutos e é muito importante para nós! 🙏</p>
                    <div style="text-align: center; margin: 25px 0;">
                      <a href="${feedbackUrl}" style="display: inline-block; background: linear-gradient(135deg, #b8860b, #d4a017); color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold;">⭐ Avaliar Agora</a>
                    </div>
                  </div>
                </div>
              </body></html>
            `,
          });
          emailsSent++;
        } catch (emailErr) {
          console.error(`Erro ao enviar email lembrete para ${fb.cliente_email}:`, emailErr);
        }

        // WhatsApp de lembrete
        if (fb.cliente_telefone) {
          const phoneClean = fb.cliente_telefone.replace(/\D/g, "");
          const phoneFull = phoneClean.startsWith("55") ? phoneClean : `55${phoneClean}`;
          const waMsg = `Olá ${fb.cliente_nome?.split(" ")[0]}! 🔔\n\nLembrete: você ainda não avaliou sua visita ao imóvel *${imovelTitulo}*.\n\n⭐ Avalie em menos de 2 min:\n${feedbackUrl}\n\nSua opinião é muito importante! 🙏`;
          
          try {
            await supabase.from("whatsapp_messages").insert({
              telefone_destino: phoneFull,
              nome_destino: fb.cliente_nome,
              tipo_mensagem: "lembrete",
              conteudo: waMsg,
              modo_envio: "wa_link",
              status: "enviado",
              enviado_em: now.toISOString(),
              construtora_id: fb.construtora_id,
              imobiliaria_id: fb.imobiliaria_id,
            });
            whatsappSent++;
          } catch (waErr) {
            console.error("Erro ao registrar WhatsApp lembrete:", waErr);
          }
        }

        // Marcar followup enviado
        await supabase
          .from("feedbacks_visitas")
          .update({ followup_enviado_cliente: true })
          .eq("id", fb.id);
      }
    }

    // 4. Enviar lembretes para corretores
    if (pendingCorretor && pendingCorretor.length > 0) {
      for (const fb of pendingCorretor) {
        const imovelTitulo = (fb.imoveis as any)?.titulo || "o imóvel";

        if (fb.corretor_email) {
          try {
            await resend.emails.send({
              from: "Feedback <noreply@godoyprime.com.br>",
              to: [fb.corretor_email],
              subject: `🔔 Lembrete: Complete o feedback da visita - ${fb.cliente_nome}`,
              html: `
                <!DOCTYPE html><html><head><meta charset="utf-8"></head>
                <body style="font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
                  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #b8860b, #d4a017); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
                      <h1 style="color: white; margin: 0;">🔔 Feedback Pendente</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
                      <p>Olá <strong>${fb.corretor_nome || "Corretor"}</strong>,</p>
                      <p>O cliente <strong>${fb.cliente_nome}</strong> já avaliou a visita ao imóvel <strong>${imovelTitulo}</strong>.</p>
                      <p>Por favor, complete sua avaliação no painel de feedbacks para gerar o relatório final.</p>
                      <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <strong>⚡ Ação necessária:</strong> Acesse o painel e complete a qualificação do lead.
                      </div>
                    </div>
                  </div>
                </body></html>
              `,
            });
            emailsSent++;
          } catch (emailErr) {
            console.error(`Erro ao enviar email lembrete para corretor ${fb.corretor_email}:`, emailErr);
          }
        }

        // Marcar followup enviado
        await supabase
          .from("feedbacks_visitas")
          .update({ followup_enviado_corretor: true })
          .eq("id", fb.id);
      }
    }

    console.log(`Follow-up: ${emailsSent} emails, ${whatsappSent} WhatsApp, ${(pendingCliente?.length || 0) + (pendingCorretor?.length || 0)} feedbacks processados`);

    return successResponse({
      success: true,
      clientesPendentes: pendingCliente?.length || 0,
      corretoresPendentes: pendingCorretor?.length || 0,
      emailsSent,
      whatsappSent,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro em send-feedback-followup:", errorMessage);
    return errorResponse(errorMessage, 500);
  }
};

serve(handler);
