import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

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
}

export interface SmartTask {
  id: string;
  text: string;
  href: string;
  done: boolean;
  priority: "high" | "medium" | "low";
}

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check onboarding
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, api_key")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  // Fetch all data in parallel
  const [
    { data: brujulaData },
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

  const tree = brujulaData?.tree || { pilares: [] };
  const buyers = brujulaData?.buyers || (brujulaData?.buyer?.nombre ? [brujulaData.buyer] : []);

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
    userName: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
  };

  // Generate smart tasks
  const tasks: SmartTask[] = [];

  if (!stats.hasMinorityReport) {
    tasks.push({ id: "mr", text: "Completa tu Minority Report — es la base de todo", href: "/onboarding", done: false, priority: "high" });
  }
  if (!stats.hasApiKey) {
    tasks.push({ id: "api", text: "Configura tu API Key para activar el Maestro", href: "/settings", done: false, priority: "high" });
  }
  if (!stats.hasBuyerPersona) {
    tasks.push({ id: "buyer", text: "Define al menos un buyer persona", href: "/onboarding", done: false, priority: "high" });
  }
  if (!stats.hasInsight) {
    tasks.push({ id: "insight", text: "Escribe tu insight estratégico", href: "/onboarding", done: false, priority: "high" });
  }
  if (stats.pillarCount < 3) {
    tasks.push({ id: "pillars", text: `Tienes ${stats.pillarCount} pilar${stats.pillarCount !== 1 ? "es" : ""} — intenta llegar a 3-5`, href: "/onboarding", done: false, priority: "medium" });
  }
  if (stats.ideasTotal === 0) {
    tasks.push({ id: "first-idea", text: "Apunta tu primera idea en el cajón", href: "/ideas", done: false, priority: "medium" });
  }
  if (stats.suggestionsTotal === 0 && stats.hasApiKey) {
    tasks.push({ id: "first-maestro", text: "Genera tu primera pieza con el Maestro", href: "/maestro", done: false, priority: "medium" });
  }
  if (stats.ideasRaw > 0) {
    tasks.push({ id: "enrich", text: `Tienes ${stats.ideasRaw} idea${stats.ideasRaw !== 1 ? "s" : ""} sin conectar — dale a enriquecer`, href: "/ideas", done: false, priority: "low" });
  }
  if (stats.piecesTotal > 0 && stats.plannedTotal === 0) {
    tasks.push({ id: "plan", text: "Planifica alguna de tus piezas guardadas", href: "/piezas", done: false, priority: "low" });
  }
  if (stats.suggestionsTotal > 0 && stats.piecesTotal === 0) {
    tasks.push({ id: "save-piece", text: "Guarda alguna pieza del Maestro que te guste", href: "/maestro", done: false, priority: "low" });
  }
  if (stats.plannedScheduled > 0 && stats.plannedPublished === 0) {
    tasks.push({ id: "publish", text: "Marca como publicada tu primera pieza planificada", href: "/planner", done: false, priority: "low" });
  }

  // If everything is set up, encourage creation
  if (tasks.length === 0) {
    tasks.push({ id: "create", text: "Todo listo — ve al Maestro y crea tu siguiente pieza", href: "/maestro", done: false, priority: "medium" });
  }

  return <DashboardClient stats={stats} tasks={tasks} />;
}
