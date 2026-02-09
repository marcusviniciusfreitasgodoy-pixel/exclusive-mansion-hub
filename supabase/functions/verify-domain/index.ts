import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();
    if (!domain || typeof domain !== "string") {
      return new Response(JSON.stringify({ error: "Domain is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanDomain = domain.trim().toLowerCase();

    // DNS lookup via DoH (DNS over HTTPS) - Google's public resolver
    let verified = false;
    let message = "";

    try {
      const dnsRes = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(cleanDomain)}&type=CNAME`,
        { headers: { Accept: "application/dns-json" } }
      );
      const dnsData = await dnsRes.json();

      if (dnsData.Answer && dnsData.Answer.length > 0) {
        const cnameTarget = dnsData.Answer.find(
          (a: any) => a.type === 5
        )?.data?.replace(/\.$/, "");

        if (
          cnameTarget === "whitelabel.godoyprime.com.br"
        ) {
          verified = true;
          message = "CNAME configurado corretamente.";
        } else {
          message = `CNAME aponta para "${cnameTarget || "desconhecido"}" em vez de "whitelabel.godoyprime.com.br".`;
        }
      } else {
        message =
          "Nenhum registro CNAME encontrado. Verifique se o DNS foi configurado corretamente.";
      }
    } catch (dnsError) {
      console.error("DNS lookup error:", dnsError);
      message = "Erro ao consultar DNS. Tente novamente em alguns minutos.";
    }

    // Update status in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const newStatus = verified ? "active" : "failed";
    await supabase
      .from("custom_domains")
      .update({
        status: newStatus,
        verified_at: verified ? new Date().toISOString() : null,
      })
      .eq("domain", cleanDomain);

    return new Response(
      JSON.stringify({ verified, message, status: newStatus }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("verify-domain error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
