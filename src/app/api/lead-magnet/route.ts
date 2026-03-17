import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/lead-magnet
 * Receives email from the landing form or the quiz,
 * sends it to Loop to trigger the 7-email sequence.
 *
 * Body: { email: string, score?: number, answers?: number[] }
 *
 * Loop API docs: https://loops.so/docs/api-reference
 * Requires LOOP_API_KEY env variable in Vercel.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, score, answers } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const LOOP_API_KEY = process.env.LOOP_API_KEY;

    if (!LOOP_API_KEY) {
      // If no Loop key configured, just log and return OK
      // This allows the quiz to work even without Loop connected
      console.log("[Lead Magnet] No LOOP_API_KEY — email captured:", email, { score, answers });
      return NextResponse.json({ ok: true, note: "Loop not configured yet" });
    }

    // Create or update contact in Loop
    const loopResponse = await fetch("https://app.loops.so/api/v1/contacts/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOOP_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        source: "diagnostico-piramide",
        // Custom fields (create these in Loop dashboard first)
        ...(score !== undefined && { diagnosticoScore: score }),
        ...(answers && {
          diagnosticoHistoria: answers[0] ?? null,
          diagnosticoValores: answers[1] ?? null,
          diagnosticoMercado: answers[2] ?? null,
          diagnosticoEstrategia: answers[3] ?? null,
          diagnosticoResultados: answers[4] ?? null,
        }),
      }),
    });

    if (!loopResponse.ok) {
      const loopError = await loopResponse.text();
      console.error("[Lead Magnet] Loop API error:", loopError);
      // Still return OK to user — don't block the experience
      return NextResponse.json({ ok: true, note: "Loop sync failed" });
    }

    // Trigger the email sequence event
    await fetch("https://app.loops.so/api/v1/events/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOOP_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        eventName: "lead-magnet-diagnostico",
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Lead Magnet] Error:", error);
    return NextResponse.json({ ok: true }); // Don't expose errors
  }
}
