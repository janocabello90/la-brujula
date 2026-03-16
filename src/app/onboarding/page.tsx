import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import OnboardingFlow from "@/components/OnboardingFlow";

export default async function OnboardingPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/acceso-buena-vida");

  // Load existing data if any
  const { data: brujulaData } = await supabase
    .from("brujula_data")
    .select("*")
    .eq("user_id", user.id)
    .single();

  let { data: profile } = await supabase
    .from("profiles")
    .select("api_key")
    .eq("id", user.id)
    .single();

  // Auto-create profile if missing (email+password signup doesn't go through callback)
  if (!profile) {
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "";
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      display_name: displayName,
      onboarding_completed: false,
    });
    profile = { api_key: null };
  }

  const initialData = brujulaData
    ? {
        briefing: brujulaData.briefing,
        buyer: brujulaData.buyer,
        empathy: brujulaData.empathy,
        insight: brujulaData.insight,
        tree: brujulaData.tree,
        channels: brujulaData.channels,
        apiKey: profile?.api_key || "",
      }
    : undefined;

  return <OnboardingFlow userId={user.id} initialData={initialData} />;
}
