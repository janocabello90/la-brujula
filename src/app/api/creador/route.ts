import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    let query = supabase
      .from("creator_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: projects, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Error al obtener proyectos" },
        { status: 500 }
      );
    }

    return NextResponse.json({ projects });
  } catch (err: any) {
    console.error("API creador GET error:", err);
    return NextResponse.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

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

    const {
      title,
      project_type,
      content,
      source_suggestion,
      canal,
      pilar,
      formato,
      tono,
    } = await request.json();

    if (!project_type) {
      return NextResponse.json(
        { error: "Tipo de proyecto requerido" },
        { status: 400 }
      );
    }

    const { data: project, error } = await supabase
      .from("creator_projects")
      .insert({
        user_id: user.id,
        title: title || "",
        project_type,
        content: content || {},
        source_suggestion: source_suggestion || {},
        canal: canal || "",
        pilar: pilar || "",
        formato: formato || "",
        tono: tono || "",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Error al crear proyecto" },
        { status: 500 }
      );
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: any) {
    console.error("API creador POST error:", err);
    return NextResponse.json(
      { error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
