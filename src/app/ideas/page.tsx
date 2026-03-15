import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import IdeasClient from "./IdeasClient";

export default async function IdeasPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, api_key")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const { data: brujulaData } = await supabase
    .from("brujula_data")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <IdeasClient
      userId={user.id}
      data={brujulaData}
      apiKey={profile?.api_key || ""}
    />
  );
}
