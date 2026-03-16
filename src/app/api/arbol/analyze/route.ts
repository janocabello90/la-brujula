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

    // Get API key
    const { data: profile } = await supabase
      .from("profiles")
      .select("api_key, display_name")
      .eq("id", userId)
      .single();

    if (!profile?.api_key) {
      return NextResponse.json(
        { error: "API Key no configurada. Ve a Ajustes para añadirla." },
        { status: 400 }
      );
    }

    // Get árbol data
    const { data: arbolData } = await supabase
      .from("arbol_data")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!arbolData) {
      return NextResponse.json(
        { error: "No hay datos del Árbol. Complétalo primero." },
        { status: 400 }
      );
    }

    const nombre = profile.display_name || "esta persona";

    const anthropic = new Anthropic({ apiKey: profile.api_key });

    const arbolJson = JSON.stringify({
      semilla: arbolData.semilla,
      raices: arbolData.raices,
      tronco: arbolData.tronco,
      ramas: arbolData.ramas,
      copa: arbolData.copa,
      frutos: arbolData.frutos,
      entorno: arbolData.entorno,
      tiempo: arbolData.tiempo,
      cofre: arbolData.cofre,
    }, null, 2);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: `Eres un experto en marca personal y estrategia de contenido. Analiza "El Árbol de la Marca Personal" de ${nombre} y genera un análisis profundo.

DATOS DEL ÁRBOL:
${arbolJson}

Responde SIEMPRE en formato JSON con esta estructura exacta (sin markdown, solo JSON puro):

{
  "resumen": "Un párrafo de 3-4 frases que capture la esencia de esta marca personal. Dirígete a la persona en segunda persona (tú). Sé concreto, no genérico.",
  "personalidad": "Descripción de su personalidad de marca basada en sus arquetipos, tono, energía y presencia. 2-3 frases.",
  "fortalezas": ["3-5 fortalezas claras de esta marca personal"],
  "alertas": ["2-3 cosas que faltan, son débiles o contradictorias en su árbol"],
  "tonoRecomendado": "El tono de comunicación ideal según su copa, arquetipos y energía. 1-2 frases concretas con ejemplos.",
  "narrativaRecomendada": "La narrativa que debería usar esta marca. Qué historia contar y cómo contarla. 2-3 frases.",
  "audienciaInsight": "Insight sobre su audiencia ideal cruzando entorno + frutos + tronco. 2-3 frases.",
  "siguientesPasos": ["4-6 acciones concretas y priorizadas que debería tomar ahora mismo"],
  "fraseMarca": "Una frase de posicionamiento tipo tagline que capture su esencia basándose en todo el árbol."
}

REGLAS:
- Sé directo, concreto, sin rodeos. Habla en segunda persona.
- No uses lenguaje genérico tipo "tu marca es única". Basa todo en los DATOS reales.
- Si alguna sección está vacía, menciónalo como alerta.
- Los siguientes pasos deben ser accionables y referir a las herramientas (La Brújula, El Maestro, El Planificador).
- La frase de marca debe ser memorable y auténtica, no un cliché.`
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON response
    let analysis;
    try {
      // Try to extract JSON from potential markdown code blocks
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      return NextResponse.json(
        { error: "Error al procesar la respuesta de la IA." },
        { status: 500 }
      );
    }

    // Also compute Brújula sync suggestions
    const syncSuggestions: Record<string, any> = {};

    // From Copa → tone for Brújula
    if (arbolData.copa?.tonoDeVoz) {
      syncSuggestions.tono = arbolData.copa.tonoDeVoz;
    }
    // From Tronco → tema and propuesta
    if (arbolData.tronco?.temaPrincipal) {
      syncSuggestions.temaRaiz = arbolData.tronco.temaPrincipal;
    }
    if (arbolData.tronco?.propuestaValor) {
      syncSuggestions.propuestaValor = arbolData.tronco.propuestaValor;
    }
    // From Entorno → channels
    if (arbolData.entorno?.dondeEstan?.length > 0) {
      syncSuggestions.canales = arbolData.entorno.dondeEstan;
    }
    // From Copa → arquetipos for narrative context
    if (arbolData.copa?.arquetipos?.length > 0) {
      syncSuggestions.arquetipos = arbolData.copa.arquetipos;
    }
    if (arbolData.copa?.narrativa) {
      syncSuggestions.narrativa = arbolData.copa.narrativa;
    }
    if (arbolData.copa?.energia) {
      syncSuggestions.energia = arbolData.copa.energia;
    }

    return NextResponse.json({ analysis, syncSuggestions });
  } catch (err: any) {
    if (err?.status === 401) {
      return NextResponse.json(
        { error: "Tu API Key no es válida. Revísala en Ajustes." },
        { status: 401 }
      );
    }
    if (err?.status === 429) {
      return NextResponse.json(
        { error: "Has superado el límite de peticiones. Espera un momento e inténtalo de nuevo." },
        { status: 429 }
      );
    }
    console.error("Arbol analyze error:", err);
    return NextResponse.json(
      { error: "Error al analizar el árbol." },
      { status: 500 }
    );
  }
}
