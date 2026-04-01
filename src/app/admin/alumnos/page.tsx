import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import AlumnosClient from "./AlumnosClient";

const ADMIN_EMAILS = ["janocabellom@gmail.com", "jano.cmg@gmail.com"];

export interface AlumnoData {
  id: string;
  email: string;
  displayName: string;
  hasApiKey: boolean;
  tourCompleted: boolean;
  createdAt: string;

  // Phase progress
  piramideStep: string | null; // current_step
  piramideStepsCompleted: string[];
  piramideCompleted: boolean; // steps_completed includes nivel_2 or current_step === 'completada'
  arbolCompleted: boolean;
  arbolStep: number; // onboarding_step 0-8
  rutaAsignada: string | null;
  brujulaCompleted: boolean; // has briefing.temaRaiz

  // Raw data for detail view
  piramide: any | null; // full piramide_data row
  arbol: any | null; // full arbol_data row
  brujula: any | null; // full brujula_data row

  // Stats
  entrevistadorSessions: number;
  entrevistadorFrases: number;

  // Last activity
  lastUpdated: string | null; // most recent updated_at across all tables
}

export default async function AlumnosPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/acceso-buena-vida");

  // Check admin access
  if (!ADMIN_EMAILS.includes(user.email || "")) {
    redirect("/dashboard");
  }

  // Fetch all profiles ordered by created_at descending
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, display_name, api_key, onboarding_completed, tour_completed, created_at")
    .order("created_at", { ascending: false });

  if (!profiles) redirect("/dashboard");

  // Get all user IDs for parallel queries
  const userIds = profiles.map((p) => p.id);

  // Fetch all data in parallel
  const [
    { data: piramideRows },
    { data: arbolRows },
    { data: brujulaRows },
    { data: userJourneyRows },
    { data: entrevistadorFrasesRows },
    { data: entrevistadorSessionsRows },
  ] = await Promise.all([
    supabase
      .from("piramide_data")
      .select(
        "user_id, current_step, steps_completed, prologo, mentalidad, buena_vida, bajo_tierra, nivel_1, nivel_2, nivel_3, nivel_4, updated_at"
      )
      .in("user_id", userIds),
    supabase
      .from("arbol_data")
      .select(
        "user_id, completed, onboarding_step, semilla, raices, tronco, ramas, copa, frutos, entorno, tiempo, cofre, updated_at"
      )
      .in("user_id", userIds),
    supabase
      .from("brujula_data")
      .select("user_id, briefing, buyer, buyers, empathy, insight, tree, channels, updated_at")
      .in("user_id", userIds),
    supabase
      .from("user_journey")
      .select("user_id, ruta_asignada")
      .in("user_id", userIds),
    supabase
      .from("entrevistador_frases")
      .select("user_id, frase")
      .in("user_id", userIds),
    supabase
      .from("entrevistador_sessions")
      .select("user_id")
      .in("user_id", userIds),
  ]);

  // Build maps for efficient lookup
  const piramideMap: Record<string, any> = {};
  (piramideRows || []).forEach((r) => {
    piramideMap[r.user_id] = r;
  });

  const arbolMap: Record<string, any> = {};
  (arbolRows || []).forEach((r) => {
    arbolMap[r.user_id] = r;
  });

  const brujulaMap: Record<string, any> = {};
  (brujulaRows || []).forEach((r) => {
    brujulaMap[r.user_id] = r;
  });

  const rutaMap: Record<string, string | null> = {};
  (userJourneyRows || []).forEach((r) => {
    rutaMap[r.user_id] = r.ruta_asignada || null;
  });

  // Count entrevistador frases per user
  const frasesCountMap: Record<string, number> = {};
  (entrevistadorFrasesRows || []).forEach((r) => {
    frasesCountMap[r.user_id] = (frasesCountMap[r.user_id] || 0) + 1;
  });

  // Count entrevistador sessions per user
  const sessionsCountMap: Record<string, number> = {};
  (entrevistadorSessionsRows || []).forEach((r) => {
    sessionsCountMap[r.user_id] = (sessionsCountMap[r.user_id] || 0) + 1;
  });

  // Build alumnos array
  const alumnos: AlumnoData[] = profiles.map((profile) => {
    const piramide = piramideMap[profile.id] || null;
    const arbol = arbolMap[profile.id] || null;
    const brujula = brujulaMap[profile.id] || null;

    // Parse steps_completed from piramide_data
    const stepsCompleted = piramide?.steps_completed || [];
    const piramideStepsCompleted = Array.isArray(stepsCompleted)
      ? stepsCompleted
      : typeof stepsCompleted === "string"
        ? stepsCompleted.split(",").map((s: string) => s.trim())
        : [];

    // Piramide completed: has nivel_2 in steps_completed or current_step === 'completada'
    const piramideCompleted =
      piramideStepsCompleted.includes("nivel_2") || piramide?.current_step === "completada";

    // Arbol completed: completed field is true
    const arbolCompleted = arbol?.completed === true;

    // Brujula completed: has briefing with temaRaiz
    const brujulaCompleted = !!(brujula?.briefing?.temaRaiz || brujula?.briefing?.tema_raiz);

    // Determine last updated across all tables
    const timestamps = [
      piramide?.updated_at,
      arbol?.updated_at,
      brujula?.updated_at,
    ].filter((t) => t !== null && t !== undefined);

    let lastUpdated: string | null = null;
    if (timestamps.length > 0) {
      lastUpdated = timestamps.sort().reverse()[0];
    }

    return {
      id: profile.id,
      email: profile.email || "",
      displayName: profile.display_name || "",
      hasApiKey: !!profile.api_key,
      tourCompleted: profile.tour_completed || false,
      createdAt: profile.created_at || "",
      piramideStep: piramide?.current_step || null,
      piramideStepsCompleted,
      piramideCompleted,
      arbolCompleted,
      arbolStep: arbol?.onboarding_step || 0,
      rutaAsignada: rutaMap[profile.id] || null,
      brujulaCompleted,
      piramide,
      arbol,
      brujula,
      entrevistadorSessions: sessionsCountMap[profile.id] || 0,
      entrevistadorFrases: frasesCountMap[profile.id] || 0,
      lastUpdated,
    };
  });

  return <AlumnosClient alumnos={alumnos} />;
}
