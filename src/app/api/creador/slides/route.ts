import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
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

    const { project_id, slide_order, title, description, cta_text, image_url } =
      await request.json();

    if (!project_id) {
      return NextResponse.json(
        { error: "ID de proyecto requerido" },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: project } = await supabase
      .from("creator_projects")
      .select("id")
      .eq("id", project_id)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      );
    }

    const { data: slide, error } = await supabase
      .from("creator_slides")
      .insert({
        project_id,
        slide_order: slide_order || 0,
        title: title || "",
        description: description || "",
        cta_text: cta_text || "",
        image_url: image_url || "",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Error al crear diapositiva" },
        { status: 500 }
      );
    }

    return NextResponse.json({ slide }, { status: 201 });
  } catch (err: any) {
    console.error("API creador slides POST error:", err);
    return NextResponse.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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

    const { id, title, description, cta_text, image_url, slide_order } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID de diapositiva requerido" },
        { status: 400 }
      );
    }

    // Verify ownership through project
    const { data: slide } = await supabase
      .from("creator_slides")
      .select("project_id")
      .eq("id", id)
      .single();

    if (!slide) {
      return NextResponse.json(
        { error: "Diapositiva no encontrada" },
        { status: 404 }
      );
    }

    const { data: project } = await supabase
      .from("creator_projects")
      .select("id")
      .eq("id", slide.project_id)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Acceso denegado" },
        { status: 403 }
      );
    }

    const updates: any = { updated_at: new Date().toISOString() };

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (cta_text !== undefined) updates.cta_text = cta_text;
    if (image_url !== undefined) updates.image_url = image_url;
    if (slide_order !== undefined) updates.slide_order = slide_order;

    const { data: updatedSlide, error } = await supabase
      .from("creator_slides")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Error al actualizar diapositiva" },
        { status: 500 }
      );
    }

    return NextResponse.json({ slide: updatedSlide });
  } catch (err: any) {
    console.error("API creador slides PATCH error:", err);
    return NextResponse.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID de diapositiva requerido" },
        { status: 400 }
      );
    }

    // Verify ownership through project
    const { data: slide } = await supabase
      .from("creator_slides")
      .select("project_id")
      .eq("id", id)
      .single();

    if (!slide) {
      return NextResponse.json(
        { error: "Diapositiva no encontrada" },
        { status: 404 }
      );
    }

    const { data: project } = await supabase
      .from("creator_projects")
      .select("id")
      .eq("id", slide.project_id)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Acceso denegado" },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from("creator_slides")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Error al eliminar diapositiva" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API creador slides DELETE error:", err);
    return NextResponse.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
