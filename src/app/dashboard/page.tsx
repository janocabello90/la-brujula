import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export interface ArbolSection {
  key: string;
  label: string;
  completed: boolean;
}

export interface TodayItem {
  id: string;
  title: string;
  pilar: string;
  formato: string;
  canal: string;
  scheduled_time: string | null;
  status: string;
}

export interface DashboardStats {
  ideasTotal: number;
  ideasRaw: number;
  ideasEnriched: number;
  ideasWorked: number;
  suggestionsTotal: number;
  piecesTotal: number;
  piecesSaved: number;
  piecesEditing: number;
  piecesPlanned: number;
  plannedTotal: number;
  plannedPublished: number;
  plannedScheduled: number;
  plannedDraft: number;
  hasMinorityReport: boolean;
  hasBuyerPersona: boolean;
  hasInsight: boolean;
  hasTree: boolean;
  hasApiKey: boolean;
  pillarCount: number;
  userName: string;
  // Árbol
  arbolSections: ArbolSection[];
  arbolCompleted: number;
  arbolTotal: number;
  hasArbol: boolean;
  // Today
  todayItems: TodayItem[];
  // Journey (Las Rutas)
  journeyPhase: number;
  journeyRuta: string | null;
  journeyPerfil: string | null;
  // Phases
  piramideCompleted: boolean;
  userPhase: number;
}

export interface SmartTask {
  id: string;
  text: string;
  href: string;
  done: boolean;
  priority: "high" | "medium" | "low";
  icon: string;
}

// Check if an árbol section has meaningful content
function isArbolSectionComplete(data: any, section: string): boolean {
  if (!data) return false;
  const s = data[section];
  if (!s || typeof s !== "object") return false;

  // Check if at least one field has meaningful content
  return Object.values(s).some((v: any) => {
    if (Array.isArray(v)) return v.length > 0 && v.some((item: any) => {
      if (typeof item === "string") return item.trim().length > 0;
      if (typeof item === "object") return Object.values(item).some((iv: any) => typeof iv === "string" && iv.trim().length > 0);
      return false;
    });
    if (typeof v === "string") return v.trim().length > 0;
    return false;
  });
}

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/acceso-buena-vida");

  // Check onboarding
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("onboarding_completed, api_key, display_name, tour_completed")
    .eq("id", user.id)
    .single();

  // Auto-create profile if missing (email+password signup doesn't go through callback)
  if (!existingProfile) {
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "";
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      display_name: displayName,
      onboarding_completed: false,
    });
    redirect("/onboarding");
  }

  if (!existingProfile.onboarding_completed) {
    redirect("/onboarding");
  }

  if (!existingProfile.tour_completed) {
    redirect("/tour");
  }

  const profile = existingProfile;

  // Today's date for planner query
  const today = new Date().toISOString().split("T")[0];

  // Fetch all data in parallel
  const [
    { data: brujulaData },
    { data: arbolData },
    { data: piramideData },
    { data: todayPlanner },
    { count: ideasTotal },
    { count: ideasRaw },
    { count: ideasEnriched },
    { count: ideasWorked },
    { count: suggestionsTotal },
    { count: piecesTotal },
    { count: piecesSaved },
    { count: piecesEditing },
    { count: piecesPlanned },
    { count: plannedTotal },
    { count: plannedPublished },
    { count: plannedScheduled },
    { count: plannedDraft },
  ] = await Promise.all([
    supabase.from("brujula_data").select("*").eq("user_id", user.id).single(),
    supabase.from("arbol_data").select("*").eq("user_id", user.id).single(),
    supabase.from("piramide_data").select("steps_completed").eq("user_id", user.id).single(),
    supabase.from("planner_items").select("id, title, pilar, formato, canal, scheduled_time, status").eq("user_id", user.id).eq("scheduled_date", today).order("scheduled_time", { ascending: true }),
    supabase.from("ideas").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("ideas").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "raw"),
    supabase.from("ideas").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "enriched"),
    supabase.from("ideas").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "worked"),
    supabase.from("suggestion_history").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("saved_pieces").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("saved_pieces").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "saved"),
    supabase.from("saved_pieces").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "editing"),
    supabase.from("saved_pieces").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "planned"),
    supabase.from("planner_items").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("planner_items").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "published"),
    supabase.from("planner_items").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "scheduled"),
    supabase.from("planner_items").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "draft"),
  ]);

  // Fetch user journey for Las Rutas integration
  let { data: userJourney } = await supabase
    .from("user_journey")
    .select("current_phase, ruta_asignada, perfil_diagnostico, piramide_completada, ruta_iniciada")
    .eq("user_id", user.id)
    .single();

  // Auto-create journey if it doesn't exist (for existing users who predate Las Rutas)
  if (!userJourney) {
    const { data: newJourney } = await supabase
      .from("user_journey")
      .insert({
        user_id: user.id,
        current_phase: 1,
        phase_started_at: { "1": new Date().toISOString() },
      })
      .select("current_phase, ruta_asignada, perfil_diagnostico, piramide_completada, ruta_iniciada")
      .single();
    userJourney = newJourney;
  }

  const tree = brujulaData?.tree || { pilares: [] };
  const buyers = brujulaData?.buyers || (brujulaData?.buyer?.nombre ? [brujulaData.buyer] : []);

  // Árbol section progress
  const arbolSectionDefs = [
    { key: "semilla", label: "La Semilla" },
    { key: "raices", label: "Las Raíces" },
    { key: "tronco", label: "El Tronco" },
    { key: "ramas", label: "Las Ramas" },
    { key: "copa", label: "La Copa" },
    { key: "frutos", label: "Los Frutos" },
    { key: "entorno", label: "El Entorno" },
    { key: "tiempo", label: "El Tiempo" },
    { key: "cofre", label: "El Cofre" },
  ];

  const arbolSections: ArbolSection[] = arbolSectionDefs.map((s) => ({
    key: s.key,
    label: s.label,
    completed: isArbolSectionComplete(arbolData, s.key),
  }));

  const arbolCompleted = arbolSections.filter((s) => s.completed).length;

  // Determine phase completion
  const piramideCompleted = piramideData?.steps_completed?.includes("nivel_2") || false;
  const arbolFullyCompleted = arbolCompleted === 9;
  const userPhase = arbolFullyCompleted ? 3 : piramideCompleted ? 2 : 1;

  // Today items
  const todayItems: TodayItem[] = (todayPlanner || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    pilar: item.pilar || "",
    formato: item.formato || "",
    canal: item.canal || "",
    scheduled_time: item.scheduled_time,
    status: item.status,
  }));

  const stats: DashboardStats = {
    ideasTotal: ideasTotal || 0,
    ideasRaw: ideasRaw || 0,
    ideasEnriched: ideasEnriched || 0,
    ideasWorked: ideasWorked || 0,
    suggestionsTotal: suggestionsTotal || 0,
    piecesTotal: piecesTotal || 0,
    piecesSaved: piecesSaved || 0,
    piecesEditing: piecesEditing || 0,
    piecesPlanned: piecesPlanned || 0,
    plannedTotal: plannedTotal || 0,
    plannedPublished: plannedPublished || 0,
    plannedScheduled: plannedScheduled || 0,
    plannedDraft: plannedDraft || 0,
    hasMinorityReport: !!(brujulaData?.briefing?.temaRaiz && tree.pilares?.length > 0),
    hasBuyerPersona: buyers.length > 0 && !!buyers[0]?.nombre,
    hasInsight: !!brujulaData?.insight?.insight,
    hasTree: tree.pilares?.length > 0 && !!tree.pilares[0]?.nombre,
    hasApiKey: !!profile?.api_key,
    pillarCount: tree.pilares?.filter((p: any) => p.nombre).length || 0,
    userName: profile?.display_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "",
    arbolSections,
    arbolCompleted,
    arbolTotal: 9,
    hasArbol: !!arbolData,
    todayItems,
    journeyPhase: userJourney?.current_phase || 1,
    journeyRuta: userJourney?.ruta_asignada || null,
    journeyPerfil: userJourney?.perfil_diagnostico || null,
    piramideCompleted,
    userPhase,
  };

  // Generate smart tasks
  const tasks: SmartTask[] = [];

  // Priority 1: Árbol setup (the foundation)
  if (!stats.hasArbol || arbolCompleted < 3) {
    tasks.push({
      id: "arbol-start",
      text: arbolCompleted === 0
        ? "Empieza El Árbol — es el mapa de tu marca personal"
        : `Llevas ${arbolCompleted}/9 secciones del Árbol — sigue construyendo`,
      href: "/arbol",
      done: false,
      priority: "high",
      icon: "tree",
    });
  } else if (arbolCompleted < 9) {
    tasks.push({
      id: "arbol-continue",
      text: `Te faltan ${9 - arbolCompleted} secciones del Árbol para completarlo`,
      href: "/arbol",
      done: false,
      priority: "medium",
      icon: "tree",
    });
  }

  // Priority 2: Brújula setup
  if (!stats.hasMinorityReport) {
    tasks.push({ id: "mr", text: "Completa tu Minority Report — la base de La Brújula", href: "/onboarding", done: false, priority: "high", icon: "compass" });
  }
  if (!stats.hasApiKey) {
    tasks.push({ id: "api", text: "Configura tu API Key para activar el Maestro", href: "/settings", done: false, priority: "high", icon: "key" });
  }
  if (!stats.hasBuyerPersona) {
    tasks.push({ id: "buyer", text: "Define al menos un buyer persona", href: "/onboarding", done: false, priority: "high", icon: "user" });
  }
  if (!stats.hasInsight) {
    tasks.push({ id: "insight", text: "Escribe tu insight estratégico", href: "/onboarding", done: false, priority: "medium", icon: "bulb" });
  }
  if (stats.pillarCount < 3) {
    tasks.push({ id: "pillars", text: `Tienes ${stats.pillarCount} pilar${stats.pillarCount !== 1 ? "es" : ""} — intenta llegar a 3-5`, href: "/onboarding", done: false, priority: "medium", icon: "pillars" });
  }

  // Priority 3: Content creation
  if (stats.ideasTotal === 0 && stats.hasMinorityReport) {
    tasks.push({ id: "first-idea", text: "Apunta tu primera idea en el cajón", href: "/ideas", done: false, priority: "medium", icon: "idea" });
  }
  if (stats.suggestionsTotal === 0 && stats.hasApiKey && stats.hasMinorityReport) {
    tasks.push({ id: "first-maestro", text: "Genera tu primera pieza con el Maestro", href: "/maestro", done: false, priority: "medium", icon: "wand" });
  }
  if (stats.ideasRaw > 0) {
    tasks.push({ id: "enrich", text: `Tienes ${stats.ideasRaw} idea${stats.ideasRaw !== 1 ? "s" : ""} sin conectar — dale a enriquecer`, href: "/ideas", done: false, priority: "low", icon: "sparkle" });
  }
  if (stats.piecesTotal > 0 && stats.plannedTotal === 0) {
    tasks.push({ id: "plan", text: "Planifica alguna de tus piezas guardadas", href: "/piezas", done: false, priority: "low", icon: "calendar" });
  }
  if (stats.suggestionsTotal > 0 && stats.piecesTotal === 0) {
    tasks.push({ id: "save-piece", text: "Guarda alguna pieza del Maestro que te guste", href: "/maestro", done: false, priority: "low", icon: "save" });
  }
  if (stats.plannedScheduled > 0 && stats.plannedPublished === 0) {
    tasks.push({ id: "publish", text: "Marca como publicada tu primera pieza planificada", href: "/planner", done: false, priority: "low", icon: "rocket" });
  }

  // If everything is set up, encourage creation
  if (tasks.length === 0) {
    tasks.push({ id: "create", text: "Todo listo — ve al Maestro y crea tu siguiente pieza", href: "/maestro", done: false, priority: "medium", icon: "wand" });
  }

  return <DashboardClient stats={stats} tasks={tasks} />;
}
