import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import ResultadoClient from "./ResultadoClient";

export default async function ResultadoPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/acceso-buena-vida");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, api_key")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/acceso-buena-vida");

  const { data: arbolData } = await supabase
    .from("arbol_data")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!arbolData) redirect("/arbol");

  return (
    <ResultadoClient
      userId={user.id}
      userName={profile.display_name || ""}
      hasApiKey={!!profile.api_key}
      arbolData={{
        semilla: arbolData.semilla || {},
        raices: arbolData.raices || {},
        tronco: arbolData.tronco || {},
        ramas: arbolData.ramas || {},
        copa: arbolData.copa || {},
        frutos: arbolData.frutos || {},
        entorno: arbolData.entorno || {},
        tiempo: arbolData.tiempo || {},
        cofre: arbolData.cofre || arbolData.producto || {},
      }}
    />
  );
}
