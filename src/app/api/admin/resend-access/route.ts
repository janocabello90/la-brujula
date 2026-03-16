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

  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  // Send password reset email (acts as a re-access link)
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${request.headers.get("origin") || "https://sistema.janocabello.com"}/auth/callback?next=/dashboard`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
