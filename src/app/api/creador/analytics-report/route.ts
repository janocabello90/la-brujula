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

    // Get all published projects with analytics
    const { data: projects } = await supabase
      .from("creator_projects")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "published");

    if (!projects || projects.length === 0) {
      return NextResponse.json(
        {
          report:
            "No hay proyectos publicados con analítica. Publica contenido y registra métricas para generar un análisis.",
          insights: {
            bestPerforming: null,
            worstPerforming: null,
            recommendations: [],
          },
        },
        { status: 200 }
      );
    }

    // Filter projects with non-zero analytics
    const projectsWithAnalytics = projects.filter((p) => {
      const analytics = p.analytics || {};
      return (
        (analytics.views || 0) > 0 ||
        (analytics.likes || 0) > 0 ||
        (analytics.comments || 0) > 0
      );
    });

    if (projectsWithAnalytics.length === 0) {
      return NextResponse.json(
        {
          report:
            "No hay datos de analítica registrados aún. Comienza a registrar métricas para obtener insights.",
          insights: {
            bestPerforming: null,
            worstPerforming: null,
            recommendations: [],
          },
        },
        { status: 200 }
      );
    }

    // Build data summary for analysis
    const analyticsData = projectsWithAnalytics.map((p) => ({
      title: p.title,
      type: p.project_type,
      pilar: p.pilar,
      canal: p.canal,
      formato: p.formato,
      tono: p.tono,
      analytics: p.analytics || {},
    }));

    // Prepare system prompt for Claude
    const systemPrompt = `Eres un EXPERTO EN ANÁLISIS DE CONTENIDOS especializado en estrategia de marca personal.

Tu tarea: analizar los datos de desempeño de contenido y generar insights ACCIONABLES para mejorar futura creación.

DATOS DE DESEMPEÑO:
${JSON.stringify(analyticsData, null, 2)}

Analiza:
1. Qué temas, formatos y tonos FUNCIONAN mejor
2. Qué combos de pilar+canal+formato generan mejor engagement
3. Patrones de desempeño por tipo de contenido
4. Recomendaciones concretas para próximas piezas

Responde SOLO con JSON válido (sin markdown, sin backticks):

{
  "report": "Análisis ejecutivo de tu desempeño (3-4 párrafos). Sé específico con números y patrones.",
  "insights": {
    "bestPerforming": {
      "title": "nombre de la pieza mejor",
      "reason": "por qué funcionó esta pieza específicamente"
    },
    "worstPerforming": {
      "title": "nombre de la pieza que menos",
      "reason": "qué falló y cómo mejorar"
    },
    "recommendations": [
      "recomendación concreta 1",
      "recomendación concreta 2",
      "recomendación concreta 3"
    ]
  }
}`;

    const anthropic = new Anthropic({ apiKey: profile.api_key });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content:
            "Analiza mis datos de desempeño y dame insights para mejorar mi estrategia de contenidos.",
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error(
          "No se pudo interpretar el análisis de desempeño"
        );
      }
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("API creador analytics-report error:", err);
    return NextResponse.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
