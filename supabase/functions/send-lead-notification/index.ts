import { Resend } from "resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LeadNotificationRequest {
  leadId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyValue: number | null;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  leadMessage: string;
  imobiliariaEmail: string | null;
  imobiliariaNome: string;
  construtoraId: string;
}

const formatCurrency = (value: number | null): string => {
  if (!value) return "A consultar";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: LeadNotificationRequest = await req.json();

    // Validate required fields
    if (!data.leadId || !data.propertyTitle || !data.leadName || !data.leadEmail) {
      throw new Error("Campos obrigatórios não fornecidos");
    }

    // Create Supabase client to get construtora data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get construtora data (including email and phone)
    const { data: construtora, error: construtoraError } = await supabase
      .from("construtoras")
      .select("nome_empresa, email_contato, telefone, user_id")
      .eq("id", data.construtoraId)
      .single();

    if (construtoraError) {
      console.error("Error fetching construtora:", construtoraError);
    }

    // Get imobiliaria phone if available
    let imobiliariaPhone: string | null = null;
    if (data.imobiliariaEmail) {
      const { data: imobData } = await supabase
        .from("imobiliarias")
        .select("telefone")
        .eq("email_contato", data.imobiliariaEmail)
        .single();
      imobiliariaPhone = imobData?.telefone || null;
    }

    // ===== EMAIL PARA O CLIENTE (Confirmação) =====
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
      <h1 style="color: white; margin: 0; font-size: 24px;">✅ Mensagem Recebida!</h1>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Olá <strong>${data.leadName}</strong>,
      </p>
      
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Sua mensagem foi recebida com sucesso! Nossa equipe entrará em contato em breve.
      </p>
      
      <div style="background: #f8f9fa; border-left: 4px solid #b8860b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <h3 style="margin: 0 0 10px 0; color: #1e3a5f;">${data.propertyTitle}</h3>
        <p style="margin: 0; color: #666;">📍 ${data.propertyAddress || "Endereço não informado"}</p>
        <p style="margin: 10px 0 0; font-size: 18px; font-weight: bold; color: #b8860b;">${formatCurrency(data.propertyValue)}</p>
      </div>
      
      ${data.leadMessage ? `
      <div style="background: #f0f7ff; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #1e3a5f; font-size: 14px;">💬 Sua mensagem:</h4>
        <p style="margin: 0; color: #555; font-style: italic;">"${data.leadMessage}"</p>
      </div>
      ` : ""}
      
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Enquanto isso, você também pode entrar em contato diretamente:
      </p>
      
      ${imobiliariaPhone || construtora?.telefone ? `
      <div style="margin-top: 25px; text-align: center;">
        <a href="https://wa.me/55${(imobiliariaPhone || construtora?.telefone || "").replace(/\D/g, "")}" 
           style="display: inline-block; background: #25d366; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          📱 Falar via WhatsApp
        </a>
      </div>
      ` : ""}
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
      
      <p style="font-size: 14px; color: #888; text-align: center;">
        ${data.imobiliariaNome}
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
      <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Novo Lead Recebido!</h1>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <strong>⚡ Ação recomendada:</strong> Entre em contato com o cliente o mais rápido possível!
      </div>
      
      <div style="background: #f8f9fa; border-left: 4px solid #b8860b; padding: 15px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
        <h3 style="margin: 0 0 10px 0; color: #1e3a5f;">${data.propertyTitle}</h3>
        <p style="margin: 0; color: #666;">📍 ${data.propertyAddress || "Endereço não informado"}</p>
        <p style="margin: 10px 0 0; font-size: 18px; font-weight: bold; color: #b8860b;">${formatCurrency(data.propertyValue)}</p>
      </div>

      <h3 style="color: #1e3a5f; margin-bottom: 15px;">👤 Dados do Cliente:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Nome:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.leadName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>E-mail:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${data.leadEmail}">${data.leadEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Telefone:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="tel:${data.leadPhone}">${data.leadPhone}</a></td>
        </tr>
      </table>

      ${data.leadMessage ? `
      <div style="background: #f0f7ff; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #1e3a5f; font-size: 14px;">💬 Mensagem:</h4>
        <p style="margin: 0; color: #555; font-style: italic;">"${data.leadMessage}"</p>
      </div>
      ` : ""}

      <div style="margin-top: 30px; text-align: center;">
        <a href="https://wa.me/55${data.leadPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${data.leadName}! Recebi seu contato sobre o imóvel ${data.propertyTitle}. Como posso ajudar?`)}" 
           style="display: inline-block; background: #25d366; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 10px;">
          📱 WhatsApp
        </a>
        <a href="tel:${data.leadPhone}" 
           style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          📞 Ligar
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
      
      <p style="font-size: 14px; color: #888; text-align: center;">
        Acesse seu dashboard para gerenciar todos os leads.
      </p>
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
      <h1 style="color: white; margin: 0; font-size: 24px;">📊 Novo Lead Recebido</h1>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <strong>ℹ️ Informativo:</strong> Um cliente demonstrou interesse ${data.imobiliariaNome !== "Contato via Site Principal" ? `através de <strong>${data.imobiliariaNome}</strong>` : "via site principal"}.
      </div>
      
      <h3 style="color: #1e3a5f;">Resumo:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Cliente:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.leadName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Contato:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.leadEmail} | ${data.leadPhone}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Imóvel:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.propertyTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Valor:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formatCurrency(data.propertyValue)}</td>
        </tr>
        ${data.imobiliariaNome !== "Contato via Site Principal" ? `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Via:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.imobiliariaNome}</td>
        </tr>
        ` : ""}
      </table>

      ${data.leadMessage ? `
      <div style="background: #f0f7ff; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #1e3a5f; font-size: 14px;">💬 Mensagem:</h4>
        <p style="margin: 0; color: #555; font-style: italic;">"${data.leadMessage}"</p>
      </div>
      ` : ""}

      <div style="margin-top: 30px; text-align: center;">
        <a href="https://wa.me/55${data.leadPhone.replace(/\D/g, "")}" 
           style="display: inline-block; background: #25d366; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          📱 WhatsApp Cliente
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
      
      <p style="font-size: 14px; color: #888; text-align: center;">
        Acompanhe todos os leads no painel administrativo.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const emailsSent: string[] = [];
    const errors: string[] = [];

    // 1. Enviar email para o CLIENTE (confirmação)
    console.log("Enviando email de confirmação para cliente:", data.leadEmail);
    try {
      const clienteResponse = await resend.emails.send({
        from: "Contato <noreply@godoyprime.com.br>",
        to: [data.leadEmail],
        subject: `✅ Mensagem Recebida - ${data.propertyTitle}`,
        html: clienteEmailHtml,
      });
      console.log("Email cliente enviado:", clienteResponse);
      emailsSent.push(`cliente: ${data.leadEmail}`);
    } catch (err) {
      console.error("Error sending to cliente:", err);
      errors.push(`cliente: ${err}`);
    }

    // 2. Enviar email para a IMOBILIÁRIA (se houver)
    if (data.imobiliariaEmail) {
      console.log("Enviando email para imobiliária:", data.imobiliariaEmail);
      try {
        const imobiliariaResponse = await resend.emails.send({
          from: "Leads <leads@godoyprime.com.br>",
          to: [data.imobiliariaEmail],
          subject: `🏠 Novo Lead - ${data.propertyTitle}`,
          html: imobiliariaEmailHtml,
        });
        console.log("Email imobiliária enviado:", imobiliariaResponse);
        emailsSent.push(`imobiliaria: ${data.imobiliariaEmail}`);
      } catch (err) {
        console.error("Error sending to imobiliaria:", err);
        errors.push(`imobiliaria: ${err}`);
      }
    }

    // 3. Enviar email para a CONSTRUTORA
    const construtoraEmail = construtora?.email_contato || "contato@godoyprime.com.br";
    console.log("Enviando email para construtora:", construtoraEmail);
    try {
      const construtoraResponse = await resend.emails.send({
        from: "Leads <leads@godoyprime.com.br>",
        to: [construtoraEmail],
        subject: `📊 Novo Lead - ${data.propertyTitle}${data.imobiliariaNome !== "Contato via Site Principal" ? ` (via ${data.imobiliariaNome})` : ""}`,
        html: construtoraEmailHtml,
      });
      console.log("Email construtora enviado:", construtoraResponse);
      emailsSent.push(`construtora: ${construtoraEmail}`);
    } catch (err) {
      console.error("Error sending to construtora:", err);
      errors.push(`construtora: ${err}`);
    }

    console.log(`Emails enviados: ${emailsSent.length}/3`);

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent,
        totalEmails: emailsSent.length,
        errors: errors.length > 0 ? errors : undefined,
        details: {
          clienteEmail: data.leadEmail,
          imobiliariaEmail: data.imobiliariaEmail || null,
          construtoraEmail: construtoraEmail,
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-lead-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

Deno.serve(handler);
