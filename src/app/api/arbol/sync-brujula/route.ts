import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Falta userId" }, { status: 400 });
    }

    const supabase = await createServerClient();

    // Get árbol data
    const { data: arbolData } = await supabase
      .from("arbol_data")
      .select("tronco, copa, entorno, ramas")
      .eq("user_id", userId)
      .single();

    if (!arbolData) {
      return NextResponse.json(
        { error: "No hay datos del Árbol." },
        { status: 400 }
      );
    }

    // Get current brújula data
    const { data: brujulaData } = await supabase
      .from("brujula_data")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!brujulaData) {
      return NextResponse.json(
        { error: "No hay datos de La Brújula. Completa el onboarding primero." },
        { status: 400 }
      );
    }

    // Build updated fields from Árbol
    const updates: Record<string, any> = {};
    const synced: string[] = [];

    // Briefing: tema raíz y propuesta de valor
    if (arbolData.tronco?.temaPrincipal || arbolData.tronco?.propuestaValor) {
      const currentBriefing = brujulaData.briefing || {};
      updates.briefing = {
        ...currentBriefing,
        ...(arbolData.tronco.temaPrincipal ? { temaRaiz: arbolData.tronco.temaPrincipal } : {}),
        ...(arbolData.tronco.propuestaValor ? { propuestaValor: arbolData.tronco.propuestaValor } : {}),
      };
      if (arbolData.tronco.temaPrincipal) synced.push("Tema raíz actualizado desde El Tronco");
      if (arbolData.tronco.propuestaValor) synced.push("Propuesta de valor actualizada desde El Tronco");
    }

    // Channels: from Entorno
    if (arbolData.entorno?.dondeEstan?.length > 0) {
      const currentChannels = brujulaData.channels || {};
      updates.channels = {
        ...currentChannels,
        canales: arbolData.entorno.dondeEstan,
      };
      synced.push("Canales actualizados desde El Entorno");
    }

    // Store tono and narrativa as metadata for Maestro context
    const arbolMeta: Record<string, any> = {};
    if (arbolData.copa?.tonoDeVoz) {
      arbolMeta.tono = arbolData.copa.tonoDeVoz;
      synced.push("Tono de voz sincronizado desde La Copa");
    }
    if (arbolData.copa?.narrativa) {
      arbolMeta.narrativa = arbolData.copa.narrativa;
      synced.push("Narrativa sincronizada desde La Copa");
    }
    if (arbolData.copa?.energia) {
      arbolMeta.energia = arbolData.copa.energia;
      synced.push("Energía sincronizada desde La Copa");
    }
    if (arbolData.copa?.arquetipos?.length > 0) {
      arbolMeta.arquetipos = arbolData.copa.arquetipos;
      synced.push("Arquetipos sincronizados desde La Copa");
    }
    if (arbolData.ramas?.formatosComunicacion?.length > 0) {
      arbolMeta.formatosPreferidos = arbolData.ramas.formatosComunicacion;
      synced.push("Formatos preferidos sincronizados desde Las Ramas");
    }

    updates.updated_at = new Date().toISOString();

    // Separate arbol_meta from core updates (column may not exist yet)
    const coreUpdates = { ...updates };
    if (Object.keys(arbolMeta).length > 0) {
      // Try arbol_meta separately so it doesn't break the whole sync
    }

    if (synced.length === 0) {
      return NextResponse.json({ synced: [], message: "No hay datos nuevos para sincronizar." });
    }

    // Update brújula data (core fields: briefing, channels)
    const { error } = await supabase
      .from("brujula_data")
      .update(coreUpdates)
      .eq("user_id", userId);

    if (error) {
      console.error("Sync error:", error);
      return NextResponse.json(
        { error: "Error al sincronizar con La Brújula." },
        { status: 500 }
      );
    }

    // Try to update arbol_meta column (may not exist yet — that's OK)
    if (Object.keys(arbolMeta).length > 0) {
      const { error: metaError } = await supabase
        .from("brujula_data")
        .update({ arbol_meta: arbolMeta })
        .eq("user_id", userId);

      if (metaError) {
        console.warn("arbol_meta column may not exist yet:", metaError.message);
        // Remove arbol_meta-related items from synced list but don't fail
        const metaLabels = ["Tono de voz", "Narrativa", "Energía", "Arquetipos", "Formatos preferidos"];
        const filtered = synced.filter((s) => !metaLabels.some((l) => s.includes(l)));
        return NextResponse.json({
          synced: [...filtered, "⚠️ Para sincronizar tono, arquetipos y narrativa, ejecuta: ALTER TABLE brujula_data ADD COLUMN arbol_meta jsonb DEFAULT '{}'"],
          message: `${filtered.length} elementos sincronizados (arbol_meta pendiente)`,
        });
      }
    }

    return NextResponse.json({ synced, message: `${synced.length} elementos sincronizados` });
  } catch (err: any) {
    console.error("Sync error:", err);
    return NextResponse.json(
      { error: "Error al sincronizar." },
      { status: 500 }
    );
  }
}
