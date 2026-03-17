import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import RutasClient from "./RutasClient";
import AppShell from "@/components/AppShell";
import type { UserJourney } from "@/lib/types";

export default async function RutasPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/acceso-buena-vida");

  // Fetch user journey
  let { data: journey } = await supabase
    .from("user_journey")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Auto-create journey if it doesn't exist (for existing users)
  if (!journey) {
    const { data: newJourney } = await supabase
      .from("user_journey")
      .insert({
        user_id: user.id,
        current_phase: 1,
        phase_started_at: { "1": new Date().toISOString() },
      })
      .select()
      .single();
    journey = newJourney;
  }

  // Fetch all data needed for strategy generation
  const [
    { data: piramideData },
    { data: arbolData },
    { data: brujulaData },
  ] = await Promise.all([
    supabase
      .from("piramide_data")
      .select("*")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("arbol_data")
      .select("*")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("brujula_data")
      .select("*")
      .eq("user_id", user.id)
      .single(),
  ]);

  // Calculate árbol sections completed
  const arbolSections = ["semilla", "raices", "tronco", "ramas", "copa", "frutos", "entorno", "tiempo", "cofre"];
  let arbolCompleted = 0;
  if (arbolData) {
    arbolCompleted = arbolSections.filter((s) => {
      const section = arbolData[s];
      if (!section || typeof section !== "object") return false;
      return Object.values(section).some((v: any) => {
        if (Array.isArray(v)) return v.length > 0 && v.some((item: any) => typeof item === "string" ? item.trim().length > 0 : typeof item === "object" && Object.values(item).some((iv: any) => typeof iv === "string" && (iv as string).trim().length > 0));
        if (typeof v === "string") return v.trim().length > 0;
        return false;
      });
    }).length;
  }

  // Calculate brújula completion
  const hasBriefing = !!brujulaData?.briefing?.temaRaiz;
  const hasBuyer = !!(brujulaData?.buyers?.length > 0 ? brujulaData.buyers[0]?.nombre : brujulaData?.buyer?.nombre);
  const hasInsight = !!brujulaData?.insight?.insight;
  const hasTree = brujulaData?.tree?.pilares?.length > 0 && !!brujulaData.tree.pilares[0]?.nombre;

  return (
    <AppShell>
      <RutasClient
        journey={journey as UserJourney}
        arbolCompleted={arbolCompleted}
        arbolTotal={9}
        hasBriefing={hasBriefing}
        hasBuyer={hasBuyer}
        hasInsight={hasInsight}
        hasTree={hasTree}
        piramideData={piramideData}
        arbolData={arbolData}
        brujulaData={brujulaData}
      />
    </AppShell>
  );
}
