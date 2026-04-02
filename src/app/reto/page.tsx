import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import RetoClient from "./RetoClient";

export default async function RetoPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/acceso-buena-vida");

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  // Check if already registered for reto
  const { data: participant } = await supabase
    .from("reto_participantes")
    .select("id, instagram_username, objetivo, created_at")
    .eq("user_id", user.id)
    .single();

  return (
    <RetoClient
      userName={profile?.display_name || user.email?.split("@")[0] || ""}
      isRegistered={!!participant}
      initialInstagram={participant?.instagram_username || ""}
      initialObjetivo={participant?.objetivo || ""}
    />
  );
}
