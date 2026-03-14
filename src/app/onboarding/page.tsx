import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import OnboardingFlow from "@/components/OnboardingFlow";

export default async function OnboardingPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Load existing data if any
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
