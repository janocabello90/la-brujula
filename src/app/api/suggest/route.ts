import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { FORMAT_MAP } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const { userId, selection, ideaText, ideaId } = await request.json();

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
      buyers: brujulaData.buyers || (brujulaData.buyer?.nombre ? [brujulaData.buyer] : []),
      empathy: brujulaData.empathy || {},
      insight: brujulaData.insight || {},
      tree: brujulaData.tree || { pilares: [] },
      channels: brujulaData.channels || { canales: [], objetivosPrincipales: [] },
    };

    const formatosDisponibles = selection.energia
      ? FORMAT_MAP[selection.energia] || []
      : [];

    const systemPrompt = `Eres un director creativo con mucho criterio. No eres complaciente. No das ideas genéricas. Piensas como alguien que ha trabajado 20 años en publicidad y ahora ayuda a creadores a encontrar su voz.

Tu trabajo: dado el perfil de un creador y su momento actual, sugerir UNA pieza de contenido que sea realmente buena. No correcta. Buena. Con ángulo, con chispa, con algo que haga que alguien pare de hacer scroll.

=== QUIÉN ES ESTE CREADOR ===

Se dedica a: ${state.briefing.temaRaiz || "No definido"}
Propuesta de valor: ${state.briefing.propuestaValor || "No definida"}
Se presenta como: ${state.briefing.etiquetaProfesional || "No definido"}
Lo que le hace diferente: ${state.briefing.porQueTu || "No definido"}

VERDAD ESTRATÉGICA (INSIGHT): ${state.insight.insight || "No definido"}
Lo que su audiencia diría: "${state.insight.fraseAudiencia || "No definida"}"

=== A QUIÉN LE HABLA ===

IMPORTANTE: Los buyer personas son EJEMPLOS representativos de su audiencia diversa. Este creador habla a profesionales de distintos sectores. Usa estos perfiles como referencia de tono, dolores y deseos — pero NO limites las sugerencias a una sola profesión o sector. El contenido debe ser universal dentro del tema raíz del creador.

${state.buyers.length > 0
  ? state.buyers.map((b: any, i: number) => `PERSONA ${i + 1}: ${b.nombre || "?"}, ${b.edad || "?"}, ${b.profesion || "?"}
  Lo que quiere: ${b.queQuiere || "No definido"}
  Lo que le frena: ${b.queLeFrena || "No definido"}
  Cómo habla: ${b.lenguaje || "No definido"}`).join("\n\n")
  : `Ejemplo de buyer persona: ${state.buyer.nombre || "?"}, ${state.buyer.edad || "?"}, ${state.buyer.profesion || "?"}
Lo que quiere: ${state.buyer.queQuiere || "No definido"}
Lo que le frena: ${state.buyer.queLeFrena || "No definido"}
Cómo habla: ${state.buyer.lenguaje || "No definido"}`}

EMOCIONES Y TENSIONES DE SU AUDIENCIA:
- Ve: ${state.empathy.queVe || "?"}
- Oye: ${state.empathy.queOye || "?"}
- Piensa/siente: ${state.empathy.quePiensaSiente || "?"}
- Dolores: ${state.empathy.dolores || "?"}
- Deseos: ${state.empathy.deseos || "?"}

=== SU UNIVERSO DE CONTENIDO ===

${state.tree.pilares
  .map(
    (p: any) =>
      `PILAR: ${p.nombre}\n  Subtemas: ${(p.subtemas || []).join(", ") || "ninguno"}\n  Ángulos que usa: ${(p.angulos || []).join(", ") || "todos los disponibles"}${(p.titulares || []).length > 0 ? `\n  Titulares de referencia (estilo del creador):\n${(p.titulares || []).map((t: string) => `    - "${t}"`).join("\n")}` : ""}`
  )
  .join("\n\n")}

Canales activos: ${(state.channels.canales || []).join(", ") || "No definidos"}
Objetivos generales: ${(state.channels.objetivosPrincipales || []).join(", ") || "No definidos"}

=== QUÉ NECESITA AHORA ===
- Objetivo: ${selection.objetivo || "No especificado"}
- Energía: ${selection.energia || "No especificado"}
- Canal: ${selection.canal || "No especificado"}
- Pilar preferido: ${selection.pilar || "Cualquiera — elige el que genere la pieza más potente"}
- Formatos posibles: ${formatosDisponibles.join(", ")}
${ideaText ? `\n=== IDEA QUE QUIERE DESARROLLAR ===\n"${ideaText}"\nUsa esta idea como semilla. No la copies literalmente — desarróllala, dale ángulo, busca lo que la hace interesante de verdad.` : ""}

${
  history.length > 0
    ? `=== HISTORIAL (no repitas) ===\n${history
        .slice(0, 5)
        .map((h: any) => `- ${h.pilar} > ${h.subtema} > ${h.angulo} (${h.formato})`)
        .join("\n")}`
    : ""
}

=== INSTRUCCIONES DE CALIDAD ===

TITULARES:
- Que sean ESPECÍFICOS, no genéricos. "5 errores de marca personal" es genérico. "Tu bio de Instagram dice más de ti de lo que crees" es específico.
- Que provoquen una reacción: curiosidad, identificación, incomodidad productiva o sorpresa.
- Que suenen a algo que dirías en una conversación, no a un artículo de blog corporativo.
- Da 3 opciones con estilos diferentes: uno provocador, uno curioso, uno directo.

GANCHO:
- La primera frase que abre la pieza. Debe enganchar desde la primera línea.
- Puede ser: una escena concreta, una pregunta incómoda, una afirmación que chirría, un dato que sorprende, una confesión.
- NUNCA empieces con "En el mundo de...", "Hoy en día...", "Alguna vez te has preguntado..." ni nada que suene a introducción de ensayo escolar.

PISTAS CREATIVAS:
- Son chispas, no instrucciones. Ideas sueltas que encienden la creatividad del creador.
- Tipos de pistas que funcionan: una analogía inesperada, un dato real concreto, una contradicción que explorar, una pregunta retórica potente, una referencia cultural (película, libro, personaje histórico), una experiencia cotidiana que todos reconocen, un "¿y si...?" que cambia la perspectiva.
- Cada pista: 1-2 frases. Concreta. Que al leerla el creador piense "hostia, eso es bueno".
- NUNCA pistas vagas tipo "habla de tu experiencia" o "comparte un ejemplo personal". Eso no vale.
- Da 4-6 pistas variadas en tipo.

ENFOQUE:
- La idea central en 1-2 frases. El "de qué va esto REALMENTE". No lo que parece ser, sino la verdad debajo.

CTA:
- Que cierre la pieza con intención. No un genérico "¿y tú qué opinas?". Algo que conecte con el enfoque.

TONO:
- Sugiere un tono concreto y matizado. No solo "cercano" o "profesional". Algo como "provocador pero cálido", "irónico y reflexivo", "directo con un punto vulnerable".

=== RESPUESTA ===

JSON válido sin markdown ni backticks:
{
  "pilar": "del árbol del creador",
  "subtema": "del árbol del creador",
  "angulo": "del árbol del creador",
  "tono": "matizado y específico",
  "formato": "de la lista de formatos posibles",
  "titulares": ["provocador", "curioso", "directo"],
  "gancho": "primera frase literal",
  "enfoque": "la idea central real",
  "pistas": ["chispa 1", "chispa 2", "chispa 3", "chispa 4"],
  "cta": "cierre con intención",
  "estrategia": "por qué funciona",
  "porQueAhora": "por qué ahora"
}`;

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

    // Mark idea as worked if coming from Ideas
    if (ideaId) {
      await supabase
        .from("ideas")
        .update({ status: "worked" })
        .eq("id", ideaId);
    }

    return NextResponse.json({ suggestion });
  } catch (err: any) {
    console.error("API suggest error:", err);
    return NextResponse.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
