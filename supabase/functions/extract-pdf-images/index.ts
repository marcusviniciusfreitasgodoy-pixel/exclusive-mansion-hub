import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfUrl, materialKey } = await req.json();

    if (!pdfUrl) {
      return new Response(
        JSON.stringify({ error: 'pdfUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Fetch the PDF
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);
    }
    
    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfArrayBuffer)));

    // Use Gemini Vision to extract and describe images from the PDF
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this PDF document and identify all the professional real estate images (renders, photos of apartments, facades, common areas, etc.). 
                
For each image found, describe:
1. A short descriptive title (in Portuguese)
2. The approximate page number where it appears
3. Whether it's a good quality professional image suitable for a real estate website

Return ONLY a JSON array with objects like:
[
  {"title": "Fachada do empreendimento", "page": 1, "isGoodQuality": true},
  {"title": "Sala de estar integrada", "page": 3, "isGoodQuality": true}
]

If no suitable images are found, return an empty array: []`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '[]';
    
    // Parse the JSON response
    let extractedImages: Array<{ title: string; page: number; isGoodQuality: boolean }> = [];
    try {
      // Find JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        extractedImages = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      extractedImages = [];
    }

    // Filter to only good quality images
    const goodImages = extractedImages.filter(img => img.isGoodQuality);

    return new Response(
      JSON.stringify({
        success: true,
        totalImagesFound: extractedImages.length,
        goodQualityImages: goodImages.length,
        images: goodImages,
        materialKey,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error extracting images:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to extract images from PDF',
        success: false,
        images: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
