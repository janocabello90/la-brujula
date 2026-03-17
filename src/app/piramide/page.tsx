import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import PiramideClient from "./PiramideClient";
import AppShell from "@/components/AppShell";
import type { PiramideData } from "@/lib/types";
import { DEFAULT_PIRAMIDE } from "@/lib/types";

export default async function PiramidePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/acceso-buena-vida");

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

  return (
    <AppShell fullWidth>
      <PiramideClient initialData={piramide as PiramideData} userId={user.id} />
    </AppShell>
  );
}
