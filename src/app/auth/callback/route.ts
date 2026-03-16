import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Get display name from Google or email
        const displayName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "";

        // Ensure profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed, display_name")
          .eq("id", user.id)
          .single();

        if (!profile) {
          // Create profile for new user
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            display_name: displayName,
            onboarding_completed: false,
          });
          return NextResponse.redirect(`${origin}/onboarding`);
        }

        // Update display name from Google if not set yet
        if (!profile.display_name && displayName) {
          await supabase
            .from("profiles")
            .update({ display_name: displayName })
            .eq("id", user.id);
        }

        if (!profile.onboarding_completed) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
