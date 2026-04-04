import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = ["janocabellom@gmail.com", "jano.cmg@gmail.com"];

export async function POST(request: Request) {
  const supabase = await createServerClient();

  // Verify admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { userId, updates } = await request.json();

  if (!userId || !updates) {
    return NextResponse.json(
      { error: "userId y updates requeridos" },
      { status: 400 }
    );
  }

  try {
    // Update the profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log the action in admin_activity_log
    const { error: logError } = await supabase.from("admin_activity_log").insert({
      admin_email: user.email,
      action: "update_user",
      target_user_id: userId,
      details: updates,
    });

    if (logError) {
      console.error("Error logging admin activity:", logError);
      // Don't fail the request if logging fails, just log the error
    }

    return NextResponse.json({ ok: true, profile: updatedProfile });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: error.message || "Error updating user" },
      { status: 500 }
    );
  }
}
