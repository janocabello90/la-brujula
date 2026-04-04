import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerClient();

  // Verify user auth (not admin)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { exerciseType, studentName, studentEmail } = await request.json();

  if (!exerciseType || !studentName || !studentEmail) {
    return NextResponse.json(
      { error: "exerciseType, studentName y studentEmail requeridos" },
      { status: 400 }
    );
  }

  // Validate exerciseType
  if (!["piramide", "arbol"].includes(exerciseType)) {
    return NextResponse.json(
      { error: "exerciseType debe ser 'piramide' o 'arbol'" },
      { status: 400 }
    );
  }

  try {
    // Check if student has premium or vip role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "No se pudo verificar el rol del estudiante" },
        { status: 500 }
      );
    }

    // Check if user has premium or vip role
    if (!profile || !["premium", "vip"].includes(profile.role || "")) {
      // User is not premium/vip, return ok but don't send notification
      return NextResponse.json({ ok: true });
    }

    // Prepare email content
    const exerciseName =
      exerciseType === "piramide" ? "Pirámide" : "Árbol";
    const subject = `🎯 ${studentName} ha completado ${exerciseName}`;
    const timestamp = new Date().toLocaleString("es-ES");
    const adminLink = `${request.headers.get("origin") || "https://sistema.janocabello.com"}/admin/alumnos`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { color: #2563eb; margin-bottom: 20px; }
    .exercise-type { color: #7c3aed; font-weight: bold; }
    .details { background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .detail-row { margin: 8px 0; }
    .label { font-weight: bold; color: #666; }
    .cta-button { background-color: #2563eb; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 15px; }
    .footer { color: #999; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Notificación de Ejercicio Completado</h2>
    </div>

    <p>¡Hola! Un estudiante ha completado un ejercicio:</p>

    <div class="details">
      <div class="detail-row">
        <span class="label">Estudiante:</span> ${studentName}
      </div>
      <div class="detail-row">
        <span class="label">Email:</span> <a href="mailto:${studentEmail}">${studentEmail}</a>
      </div>
      <div class="detail-row">
        <span class="label">Ejercicio:</span> <span class="exercise-type">${exerciseName}</span>
      </div>
      <div class="detail-row">
        <span class="label">Fecha y Hora:</span> ${timestamp}
      </div>
    </div>

    <p>
      <a href="${adminLink}" class="cta-button">Ver en Admin</a>
    </p>

    <div class="footer">
      <p>Este es un mensaje automático del Sistema de Buena Vida.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Send email via Resend API if available
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.log(`Exercise notification (Resend not configured): ${studentName} completed ${exerciseName}`);
      return NextResponse.json({ ok: true });
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "El Sistema <notificaciones@sistema.janocabello.com>",
          to: "janocabellom@gmail.com",
          subject: subject,
          html: htmlBody,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Resend API error:", error);
        // Log but don't fail - graceful degradation
        return NextResponse.json({ ok: true });
      }

      return NextResponse.json({ ok: true });
    } catch (resendError) {
      console.error("Error sending email via Resend:", resendError);
      // Graceful degradation - return ok even if email fails
      return NextResponse.json({ ok: true });
    }
  } catch (error: any) {
    console.error("Notify exercise error:", error);
    return NextResponse.json(
      { error: error.message || "Error en notificación" },
      { status: 500 }
    );
  }
}
