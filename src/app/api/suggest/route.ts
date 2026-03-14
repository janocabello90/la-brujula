import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { FORMAT_MAP } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const { userId, selection } = await request.json();

    if (!userId || !selection) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
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
        { error: "No hay datos de La Brújula. Completa el onboarding primero." },
        { status: 400 }
      );
    }

    // Get history
    const { data: historyData } = await supabase
      .from("suggestion_history")
      .select("suggestion")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    const history = historyData?.map((h) => h.suggestion) || [];

    // Build the system prompt (ported from HTML prototype)
    const state = {
      briefing: brujulaData.briefing || {},
      buyer: brujulaData.buyer || {},
      empathy: brujulaData.empathy || {},
      insight: brujulaData.insight || {},
      tree: brujulaData.tree || { pilares: [] },
      channels: brujulaData.channels || { canales: [], objetivosPrincipales: [] },
    };

    const formatosDisponibles = selection.energia
      ? FORMAT_MAP[selection.energia] || []
      : [];

    const systemPrompt = `Eres el MAESTRO DE CONTENIDO — un director creativo senior especializado en marca personal y estrategia de contenidos.

Tu trabajo: analizar el perfil completo del creador y, dado su estado actual (objetivo, energía, canal), sugerir LA pieza de contenido perfecta para este momento.

=== PERFIL DEL CREADOR ===

BRIEFING:
- Tema raíz: ${state.briefing.temaRaiz || "No definido"}
- Propuesta de valor: ${state.briefing.propuestaValor || "No definida"}
- Etiqueta profesional: ${state.briefing.etiquetaProfesional || "No definida"}
- ¿Por qué tú?: ${state.briefing.porQueTu || "No definido"}

BUYER PERSONA:
- Nombre: ${state.buyer.nombre || "No definido"} | Edad: ${state.buyer.edad || "?"} | Profesión: ${state.buyer.profesion || "?"}
- Qué quiere: ${state.buyer.queQuiere || "No definido"}
- Qué le frena: ${state.buyer.queLeFrena || "No definido"}
- Qué consume: ${state.buyer.queConsumo || "No definido"}
- Dónde está: ${state.buyer.dondeEsta || "No definido"}
- Lenguaje: ${state.buyer.lenguaje || "No definido"}

MAPA DE EMPATÍA:
- Qué ve: ${state.empathy.queVe || "No definido"}
- Qué oye: ${state.empathy.queOye || "No definido"}
- Qué dice/hace: ${state.empathy.queDiceHace || "No definido"}
- Qué piensa/siente: ${state.empathy.quePiensaSiente || "No definido"}
- Dolores: ${state.empathy.dolores || "No definido"}
- Deseos: ${state.empathy.deseos || "No definido"}

INSIGHT: ${state.insight.insight || "No definido"}
FRASE DE AUDIENCIA: "${state.insight.fraseAudiencia || "No definida"}"

ÁRBOL DE CONTENIDOS:
${state.tree.pilares
  .map(
    (p: any) =>
      `- Pilar: ${p.nombre}\n  Subtemas: ${(p.subtemas || []).join(", ") || "ninguno"}\n  Ángulos: ${(p.angulos || []).join(", ") || "ninguno"}`
  )
  .join("\n")}

CANALES: ${(state.channels.canales || []).join(", ") || "No definidos"}
OBJETIVOS: ${(state.channels.objetivosPrincipales || []).join(", ") || "No definidos"}

=== VARIABLES DEL MOMENTO ===
- Objetivo actual: ${selection.objetivo || "No especificado"}
- Nivel de energía: ${selection.energia || "No especificado"}
- Canal elegido: ${selection.canal || "No especificado"}
- Pilar preferido: ${selection.pilar || "Cualquiera (elige tú el mejor)"}
- Formatos posibles para esta energía: ${formatosDisponibles.join(", ")}

${
  history.length > 0
    ? `=== HISTORIAL RECIENTE (evita repetir) ===\n${history
        .slice(0, 5)
        .map((h: any) => `- ${h.pilar} > ${h.subtema} > ${h.angulo} (${h.formato})`)
        .join("\n")}`
    : ""
}

=== TU RESPUESTA ===

Responde SOLO con un JSON válido (sin markdown, sin backticks) con esta estructura:
{
  "pilar": "nombre del pilar elegido",
  "subtema": "subtema específico",
  "angulo": "ángulo narrativo elegido",
  "tono": "tono recomendado (ej: cercano, provocador, reflexivo...)",
  "formato": "formato específico de la lista de formatos posibles",
  "titulares": ["Titular opción 1", "Titular opción 2", "Titular opción 3"],
  "gancho": "La frase o pregunta de apertura que engancha desde el segundo 1 o la primera línea",
  "enfoque": "En 1-2 frases, la idea central y el ángulo desde el que atacar esta pieza",
  "pistas": ["Pista creativa 1: una referencia, dato, analogía o idea concreta para desarrollar", "Pista creativa 2: ...", "Pista creativa 3: ...", "Pista creativa 4: ..."],
  "cta": "El cierre o llamada a la acción que debe dejar la pieza",
  "estrategia": "En 1-2 frases, por qué esta pieza funciona estratégicamente dado el objetivo y el perfil",
  "porQueAhora": "En 1 frase, por qué esta pieza tiene sentido AHORA"
}

IMPORTANTE:
- Elige subtemas y ángulos del árbol del creador, no inventes nuevos
- El formato DEBE ser de la lista de formatos posibles para su energía
- Los titulares deben ser 3 opciones reales, listas para usar, con gancho
- Las pistas son IDEAS SUELTAS para inspirar: datos curiosos, analogías, referencias culturales, preguntas retóricas, experiencias comunes, contradicciones... NO párrafos largos
- Cada pista debe ser 1-2 frases máximo, concreta y accionable
- Da entre 4 y 6 pistas variadas
- El gancho debe ser la primera frase literal que abra la pieza
- Si hay historial, NO repitas combinaciones recientes`;

    // Call Anthropic
    const anthropic = new Anthropic({ apiKey: profile.api_key });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: "Genera la sugerencia de contenido basándote en mi perfil y las variables del momento.",
        },
      ],
      system: systemPrompt,
    });

    // Parse response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let suggestion;
    try {
      // Try to parse JSON directly
      suggestion = JSON.parse(responseText);
    } catch {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestion = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No se pudo interpretar la respuesta del Maestro");
      }
    }

    // Save to history
    const historyEntry = {
      ...suggestion,
      date: new Date().toISOString().split("T")[0],
      objetivo: selection.objetivo,
      energia: selection.energia,
    };

    await supabase.from("suggestion_history").insert({
      user_id: userId,
      suggestion: historyEntry,
      variables: selection,
    });

    return NextResponse.json({ suggestion });
  } catch (err: any) {
    console.error("API suggest error:", err);
    return NextResponse.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
