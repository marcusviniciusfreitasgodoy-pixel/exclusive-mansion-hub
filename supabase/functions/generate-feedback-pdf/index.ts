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

interface GeneratePDFRequest {
  feedbackId: string;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function renderStars(rating: number): string {
  const filled = "★".repeat(rating);
  const empty = "☆".repeat(5 - rating);
  return filled + empty;
}

function getNPSLabel(nps: number): { label: string; color: string } {
  if (nps <= 6) return { label: "Detrator", color: "#dc2626" };
  if (nps <= 8) return { label: "Neutro", color: "#ca8a04" };
  return { label: "Promotor", color: "#16a34a" };
}

function getQualificacaoLabel(q: string): string {
  const labels: Record<string, string> = {
    quente: "🔥 Quente",
    morno: "🌡️ Morno",
    frio: "❄️ Frio",
  };
  return labels[q] || q;
}

function getInteresseLabel(i: string): string {
  const labels: Record<string, string> = {
    muito_interessado: "Muito Interessado",
    interessado: "Interessado",
    pouco_interessado: "Pouco Interessado",
    sem_interesse: "Sem Interesse",
  };
  return labels[i] || i;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedbackId }: GeneratePDFRequest = await req.json();

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar dados completos do feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from("feedbacks_visitas")
      .select(`
        *,
        imoveis(titulo, endereco, bairro, cidade, valor),
        imobiliarias(nome_empresa, logo_url),
        construtoras(nome_empresa, logo_url)
      `)
      .eq("id", feedbackId)
      .single();

    if (feedbackError || !feedback) {
      throw new Error("Feedback não encontrado");
    }

    const npsInfo = feedback.nps_cliente !== null ? getNPSLabel(feedback.nps_cliente) : null;
    const endereco = [
      feedback.imoveis?.endereco,
      feedback.imoveis?.bairro,
      feedback.imoveis?.cidade,
    ].filter(Boolean).join(", ");

    // Gerar HTML do relatório
    const pdfHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #333; }
          .page { padding: 30px; max-width: 800px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #1e3a5f, #2d5a8a); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { font-size: 20px; margin-bottom: 5px; }
          .header p { opacity: 0.8; font-size: 11px; }
          .section { border: 1px solid #e5e7eb; border-top: none; padding: 20px; }
          .section:last-child { border-radius: 0 0 8px 8px; }
          .section-title { font-size: 14px; font-weight: bold; color: #1e3a5f; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .field { margin-bottom: 10px; }
          .field-label { font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 3px; }
          .field-value { font-size: 12px; font-weight: 500; }
          .stars { color: #f59e0b; font-size: 14px; letter-spacing: 2px; }
          .nps-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; color: white; }
          .signature-box { border: 1px dashed #ccc; padding: 15px; text-align: center; margin-top: 10px; background: #fafafa; }
          .signature-img { max-height: 80px; max-width: 200px; }
          .signature-meta { font-size: 9px; color: #888; margin-top: 8px; }
          .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 9px; color: #666; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
          .hash { font-family: monospace; word-break: break-all; background: #eee; padding: 5px; border-radius: 4px; margin-top: 8px; }
          .qualificacao { display: inline-block; padding: 5px 12px; border-radius: 6px; font-weight: bold; }
          .qualificacao-quente { background: #fee2e2; color: #dc2626; }
          .qualificacao-morno { background: #fef3c7; color: #d97706; }
          .qualificacao-frio { background: #dbeafe; color: #2563eb; }
          .interesse { display: inline-block; padding: 3px 10px; border-radius: 4px; background: #f3f4f6; }
          .text-block { background: #f9fafb; padding: 12px; border-radius: 6px; margin-top: 8px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="page">
          <!-- Header -->
          <div class="header">
            <h1>📋 RELATÓRIO DE VISITA AO IMÓVEL</h1>
            <p>Documento com Validade Jurídica • ID: ${feedback.id}</p>
          </div>

          <!-- Dados do Imóvel -->
          <div class="section">
            <div class="section-title">📍 DADOS DO IMÓVEL</div>
            <div class="grid">
              <div class="field">
                <div class="field-label">Título</div>
                <div class="field-value">${feedback.imoveis?.titulo || "-"}</div>
              </div>
              <div class="field">
                <div class="field-label">Valor</div>
                <div class="field-value">${feedback.imoveis?.valor ? formatCurrency(feedback.imoveis.valor) : "-"}</div>
              </div>
            </div>
            <div class="field">
              <div class="field-label">Endereço</div>
              <div class="field-value">${endereco || "-"}</div>
            </div>
          </div>

          <!-- Dados da Visita -->
          <div class="section">
            <div class="section-title">📅 DADOS DA VISITA</div>
            <div class="grid">
              <div class="field">
                <div class="field-label">Data da Visita</div>
                <div class="field-value">${formatDate(feedback.data_visita)}</div>
              </div>
              <div class="field">
                <div class="field-label">Duração</div>
                <div class="field-value">${feedback.duracao_minutos ? `${feedback.duracao_minutos} minutos` : "-"}</div>
              </div>
              <div class="field">
                <div class="field-label">Cliente</div>
                <div class="field-value">${feedback.cliente_nome}</div>
              </div>
              <div class="field">
                <div class="field-label">Corretor</div>
                <div class="field-value">${feedback.corretor_nome || "-"}</div>
              </div>
            </div>
          </div>

          <!-- Avaliação do Cliente -->
          <div class="section">
            <div class="section-title">⭐ AVALIAÇÃO DO CLIENTE</div>
            
            ${feedback.nps_cliente !== null ? `
            <div class="field" style="margin-bottom: 20px;">
              <div class="field-label">NPS (Net Promoter Score)</div>
              <div class="field-value">
                <strong style="font-size: 24px;">${feedback.nps_cliente}</strong>/10
                <span class="nps-badge" style="background: ${npsInfo?.color}; margin-left: 10px;">
                  ${npsInfo?.label}
                </span>
              </div>
            </div>
            ` : ""}

            <div class="grid">
              <div class="field">
                <div class="field-label">Localização</div>
                <div class="stars">${feedback.avaliacao_localizacao ? renderStars(feedback.avaliacao_localizacao) : "-"}</div>
              </div>
              <div class="field">
                <div class="field-label">Acabamento</div>
                <div class="stars">${feedback.avaliacao_acabamento ? renderStars(feedback.avaliacao_acabamento) : "-"}</div>
              </div>
              <div class="field">
                <div class="field-label">Layout</div>
                <div class="stars">${feedback.avaliacao_layout ? renderStars(feedback.avaliacao_layout) : "-"}</div>
              </div>
              <div class="field">
                <div class="field-label">Custo-Benefício</div>
                <div class="stars">${feedback.avaliacao_custo_beneficio ? renderStars(feedback.avaliacao_custo_beneficio) : "-"}</div>
              </div>
              <div class="field">
                <div class="field-label">Atendimento</div>
                <div class="stars">${feedback.avaliacao_atendimento ? renderStars(feedback.avaliacao_atendimento) : "-"}</div>
              </div>
              <div class="field">
                <div class="field-label">Interesse</div>
                <div class="interesse">${feedback.interesse_compra ? getInteresseLabel(feedback.interesse_compra) : "-"}</div>
              </div>
            </div>

            ${feedback.pontos_positivos ? `
            <div class="field" style="margin-top: 15px;">
              <div class="field-label">Pontos Positivos</div>
              <div class="text-block">${feedback.pontos_positivos}</div>
            </div>
            ` : ""}

            ${feedback.pontos_negativos ? `
            <div class="field">
              <div class="field-label">Pontos Negativos</div>
              <div class="text-block">${feedback.pontos_negativos}</div>
            </div>
            ` : ""}
          </div>

          <!-- Avaliação do Corretor -->
          <div class="section">
            <div class="section-title">📊 AVALIAÇÃO DO CORRETOR</div>
            <div class="grid">
              <div class="field">
                <div class="field-label">Qualificação do Lead</div>
                <div class="field-value">
                  <span class="qualificacao qualificacao-${feedback.qualificacao_lead}">
                    ${feedback.qualificacao_lead ? getQualificacaoLabel(feedback.qualificacao_lead) : "-"}
                  </span>
                </div>
              </div>
              <div class="field">
                <div class="field-label">Score do Lead</div>
                <div class="field-value" style="font-size: 18px; font-weight: bold; color: #1e3a5f;">
                  ${feedback.score_lead}/100
                </div>
              </div>
              <div class="field">
                <div class="field-label">Poder de Decisão</div>
                <div class="field-value">${feedback.poder_decisao || "-"}</div>
              </div>
              <div class="field">
                <div class="field-label">Prazo de Compra</div>
                <div class="field-value">${feedback.prazo_compra?.replace(/_/g, " ") || "-"}</div>
              </div>
              <div class="field">
                <div class="field-label">Orçamento</div>
                <div class="field-value">${feedback.orcamento_disponivel ? formatCurrency(feedback.orcamento_disponivel) : "-"}</div>
              </div>
              <div class="field">
                <div class="field-label">Forma de Pagamento</div>
                <div class="field-value">${feedback.forma_pagamento_pretendida || "-"}</div>
              </div>
            </div>

            ${feedback.observacoes_corretor ? `
            <div class="field" style="margin-top: 15px;">
              <div class="field-label">Observações do Corretor</div>
              <div class="text-block">${feedback.observacoes_corretor}</div>
            </div>
            ` : ""}

            ${feedback.proximos_passos ? `
            <div class="field">
              <div class="field-label">Próximos Passos</div>
              <div class="text-block">${feedback.proximos_passos}</div>
            </div>
            ` : ""}
          </div>

          <!-- Assinaturas -->
          <div class="section">
            <div class="section-title">✍️ ASSINATURAS DIGITAIS</div>
            <div class="grid">
              <div>
                <div class="field-label">Assinatura do Cliente</div>
                <div class="signature-box">
                  ${feedback.assinatura_cliente 
                    ? `<img src="${feedback.assinatura_cliente}" class="signature-img" alt="Assinatura do Cliente" />`
                    : "<p style='color: #999;'>Aguardando assinatura</p>"
                  }
                </div>
                ${feedback.assinatura_cliente_data ? `
                <div class="signature-meta">
                  Assinado em: ${formatDate(feedback.assinatura_cliente_data)}<br>
                  IP: ${feedback.assinatura_cliente_ip || "N/A"}<br>
                  Dispositivo: ${(feedback.assinatura_cliente_device || "").substring(0, 50)}...
                </div>
                ` : ""}
              </div>
              <div>
                <div class="field-label">Assinatura do Corretor</div>
                <div class="signature-box">
                  ${feedback.assinatura_corretor 
                    ? `<img src="${feedback.assinatura_corretor}" class="signature-img" alt="Assinatura do Corretor" />`
                    : "<p style='color: #999;'>Aguardando assinatura</p>"
                  }
                </div>
                ${feedback.assinatura_corretor_data ? `
                <div class="signature-meta">
                  Assinado em: ${formatDate(feedback.assinatura_corretor_data)}<br>
                  IP: ${feedback.assinatura_corretor_ip || "N/A"}<br>
                  Dispositivo: ${(feedback.assinatura_corretor_device || "").substring(0, 50)}...
                </div>
                ` : ""}
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <strong>Este documento possui validade jurídica</strong><br>
            Gerado em: ${formatDate(new Date().toISOString())}<br>
            ID do Documento: ${feedback.id}<br>
            ${feedback.documento_hash ? `<div class="hash">Hash SHA-256: ${feedback.documento_hash}</div>` : ""}
          </div>
        </div>
      </body>
      </html>
    `;

    // Nota: A geração real do PDF seria feita no frontend com jsPDF/html2canvas
    // Esta edge function prepara os dados e pode ser expandida para usar um serviço de PDF

    // Por enquanto, vamos apenas notificar que o feedback está completo
    // e enviar emails para todas as partes

    // Email para cliente com confirmação
    await resend.emails.send({
      from: "Feedback <noreply@godoyprime.com.br>",
      to: [feedback.cliente_email],
      subject: `✅ Feedback registrado - ${feedback.imoveis?.titulo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Obrigado pelo seu feedback!</h2>
          <p>Olá ${feedback.cliente_nome},</p>
          <p>Seu feedback sobre a visita ao imóvel <strong>${feedback.imoveis?.titulo}</strong> foi registrado com sucesso.</p>
          <p>Agradecemos por compartilhar sua opinião. Ela é muito importante para nós!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px;">Este é um email automático, por favor não responda.</p>
        </div>
      `,
    });

    // Email para imobiliária
    if (feedback.imobiliarias?.nome_empresa) {
      // Buscar email da imobiliária
      const { data: imobiliaria } = await supabase
        .from("imobiliarias")
        .select("email_contato")
        .eq("id", feedback.imobiliaria_id)
        .single();

      if (imobiliaria?.email_contato) {
        await resend.emails.send({
          from: "Sistema <noreply@godoyprime.com.br>",
          to: [imobiliaria.email_contato],
          subject: `📊 Feedback completo - ${feedback.cliente_nome}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Feedback de visita completo!</h2>
              <p>O cliente <strong>${feedback.cliente_nome}</strong> completou o feedback da visita.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Imóvel:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${feedback.imoveis?.titulo}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>NPS:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${feedback.nps_cliente}/10</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Interesse:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${feedback.interesse_compra ? getInteresseLabel(feedback.interesse_compra) : "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Score:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${feedback.score_lead}/100</td>
                </tr>
              </table>
              <p>Acesse o painel para ver o relatório completo.</p>
            </div>
          `,
        });
      }
    }

    // Atualizar feedback com data de geração do PDF
    await supabase
      .from("feedbacks_visitas")
      .update({
        pdf_gerado_em: new Date().toISOString(),
        // pdf_url será atualizado quando o PDF real for gerado no frontend
      })
      .eq("id", feedbackId);

    console.log("Processamento de feedback completo para:", feedbackId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Feedback processado com sucesso",
        htmlReport: pdfHtml // Retorna HTML para geração de PDF no frontend
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Erro em generate-feedback-pdf:", error);
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
