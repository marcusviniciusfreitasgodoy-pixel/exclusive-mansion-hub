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

    // Create Supabase client to get construtora email
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get construtora email
    const { data: construtora, error: construtoraError } = await supabase
      .from("construtoras")
      .select("nome_empresa, user_id")
      .eq("id", data.construtoraId)
      .single();

    if (construtoraError) {
      console.error("Error fetching construtora:", construtoraError);
    }

    // Get construtora user email from auth
    let construtoraEmail: string | null = null;
    if (construtora?.user_id) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
        construtora.user_id
      );
      if (!userError && userData?.user) {
        construtoraEmail = userData.user.email || null;
      }
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Lead</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .content {
      padding: 30px;
    }
    .property-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 25px;
      border-left: 4px solid #d4af37;
    }
    .property-card h2 {
      margin: 0 0 10px;
      color: #1a1a2e;
      font-size: 18px;
    }
    .property-card p {
      margin: 5px 0;
      color: #666;
      font-size: 14px;
    }
    .property-value {
      font-size: 20px;
      font-weight: 700;
      color: #d4af37;
      margin-top: 10px;
    }
    .lead-info {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 25px;
    }
    .lead-info h3 {
      margin: 0 0 15px;
      color: #1a1a2e;
      font-size: 16px;
      border-bottom: 2px solid #d4af37;
      padding-bottom: 10px;
    }
    .info-row {
      display: flex;
      margin-bottom: 12px;
    }
    .info-label {
      font-weight: 600;
      color: #555;
      width: 100px;
      flex-shrink: 0;
    }
    .info-value {
      color: #333;
    }
    .info-value a {
      color: #1a73e8;
      text-decoration: none;
    }
    .message-box {
      background: #f0f7ff;
      border-radius: 8px;
      padding: 15px;
      margin-top: 15px;
    }
    .message-box h4 {
      margin: 0 0 10px;
      color: #1a1a2e;
      font-size: 14px;
    }
    .message-box p {
      margin: 0;
      color: #555;
      font-style: italic;
    }
    .cta-button {
      display: inline-block;
      background: #25D366;
      color: white !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 600;
      margin-top: 20px;
      text-align: center;
    }
    .cta-button:hover {
      background: #128C7E;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #888;
    }
    .footer a {
      color: #1a73e8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Novo Lead Recebido!</h1>
      <p>Um cliente demonstrou interesse no seu imóvel</p>
    </div>
    
    <div class="content">
      <div class="property-card">
        <h2>${data.propertyTitle}</h2>
        <p>📍 ${data.propertyAddress || "Endereço não informado"}</p>
        <div class="property-value">${formatCurrency(data.propertyValue)}</div>
      </div>

      <div class="lead-info">
        <h3>👤 Dados do Cliente</h3>
        <div class="info-row">
          <span class="info-label">Nome:</span>
          <span class="info-value">${data.leadName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">E-mail:</span>
          <span class="info-value"><a href="mailto:${data.leadEmail}">${data.leadEmail}</a></span>
        </div>
        <div class="info-row">
          <span class="info-label">Telefone:</span>
          <span class="info-value"><a href="tel:${data.leadPhone}">${data.leadPhone}</a></span>
        </div>
        <div class="info-row">
          <span class="info-label">Via:</span>
          <span class="info-value">${data.imobiliariaNome}</span>
        </div>

        ${data.leadMessage ? `
        <div class="message-box">
          <h4>💬 Mensagem:</h4>
          <p>"${data.leadMessage}"</p>
        </div>
        ` : ""}
      </div>

      <div style="text-align: center;">
        <a href="https://wa.me/55${data.leadPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${data.leadName}! Recebi seu contato sobre o imóvel ${data.propertyTitle}. Como posso ajudar?`)}" class="cta-button">
          📱 Responder via WhatsApp
        </a>
      </div>
    </div>

    <div class="footer">
      <p>Este lead foi gerado através da plataforma de imóveis.</p>
      <p>Acesse seu <a href="#">dashboard</a> para gerenciar todos os leads.</p>
    </div>
  </div>
</body>
</html>
    `;

    const emailsSent: string[] = [];
    const errors: string[] = [];

    // Send to imobiliaria
    if (data.imobiliariaEmail) {
      try {
        const imobiliariaResponse = await resend.emails.send({
          from: "Leads <leads@godoyprime.com.br>",
          to: [data.imobiliariaEmail],
          subject: `🏠 Novo Lead - ${data.propertyTitle}`,
          html: emailHtml,
        });
        console.log("Email sent to imobiliaria:", imobiliariaResponse);
        emailsSent.push(`imobiliaria: ${data.imobiliariaEmail}`);
      } catch (err) {
        console.error("Error sending to imobiliaria:", err);
        errors.push(`imobiliaria: ${err}`);
      }
    }

    // Send to construtora
    if (construtoraEmail) {
      try {
        const construtoraResponse = await resend.emails.send({
          from: "Leads <leads@godoyprime.com.br>",
          to: [construtoraEmail],
          subject: `🏠 Novo Lead - ${data.propertyTitle} (via ${data.imobiliariaNome})`,
          html: emailHtml,
        });
        console.log("Email sent to construtora:", construtoraResponse);
        emailsSent.push(`construtora: ${construtoraEmail}`);
      } catch (err) {
        console.error("Error sending to construtora:", err);
        errors.push(`construtora: ${err}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent,
        errors: errors.length > 0 ? errors : undefined,
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
