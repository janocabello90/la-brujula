import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import MinorityReportClient from "./MinorityReportClient";

export default async function MinorityReportPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: brujulaData } = await supabase
    .from("brujula_data")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: historyData } = await supabase
    .from("suggestion_history")
    .select("suggestion")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <MinorityReportClient
      data={brujulaData}
      history={historyData?.map((h) => h.suggestion) || []}
    />
  );
}
