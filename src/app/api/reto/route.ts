import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// Challenge start date — adjust as needed
const RETO_START = new Date("2026-04-07T00:00:00Z");

function getCurrentDay(): number {
  const now = new Date();
  const diff = now.getTime() - RETO_START.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.min(day, 15));
}

/**
 * GET /api/reto — Fetch ranking + optional personal data
 * Query: ?action=ranking | ?action=me
 */
export async function GET(req: NextRequest) {
  const supabase = await createServerClient();
  const action = req.nextUrl.searchParams.get("action");

  if (action === "me") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No auth" }, { status: 401 });

    const { data: participant } = await supabase
      .from("reto_participantes")
      .select("id, instagram_username, objetivo, created_at")
      .eq("user_id", user.id)
      .single();

    if (!participant) {
      return NextResponse.json({ registered: false, currentDay: getCurrentDay() });
    }

    const { data: checkins } = await supabase
      .from("reto_checkins")
      .select("dia, likes, comentarios, desbloqueador, created_at")
      .eq("participante_id", participant.id)
      .order("dia", { ascending: true });

    // Get user's display name from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      registered: true,
      participant: { ...participant, nombre: profile?.display_name || "" },
      checkins: checkins || [],
      currentDay: getCurrentDay(),
    });
  }

  // Default: return full ranking
  const { data: participantes } = await supabase
    .from("reto_participantes")
    .select("id, user_id, instagram_username, objetivo, created_at");

  if (!participantes || participantes.length === 0) {
    return NextResponse.json({
      ranking: [],
      currentDay: getCurrentDay(),
      totalParticipantes: 0,
    });
  }

  // Fetch profiles for names
  const userIds = participantes.map((p) => p.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", userIds);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p.display_name || ""]));

  // Fetch all checkins
  const participantIds = participantes.map((p) => p.id);
  const { data: allCheckins } = await supabase
    .from("reto_checkins")
    .select("participante_id, dia, likes, comentarios, desbloqueador")
    .in("participante_id", participantIds);

  // Build ranking
  const ranking = participantes.map((p) => {
    const checkins = (allCheckins || []).filter((c) => c.participante_id === p.id);
    const diasPublicados = checkins.length;
    const totalLikes = checkins.reduce((sum, c) => sum + (c.likes || 0), 0);
    const totalComentarios = checkins.reduce((sum, c) => sum + (c.comentarios || 0), 0);
    const totalEngagement = totalLikes + totalComentarios;
    const desbloqueadores = checkins
      .filter((c) => c.desbloqueador && c.desbloqueador.trim().length > 0)
      .map((c) => ({ dia: c.dia, texto: c.desbloqueador }));

    // Streak: consecutive days from day 1
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
      nombre: profileMap.get(p.user_id) || "Participante",
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

  ranking.sort((a, b) => {
    if (b.racha !== a.racha) return b.racha - a.racha;
    return b.totalEngagement - a.totalEngagement;
  });

  return NextResponse.json({
    ranking,
    currentDay: getCurrentDay(),
    totalParticipantes: ranking.length,
  });
}

/**
 * POST /api/reto — Join or Check-in
 * Body: { action: "join", instagram_username, objetivo }
 *     | { action: "checkin", dia, likes, comentarios, desbloqueador }
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Inicia sesión primero" }, { status: 401 });
  }

  const body = await req.json();

  if (body.action === "join") {
    const { instagram_username, objetivo } = body;

    if (!instagram_username) {
      return NextResponse.json({ error: "Instagram es obligatorio" }, { status: 400 });
    }

    // Check if already registered
    const { data: existing } = await supabase
      .from("reto_participantes")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      return NextResponse.json({ ok: true, already: true });
    }

    const igClean = instagram_username.trim().replace(/^@/, "");

    const { error } = await supabase
      .from("reto_participantes")
      .insert({
        user_id: user.id,
        instagram_username: igClean,
        objetivo: objetivo?.trim() || null,
      });

    if (error) {
      console.error("[Reto] Join error:", error);
      return NextResponse.json({ error: "Error al apuntarte. Inténtalo de nuevo." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  if (body.action === "checkin") {
    const { dia, likes, comentarios, desbloqueador } = body;

    if (!dia) {
      return NextResponse.json({ error: "Día requerido" }, { status: 400 });
    }

    // Get participant id
    const { data: participant } = await supabase
      .from("reto_participantes")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!participant) {
      return NextResponse.json({ error: "No estás apuntado al reto" }, { status: 400 });
    }

    const currentDay = getCurrentDay();
    if (dia > currentDay) {
      return NextResponse.json({ error: "No puedes hacer check-in de un día futuro" }, { status: 400 });
    }

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
      return NextResponse.json({ error: "Error al guardar." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
