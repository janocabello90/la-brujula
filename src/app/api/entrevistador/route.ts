import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { userId, messages, estilo, sessionId } = await request.json();

    // Validate inputs
    if (!userId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Faltan datos: userId, messages son requeridos" },
        { status: 400 }
      );
    }

    if (!estilo || !["profundo", "inspirador", "divertido", "cotilla"].includes(estilo)) {
      return NextResponse.json(
        { error: "Estilo no válido. Debe ser: profundo, inspirador, divertido o cotilla" },
        { status: 400 }
      );
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

    // Load all user context in parallel
    const [
      { data: piramideData },
      { data: arbolData },
      { data: brujulaData },
      { data: userJourney },
      { data: frasesData },
      { count: sessionCount },
    ] = await Promise.all([
      supabase
        .from("piramide_data")
        .select("*")
        .eq("user_id", userId)
        .single(),
      supabase
        .from("arbol_data")
        .select("*")
        .eq("user_id", userId)
        .single(),
      supabase
        .from("brujula_data")
        .select("*")
        .eq("user_id", userId)
        .single(),
      supabase
        .from("user_journey")
        .select("*")
        .eq("user_id", userId)
        .single(),
      supabase
        .from("entrevistador_frases")
        .select("frase, contexto")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("entrevistador_sessions")
        .select("id", { count: "exact" })
        .eq("user_id", userId),
    ]);

    if (!brujulaData) {
      return NextResponse.json(
        { error: "No hay datos de La Brújula. Completa el onboarding primero." },
        { status: 400 }
      );
    }

    // Build personality descriptions based on estilo
    const personalities = {
      profundo: `Eres un entrevistador de largo formato, como los mejores podcasters. Profundo, reflexivo, lúcido.
Te encanta hacer preguntas que van al corazón de las cosas. No te conformas con respuestas superficiales.
Cuando alguien dice algo, inmediatamente ves las capas debajo. Haces pausas incómodas (en el buen sentido) que invitan a la verdad.
Conectas puntos que la gente no había conectado: "Espera, hace un minuto dijiste X, pero también mencionaste Y — ¿cómo se relacionan?".
Tu ritmo es lento. Una pregunta por turno. Das espacio para que la gente piense.
Hablas como alguien que ha escuchado miles de historias y sabe dónde está la magia real.`,

      inspirador: `Eres cálido, genuinamente curioso, celebrador. Como Oprah en sus mejores momentos: haces que la gente se sienta VISTA.
Tu superpoder es reflejar la grandeza que el otro no ve en sí mismo todavía.
Eres empático pero no falso. Cuando algo es genuinamente bonito, lo dices. Cuando algo es valiente, lo nombras.
Tu pregunta no es para sacarte de dudas. Es para que ellos se redescubran a sí mismos.
Eres un espejo que amplifica lo positivo sin negar la sombra.
Tu tono es: "Cuéntame más de esto porque veo algo hermoso aquí y quiero entenderlo mejor".`,

      divertido: `Eres ingenio y buena energía. Como los mejores late-night hosts: usas el humor para BAJAR la guardia de la gente.
El humor es tu herramienta para llegar a verdades incómodas sin que duela tanto.
No eres sarcástico de forma hiriente. Eres juguetón. Cómplice. Como un amigo que te pone en un brete para que te rías de ti mismo.
Eres rápido, observador, captas la ironía de las cosas.
Pero bajo el humor está la verdad. No es vacío. Es diversión CON propósito.
Tu tono es: "Venga, cuenta. Sé que hay una historia jugosa aquí y vamos a sacarla con una sonrisa".`,

      cotilla: `Eres curiosidad pura. Nosy pero con cariño. Como esa amiga que se toma un café contigo y NO PARA de preguntar porque realmente le importas.
No tienes filtros sociales tontos. Si algo es interesante, lo preguntas directo.
"Espera, espera, espera — vuelve a eso. ¿Qué pasó exactamente? No, en serio, cuéntame TODA la historia".
Eres impulsiva, entusiasta, contagia energía. Cuando algo te sorprende, lo demuestras.
Pero tu curiosidad viene de un lugar de genuino interés en ENTENDER a esta persona.
Tu tono es: "Ay, cuéntame. Necesito todos los detalles".`,
    };

    // Format user data for context
    const piramideContext = piramideData
      ? `
PIRÁMIDE DE MARCA PERSONAL:
- Propósito: ${piramideData.proposito || "No definido"}
- Audiencia Principal: ${piramideData.audiencia_principal || "No definida"}
- Diferenciador: ${piramideData.diferenciador || "No definido"}
- Valores: ${piramideData.valores?.join(", ") || "No definidos"}
- Promesa de Valor: ${piramideData.promesa_valor || "No definida"}`
      : "";

    const arbolContext = arbolData
      ? `
ÁRBOL DE CONTENIDO:
Pilares y subtemas que dominas:
${
  arbolData.pilares
    ?.map(
      (p: any) =>
        `- ${p.nombre}: ${(p.subtemas || []).join(", ") || "Sin subtemas"}`
    )
    .join("\n") || "Sin pilares definidos"
}`
      : "";

    const brujulaContext = brujulaData
      ? `
LA BRÚJULA (ANÁLISIS ESTRATÉGICO):
- Briefing: ${brujulaData.briefing?.temaRaiz || "No definido"}
- Propuesta: ${brujulaData.briefing?.propuestaValor || "No definida"}
- Audiencia Insight: "${brujulaData.insight?.fraseAudiencia || "No definida"}"
- Buyer Persona Principal: ${brujulaData.buyer?.nombre || "No definido"}, ${brujulaData.buyer?.edad || "?"} años, ${brujulaData.buyer?.profesion || "?"}
  - Qué quiere: ${brujulaData.buyer?.queQuiere || "No definido"}
  - Qué le frena: ${brujulaData.buyer?.queLeFrena || "No definido"}`
      : "";

    const journeyContext = userJourney
      ? `
ETAPA DEL VIAJE: ${userJourney.etapa || "No definida"}
${userJourney.descripcion ? `Descripción: ${userJourney.descripcion}` : ""}`
      : "";

    const previousPhrases =
      frasesData && frasesData.length > 0
        ? `
FRASES DESTACADAS ANTERIORES (no repitas):
${frasesData.map((f: any) => `- "${f.frase}" (${f.contexto})`).join("\n")}`
        : "";

    const sessionCountContext = sessionCount || 0;

    // Build the system prompt
    const systemPrompt = `Eres un entrevistador de podcast para la marca personal. Tu rol es ayudar a alguien a descubrir y articular quiénes son REALMENTE.

${personalities[estilo as keyof typeof personalities]}

=== CONTEXTO DEL ENTREVISTADO ===

${piramideContext}

${arbolContext}

${brujulaContext}

${journeyContext}

Sesiones anteriores: ${sessionCountContext}

${previousPhrases}

=== CÓMO ENTREVISTAR ===

1. UNA PREGUNTA POR TURNO. Nunca dos. La brevedad es elegancia.

2. SIEMPRE específico. Conecta tus preguntas con datos reales de su perfil:
   - En lugar de: "¿Cuál es tu propósito?"
   - Pregunta: "Dijiste que tu propósito es [X] — ¿recuerdas el momento exacto en que lo supiste?"

   - En lugar de: "¿Qué te diferencia?"
   - Pregunta: "Vi que en tu árbol mencionas [Y]. ¿De dónde viene esa especialización? ¿Fue accidental o siempre lo supiste?"

3. REPREGUNTA Y PROFUNDIZA. Si sientes que hay más debajo, ve a por ello:
   - "Cuenta más..."
   - "¿Qué pasó entonces?"
   - "¿Cómo se sintió?"
   - "¿Qué te dio miedo de eso?"

4. MARCA FRASES DESTACADAS. Cuando algo sea potente, entrecomillado, real — envuelve en tags así:
   [FRASE_DESTACADA]la frase o idea potente aquí[/FRASE_DESTACADA]
   Hazlo NATURAL. No interrumpas el flujo. Solo marca lo que REALMENTE merece ser recordado.

5. MANTÉN TU TONO. No pierdas personalidad. Sé auténtico al estilo que elegiste.

6. SI ES EL PRIMER MENSAJE: Empieza con una bienvenida cálida y tu primera pregunta. Preséntate brevemente.

7. RESPUESTAS BREVES. Esto es una conversación, no un monólogo. Máximo 2-3 párrafos.

8. REFERENCIAS NATURALES. Teje los datos del perfil sin que suene a lectura. No digas "según tu Brújula...". Solo: "Dijiste que...", "Vi en tu árbol que...".

=== RESPUESTA ===

Solo el texto de tu respuesta. Sin JSON, sin marcadores raros, sin meta-explicaciones.
Sé el entrevistador. Habla español de España (Madrid, Barcelona, informal).`;

    // Call Anthropic with the conversation history
    const anthropic = new Anthropic({ apiKey: profile.api_key });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Extract highlighted phrases using regex
    const fraseRegex = /\[FRASE_DESTACADA\](.*?)\[\/FRASE_DESTACADA\]/g;
    const frases: Array<{ frase: string; contexto: string; pregunta: string }> =
      [];
    let match;

    // Find the last ASSISTANT message as context (the question that triggered the user's response)
    const lastAssistantQuestion = messages
      .slice()
      .reverse()
      .find((m: any) => m.role === "assistant")?.content || "";

    // Truncate to first 300 chars (just the question, not a wall of text)
    const truncatedQuestion = lastAssistantQuestion.length > 300
      ? lastAssistantQuestion.substring(0, 300) + "..."
      : lastAssistantQuestion;

    while ((match = fraseRegex.exec(responseText)) !== null) {
      frases.push({
        frase: match[1].trim(),
        contexto: estilo,
        pregunta: truncatedQuestion,
      });
    }

    // Remove tags from response text for clean display
    const cleanResponseText = responseText.replace(
      /\[FRASE_DESTACADA\](.*?)\[\/FRASE_DESTACADA\]/g,
      "$1"
    );

    // Handle session management
    let newSessionId = sessionId;

    if (!sessionId) {
      // Create new session
      const { data: newSession } = await supabase
        .from("entrevistador_sessions")
        .insert({
          user_id: userId,
          estilo: estilo,
          messages: messages,
        })
        .select("id")
        .single();

      newSessionId = newSession?.id;
    } else {
      // Update existing session with new messages
      await supabase
        .from("entrevistador_sessions")
        .update({
          messages: messages,
        })
        .eq("id", sessionId)
        .eq("user_id", userId);
    }

    // Save extracted phrases if any (only if we have a valid session)
    if (frases.length > 0 && newSessionId) {
      await supabase.from("entrevistador_frases").insert(
        frases.map((f) => ({
          user_id: userId,
          session_id: newSessionId,
          frase: f.frase,
          contexto: f.contexto,
          pregunta: f.pregunta,
        }))
      );
    }

    return NextResponse.json({
      response: cleanResponseText,
      frases: frases,
      sessionId: newSessionId,
    });
  } catch (err: any) {
    console.error("API entrevistador error:", err);

    // Handle Anthropic API auth errors specifically
    if (err?.status === 401 || err?.error?.type === "authentication_error") {
      return NextResponse.json(
        {
          error:
            "Tu API Key de Anthropic no es válida. Ve a Ajustes y comprueba que la has copiado bien (empieza por sk-ant-).",
        },
        { status: 401 }
      );
    }

    if (err?.status === 429) {
      return NextResponse.json(
        {
          error:
            "Has superado el límite de uso de tu API Key. Espera un momento o revisa tu plan en console.anthropic.com.",
        },
        { status: 429 }
      );
    }

    // Handle insufficient credits / billing errors
    if (err?.status === 400 && err?.error?.type === "invalid_request_error" &&
        (err?.message?.includes("credit balance") || err?.error?.message?.includes("credit balance"))) {
      return NextResponse.json(
        {
          error:
            "Tu cuenta de Anthropic no tiene créditos suficientes. Recarga en console.anthropic.com → Plans & Billing.",
        },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
