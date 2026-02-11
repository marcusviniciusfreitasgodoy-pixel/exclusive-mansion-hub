import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ConfirmationRequest {
  feedback_id: string;
  incluir_proposta: boolean;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { feedback_id, incluir_proposta }: ConfirmationRequest = await req.json();

    if (!feedback_id) {
      return new Response(JSON.stringify({ error: "feedback_id obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch feedback with related data
    const { data: fb, error: fbErr } = await supabase
      .from("feedbacks_visitas")
      .select(`
        id, cliente_nome, cliente_email, cliente_telefone,
        corretor_nome, corretor_email,
        construtora_id, imobiliaria_id, imovel_id, interesse_compra,
        imoveis(titulo, endereco, bairro, cidade),
        construtoras(nome_empresa, email_contato, telefone),
        imobiliarias(nome_empresa, email_contato, telefone)
      `)
      .eq("id", feedback_id)
      .single();

    if (fbErr || !fb) {
      console.error("Feedback não encontrado:", fbErr);
      return new Response(JSON.stringify({ error: "Feedback não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imovel = fb.imoveis as any;
    const construtora = fb.construtoras as any;
    const imobiliaria = fb.imobiliarias as any;
    const imovelTitulo = imovel?.titulo || "o imóvel";
    const imovelEndereco = [imovel?.endereco, imovel?.bairro, imovel?.cidade].filter(Boolean).join(", ");
    const primeiroNome = fb.cliente_nome?.split(" ")[0] || "Cliente";
    const propostaTxt = incluir_proposta ? " e sua proposta de compra foi registrada" : "";

    let emailsSent = 0;
    let whatsappLogged = 0;

    // ── 1. E-mail de confirmação para o CLIENTE ──
    if (fb.cliente_email) {
      try {
        await resend.emails.send({
          from: "Feedback <noreply@godoyprime.com.br>",
          to: [fb.cliente_email],
          subject: `✅ Feedback recebido — ${imovelTitulo}`,
          html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:'Segoe UI',sans-serif;margin:0;padding:0;background:#f5f5f5;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#1e3a5f,#2d5a8a);border-radius:12px 12px 0 0;padding:30px;text-align:center;">
      <h1 style="color:white;margin:0;">✅ Feedback Recebido</h1>
    </div>
    <div style="background:white;padding:30px;border-radius:0 0 12px 12px;">
      <p>Olá <strong>${primeiroNome}</strong>,</p>
      <p>Seu feedback sobre a visita ao imóvel <strong>${imovelTitulo}</strong> foi registrado com sucesso${propostaTxt}.</p>
      ${imovelEndereco ? `<p style="color:#666;">📍 ${imovelEndereco}</p>` : ""}
      ${incluir_proposta ? `
      <div style="background:#e8f5e9;border:1px solid #4caf50;padding:15px;border-radius:8px;margin:20px 0;">
        <strong>📋 Proposta de compra registrada!</strong><br>
        <span style="font-size:14px;">Você receberá um retorno em breve sobre sua proposta.</span>
      </div>` : ""}
      <p>O corretor responsável será notificado para dar continuidade ao atendimento.</p>
      <p style="color:#999;font-size:12px;margin-top:30px;">Este é um e-mail automático. Caso tenha dúvidas, entre em contato com seu corretor.</p>
    </div>
  </div>
</body></html>`,
        });
        emailsSent++;
      } catch (e) {
        console.error("Erro email cliente:", e);
      }
    }

    // ── 2. E-mail para CORRETOR / IMOBILIÁRIA ──
    const corretorEmail = fb.corretor_email || imobiliaria?.email_contato;
    if (corretorEmail) {
      const destinatarioNome = fb.corretor_nome || imobiliaria?.nome_empresa || "Corretor";
      try {
        await resend.emails.send({
          from: "Feedback <noreply@godoyprime.com.br>",
          to: [corretorEmail],
          subject: `📩 Novo feedback recebido — ${fb.cliente_nome} — ${imovelTitulo}`,
          html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:'Segoe UI',sans-serif;margin:0;padding:0;background:#f5f5f5;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#b8860b,#d4a017);border-radius:12px 12px 0 0;padding:30px;text-align:center;">
      <h1 style="color:white;margin:0;">📩 Feedback Recebido</h1>
    </div>
    <div style="background:white;padding:30px;border-radius:0 0 12px 12px;">
      <p>Olá <strong>${destinatarioNome}</strong>,</p>
      <p>O cliente <strong>${fb.cliente_nome}</strong> enviou o feedback da visita ao imóvel <strong>${imovelTitulo}</strong>.</p>
      <p><strong>Nível de interesse:</strong> ${fb.interesse_compra || "Não informado"}</p>
      ${incluir_proposta ? `
      <div style="background:#fff3cd;border:1px solid #ffc107;padding:15px;border-radius:8px;margin:20px 0;">
        <strong>🔥 PROPOSTA DE COMPRA INCLUÍDA!</strong><br>
        <span style="font-size:14px;">O cliente manifestou interesse formal em adquirir o imóvel. Verifique os detalhes no painel.</span>
      </div>` : ""}
      <div style="background:#e3f2fd;border:1px solid #2196f3;padding:15px;border-radius:8px;margin:20px 0;">
        <strong>⚡ Ação necessária:</strong> Acesse o painel de feedbacks para completar sua avaliação e gerar o relatório.
      </div>
      ${fb.cliente_telefone ? `<p>📱 WhatsApp do cliente: <a href="https://wa.me/55${fb.cliente_telefone.replace(/\\D/g, "")}">${fb.cliente_telefone}</a></p>` : ""}
    </div>
  </div>
</body></html>`,
        });
        emailsSent++;
      } catch (e) {
        console.error("Erro email corretor:", e);
      }
    }

    // ── 3. E-mail para CONSTRUTORA ──
    if (construtora?.email_contato) {
      try {
        await resend.emails.send({
          from: "Feedback <noreply@godoyprime.com.br>",
          to: [construtora.email_contato],
          subject: `📊 Feedback de visita — ${fb.cliente_nome} — ${imovelTitulo}`,
          html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:'Segoe UI',sans-serif;margin:0;padding:0;background:#f5f5f5;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#1e3a5f,#2d5a8a);border-radius:12px 12px 0 0;padding:30px;text-align:center;">
      <h1 style="color:white;margin:0;">📊 Feedback de Visita</h1>
    </div>
    <div style="background:white;padding:30px;border-radius:0 0 12px 12px;">
      <p>Olá <strong>${construtora.nome_empresa}</strong>,</p>
      <p>O cliente <strong>${fb.cliente_nome}</strong> enviou feedback sobre <strong>${imovelTitulo}</strong>.</p>
      <p><strong>Interesse:</strong> ${fb.interesse_compra || "N/A"} ${incluir_proposta ? "| <strong>📋 Com proposta de compra</strong>" : ""}</p>
      ${fb.corretor_nome ? `<p><strong>Corretor:</strong> ${fb.corretor_nome}</p>` : ""}
      ${imobiliaria?.nome_empresa ? `<p><strong>Imobiliária:</strong> ${imobiliaria.nome_empresa}</p>` : ""}
    </div>
  </div>
</body></html>`,
        });
        emailsSent++;
      } catch (e) {
        console.error("Erro email construtora:", e);
      }
    }

    // ── 4. WhatsApp confirmação para CLIENTE ──
    if (fb.cliente_telefone) {
      const phoneClean = fb.cliente_telefone.replace(/\D/g, "");
      const phoneFull = phoneClean.startsWith("55") ? phoneClean : `55${phoneClean}`;
      const waMsg = incluir_proposta
        ? `✅ Olá ${primeiroNome}! Seu feedback e proposta de compra sobre o imóvel *${imovelTitulo}* foram registrados com sucesso. Você receberá um retorno em breve!`
        : `✅ Olá ${primeiroNome}! Seu feedback sobre a visita ao imóvel *${imovelTitulo}* foi recebido. Obrigado pela sua avaliação! 🙏`;

      try {
        await supabase.from("whatsapp_messages").insert({
          telefone_destino: phoneFull,
          nome_destino: fb.cliente_nome,
          tipo_mensagem: "followup",
          conteudo: waMsg,
          modo_envio: "wa_link",
          status: "enviado",
          enviado_em: new Date().toISOString(),
          construtora_id: fb.construtora_id,
          imobiliaria_id: fb.imobiliaria_id,
        });
        whatsappLogged++;
      } catch (e) {
        console.error("Erro WhatsApp cliente:", e);
      }
    }

    // ── 5. WhatsApp notificação para CORRETOR / IMOBILIÁRIA ──
    const corretorPhone = imobiliaria?.telefone || construtora?.telefone;
    if (corretorPhone) {
      const phoneClean = corretorPhone.replace(/\D/g, "");
      const phoneFull = phoneClean.startsWith("55") ? phoneClean : `55${phoneClean}`;
      const waMsg = incluir_proposta
        ? `📩 *Feedback + Proposta recebidos!*\n\nCliente: ${fb.cliente_nome}\nImóvel: ${imovelTitulo}\nInteresse: ${fb.interesse_compra || "N/A"}\n\n🔥 *O cliente incluiu uma proposta de compra!* Verifique no painel.`
        : `📩 *Novo feedback recebido!*\n\nCliente: ${fb.cliente_nome}\nImóvel: ${imovelTitulo}\nInteresse: ${fb.interesse_compra || "N/A"}\n\nAcesse o painel para completar a avaliação.`;

      try {
        await supabase.from("whatsapp_messages").insert({
          telefone_destino: phoneFull,
          nome_destino: fb.corretor_nome || imobiliaria?.nome_empresa || "Corretor",
          tipo_mensagem: "followup",
          conteudo: waMsg,
          modo_envio: "wa_link",
          status: "enviado",
          enviado_em: new Date().toISOString(),
          construtora_id: fb.construtora_id,
          imobiliaria_id: fb.imobiliaria_id,
        });
        whatsappLogged++;
      } catch (e) {
        console.error("Erro WhatsApp corretor:", e);
      }
    }

    console.log(`Confirmação feedback ${feedback_id}: ${emailsSent} emails, ${whatsappLogged} WhatsApp`);

    return new Response(
      JSON.stringify({ success: true, emailsSent, whatsappLogged }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro em send-feedback-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
