import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("api_key, email, display_name")
    .eq("id", user.id)
    .single();

  return (
    <SettingsClient
      userId={user.id}
      email={profile?.email || user.email || ""}
      displayName={profile?.display_name || user.user_metadata?.full_name || ""}
      currentApiKey={profile?.api_key || ""}
    />
  );
}
