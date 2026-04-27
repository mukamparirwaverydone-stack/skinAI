// Analyze a skin lesion image via Lovable AI vision (Gemini).
// Returns structured risk assessment. Educational only — not medical advice.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeBody {
  imageBase64: string; // data URL or raw base64
  mimeType?: string;
  language?: "en" | "rw";
}

const SYSTEM_PROMPT = `You are an AI assistant that performs PRELIMINARY visual screening of skin lesions for educational purposes only.
You are NOT a doctor and your output is NOT a medical diagnosis.

Apply the dermatology ABCDE criteria when assessing the lesion:
- Asymmetry
- Border irregularity
- Color variation
- Diameter (>6mm is more concerning)
- Evolution / change over time (cannot judge from one image)

Also note: ugly duckling sign, bleeding, ulceration, satellite lesions.

Always return your answer by calling the report_assessment tool with structured fields.
Be conservative: if the image is unclear, not a skin lesion, or you are uncertain, set risk_level to "unknown" and explain why.
Never claim certainty. Always recommend professional consultation for medium/high risk.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as AnalyzeBody;
    if (!body?.imageBase64) {
      return new Response(JSON.stringify({ error: "imageBase64 required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const language = body.language === "rw" ? "Kinyarwanda" : "English";
    const mimeType = body.mimeType || "image/jpeg";
    const dataUrl = body.imageBase64.startsWith("data:")
      ? body.imageBase64
      : `data:${mimeType};base64,${body.imageBase64}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: `Assess this skin lesion image. Respond in ${language}. Use the report_assessment tool.` },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "report_assessment",
            description: "Return the structured screening assessment.",
            parameters: {
              type: "object",
              properties: {
                is_skin_lesion: { type: "boolean", description: "Whether the image actually shows a skin lesion." },
                classification: { type: "string", description: "Short label, e.g. 'Likely benign nevus', 'Suspicious pigmented lesion', 'Unclear / not a lesion'." },
                risk_level: { type: "string", enum: ["low", "medium", "high", "unknown"] },
                confidence: { type: "number", description: "0-1 confidence in the risk assessment." },
                findings: {
                  type: "object",
                  properties: {
                    asymmetry: { type: "string" },
                    border: { type: "string" },
                    color: { type: "string" },
                    diameter: { type: "string" },
                    other: { type: "string" },
                  },
                  required: ["asymmetry", "border", "color", "diameter"],
                  additionalProperties: false,
                },
                explanation: { type: "string", description: "Plain-language summary for the user." },
                recommendation: { type: "string", description: "What the user should do next." },
              },
              required: ["is_skin_lesion", "classification", "risk_level", "confidence", "findings", "explanation", "recommendation"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "report_assessment" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No structured response from AI" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const args = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-lesion error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
