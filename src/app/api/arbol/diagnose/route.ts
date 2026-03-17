import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// ===== DIAGNOSTIC LOGIC =====
// Profile A: Cimientos débiles → Ruta Cimientos
// Profile B: Raíces fuertes, ramas/copa débiles → Ruta Visibilidad
// Profile C: Ramas/copa grandes, raíces/tronco flojos → Ruta Reconstrucción
// Profile D: Todo alineado pero sin entorno/difusión → Ruta Difusión

interface SectionScore {
  name: string;
  score: number; // 0-100
  weight: number;
  layer: "foundation" | "core" | "expression" | "reach";
}

// Route module definitions
const RUTA_MODULOS = {
  cimientos: [
    { id: "cim-1", nombre: "Redefine tu Semilla", descripcion: "Revisita tu propósito, visión e intención con las preguntas del Árbol. Sin semilla clara, nada crece.", completado: false, fecha_completado: null },
    { id: "cim-2", nombre: "Excava tus Raíces", descripcion: "Trabaja tu historia, creencias, valores e identidad. Lo que no se ve sostiene todo.", completado: false, fecha_completado: null },
    { id: "cim-3", nombre: "Fortalece el Tronco", descripcion: "Define tu tema principal, propuesta de valor y zona de genialidad. Aquí no vale el 'yo hablo de todo'.", completado: false, fecha_completado: null },
    { id: "cim-4", nombre: "Revisa la Pirámide", descripcion: "Vuelve a Bajo Tierra y Nivel 1. Tus objetivos y valores deben estar claros antes de construir.", completado: false, fecha_completado: null },
    { id: "cim-5", nombre: "Primer Contenido Auténtico", descripcion: "Crea tu primera pieza de contenido desde los cimientos. Usa El Maestro con tu nuevo briefing.", completado: false, fecha_completado: null },
  ],
  visibilidad: [
    { id: "vis-1", nombre: "Define tu Copa", descripcion: "Trabaja tus arquetipos, tono de voz, narrativa y energía. Esto es lo que el mundo ve de ti.", completado: false, fecha_completado: null },
    { id: "vis-2", nombre: "Estrategia de Contenido", descripcion: "Usa La Brújula para definir pilares, subtemas y ángulos. Tu mensaje necesita estructura.", completado: false, fecha_completado: null },
    { id: "vis-3", nombre: "Mapea tu Entorno", descripcion: "Define dónde está tu audiencia, quién es tu competencia y qué te diferencia.", completado: false, fecha_completado: null },
    { id: "vis-4", nombre: "Plan de Publicación", descripcion: "Usa El Planificador para crear tu primera semana de contenido. Constancia > viralidad.", completado: false, fecha_completado: null },
    { id: "vis-5", nombre: "Primeras 10 Piezas", descripcion: "Genera y publica 10 piezas con El Maestro. Mide qué resuena y ajusta.", completado: false, fecha_completado: null },
    { id: "vis-6", nombre: "Feedback Loop", descripcion: "Revisa métricas y ajusta tu estrategia. El algoritmo premia la coherencia.", completado: false, fecha_completado: null },
  ],
  reconstruccion: [
    { id: "rec-1", nombre: "Auditoría de Coherencia", descripcion: "Compara lo que dices que eres (raíces/tronco) con lo que muestras (copa/ramas). Encuentra las grietas.", completado: false, fecha_completado: null },
    { id: "rec-2", nombre: "Reconecta con tu Semilla", descripcion: "Tu propósito original puede haberse diluido. Vuelve a la pregunta: ¿por qué empezaste?", completado: false, fecha_completado: null },
    { id: "rec-3", nombre: "Redefine el Tronco", descripcion: "Ajusta tu tema principal y propuesta de valor. Que lo visible refleje lo invisible.", completado: false, fecha_completado: null },
    { id: "rec-4", nombre: "Poda las Ramas", descripcion: "Elimina lo que no te representa. Menos temas, más profundidad. Calidad > cantidad.", completado: false, fecha_completado: null },
    { id: "rec-5", nombre: "Nueva Narrativa", descripcion: "Reescribe tu historia de marca. Tu evolución es parte de tu autenticidad.", completado: false, fecha_completado: null },
    { id: "rec-6", nombre: "Transición Visible", descripcion: "Publica contenido que muestre tu transformación. Tu audiencia respeta la honestidad.", completado: false, fecha_completado: null },
  ],
  difusion: [
    { id: "dif-1", nombre: "Multiplica Canales", descripcion: "Tu mensaje es sólido. Ahora llévalo a más plataformas. Adapta formato, mantén esencia.", completado: false, fecha_completado: null },
    { id: "dif-2", nombre: "Colaboraciones Estratégicas", descripcion: "Identifica aliados potenciales de tu Entorno. Colaborar > competir.", completado: false, fecha_completado: null },
    { id: "dif-3", nombre: "Embudo de Conversión", descripcion: "Conecta contenido con productos. Usa El Cofre para empaquetar tu conocimiento.", completado: false, fecha_completado: null },
    { id: "dif-4", nombre: "Sistema de Contenido", descripcion: "Crea un sistema sostenible con El Planificador. Automatiza lo repetitivo, humaniza lo importante.", completado: false, fecha_completado: null },
    { id: "dif-5", nombre: "Escala con Coherencia", descripcion: "Más alcance sin perder autenticidad. Revisa tu Score de Coherencia regularmente.", completado: false, fecha_completado: null },
    { id: "dif-6", nombre: "Mide y Evoluciona", descripcion: "Usa las métricas del Nivel 4 de la Pirámide. Crece con intención, no por inercia.", completado: false, fecha_completado: null },
  ],
};

function countFilledFields(obj: any): { filled: number; total: number } {
  if (!obj || typeof obj !== "object") return { filled: 0, total: 0 };

  let filled = 0;
  let total = 0;

  for (const [, value] of Object.entries(obj)) {
    total++;
    if (value === null || value === undefined || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length > 0 && value.some((v) => v !== "" && v !== null)) filled++;
    } else if (typeof value === "object") {
      const inner = countFilledFields(value);
      // Count nested object as filled if at least half its fields are
      if (inner.total > 0 && inner.filled / inner.total >= 0.5) filled++;
    } else if (String(value).trim().length > 0) {
      filled++;
    }
  }
  return { filled, total };
}

function scoreSectionCompleteness(data: any): number {
  if (!data || typeof data !== "object") return 0;
  const { filled, total } = countFilledFields(data);
  if (total === 0) return 0;
  return Math.round((filled / total) * 100);
}

function scoreStringDepth(value: string | undefined | null): number {
  if (!value) return 0;
  const len = value.trim().length;
  if (len === 0) return 0;
  if (len < 20) return 20;
  if (len < 50) return 40;
  if (len < 100) return 60;
  if (len < 200) return 80;
  return 100;
}

function scoreArrayRichness(arr: any[] | undefined | null): number {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return 0;
  const filledItems = arr.filter((item) => {
    if (typeof item === "string") return item.trim().length > 0;
    if (typeof item === "object") return countFilledFields(item).filled > 0;
    return !!item;
  });
  if (filledItems.length === 0) return 0;
  if (filledItems.length === 1) return 30;
  if (filledItems.length === 2) return 50;
  if (filledItems.length === 3) return 70;
  if (filledItems.length >= 4) return 90;
  return 100;
}

function calculateSectionScores(arbolData: any): SectionScore[] {
  // Foundation layer: semilla + raices
  const semillaScore = (() => {
    const s = arbolData.semilla || {};
    const scores = [
      scoreStringDepth(s.proposito),
      scoreStringDepth(s.vision),
      scoreStringDepth(s.intencion),
      scoreStringDepth(s.objetivos),
    ];
    return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
  })();

  const raicesScore = (() => {
    const r = arbolData.raices || {};
    const scores = [
      scoreStringDepth(r.historia),
      scoreStringDepth(r.creencias),
      scoreArrayRichness(r.valores),
      scoreStringDepth(r.identidad),
      scoreStringDepth(r.conocimientoHabilidades),
      scoreArrayRichness(r.fortalezas),
      scoreStringDepth(r.experiencia),
      scoreStringDepth(r.intuicion),
    ];
    return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
  })();

  // Core layer: tronco
  const troncoScore = (() => {
    const t = arbolData.tronco || {};
    const scores = [
      scoreStringDepth(t.temaPrincipal),
      scoreStringDepth(t.propuestaValor),
      scoreStringDepth(t.zonaGenialidad),
    ];
    return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
  })();

  // Expression layer: ramas + copa
  const ramasScore = (() => {
    const r = arbolData.ramas || {};
    const scores = [
      scoreArrayRichness(r.pasiones),
      scoreArrayRichness(r.intereses),
      scoreArrayRichness(r.hobbies),
      scoreArrayRichness(r.habilidadesSecundarias),
      scoreArrayRichness(r.formatosComunicacion),
    ];
    return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
  })();

  const copaScore = (() => {
    const c = arbolData.copa || {};
    const scores = [
      scoreArrayRichness(c.atributos),
      scoreArrayRichness(c.arquetipos),
      scoreStringDepth(c.tonoDeVoz),
      scoreStringDepth(c.narrativa),
      scoreStringDepth(c.energia),
      scoreStringDepth(c.presencia),
      scoreStringDepth(c.percepcion),
    ];
    return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
  })();

  // Reach layer: frutos + entorno + cofre
  const frutosScore = (() => {
    const f = arbolData.frutos || {};
    const scores = [
      scoreStringDepth(f.queDeseasRecibir),
      scoreStringDepth(f.metaSeguidores),
      scoreStringDepth(f.mensajesQueQuieres),
      scoreStringDepth(f.impactoDeseado),
      scoreStringDepth(f.testimonioIdeal),
    ];
    return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
  })();

  const entornoScore = (() => {
    const e = arbolData.entorno || {};
    const scores = [
      scoreStringDepth(e.audienciaPrincipal),
      scoreArrayRichness(e.dondeEstan),
      scoreStringDepth(e.competencia),
      scoreStringDepth(e.aliadosPotenciales),
      scoreStringDepth(e.posicionamiento),
    ];
    return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
  })();

  const tiempoScore = scoreSectionCompleteness(arbolData.tiempo);
  const cofreScore = (() => {
    const c = arbolData.cofre || {};
    if (c.productos && Array.isArray(c.productos) && c.productos.length > 0) {
      return scoreArrayRichness(c.productos);
    }
    return scoreSectionCompleteness(c);
  })();

  return [
    { name: "semilla", score: semillaScore, weight: 1.0, layer: "foundation" },
    { name: "raices", score: raicesScore, weight: 1.2, layer: "foundation" },
    { name: "tronco", score: troncoScore, weight: 1.3, layer: "core" },
    { name: "ramas", score: ramasScore, weight: 0.8, layer: "expression" },
    { name: "copa", score: copaScore, weight: 1.0, layer: "expression" },
    { name: "frutos", score: frutosScore, weight: 0.7, layer: "reach" },
    { name: "entorno", score: entornoScore, weight: 0.9, layer: "reach" },
    { name: "tiempo", score: tiempoScore, weight: 0.5, layer: "reach" },
    { name: "cofre", score: cofreScore, weight: 0.6, layer: "reach" },
  ];
}

function calculateLayerScore(sections: SectionScore[], layer: string): number {
  const layerSections = sections.filter((s) => s.layer === layer);
  if (layerSections.length === 0) return 0;
  const totalWeight = layerSections.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = layerSections.reduce((sum, s) => sum + s.score * s.weight, 0);
  return Math.round(weightedSum / totalWeight);
}

function calculateCoherenceScore(sections: SectionScore[]): number {
  // Global weighted average
  const totalWeight = sections.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = sections.reduce((sum, s) => sum + s.score * s.weight, 0);
  const baseScore = weightedSum / totalWeight;

  // Penalize imbalance: if some layers are much stronger than others
  const foundation = calculateLayerScore(sections, "foundation");
  const core = calculateLayerScore(sections, "core");
  const expression = calculateLayerScore(sections, "expression");
  const reach = calculateLayerScore(sections, "reach");

  const layers = [foundation, core, expression, reach];
  const maxLayer = Math.max(...layers);
  const minLayer = Math.min(...layers);
  const imbalancePenalty = Math.max(0, (maxLayer - minLayer) * 0.15);

  return Math.round(Math.max(0, Math.min(100, baseScore - imbalancePenalty)));
}

function identifyGrietas(sections: SectionScore[]): string[] {
  const grietas: string[] = [];
  const sectionNames: Record<string, string> = {
    semilla: "La Semilla (propósito/visión)",
    raices: "Las Raíces (historia/valores/identidad)",
    tronco: "El Tronco (tema/propuesta de valor)",
    ramas: "Las Ramas (pasiones/diversidad)",
    copa: "La Copa (tono/arquetipos/presencia)",
    frutos: "Los Frutos (impacto/resultados)",
    entorno: "El Entorno (audiencia/mercado)",
    tiempo: "El Tiempo (ritmo/metas)",
    cofre: "El Cofre (productos/monetización)",
  };

  for (const section of sections) {
    if (section.score < 30) {
      grietas.push(`${sectionNames[section.name]} está muy incompleta (${section.score}%)`);
    } else if (section.score < 50) {
      grietas.push(`${sectionNames[section.name]} necesita más trabajo (${section.score}%)`);
    }
  }

  // Check layer imbalances
  const foundation = calculateLayerScore(sections, "foundation");
  const expression = calculateLayerScore(sections, "expression");
  if (expression > foundation + 25) {
    grietas.push("Tu expresión visible supera a tus cimientos internos. Riesgo de incoherencia.");
  }
  if (foundation > expression + 30) {
    grietas.push("Tienes cimientos sólidos pero no los estás mostrando al mundo.");
  }

  return grietas;
}

function identifyFortalezas(sections: SectionScore[]): string[] {
  const fortalezas: string[] = [];
  const sectionNames: Record<string, string> = {
    semilla: "Tu Semilla está bien plantada",
    raices: "Tus Raíces son profundas y sólidas",
    tronco: "Tu Tronco está bien definido",
    ramas: "Tus Ramas muestran diversidad rica",
    copa: "Tu Copa proyecta una imagen clara",
    frutos: "Tus Frutos están bien definidos",
    entorno: "Conoces bien tu Entorno",
    tiempo: "Tienes un plan temporal claro",
    cofre: "Tu Cofre tiene productos bien estructurados",
  };

  for (const section of sections) {
    if (section.score >= 70) {
      fortalezas.push(sectionNames[section.name]);
    }
  }

  return fortalezas;
}

type ProfileType = "A" | "B" | "C" | "D";
type RutaAssigned = "cimientos" | "visibilidad" | "reconstruccion" | "difusion";

function determineProfile(sections: SectionScore[]): { profile: ProfileType; ruta: RutaAssigned } {
  const foundation = calculateLayerScore(sections, "foundation");
  const core = calculateLayerScore(sections, "core");
  const expression = calculateLayerScore(sections, "expression");
  const reach = calculateLayerScore(sections, "reach");

  const internalStrength = Math.round((foundation + core) / 2);
  const externalStrength = Math.round((expression + reach) / 2);

  // Profile A: Everything weak — need to build from scratch
  if (internalStrength < 40 && externalStrength < 40) {
    return { profile: "A", ruta: "cimientos" };
  }

  // Profile B: Strong inside, weak outside — need visibility
  if (internalStrength >= 50 && externalStrength < 40) {
    return { profile: "B", ruta: "visibilidad" };
  }

  // Profile C: Weak inside, strong outside — need reconstruction
  if (internalStrength < 45 && externalStrength >= 45) {
    return { profile: "C", ruta: "reconstruccion" };
  }

  // Profile D: Both decent but reach is limited — need diffusion
  if (internalStrength >= 45 && externalStrength >= 40) {
    // Check if reach specifically is the bottleneck
    if (reach < 50 || (foundation >= 55 && core >= 55 && expression >= 50)) {
      return { profile: "D", ruta: "difusion" };
    }
  }

  // Default: if internal is weaker, focus on cimientos; if external, visibility
  if (internalStrength < externalStrength) {
    return { profile: "C", ruta: "reconstruccion" };
  }
  if (internalStrength > externalStrength + 15) {
    return { profile: "B", ruta: "visibilidad" };
  }

  // Balanced but not strong enough
  if (internalStrength < 50) {
    return { profile: "A", ruta: "cimientos" };
  }

  return { profile: "D", ruta: "difusion" };
}

function countCompletedSections(arbolData: any): number {
  const sections = ["semilla", "raices", "tronco", "ramas", "copa", "frutos", "entorno", "tiempo", "cofre"];
  let completed = 0;
  for (const section of sections) {
    const data = arbolData[section];
    if (data && typeof data === "object") {
      const { filled, total } = countFilledFields(data);
      if (total > 0 && filled / total >= 0.4) {
        completed++;
      }
    }
  }
  return completed;
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Falta userId" }, { status: 400 });
    }

    const supabase = await createServerClient();

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

    // Calculate section scores
    const sectionScores = calculateSectionScores(arbolData);

    // Calculate coherence
    const coherenceScore = calculateCoherenceScore(sectionScores);
    const grietas = identifyGrietas(sectionScores);
    const fortalezas = identifyFortalezas(sectionScores);

    // Determine profile and route
    const { profile, ruta } = determineProfile(sectionScores);

    // Count completed sections for phase advancement
    const completedSections = countCompletedSections(arbolData);

    // Build diagnostic result
    const diagnostico = {
      score: coherenceScore,
      grietas,
      fortalezas,
      sectionScores: sectionScores.map((s) => ({
        name: s.name,
        score: s.score,
        layer: s.layer,
      })),
      layers: {
        foundation: calculateLayerScore(sectionScores, "foundation"),
        core: calculateLayerScore(sectionScores, "core"),
        expression: calculateLayerScore(sectionScores, "expression"),
        reach: calculateLayerScore(sectionScores, "reach"),
      },
    };

    // Get route modules
    const modulos = RUTA_MODULOS[ruta];

    // Update user_journey
    const now = new Date().toISOString();

    // First check if journey exists
    const { data: existingJourney } = await supabase
      .from("user_journey")
      .select("id, current_phase, phase_started_at, coherencia_historica")
      .eq("user_id", userId)
      .single();

    if (existingJourney) {
      // Determine if we should advance to phase 3
      const shouldAdvanceToPhase3 = completedSections >= 7 && existingJourney.current_phase < 3;

      const updateData: any = {
        arbol_completado: arbolData.completed || completedSections >= 7,
        diagnostico_coherencia: diagnostico,
        perfil_diagnostico: profile,
        ruta_asignada: ruta,
        ruta_modulos: modulos,
      };

      if (shouldAdvanceToPhase3) {
        const phaseStarted = existingJourney.phase_started_at || {};
        updateData.current_phase = 3;
        updateData.phase_started_at = { ...phaseStarted, "3": now };
      }

      // Append to coherencia_historica
      const history = existingJourney.coherencia_historica || [];
      history.push({ fecha: now.split("T")[0], score: coherenceScore });
      updateData.coherencia_historica = history;

      await supabase
        .from("user_journey")
        .update(updateData)
        .eq("user_id", userId);
    } else {
      // Create journey if doesn't exist
      await supabase.from("user_journey").insert({
        user_id: userId,
        current_phase: completedSections >= 7 ? 3 : 2,
        phase_started_at: {
          "1": now,
          "2": now,
          ...(completedSections >= 7 ? { "3": now } : {}),
        },
        arbol_completado: arbolData.completed || completedSections >= 7,
        diagnostico_coherencia: diagnostico,
        perfil_diagnostico: profile,
        ruta_asignada: ruta,
        ruta_modulos: modulos,
        coherencia_historica: [{ fecha: now.split("T")[0], score: coherenceScore }],
      });
    }

    return NextResponse.json({
      profile,
      ruta,
      diagnostico,
      modulos,
      completedSections,
    });
  } catch (err: any) {
    console.error("Diagnose error:", err);
    return NextResponse.json(
      { error: "Error al generar el diagnóstico." },
      { status: 500 }
    );
  }
}
