import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Se requiere userId" },
        { status: 400 }
      );
    }

    // Call the diagnose endpoint to re-run the diagnostic
    const diagnoseResponse = await fetch(
      new URL("/api/arbol/diagnose", process.env.NEXTAUTH_URL || "http://localhost:3000"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      }
    );

    if (!diagnoseResponse.ok) {
      return NextResponse.json(
        { error: "Error al generar nuevo diagnóstico" },
        { status: 500 }
      );
    }

    const result = await diagnoseResponse.json();

    // Fetch updated journey
    const supabase = await createServerClient();
    const { data: journey } = await supabase
      .from("user_journey")
      .select("*")
      .eq("user_id", userId)
      .single();

    return NextResponse.json({
      success: true,
      result,
      journey,
    });
  } catch (err: any) {
    console.error("Re-diagnose error:", err);
    return NextResponse.json(
      { error: "Error al re-diagnosticar" },
      { status: 500 }
    );
  }
}
