import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { userId, moduleId } = await request.json();

    if (!userId || !moduleId) {
      return NextResponse.json(
        { error: "Se requieren userId y moduleId" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Fetch user journey to get module details
    const { data: journey, error: journeyError } = await supabase
      .from("user_journey")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (journeyError || !journey) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Find the module
    const rutaModule = journey.ruta_modulos?.find((m: any) => m.id === moduleId);
    if (!rutaModule) {
      return NextResponse.json(
        { error: "Módulo no encontrado" },
        { status: 404 }
      );
    }

    // Fetch all user data needed for context
    const [
      { data: piramideData },
      { data: arbolData },
      { data: brujulaData },
      { data: profileData },
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
        .from("profiles")
        .select("api_key")
        .eq("id", userId)
        .single(),
    ]);

    // Check if user has API key
    if (!profileData?.api_key) {
      return NextResponse.json(
        { error: "No hay API key configurada. Por favor, añádela en Configuración." },
        { status: 400 }
      );
    }

    // Build the context prompt
    const buildContextPrompt = () => {
      let context = "";

      if (piramideData) {
        context += `## Pirámide del Usuario\n`;
        if (piramideData.bajo_tierra) {
          const bt = piramideData.bajo_tierra;
          context += `
### Bajo Tierra (Propósito & Mercado)
- Historia: ${bt.historia || "(no completado)"}
- Propósito: ${bt.proposito || "(no completado)"}
- Valores: ${bt.valores || "(no completado)"}
- Desafío Clave: ${bt.desafio_clave || "(no completado)"}
`;
        }
        if (piramideData.nivel_1) {
          const n1 = piramideData.nivel_1;
          context += `
### Nivel 1 (Quién Eres)
- Expertise/Superpower: ${n1.superpower || "(no completado)"}
- Habilidades Clave: ${n1.habilidades || "(no completado)"}
- Diferenciadores: ${n1.diferenciadores || "(no completado)"}
`;
        }
        if (piramideData.nivel_2) {
          const n2 = piramideData.nivel_2;
          context += `
### Nivel 2 (Qué Ofreces)
- Tema/Expertise: ${n2.tema || "(no completado)"}
- Propuesta de Valor: ${n2.propuesta_valor || "(no completado)"}
- Mercado/Nicho: ${n2.mercado || "(no completado)"}
`;
        }
      }

      if (arbolData) {
        context += `\n## Árbol del Marca Personal\n`;
        const sections = [
          { key: "semilla", label: "Semilla (Propósito)" },
          { key: "raices", label: "Raíces (Historia/Valores)" },
          { key: "tronco", label: "Tronco (Tema Principal)" },
          { key: "ramas", label: "Ramas (Pasiones/Diversidad)" },
          { key: "copa", label: "Copa (Presencia/Arquetipos)" },
          { key: "entorno", label: "Entorno (Audiencia)" },
          { key: "cofre", label: "Cofre (Productos)" },
        ];
        for (const sec of sections) {
          const data = (arbolData as any)[sec.key];
          if (data) {
            context += `\n### ${sec.label}\n`;
            const filled = Object.entries(data)
              .filter(([, v]) => {
                if (Array.isArray(v)) return v.length > 0;
                if (typeof v === "string") return (v as string).trim().length > 0;
                return false;
              })
              .map(([k, v]) => {
                if (Array.isArray(v)) {
                  return `- ${k}: ${(v as any[]).join(", ")}`;
                }
                return `- ${k}: ${String(v).substring(0, 100)}...`;
              })
              .join("\n");
            context += filled || "(incompleto)";
          }
        }
      }

      if (brujulaData) {
        context += `\n## Brújula (Estrategia)\n`;
        if (brujulaData.briefing) {
          context += `
### Briefing
- Tema Raíz: ${brujulaData.briefing.temaRaiz || "(no completado)"}
- Propuesta de Valor: ${brujulaData.briefing.propuestaValor || "(no completado)"}
- Etiqueta Profesional: ${brujulaData.briefing.etiquetaProfesional || "(no completado)"}
`;
        }
        if (brujulaData.buyers?.length > 0) {
          context += `\n### Buyer Persona (Principal)\n`;
          const buyer = brujulaData.buyers[0];
          context += `- Nombre: ${buyer.nombre || "(no completado)"}
- Quién es / Qué quiere: ${buyer.queQuiere || "(no completado)"}
- Qué le frena: ${buyer.queLeFrena || "(no completado)"}
- Dónde está: ${buyer.dondeEsta || "(no completado)"}
`;
        }
        if (brujulaData.tree?.pilares?.length > 0) {
          context += `\n### Pilares de Contenido\n`;
          brujulaData.tree.pilares.slice(0, 3).forEach((p: any) => {
            context += `- ${p.nombre}: ${p.subtemas?.slice(0, 2).join(", ") || ""}
`;
          });
        }
      }

      if (journey.diagnostico_coherencia) {
        context += `\n## Diagnóstico de Coherencia\n`;
        context += `- Score: ${journey.diagnostico_coherencia.score || 0}/100
- Perfil: ${journey.perfil_diagnostico || "N/A"}
- Ruta: ${journey.ruta_asignada || "N/A"}
`;
        if (journey.diagnostico_coherencia.fortalezas?.length > 0) {
          context += `- Fortalezas: ${journey.diagnostico_coherencia.fortalezas.slice(0, 2).join("; ")}
`;
        }
        if (journey.diagnostico_coherencia.grietas?.length > 0) {
          context += `- Áreas a trabajar: ${journey.diagnostico_coherencia.grietas.slice(0, 2).join("; ")}
`;
        }
      }

      return context;
    };

    const contextPrompt = buildContextPrompt();

    // Build the main system prompt as MIGA (the marketing coach)
    const systemPrompt = `Eres MIGA, el coach de marca personal de Buena Vida. Tu rol es actuar como estratega de marketing personal, leyendo los datos profundos del usuario y generando sesiones personalizadas de estrategia.

Eres:
- Directo pero cálido. No falsamente positivo, pero siempre esperanzador.
- Estratégico. Cada tarea debe tener un propósito claro en el viaje de marca personal.
- Práctico. Las tareas son concretas, ejecutables, con herramientas específicas de la plataforma.
- Contextual. Lees TODO el data del usuario: Pirámide, Árbol, Brújula, diagnóstico. Eres específico con sus datos reales, no genérico.

Tono de voz: directo, un poco irónico, respetuoso del usuario pero sin miedo a decir verdades difíciles. En español, casual pero profesional.

${contextPrompt}`;

    const userPrompt = `El usuario está en el módulo: "${rutaModule.nombre}"

Objetivo de este módulo: ${rutaModule.objetivo || "Avanzar en su ruta de marca personal"}

Contexto estratégico: ${rutaModule.promptContext || ""}

Herramientas disponibles en la plataforma:
- La Pirámide (/piramide) - Autoconocimiento profundo
- El Árbol (/arbol) - Coherencia de marca
- La Brújula (/dashboard) - Estrategia de contenido y audiencia
- El Maestro (/maestro) - Generador de contenido con IA
- El Planificador (/planner) - Calendario de contenido
- Piezas (/piezas) - Gestor de contenido creado
- Ideas (/ideas) - Banco de ideas
- El Espejo (/espejo) - Reflejo de datos en un lugar

Tu tarea:
1. Lee el contexto del usuario (arriba)
2. Genera UN insight estratégico corto (2-3 frases) que conecte su situación actual con el objetivo de este módulo
3. Genera EXACTAMENTE 3 tareas concretas que lo muevan hacia adelante
4. Cada tarea debe:
   - Tener un título claro y direccionador
   - Una descripción que explique POR QUÉ importa (no solo QUÉ hacer)
   - Nombrar la herramienta específica a usar (pirámide, arbol, maestro, etc.)
   - Incluir el link a esa herramienta
   - Una acción específica ("Abre El Maestro, selecciona tu pilar principal y genera 3 variaciones de contenido sobre...")
5. Cierra con una reflexión provocadora: una pregunta o insight que lo haga pensar más profundo

RESPONDE EN JSON con esta estructura exacta:
{
  "insight": "Frase corta diciendo dónde está y por qué este módulo importa",
  "tareas": [
    {
      "titulo": "Título de la tarea",
      "descripcion": "Por qué importa esta tarea en su contexto",
      "herramienta": "maestro|arbol|piramide|brujula|planner|piezas|ideas|espejo",
      "link": "/maestro (etc)",
      "accion": "Acción muy específica. Ej: Abre El Maestro, selecciona..."
    },
    ... (3 total)
  ],
  "reflexion": "Una pregunta o insight que lo haga pensar"
}

¡Sé específico con sus datos! Referencia su tema, su audiencia, sus valores. No seas genérico.`;

    // Call Claude API with user's API key
    const client = new Anthropic({
      apiKey: profileData.api_key,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Parse the response
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Extract JSON from the response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from Claude response");
    }

    const strategy = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      strategy,
    });
  } catch (err: any) {
    console.error("Generate strategy error:", err);

    if (err.message?.includes("API key")) {
      return NextResponse.json(
        {
          error:
            "La API key del usuario no es válida. Por favor, verifica tu configuración en Ajustes.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al generar la estrategia. Por favor, intenta de nuevo." },
      { status: 500 }
    );
  }
}
