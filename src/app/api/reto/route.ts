import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service-level client for reto (no auth required)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Challenge start date — adjust as needed
const RETO_START = new Date("2026-04-07T00:00:00Z"); // Monday after announcement

function getCurrentDay(): number {
  const now = new Date();
  const diff = now.getTime() - RETO_START.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.min(day, 15));
}

/**
 * GET /api/reto — Fetch ranking data
 * Query: ?action=ranking | ?action=participant&token=xxx
 */
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  const action = req.nextUrl.searchParams.get("action");
  const token = req.nextUrl.searchParams.get("token");

  if (action === "participant" && token) {
    // Fetch single participant + their checkins
    const { data: participant } = await supabase
      .from("reto_participantes")
      .select("id, nombre, instagram_username, objetivo, created_at")
      .eq("token", token)
      .single();

    if (!participant) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: checkins } = await supabase
      .from("reto_checkins")
      .select("dia, likes, comentarios, desbloqueador, created_at")
      .eq("participante_id", participant.id)
      .order("dia", { ascending: true });

    return NextResponse.json({
      participant,
      checkins: checkins || [],
      currentDay: getCurrentDay(),
      retoStart: RETO_START.toISOString(),
    });
  }

  // Default: return full ranking
  const { data: participantes } = await supabase
    .from("reto_participantes")
    .select("id, nombre, instagram_username, objetivo, created_at");

  const { data: allCheckins } = await supabase
    .from("reto_checkins")
    .select("participante_id, dia, likes, comentarios, desbloqueador");

  // Build ranking
  const ranking = (participantes || []).map((p) => {
    const checkins = (allCheckins || []).filter((c) => c.participante_id === p.id);
    const diasPublicados = checkins.length;
    const totalLikes = checkins.reduce((sum, c) => sum + (c.likes || 0), 0);
    const totalComentarios = checkins.reduce((sum, c) => sum + (c.comentarios || 0), 0);
    const totalEngagement = totalLikes + totalComentarios;
    const desbloqueadores = checkins
      .filter((c) => c.desbloqueador && c.desbloqueador.trim().length > 0)
      .map((c) => ({ dia: c.dia, texto: c.desbloqueador }));

    // Calculate streak (consecutive days from day 1)
    let racha = 0;
    for (let d = 1; d <= 15; d++) {
      if (checkins.some((c) => c.dia === d)) {
        racha = d;
      } else {
        break;
      }
    }

    return {
      id: p.id,
      nombre: p.nombre,
      instagram: p.instagram_username,
      objetivo: p.objetivo,
      diasPublicados,
      racha,
      totalLikes,
      totalComentarios,
      totalEngagement,
      desbloqueadores,
    };
  });

  // Sort by engagement (primary), then by streak
  ranking.sort((a, b) => {
    if (b.racha !== a.racha) return b.racha - a.racha;
    return b.totalEngagement - a.totalEngagement;
  });

  return NextResponse.json({
    ranking,
    currentDay: getCurrentDay(),
    retoStart: RETO_START.toISOString(),
    totalParticipantes: ranking.length,
  });
}

/**
 * POST /api/reto — Register or Check-in
 * Body: { action: "register", nombre, email, instagram_username, objetivo }
 *     | { action: "checkin", token, dia, likes, comentarios, desbloqueador }
 */
export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();

  if (body.action === "register") {
    const { nombre, email, instagram_username, objetivo } = body;

    if (!nombre || !email || !instagram_username) {
      return NextResponse.json({ error: "Nombre, email e Instagram son obligatorios" }, { status: 400 });
    }

    // Check if email already registered
    const { data: existing } = await supabase
      .from("reto_participantes")
      .select("token")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existing) {
      // Return existing token
      return NextResponse.json({ token: existing.token, existing: true });
    }

    // Clean instagram username (remove @ if present)
    const igClean = instagram_username.trim().replace(/^@/, "");

    const { data, error } = await supabase
      .from("reto_participantes")
      .insert({
        nombre: nombre.trim(),
        email: email.toLowerCase().trim(),
        instagram_username: igClean,
        objetivo: objetivo?.trim() || null,
      })
      .select("token")
      .single();

    if (error) {
      console.error("[Reto] Registration error:", error);
      return NextResponse.json({ error: "Error al registrarte. Inténtalo de nuevo." }, { status: 500 });
    }

    return NextResponse.json({ token: data.token, existing: false });
  }

  if (body.action === "checkin") {
    const { token, dia, likes, comentarios, desbloqueador } = body;

    if (!token || !dia) {
      return NextResponse.json({ error: "Token y día requeridos" }, { status: 400 });
    }

    // Verify participant
    const { data: participant } = await supabase
      .from("reto_participantes")
      .select("id")
      .eq("token", token)
      .single();

    if (!participant) {
      return NextResponse.json({ error: "Participante no encontrado" }, { status: 404 });
    }

    const currentDay = getCurrentDay();
    if (dia > currentDay) {
      return NextResponse.json({ error: "No puedes hacer check-in de un día futuro" }, { status: 400 });
    }

    // Upsert checkin
    const { error } = await supabase
      .from("reto_checkins")
      .upsert(
        {
          participante_id: participant.id,
          dia,
          likes: Math.max(0, parseInt(likes) || 0),
          comentarios: Math.max(0, parseInt(comentarios) || 0),
          desbloqueador: desbloqueador?.trim() || null,
        },
        { onConflict: "participante_id,dia" }
      );

    if (error) {
      console.error("[Reto] Checkin error:", error);
      return NextResponse.json({ error: "Error al guardar. Inténtalo de nuevo." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
