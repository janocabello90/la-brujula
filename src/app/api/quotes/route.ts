import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET: devuelve todas las frases del repositorio
export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("quotes")
      .select("id, text, author")
      .order("created_at", { ascending: false });

    if (error) {
      // Si la tabla no existe, devolver las frases por defecto
      if (error.code === "42P01") {
        return NextResponse.json({ quotes: DEFAULT_QUOTES, source: "fallback" });
      }
      throw error;
    }

    // Si no hay frases en la BD, devolver las por defecto
    if (!data || data.length === 0) {
      return NextResponse.json({ quotes: DEFAULT_QUOTES, source: "fallback" });
    }

    return NextResponse.json({ quotes: data, source: "supabase", total: data.length });
  } catch (err: any) {
    console.error("Error fetching quotes:", err);
    return NextResponse.json({ quotes: DEFAULT_QUOTES, source: "fallback" });
  }
}

// Frases por defecto (fallback si la tabla no existe aún)
const DEFAULT_QUOTES = [
  { text: "El contenido es fuego. Las redes sociales son gasolina.", author: "Jay Baer" },
  { text: "La gente no compra lo que haces, compra por qué lo haces.", author: "Simon Sinek" },
  { text: "Tu marca personal es lo que dicen de ti cuando no estás en la sala.", author: "Jeff Bezos" },
  { text: "La mejor forma de predecir el futuro es creándolo.", author: "Peter Drucker" },
  { text: "No busques clientes para tus productos, busca productos para tus clientes.", author: "Seth Godin" },
  { text: "La creatividad es la inteligencia divirtiéndose.", author: "Albert Einstein" },
  { text: "El marketing ya no va de las cosas que haces, sino de las historias que cuentas.", author: "Seth Godin" },
  { text: "La estrategia sin táctica es el camino más lento hacia la victoria. La táctica sin estrategia es el ruido antes de la derrota.", author: "Sun Tzu" },
  { text: "El que tiene un porqué para vivir puede soportar casi cualquier cómo.", author: "Friedrich Nietzsche" },
  { text: "Invierte en ti mismo. Tu carrera es el motor de tu riqueza.", author: "Warren Buffett" },
];
