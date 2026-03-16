import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import MaestroClient from "./MaestroClient";

export default async function MaestroPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/acceso-buena-vida");

  const { data: brujulaData } = await supabase
    .from("brujula_data")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("api_key")
    .eq("id", user.id)
    .single();

  const { data: historyData } = await supabase
    .from("suggestion_history")
    .select("suggestion")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <MaestroClient
      userId={user.id}
      data={brujulaData}
      apiKey={profile?.api_key || ""}
      history={historyData?.map((h) => h.suggestion) || []}
    />
  );
}
