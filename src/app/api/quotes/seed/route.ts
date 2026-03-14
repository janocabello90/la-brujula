import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const INITIAL_QUOTES = [
  { text: "El contenido es fuego. Las redes sociales son gasolina.", author: "Jay Baer" },
  { text: "La gente no compra lo que haces, compra por qué lo haces.", author: "Simon Sinek" },
  { text: "Tu marca personal es lo que dicen de ti cuando no estás en la sala.", author: "Jeff Bezos" },
  { text: "La mejor forma de predecir el futuro es creándolo.", author: "Peter Drucker" },
  { text: "No busques clientes para tus productos, busca productos para tus clientes.", author: "Seth Godin" },
  { text: "La creatividad es la inteligencia divirtiéndose.", author: "Albert Einstein" },
  { text: "Haz las cosas simples, no más simples.", author: "Albert Einstein" },
  { text: "El marketing ya no va de las cosas que haces, sino de las historias que cuentas.", author: "Seth Godin" },
  { text: "La estrategia sin táctica es el camino más lento hacia la victoria. La táctica sin estrategia es el ruido antes de la derrota.", author: "Sun Tzu" },
  { text: "El que tiene un porqué para vivir puede soportar casi cualquier cómo.", author: "Friedrich Nietzsche" },
  { text: "Invierte en ti mismo. Tu carrera es el motor de tu riqueza.", author: "Warren Buffett" },
  { text: "La vida no se trata de encontrarte a ti mismo, se trata de crearte a ti mismo.", author: "George Bernard Shaw" },
  { text: "Donde todos piensan igual, nadie piensa mucho.", author: "Walter Lippmann" },
  { text: "El éxito no es la clave de la felicidad. La felicidad es la clave del éxito.", author: "Albert Schweitzer" },
  { text: "Sé tú mismo; todos los demás ya están ocupados.", author: "Oscar Wilde" },
  { text: "La mejor inversión que puedes hacer es en ti mismo.", author: "Warren Buffett" },
  { text: "No tienes que ser grande para empezar, pero tienes que empezar para ser grande.", author: "Zig Ziglar" },
  { text: "Tu tiempo es limitado, no lo malgastes viviendo la vida de otro.", author: "Steve Jobs" },
  { text: "La marca personal no es lo que tú dices que eres. Es lo que Google dice que eres.", author: "Chris Anderson" },
  { text: "El mundo hace sitio al hombre que sabe adónde va.", author: "Ralph Waldo Emerson" },
  { text: "Crea contenido que enseñe. No puedes rendirte con eso.", author: "Gary Vaynerchuk" },
  { text: "Lo que no se mide, no se puede mejorar.", author: "Peter Drucker" },
  { text: "El secreto de ir adelante es empezar.", author: "Mark Twain" },
  { text: "Haz lo que amas y no trabajarás un solo día de tu vida.", author: "Confucio" },
];

export async function POST() {
  try {
    const supabase = await createServerClient();

    // Check if quotes already exist
    const { data: existing, error: checkError } = await supabase
      .from("quotes")
      .select("id")
      .limit(1);

    if (checkError && checkError.code === "42P01") {
      return NextResponse.json(
        { error: "La tabla 'quotes' no existe. Créala primero en Supabase con: CREATE TABLE quotes (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, text text NOT NULL, author text NOT NULL, created_at timestamptz DEFAULT now());" },
        { status: 400 }
      );
    }

    if (existing && existing.length > 0) {
      // Already seeded, add only new ones (avoid duplicates by text)
      const { data: allExisting } = await supabase.from("quotes").select("text");
      const existingTexts = new Set((allExisting || []).map((q) => q.text));
      const newQuotes = INITIAL_QUOTES.filter((q) => !existingTexts.has(q.text));

      if (newQuotes.length === 0) {
        return NextResponse.json({ message: "No hay frases nuevas que añadir", total: allExisting?.length || 0 });
      }

      const { error: insertError } = await supabase.from("quotes").insert(newQuotes);
      if (insertError) throw insertError;

      return NextResponse.json({ message: `Añadidas ${newQuotes.length} frases nuevas`, total: (allExisting?.length || 0) + newQuotes.length });
    }

    // First seed
    const { error: insertError } = await supabase.from("quotes").insert(INITIAL_QUOTES);
    if (insertError) throw insertError;

    return NextResponse.json({ message: `Repositorio creado con ${INITIAL_QUOTES.length} frases`, total: INITIAL_QUOTES.length });
  } catch (err: any) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
