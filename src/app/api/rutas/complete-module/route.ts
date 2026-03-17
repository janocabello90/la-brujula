import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { userId, moduleId } = await request.json();

    if (!userId || !moduleId) {
      return NextResponse.json(
        { error: "Se requieren userId y moduleId" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Fetch current user_journey
    const { data: journey, error: fetchError } = await supabase
      .from("user_journey")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError || !journey) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Find and mark module as complete
    const modulos = (journey.ruta_modulos || []) as Array<{
      id: string;
      nombre: string;
      descripcion: string;
      completado: boolean;
      fecha_completado: string | null;
    }>;

    const moduleIndex = modulos.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) {
      return NextResponse.json(
        { error: "Módulo no encontrado" },
        { status: 404 }
      );
    }

    // Mark as completed
    const now = new Date().toISOString();
    modulos[moduleIndex].completado = true;
    modulos[moduleIndex].fecha_completado = now;

    // Check if all modules are now complete
    const allComplete = modulos.every((m) => m.completado);
    const updateData: any = { ruta_modulos: modulos };

    if (allComplete && journey.current_phase === 3) {
      // Advance to phase 4
      const phaseStarted = journey.phase_started_at || {};
      updateData.current_phase = 4;
      updateData.phase_started_at = { ...phaseStarted, "4": now };
    }

    // Update the journey
    const { data: updated, error: updateError } = await supabase
      .from("user_journey")
      .update(updateData)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Error al actualizar el módulo" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      journey: updated,
      allComplete,
    });
  } catch (err: any) {
    console.error("Complete module error:", err);
    return NextResponse.json(
      { error: "Error al completar el módulo" },
      { status: 500 }
    );
  }
}
