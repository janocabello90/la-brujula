import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import EditorClient from "./EditorClient";
import AppShell from "@/components/AppShell";

interface PageProps {
  params: { id: string };
}

export default async function EditorPage({ params }: PageProps) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/acceso-buena-vida");

  // Fetch user profile for display name and API key check
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, api_key")
    .eq("id", user.id)
    .single();

  // Fetch the specific project with authorization check
  const { data: project } = await supabase
    .from("creator_projects")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!project) redirect("/creador");

  // Fetch slides if carousel
  let slides: any[] = [];
  if (project.type === "carousel") {
    const { data } = await supabase
      .from("creator_slides")
      .select("*")
      .eq("project_id", project.id)
      .order("slide_order", { ascending: true });
    slides = data || [];
  }

  // Fetch chat history
  const { data: chatHistory } = await supabase
    .from("creator_chat_history")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: true });

  // Fetch brujula data for AI context
  const { data: brujulaData } = await supabase
    .from("brujula_data")
    .select("briefing, buyer, buyers, tree, insight")
    .eq("user_id", user.id)
    .single();

  return (
    <AppShell>
      <EditorClient
        project={project}
        slides={slides}
        chatHistory={chatHistory || []}
        userId={user.id}
        userName={profile?.display_name || ""}
        hasApiKey={!!profile?.api_key}
        brujulaContext={brujulaData}
      />
    </AppShell>
  );
}
