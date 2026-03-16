import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { userId, ideaId, ideaText } = await request.json();

    if (!userId || !ideaId || !ideaText) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const supabase = await createServerClient();

    // Get API key
    const { data: profile } = await supabase
      .from("profiles")
      .select("api_key")
      .eq("id", userId)
      .single();

    if (!profile?.api_key) {
      return NextResponse.json(
        { error: "API Key no configurada." },
        { status: 400 }
      );
    }

    // Get brujula data
    const { data: brujulaData } = await supabase
      .from("brujula_data")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!brujulaData) {
      return NextResponse.json(
        { error: "No hay datos de La Brújula." },
        { status: 400 }
      );
    }

    const state = {
      briefing: brujulaData.briefing || {},
      tree: brujulaData.tree || { pilares: [] },
      buyer: brujulaData.buyer || {},
      insight: brujulaData.insight || {},
    };

    const systemPrompt = `Eres un estratega de contenido. Tu trabajo es analizar una idea en bruto y conectarla con la estrategia de marca personal del creador.

=== ESTRATEGIA DEL CREADOR ===

TEMA RAÍZ: ${state.briefing.temaRaiz || "No definido"}
PROPUESTA DE VALOR: ${state.briefing.propuestaValor || "No definida"}
INSIGHT: ${state.insight.insight || "No definido"}

ÁRBOL DE CONTENIDOS:
${state.tree.pilares
  .map(
    (p: any) =>
      `- Pilar: ${p.nombre}\n  Subtemas: ${(p.subtemas || []).join(", ") || "ninguno"}\n  Ángulos: ${(p.angulos || []).join(", ") || "todos"}${(p.titulares || []).length > 0 ? `\n  Titulares ref: ${(p.titulares || []).map((t: string) => `"${t}"`).join(", ")}` : ""}`
  )
  .join("\n")}

AUDIENCIA: ${state.buyer.nombre || "No definida"} — ${state.buyer.queQuiere || ""} / Le frena: ${state.buyer.queLeFrena || ""}

=== IDEA EN BRUTO ===
"${ideaText}"

=== TU TAREA ===
Analiza la idea y conéctala con el árbol de contenidos del creador.

Responde SOLO con un JSON válido (sin markdown, sin backticks):
{
  "pilar": "el pilar del árbol que mejor encaja con esta idea",
  "subtema": "el subtema más cercano (o sugiere uno nuevo coherente con el pilar)",
  "angulos": ["2-3 ángulos narrativos que podrían funcionar para desarrollar esta idea"],
  "conexion": "En 1-2 frases, por qué esta idea encaja con la estrategia del creador y qué la hace potente para su audiencia"
}

IMPORTANTE:
- Prioriza pilares y subtemas que YA existen en el árbol
- Si la idea no encaja en ningún pilar existente, elige el más cercano y explícalo
- Los ángulos deben ser concretos: "experiencia personal", "mito vs realidad", "análisis de caso", etc.
- La conexión debe ser breve y accionable`;

    const anthropic = new Anthropic({ apiKey: profile.api_key });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: "Analiza esta idea y conéctala con mi estrategia.",
        },
      ],
      system: systemPrompt,
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let enrichment;
    try {
      enrichment = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        enrichment = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No se pudo interpretar la respuesta");
      }
    }

    // Update idea in database
    await supabase
      .from("ideas")
      .update({
        status: "enriched",
        pilar: enrichment.pilar,
        subtema: enrichment.subtema,
        enrichment,
      })
      .eq("id", ideaId);

    return NextResponse.json({ enrichment });
  } catch (err: any) {
    console.error("Ideas enrich error:", err);
    return NextResponse.json(
      { error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
