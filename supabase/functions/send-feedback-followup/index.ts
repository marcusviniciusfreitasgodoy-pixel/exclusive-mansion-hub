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

    // ========== SEGUNDO LEMBRETE (48h) ==========
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

    // 5. Buscar feedbacks aguardando cliente há mais de 48h (já recebeu 1º lembrete)
    const { data: pendingCliente48, error: errCliente48 } = await supabase
      .from("feedbacks_visitas")
      .select(`
        id, cliente_nome, cliente_email, cliente_telefone, token_acesso_cliente,
        construtora_id, imobiliaria_id,
        imoveis(titulo)
      `)
      .eq("status", "aguardando_cliente")
      .eq("followup_enviado_cliente", true)
      .eq("followup_2_enviado_cliente", false)
      .lt("created_at", fortyEightHoursAgo)
      .limit(50);

    if (errCliente48) {
      console.error("Erro ao buscar feedbacks 48h (cliente):", errCliente48);
    }

    // 6. Buscar feedbacks aguardando corretor há mais de 48h (já recebeu 1º lembrete)
    const { data: pendingCorretor48, error: errCorretor48 } = await supabase
      .from("feedbacks_visitas")
      .select(`
        id, corretor_nome, corretor_email, corretor_telefone, cliente_nome,
        construtora_id, imobiliaria_id,
        imoveis(titulo)
      `)
      .eq("status", "aguardando_corretor")
      .eq("followup_enviado_corretor", true)
      .eq("followup_2_enviado_corretor", false)
      .lt("feedback_cliente_em", fortyEightHoursAgo)
      .limit(50);

    if (errCorretor48) {
      console.error("Erro ao buscar feedbacks 48h (corretor):", errCorretor48);
    }

    // 7. Enviar 2º lembrete para clientes (tom cordial)
    if (pendingCliente48 && pendingCliente48.length > 0) {
      for (const fb of pendingCliente48) {
        const imovelTitulo = (fb.imoveis as any)?.titulo || "o imóvel";
        const feedbackUrl = `https://exclusive-mansion-hub.lovable.app/feedback-visita/${fb.token_acesso_cliente}`;

        // Email cordial
        try {
          await resend.emails.send({
            from: "Feedback <noreply@godoyprime.com.br>",
            to: [fb.cliente_email],
            subject: `💬 Sua opinião é muito importante - ${imovelTitulo}`,
            html: `
              <!DOCTYPE html><html><head><meta charset="utf-8"></head>
              <body style="font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #2d5a8a, #4a90d9); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">💬 Queremos ouvir você</h1>
                  </div>
                  <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
                    <p>Olá <strong>${fb.cliente_nome?.split(" ")[0]}</strong>,</p>
                    <p>Sabemos que a rotina é corrida, mas sua opinião sobre a visita ao <strong>${imovelTitulo}</strong> nos ajuda muito a melhorar nosso atendimento. 💙</p>
                    <p>Leva menos de 2 minutos e faz toda a diferença para nós!</p>
                    <div style="text-align: center; margin: 25px 0;">
                      <a href="${feedbackUrl}" style="display: inline-block; background: linear-gradient(135deg, #2d5a8a, #4a90d9); color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold;">⭐ Avaliar Minha Visita</a>
                    </div>
                    <p style="color: #666; font-size: 13px; text-align: center;">Agradecemos imensamente sua colaboração! 🙏</p>
                  </div>
                </div>
              </body></html>
            `,
          });
          emailsSent++;
        } catch (emailErr) {
          console.error(`Erro email 48h cliente ${fb.cliente_email}:`, emailErr);
        }

        // WhatsApp cordial
        if (fb.cliente_telefone) {
          const phoneClean = fb.cliente_telefone.replace(/\D/g, "");
          const phoneFull = phoneClean.startsWith("55") ? phoneClean : `55${phoneClean}`;
          const waMsg = `Olá ${fb.cliente_nome?.split(" ")[0]}! 💬\n\nSabemos que a rotina é corrida, mas sua opinião sobre a visita ao *${imovelTitulo}* nos ajuda muito!\n\n⭐ Leva menos de 2 min:\n${feedbackUrl}\n\nAgradecemos imensamente! 🙏`;

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
            console.error("Erro WhatsApp 48h cliente:", waErr);
          }
        }

        await supabase
          .from("feedbacks_visitas")
          .update({ followup_2_enviado_cliente: true })
          .eq("id", fb.id);
      }
    }

    // 8. Enviar 2º lembrete para corretores (tom urgente + WhatsApp)
    if (pendingCorretor48 && pendingCorretor48.length > 0) {
      for (const fb of pendingCorretor48) {
        const imovelTitulo = (fb.imoveis as any)?.titulo || "o imóvel";

        // Email urgente
        if (fb.corretor_email) {
          try {
            await resend.emails.send({
              from: "Feedback <noreply@godoyprime.com.br>",
              to: [fb.corretor_email],
              subject: `🚨 URGENTE: Feedback pendente há mais de 48h - ${fb.cliente_nome}`,
              html: `
                <!DOCTYPE html><html><head><meta charset="utf-8"></head>
                <body style="font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
                  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #c0392b, #e74c3c); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
                      <h1 style="color: white; margin: 0;">🚨 URGENTE - Feedback Pendente</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
                      <div style="background: #fdecea; border: 2px solid #e74c3c; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <strong style="color: #c0392b;">⚠️ AÇÃO URGENTE NECESSÁRIA</strong>
                        <p style="color: #c0392b; margin: 8px 0 0;">O cliente <strong>${fb.cliente_nome}</strong> já avaliou a visita ao <strong>${imovelTitulo}</strong> há mais de 48 horas e aguarda sua qualificação.</p>
                      </div>
                      <p>Olá <strong>${fb.corretor_nome || "Corretor"}</strong>,</p>
                      <p>O relatório final do feedback não pode ser gerado sem sua avaliação. Por favor, acesse o painel <strong>imediatamente</strong> e complete a qualificação do lead.</p>
                      <div style="text-align: center; margin: 25px 0;">
                        <p style="background: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 8px; font-weight: bold;">⏰ Pendente há mais de 48 horas</p>
                      </div>
                    </div>
                  </div>
                </body></html>
              `,
            });
            emailsSent++;
          } catch (emailErr) {
            console.error(`Erro email 48h corretor ${fb.corretor_email}:`, emailErr);
          }
        }

        // WhatsApp urgente para corretor
        const corretorTel = (fb as any).corretor_telefone;
        if (corretorTel) {
          const phoneClean = corretorTel.replace(/\D/g, "");
          const phoneFull = phoneClean.startsWith("55") ? phoneClean : `55${phoneClean}`;
          const waMsg = `🚨 *URGENTE* - Feedback pendente\n\nOlá ${fb.corretor_nome || "Corretor"}!\n\nO cliente *${fb.cliente_nome}* avaliou a visita ao *${imovelTitulo}* há mais de 48h e aguarda sua qualificação.\n\n⚠️ Acesse o painel e complete o feedback para gerar o relatório final.`;

          try {
            await supabase.from("whatsapp_messages").insert({
              telefone_destino: phoneFull,
              nome_destino: fb.corretor_nome,
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
            console.error("Erro WhatsApp 48h corretor:", waErr);
          }
        }

        await supabase
          .from("feedbacks_visitas")
          .update({ followup_2_enviado_corretor: true })
          .eq("id", fb.id);
      }
    }

    const totalProcessed = (pendingCliente?.length || 0) + (pendingCorretor?.length || 0) + (pendingCliente48?.length || 0) + (pendingCorretor48?.length || 0);
    console.log(`Follow-up: ${emailsSent} emails, ${whatsappSent} WhatsApp, ${totalProcessed} feedbacks processados (24h+48h)`);

    return successResponse({
      success: true,
      clientesPendentes24h: pendingCliente?.length || 0,
      corretoresPendentes24h: pendingCorretor?.length || 0,
      clientesPendentes48h: pendingCliente48?.length || 0,
      corretoresPendentes48h: pendingCorretor48?.length || 0,
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
