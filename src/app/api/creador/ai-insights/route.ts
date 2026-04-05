import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { projectId, projectType, content, pilar, canal, tono } =
      await request.json();

    if (!projectId || !projectType) {
      return NextResponse.json(
        { error: "Datos de proyecto requeridos" },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: project } = await supabase
      .from("creator_projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      );
    }

    // Get user profile with API key
    const { data: profile } = await supabase
      .from("profiles")
      .select("api_key")
      .eq("id", user.id)
      .single();

    if (!profile?.api_key) {
      return NextResponse.json(
        { error: "API Key no configurada. Ve a Ajustes para añadirla." },
        { status: 400 }
      );
    }

    // Get brujula data for context
    const { data: brujulaData } = await supabase
      .from("brujula_data")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!brujulaData) {
      return NextResponse.json(
        { error: "No hay datos de La Brújula. Completa el onboarding primero." },
        { status: 400 }
      );
    }

    const state = {
      briefing: brujulaData.briefing || {},
      buyer: brujulaData.buyer || {},
      insight: brujulaData.insight || {},
      tree: brujulaData.tree || { pilares: [] },
    };

    const systemPrompt = `Eres un EXPERTO EN CONTENIDO creativo y estratégico, especializado en marca personal.

Tu tarea: analizar el contenido que el creador está desarrollando y generar INSIGHTS creativo-estratégicos que le ayuden a mejorar y optimizar su pieza.

=== CONTEXTO DEL CREADOR ===

BRIEFING:
- Tema raíz: ${state.briefing.temaRaiz || "No definido"}
- Propuesta de valor: ${state.briefing.propuestaValor || "No definida"}
- ¿Por qué tú?: ${state.briefing.porQueTu || "No definido"}

BUYER PERSONA:
- ${state.buyer.nombre || "Audiencia"}: ${state.buyer.queQuiere || "No definido"}
- Lenguaje: ${state.buyer.lenguaje || "No definido"}

INSIGHT DE MARCA:
${state.insight.insight || "No definido"}

=== CONTENIDO ACTUAL ===

Tipo: ${projectType}
Pilar: ${pilar || "No especificado"}
Canal: ${canal || "No especificado"}
Tono: ${tono || "No especificado"}
Contenido: ${typeof content === "string" ? content : JSON.stringify(content)}

=== TU RESPUESTA ===

Genera SOLO un JSON válido (sin markdown, sin backticks) con esta estructura exacta:

{
  "titulares": ["opción 1", "opción 2", "opción 3"],
  "gancho_apertura": "El gancho perfecto para captar atención en los primeros 3 segundos",
  "enfoque": "Cuál es el enfoque narrativo principal en 1-2 frases directas",
  "pistas_creativas": ["chispa 1", "chispa 2", "chispa 3", "chispa 4", "chispa 5"],
  "cierre_cta": "Cómo cerrar el contenido con una CTA específica y natural",
  "estrategia": "Por qué este enfoque funciona estratégicamente para tu audiencia",
  "por_que_ahora": "Por qué este contenido tiene sentido en este momento específico"
}

IMPORTANTE:
- Los titulares deben ser específicos, no genéricos
- El gancho debe ser provocador y captar atención inmediata
- Las pistas creativas deben ser angles narrativos, no temas
- Sé concreto y útil, no vago
- Respeta el tono y la estrategia del creador`;

    const anthropic = new Anthropic({ apiKey: profile.api_key });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content:
            "Genera los insights para optimizar este contenido basándote en el contexto de mi marca.",
        },
      ],
      system: systemPrompt,
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let insights;
    try {
      insights = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No se pudo interpretar los insights");
      }
    }

    // Save insights to project
    await supabase
      .from("creator_projects")
      .update({ ai_insights: insights, updated_at: new Date().toISOString() })
      .eq("id", projectId);

    return NextResponse.json({ insights });
  } catch (err: any) {
    console.error("API creador ai-insights error:", err);
    return NextResponse.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
