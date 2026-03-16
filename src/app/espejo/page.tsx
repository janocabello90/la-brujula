import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import EspejoClient from "./EspejoClient";

export default async function EspejoPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, api_key")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Load both data sources in parallel
  const [{ data: arbolData }, { data: brujulaData }] = await Promise.all([
    supabase.from("arbol_data").select("*").eq("user_id", user.id).single(),
    supabase.from("brujula_data").select("*").eq("user_id", user.id).single(),
  ]);

  return (
    <EspejoClient
      userId={user.id}
      userName={profile.display_name || ""}
      arbol={arbolData ? {
        semilla: arbolData.semilla || {},
        raices: arbolData.raices || {},
        tronco: arbolData.tronco || {},
        ramas: arbolData.ramas || {},
        copa: arbolData.copa || {},
        frutos: arbolData.frutos || {},
        entorno: arbolData.entorno || {},
        tiempo: arbolData.tiempo || {},
        cofre: arbolData.cofre || arbolData.producto || {},
      } : null}
      brujula={brujulaData ? {
        briefing: brujulaData.briefing || {},
        tree: brujulaData.tree || {},
        channels: brujulaData.channels || {},
        insight: brujulaData.insight || {},
        buyers: brujulaData.buyers || (brujulaData.buyer?.nombre ? [brujulaData.buyer] : []),
      } : null}
    />
  );
}
