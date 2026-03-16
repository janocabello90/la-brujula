import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import AdminClient from "./AdminClient";

// Only these emails can access admin
const ADMIN_EMAILS = ["janocabellom@gmail.com"];

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  hasApiKey: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  // Stats
  ideasCount: number;
  suggestionsCount: number;
  piecesCount: number;
  plannedCount: number;
  publishedCount: number;
  // Brujula state
  pillarCount: number;
  buyerCount: number;
  hasInsight: boolean;
  temaRaiz: string;
  // Activity
  lastSuggestionAt: string | null;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number; // users with at least 1 suggestion
  totalSuggestions: number;
  totalIdeas: number;
  totalPieces: number;
  totalPublished: number;
  estimatedCost: string; // approximate API spend
  users: AdminUser[];
}

export default async function AdminPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check admin access
  if (!ADMIN_EMAILS.includes(user.email || "")) {
    redirect("/dashboard");
  }

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, display_name, api_key, onboarding_completed, created_at")
    .order("created_at", { ascending: false });

  if (!profiles) redirect("/dashboard");

  // Fetch all counts in parallel
  const userIds = profiles.map((p) => p.id);

  const [
    { data: brujulaRows },
    { data: allIdeas },
    { data: suggestionCounts },
    { data: piecesCounts },
    { data: plannedCounts },
    { data: publishedCounts },
    { data: lastSuggestions },
  ] = await Promise.all([
    supabase.from("brujula_data").select("user_id, tree, buyers, buyer, insight, briefing").in("user_id", userIds),
    supabase.from("ideas").select("user_id"),
    supabase.from("suggestion_history").select("user_id"),
    supabase.from("saved_pieces").select("user_id"),
    supabase.from("planner_items").select("user_id"),
    supabase.from("planner_items").select("user_id, status").eq("status", "published"),
    supabase.from("suggestion_history").select("user_id, created_at").order("created_at", { ascending: false }),
  ]);

  // Build count maps
  const countMap = (rows: any[] | null) => {
    const map: Record<string, number> = {};
    (rows || []).forEach((r) => {
      map[r.user_id] = (map[r.user_id] || 0) + 1;
    });
    return map;
  };

  const ideasMap = countMap(allIdeas);
  const suggestionsMap = countMap(suggestionCounts);
  const piecesMap = countMap(piecesCounts);
  const plannedMap = countMap(plannedCounts);
  const publishedMap = countMap(publishedCounts);

  // Last suggestion per user
  const lastSuggestionMap: Record<string, string> = {};
  (lastSuggestions || []).forEach((r) => {
    if (!lastSuggestionMap[r.user_id]) {
      lastSuggestionMap[r.user_id] = r.created_at;
    }
  });

  // Build brujula data map
  const brujulaMap: Record<string, any> = {};
  (brujulaRows || []).forEach((r) => { brujulaMap[r.user_id] = r; });

  // Build admin users
  const users: AdminUser[] = profiles.map((p) => {
    const bd = brujulaMap[p.id] || {};
    const tree = bd.tree || { pilares: [] };
    const buyers = bd.buyers || (bd.buyer?.nombre ? [bd.buyer] : []);

    return {
      id: p.id,
      email: p.email || "",
      displayName: p.display_name || "",
      hasApiKey: !!p.api_key,
      onboardingCompleted: p.onboarding_completed || false,
      createdAt: p.created_at || "",
      ideasCount: ideasMap[p.id] || 0,
      suggestionsCount: suggestionsMap[p.id] || 0,
      piecesCount: piecesMap[p.id] || 0,
      plannedCount: plannedMap[p.id] || 0,
      publishedCount: publishedMap[p.id] || 0,
      pillarCount: tree.pilares?.filter((pi: any) => pi.nombre).length || 0,
      buyerCount: buyers.filter((b: any) => b.nombre).length,
      hasInsight: !!bd.insight?.insight,
      temaRaiz: bd.briefing?.temaRaiz || "",
      lastSuggestionAt: lastSuggestionMap[p.id] || null,
    };
  });

  const totalSuggestions = Object.values(suggestionsMap).reduce((a, b) => a + b, 0);

  const adminStats: AdminStats = {
    totalUsers: profiles.length,
    activeUsers: users.filter((u) => u.suggestionsCount > 0).length,
    totalSuggestions,
    totalIdeas: Object.values(ideasMap).reduce((a, b) => a + b, 0),
    totalPieces: Object.values(piecesMap).reduce((a, b) => a + b, 0),
    totalPublished: Object.values(publishedMap).reduce((a, b) => a + b, 0),
    // ~$0.008 per suggestion (Claude Sonnet, ~1500 tokens in + 800 out)
    estimatedCost: `~$${(totalSuggestions * 0.008).toFixed(2)}`,
    users,
  };

  return <AdminClient stats={adminStats} />;
}
