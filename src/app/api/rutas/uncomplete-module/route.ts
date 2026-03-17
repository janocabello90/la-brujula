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

    // Find and mark module as incomplete
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

    // Mark as incomplete
    modulos[moduleIndex].completado = false;
    modulos[moduleIndex].fecha_completado = null;

    // Check if we need to revert from phase 4 to phase 3
    const updateData: any = { ruta_modulos: modulos };

    if (journey.current_phase === 4) {
      // Revert to phase 3 since not all modules are complete
      const phaseStarted = journey.phase_started_at || {};
      updateData.current_phase = 3;
      // Keep the original phase 3 start date
      updateData.phase_started_at = phaseStarted;
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
    });
  } catch (err: any) {
    console.error("Uncomplete module error:", err);
    return NextResponse.json(
      { error: "Error al desmarcar el módulo" },
      { status: 500 }
    );
  }
}
