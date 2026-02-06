import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, errorResponse, successResponse, sanitizeInput, isValidEmail } from "../_shared/security.ts";
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from "../_shared/rate-limiter.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limiting: 3 requests per 10 minutes
    const clientId = getClientIdentifier(req);
    const rateCheck = await checkRateLimit(supabase, clientId, "send-demo-request", {
      maxRequests: 3,
      windowSeconds: 600,
    });
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetAt);
    }

    const body = await req.json();
    const nome = sanitizeInput(body.nome, 100);
    const empresa = sanitizeInput(body.empresa, 100);
    const email = body.email?.trim();
    const telefone = sanitizeInput(body.telefone, 20);
    const mensagem = sanitizeInput(body.mensagem, 1000);

    if (!nome || !empresa || !email) {
      return errorResponse("Campos obrigatórios: nome, empresa e e-mail.", 400);
    }
    if (!isValidEmail(email)) {
      return errorResponse("E-mail inválido.", 400);
    }

    // Save to database
    await supabase.from("demo_requests").insert({
      nome: body.nome?.trim(),
      empresa: body.empresa?.trim(),
      email,
      telefone: body.telefone?.trim() || null,
      mensagem: body.mensagem?.trim() || null,
    });

    const fromAddress = "Godoy Prime <noreply@godoyprime.com.br>";

    // Send notification to Godoy Prime
    await resend.emails.send({
      from: fromAddress,
      to: ["contato@godoyprime.com.br"],
      subject: `Nova solicitação de demonstração — ${nome}`,
      html: `
        <h2>Nova solicitação de demonstração</h2>
        <table style="border-collapse:collapse;width:100%;max-width:500px">
          <tr><td style="padding:8px;font-weight:bold">Nome</td><td style="padding:8px">${nome}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Empresa</td><td style="padding:8px">${empresa}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">E-mail</td><td style="padding:8px">${email}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Telefone</td><td style="padding:8px">${telefone || "—"}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Mensagem</td><td style="padding:8px">${mensagem || "—"}</td></tr>
        </table>
      `,
    });

    // Send confirmation to requester
    await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject: "Recebemos sua solicitação — Godoy Prime Realty",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#0C2340">Olá, ${nome}!</h2>
          <p>Recebemos sua solicitação de demonstração da plataforma <strong>Godoy Prime</strong>.</p>
          <p>Nossa equipe entrará em contato em breve para agendar uma apresentação personalizada para a <strong>${empresa}</strong>.</p>
          <p>Caso prefira, entre em contato diretamente pelo WhatsApp: <a href="https://wa.me/5521964075124">+55 21 96407-5124</a></p>
          <br/>
          <p style="color:#666;font-size:13px">Godoy Prime Realty — Tecnologia para o mercado imobiliário de alto padrão</p>
        </div>
      `,
    });

    return successResponse({ success: true });
  } catch (err) {
    console.error("[send-demo-request] Error:", err);
    return errorResponse("Erro ao processar solicitação.", 500);
  }
});
