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

    const { projectId, message: userMessage, history } = await request.json();

    if (!projectId || !userMessage) {
      return NextResponse.json(
        { error: "Datos requeridos faltantes" },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: project } = await supabase
      .from("creator_projects")
      .select("*")
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

    const state = {
      briefing: brujulaData?.briefing || {},
      buyer: brujulaData?.buyer || {},
      insight: brujulaData?.insight || {},
      tree: brujulaData?.tree || { pilares: [] },
    };

    // Build system prompt
    const systemPrompt = `Eres MAESTRO IA, un asistente creativo especializado en contenidos de marca personal.

Estás incrustado en El Sistema de Buena Vida, ayudando al creador a desarrollar su pieza de contenido.

CONTEXTO DEL CREADOR:
- Tema: ${state.briefing.temaRaiz || "No definido"}
- Propuesta: ${state.briefing.propuestaValor || "No definida"}
- Audiencia: ${state.buyer.nombre || "No definida"}
- Insight: ${state.insight.insight || "No definido"}

PIEZA ACTUAL:
- Tipo: ${project.project_type}
- Pilar: ${project.pilar || "Flexible"}
- Canal: ${project.canal || "Flexible"}
- Tono: ${project.tono || "Flexible"}
- Contenido: ${JSON.stringify(project.content || {})}

TU ROL:
- Eres específico, provocador y útil
- Ayudas a mejorar y optimizar el contenido
- Hablas el lenguaje de la audiencia del creador
- Sugiere ángulos narrativos concretos, no genéricos
- Responde SIEMPRE en español
- Sé directo y práctico, no filosófico
- Si el creador te da feedback, evoluciona la propuesta`;

    // Save user message to history
    await supabase.from("creator_chat_history").insert({
      project_id: projectId,
      user_id: user.id,
      role: "user",
      content: userMessage,
    });

    // Prepare messages for Claude
    const messages = [
      ...(history || []).map((h: any) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user" as const, content: userMessage },
    ];

    // Call Claude with streaming
    const anthropic = new Anthropic({ apiKey: profile.api_key });

    const stream = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
      stream: true,
    });

    // Collect full response for saving
    let fullResponse = "";

    // Create streaming response
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              fullResponse += event.delta.text;
              controller.enqueue(
                new TextEncoder().encode(event.delta.text)
              );
            }
          }

          // Save assistant response to history
          if (fullResponse) {
            await supabase.from("creator_chat_history").insert({
              project_id: projectId,
              user_id: user.id,
              role: "assistant",
              content: fullResponse,
            });
          }

          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err: any) {
    console.error("API creador chat error:", err);
    return NextResponse.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
