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

    if (Object.keys(arbolMeta).length > 0) {
      updates.arbol_meta = arbolMeta;
    }

    updates.updated_at = new Date().toISOString();

    if (synced.length === 0) {
      return NextResponse.json({ synced: [], message: "No hay datos nuevos para sincronizar." });
    }

    // Update brújula data
    const { error } = await supabase
      .from("brujula_data")
      .update(updates)
      .eq("user_id", userId);

    if (error) {
      console.error("Sync error:", error);
      return NextResponse.json(
        { error: "Error al sincronizar con La Brújula." },
        { status: 500 }
      );
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
