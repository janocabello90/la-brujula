import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Falta userId" }, { status: 400 });
    }

    const supabase = await createServerClient();

    // Get user profile + API key
    const { data: profile } = await supabase
      .from("profiles")
      .select("api_key")
      .eq("id", userId)
      .single();

    if (!profile?.api_key) {
      return NextResponse.json(
        { error: "API Key no configurada. Ve a Ajustes para añadirla." },
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
      buyer: brujulaData.buyer || {},
      empathy: brujulaData.empathy || {},
      insight: brujulaData.insight || {},
      tree: brujulaData.tree || { pilares: [] },
      channels: brujulaData.channels || { canales: [], objetivosPrincipales: [] },
    };

    // Get recent history to avoid repetition
    const { data: historyData } = await supabase
      .from("suggestion_history")
      .select("suggestion")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    const history = historyData?.map((h) => h.suggestion) || [];

    const systemPrompt = `Eres un director creativo senior de contenidos para marca personal.

Tu trabajo: generar 10 ideas de contenido variadas y específicas basándote EXCLUSIVAMENTE en el perfil del creador.

=== PERFIL DEL CREADOR ===

BRIEFING:
- Tema raíz: ${state.briefing.temaRaiz || "No definido"}
- Propuesta de valor: ${state.briefing.propuestaValor || "No definida"}
- Etiqueta profesional: ${state.briefing.etiquetaProfesional || "No definida"}
- ¿Por qué tú?: ${state.briefing.porQueTu || "No definido"}

BUYER PERSONA:
- Nombre: ${state.buyer.nombre || "?"} | Edad: ${state.buyer.edad || "?"} | Profesión: ${state.buyer.profesion || "?"}
- Qué quiere: ${state.buyer.queQuiere || "No definido"}
- Qué le frena: ${state.buyer.queLeFrena || "No definido"}
- Qué consume: ${state.buyer.queConsumo || "No definido"}
- Lenguaje: ${state.buyer.lenguaje || "No definido"}

MAPA DE EMPATÍA:
- Dolores: ${state.empathy.dolores || "No definido"}
- Deseos: ${state.empathy.deseos || "No definido"}

INSIGHT: ${state.insight.insight || "No definido"}
FRASE AUDIENCIA: "${state.insight.fraseAudiencia || "No definida"}"

ÁRBOL DE CONTENIDOS:
${state.tree.pilares
  .map(
    (p: any) =>
      `- Pilar: ${p.nombre}\n  Subtemas: ${(p.subtemas || []).join(", ") || "ninguno"}\n  Ángulos: ${(p.angulos || []).join(", ") || "ninguno"}`
  )
  .join("\n")}

CANALES: ${(state.channels.canales || []).join(", ") || "No definidos"}

${
  history.length > 0
    ? `=== HISTORIAL RECIENTE (no repitas) ===\n${history
        .slice(0, 5)
        .map((h: any) => `- ${h.pilar} > ${h.subtema} (${h.formato})`)
        .join("\n")}`
    : ""
}

=== INSTRUCCIONES ===

Genera exactamente 10 ideas de contenido que:
1. Usen SOLO pilares, subtemas y ángulos del árbol del creador
2. Varíen entre los distintos pilares (no concentres todo en uno)
3. Usen formatos variados adaptados a los canales del creador
4. Hablen directamente a los dolores y deseos del buyer persona
5. Sean específicas — con un titular concreto, no genérico

Responde SOLO con un JSON array (sin markdown, sin backticks):
[
  {
    "pilar": "nombre del pilar",
    "subtema": "subtema del árbol",
    "angulo": "ángulo narrativo",
    "formato": "formato concreto (post, reel, carrusel, newsletter, etc.)",
    "canal": "canal principal",
    "titular": "Titular concreto y atractivo para esta pieza"
  }
]`;

    const anthropic = new Anthropic({ apiKey: profile.api_key });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: "Genera 10 ideas de contenido basadas en mi perfil completo.",
        },
      ],
      system: systemPrompt,
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let suggestions;
    try {
      suggestions = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No se pudieron generar las sugerencias");
      }
    }

    return NextResponse.json({ suggestions });
  } catch (err: any) {
    console.error("Export suggestions error:", err);
    return NextResponse.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
