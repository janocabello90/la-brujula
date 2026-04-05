import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Get project
    const { data: project, error: projectError } = await supabase
      .from("creator_projects")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      );
    }

    // Get slides if carousel
    let slides = null;
    if (project.project_type === "carousel") {
      const { data: slidesData } = await supabase
        .from("creator_slides")
        .select("*")
        .eq("project_id", params.id)
        .order("slide_order", { ascending: true });

      slides = slidesData || [];
    }

    return NextResponse.json({ project, slides });
  } catch (err: any) {
    console.error("API creador [id] GET error:", err);
    return NextResponse.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: project, error: projectError } = await supabase
      .from("creator_projects")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      );
    }

    const updates = await request.json();

    // Only allow specific fields to be updated
    const allowedFields = [
      "title",
      "content",
      "status",
      "analytics",
      "ai_insights",
    ];
    const filteredUpdates: any = {};

    for (const field of allowedFields) {
      if (field in updates) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (updates.status === "published" && !filteredUpdates.published_at) {
      filteredUpdates.published_at = new Date().toISOString();
    }

    filteredUpdates.updated_at = new Date().toISOString();

    const { data: updatedProject, error: updateError } = await supabase
      .from("creator_projects")
      .update(filteredUpdates)
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Error al actualizar proyecto" },
        { status: 500 }
      );
    }

    return NextResponse.json({ project: updatedProject });
  } catch (err: any) {
    console.error("API creador [id] PATCH error:", err);
    return NextResponse.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: project, error: projectError } = await supabase
      .from("creator_projects")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("creator_projects")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Error al eliminar proyecto" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API creador [id] DELETE error:", err);
    return NextResponse.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
