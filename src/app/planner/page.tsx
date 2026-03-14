import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import PlannerClient from "./PlannerClient";

export default async function PlannerPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <PlannerClient userId={user.id} />;
}
