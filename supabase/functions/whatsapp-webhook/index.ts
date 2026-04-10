import { createClient } from "npm:@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Webhook for receiving WhatsApp message status updates from Z-API
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting - 30 requests per minute per IP
    const clientId = getClientIdentifier(req);
    const rateLimit = await checkRateLimit(supabase, clientId, "whatsapp-webhook", {
      maxRequests: 30,
      windowSeconds: 60,
    });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    const body = await req.json();
    console.log('Z-API Webhook received:', JSON.stringify(body, null, 2));

    // Z-API sends different event types
    // Common fields: phone, messageId, status, mompirent
    // Status events: status can be "SENT", "DELIVERED", "READ", "PLAYED", "FAILED"

    if (body.status) {
      // Status update from Z-API
      const messageId = body.id?.id || body.messageId || body.ids?.[0]?.id;
      const statusType = (body.status || '').toLowerCase();

      if (messageId) {
        console.log(`Z-API status update for ${messageId}: ${statusType}`);

        const updateData: Record<string, unknown> = {
          status: statusType === 'sent' ? 'enviado' :
                  statusType === 'delivered' ? 'entregue' :
                  statusType === 'read' || statusType === 'played' ? 'lido' :
                  statusType === 'failed' ? 'falhou' : statusType
        };

        if (statusType === 'delivered') {
          updateData.entregue_em = new Date().toISOString();
        } else if (statusType === 'read' || statusType === 'played') {
          updateData.lido_em = new Date().toISOString();
        } else if (statusType === 'failed') {
          updateData.erro = body.errorMessage || 'Delivery failed';
        }

        await supabase
          .from('whatsapp_messages')
          .update(updateData)
          .eq('wamid', messageId);
      }
    }

    // Z-API incoming message (ReceivedCallback)
    if (body.text?.message || body.image || body.audio || body.document) {
      const phone = body.phone;
      console.log('Z-API incoming message from:', phone);
      // Future: store incoming messages for chat functionality
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing Z-API webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
