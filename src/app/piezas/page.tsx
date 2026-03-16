import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import PiezasClient from "./PiezasClient";

export default async function PiezasPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) redirect("/onboarding");

  return <PiezasClient userId={user.id} />;
}
