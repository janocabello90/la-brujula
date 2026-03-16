import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import ArbolClient from "./ArbolClient";

export default async function ArbolPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check profile exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Load existing árbol data
  const { data: arbolData } = await supabase
    .from("arbol_data")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Load brújula data for pre-filling / sync
  const { data: brujulaData } = await supabase
    .from("brujula_data")
    .select("briefing, buyer, buyers, tree, channels, insight")
    .eq("user_id", user.id)
    .single();

  return (
    <ArbolClient
      userId={user.id}
      userName={profile.display_name || ""}
      initialData={arbolData}
      brujulaData={brujulaData}
    />
  );
}
