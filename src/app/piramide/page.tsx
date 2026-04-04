import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import PiramideClient from "./PiramideClient";
import AppShell from "@/components/AppShell";
import type { PiramideData } from "@/lib/types";
import { DEFAULT_PIRAMIDE } from "@/lib/types";

const ADMIN_EMAILS = ["janocabellom@gmail.com", "jano.cmg@gmail.com"];

export default async function PiramidePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/acceso-buena-vida");

  const isAdmin = ADMIN_EMAILS.includes(user.email || "");

  // Fetch existing piramide data
  let { data: piramide } = await supabase
    .from("piramide_data")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Auto-create if doesn't exist
  if (!piramide) {
    const { data: newPiramide } = await supabase
      .from("piramide_data")
      .insert({
        user_id: user.id,
        current_step: "prologo",
        steps_completed: [],
        prologo: DEFAULT_PIRAMIDE.prologo,
        mentalidad: DEFAULT_PIRAMIDE.mentalidad,
        buena_vida: DEFAULT_PIRAMIDE.buena_vida,
        bajo_tierra: DEFAULT_PIRAMIDE.bajo_tierra,
        nivel_1: DEFAULT_PIRAMIDE.nivel_1,
        nivel_2: DEFAULT_PIRAMIDE.nivel_2,
        nivel_3: DEFAULT_PIRAMIDE.nivel_3,
        nivel_4: DEFAULT_PIRAMIDE.nivel_4,
      })
      .select()
      .single();
    piramide = newPiramide;
  }

  // Fetch profile for notification data
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("id", user.id)
    .single();

  return (
    <AppShell fullWidth>
      <PiramideClient
        initialData={piramide as PiramideData}
        userId={user.id}
        isAdmin={isAdmin}
        userName={profile?.display_name || user.email?.split("@")[0] || ""}
        userEmail={user.email || ""}
      />
    </AppShell>
  );
}
