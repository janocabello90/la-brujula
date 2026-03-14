import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { itemId, summary, description, date, time } = body;

    if (!itemId || !date || !time) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Build the calendar event URL for Google Calendar
    // Format: YYYYMMDDTHHMMSS
    const dateClean = date.replace(/-/g, "");
    const timeClean = time.replace(/:/g, "") + "00";
    const startDateTime = `${dateClean}T${timeClean}`;

    // End time = start + 1 hour
    const startDate = new Date(`${date}T${time}:00`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const endDateStr = endDate.toISOString().split("T")[0].replace(/-/g, "");
    const endTimeStr =
      endDate.toTimeString().split(":").slice(0, 2).join("") + "00";
    const endDateTime = `${endDateStr}T${endTimeStr}`;

    // Generate Google Calendar URL (universal, works without API auth)
    const gcalUrl = new URL("https://calendar.google.com/calendar/render");
    gcalUrl.searchParams.set("action", "TEMPLATE");
    gcalUrl.searchParams.set("text", summary || "Contenido planificado");
    gcalUrl.searchParams.set("dates", `${startDateTime}/${endDateTime}`);
    gcalUrl.searchParams.set(
      "details",
      description || "Pieza de contenido de La Brújula"
    );

    // Mark as synced in DB
    await supabase
      .from("planner_items")
      .update({
        gcal_synced: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      gcalUrl: gcalUrl.toString(),
    });
  } catch (error: any) {
    console.error("Calendar sync error:", error);
    return NextResponse.json(
      { error: "Error al sincronizar" },
      { status: 500 }
    );
  }
}
