import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import EntrevistadorClient from "./EntrevistadorClient";

export default async function EntrevistadorPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/acceso-buena-vida");

  const { data: profile } = await supabase
    .from("profiles")
    .select("api_key")
    .eq("id", user.id)
    .single();

  const { data: frases } = await supabase
    .from("entrevistador_frases")
    .select("id, frase, contexto, pregunta, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: sessions } = await supabase
    .from("entrevistador_sessions")
    .select("id, estilo, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <EntrevistadorClient
      userId={user.id}
      apiKey={profile?.api_key || ""}
      frases={frases || []}
      sessions={sessions || []}
    />
  );
}
