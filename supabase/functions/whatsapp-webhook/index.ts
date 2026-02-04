import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Webhook for receiving WhatsApp message status updates from Meta
Deno.serve(async (req) => {
  // Handle webhook verification (GET request from Meta)
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    // Verify token should be configured in Meta dashboard
    const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'lovable_whatsapp_webhook';

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('Webhook verified successfully');
      return new Response(challenge, { status: 200 });
    } else {
      console.error('Webhook verification failed');
      return new Response('Forbidden', { status: 403 });
    }
  }

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

    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Process Meta webhook payload
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            const value = change.value;

            // Process status updates
            if (value.statuses) {
              for (const status of value.statuses) {
                const wamid = status.id;
                const statusType = status.status; // sent, delivered, read, failed
                const timestamp = new Date(parseInt(status.timestamp) * 1000).toISOString();

                console.log(`Status update for ${wamid}: ${statusType}`);

                // Update message status in database
                const updateData: Record<string, unknown> = {
                  status: statusType === 'sent' ? 'enviado' : 
                          statusType === 'delivered' ? 'entregue' : 
                          statusType === 'read' ? 'lido' : 
                          statusType === 'failed' ? 'falhou' : statusType
                };

                if (statusType === 'delivered') {
                  updateData.entregue_em = timestamp;
                } else if (statusType === 'read') {
                  updateData.lido_em = timestamp;
                } else if (statusType === 'failed') {
                  updateData.erro = status.errors?.[0]?.message || 'Delivery failed';
                }

                await supabase
                  .from('whatsapp_messages')
                  .update(updateData)
                  .eq('wamid', wamid);
              }
            }

            // Process incoming messages (optional - for future use)
            if (value.messages) {
              for (const message of value.messages) {
                console.log('Incoming message:', message);
                // Could store incoming messages for chat functionality
              }
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
