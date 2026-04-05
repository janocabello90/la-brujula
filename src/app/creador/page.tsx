import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import CreadorClient from "./CreadorClient";
import AppShell from "@/components/AppShell";

export default async function CreadorPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/acceso-buena-vida");

  // Fetch profile for display name and API key check
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, api_key")
    .eq("id", user.id)
    .single();

  // Fetch all creator projects
  const { data: projects } = await supabase
    .from("creator_projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <AppShell>
      <CreadorClient
        projects={projects || []}
        userId={user.id}
        userName={profile?.display_name || ""}
        hasApiKey={!!profile?.api_key}
      />
    </AppShell>
  );
}
