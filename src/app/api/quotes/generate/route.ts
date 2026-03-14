import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { userId, count = 10 } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Falta userId" }, { status: 400 });
    }

    const supabase = await createServerClient();

    // Get user API key
    const { data: profile } = await supabase
      .from("profiles")
      .select("api_key")
      .eq("id", userId)
      .single();

    if (!profile?.api_key) {
      return NextResponse.json({ error: "API Key no configurada" }, { status: 400 });
    }

    // Get existing quotes to avoid duplicates
    const { data: existing } = await supabase
      .from("quotes")
      .select("text, author")
      .order("created_at", { ascending: false })
      .limit(50);

    const existingList = (existing || [])
      .map((q) => `- "${q.text}" — ${q.author}`)
      .join("\n");

    const anthropic = new Anthropic({ apiKey: profile.api_key });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: `Eres un curador de frases célebres. Tu especialidad: frases inspiradoras sobre marca personal, estrategia digital, creatividad, emprendimiento, vida con propósito y filosofía de vida.

Buscamos frases de: filósofos (Séneca, Marco Aurelio, Nietzsche, Epicteto...), inversores (Buffett, Munger, Naval Ravikant...), gurús del marketing (Seth Godin, Gary Vee, Ogilvy, Simon Sinek...), emprendedores (Jobs, Bezos, Musk...), escritores y pensadores (Wilde, Twain, Emerson, Thoreau...), y cualquier figura relevante.

Las frases deben resonar con creadores de contenido y emprendedores que buscan construir una marca personal auténtica y vivir bien.`,
      messages: [
        {
          role: "user",
          content: `Genera exactamente ${Math.min(count, 20)} frases célebres nuevas que NO estén ya en esta lista:

${existingList || "(lista vacía)"}

Responde SOLO con un JSON array válido (sin markdown, sin backticks):
[{"text": "La frase exacta", "author": "Nombre del autor"}, ...]

IMPORTANTE:
- Frases REALES de autores REALES (no inventes frases ni las atribuyas a quien no las dijo)
- Variedad de autores y temáticas
- Mezcla de clásicos y contemporáneos
- Cortas y memorables (máximo 2 frases)
- NO repitas ninguna de la lista existente`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let newQuotes: { text: string; author: string }[];
    try {
      newQuotes = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        newQuotes = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No se pudo interpretar la respuesta");
      }
    }

    // Filter out any duplicates
    const existingTexts = new Set((existing || []).map((q) => q.text.toLowerCase()));
    const uniqueQuotes = newQuotes.filter(
      (q) => q.text && q.author && !existingTexts.has(q.text.toLowerCase())
    );

    if (uniqueQuotes.length > 0) {
      const { error: insertError } = await supabase.from("quotes").insert(uniqueQuotes);
      if (insertError) throw insertError;
    }

    // Get total count
    const { count: total } = await supabase
      .from("quotes")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      generated: uniqueQuotes.length,
      total: total || 0,
      quotes: uniqueQuotes,
    });
  } catch (err: any) {
    console.error("Quote generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
