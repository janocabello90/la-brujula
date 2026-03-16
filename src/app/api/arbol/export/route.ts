import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { userId, analysis } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Falta userId" }, { status: 400 });
    }

    const supabase = await createServerClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .single();

    const { data: arbolData } = await supabase
      .from("arbol_data")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!arbolData) {
      return NextResponse.json({ error: "No hay datos del Árbol." }, { status: 400 });
    }

    const name = profile?.display_name || "Tu Marca";

    // Generate HTML for PDF conversion
    const html = generateArbolHTML(arbolData, name, analysis);

    // We'll return HTML that the client can print/save as PDF
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="arbol-${name}.html"`,
      },
    });
  } catch (err: any) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Error al exportar." }, { status: 500 });
  }
}

function generateArbolHTML(data: any, name: string, analysis: any): string {
  const semilla = data.semilla || {};
  const raices = data.raices || {};
  const tronco = data.tronco || {};
  const ramas = data.ramas || {};
  const copa = data.copa || {};
  const frutos = data.frutos || {};
  const entorno = data.entorno || {};
  const tiempo = data.tiempo || {};
  const cofre = data.cofre || data.producto || {};

  const arquetipos = (copa.arquetipos || []).filter((a: any) => a.nombre);
  const productos = (cofre.productos || []).filter((p: any) => p.nombreProducto);

  const date = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>El Árbol de ${name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', sans-serif; color: #1a1a1a; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 28px; margin-bottom: 4px; }
  h2 { font-size: 18px; color: #E8652D; margin: 32px 0 12px; border-bottom: 2px solid #E8652D; padding-bottom: 4px; }
  h3 { font-size: 14px; color: #666; margin: 16px 0 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  p { font-size: 14px; margin-bottom: 8px; color: #333; }
  .subtitle { color: #888; font-size: 14px; }
  .tag { display: inline-block; background: #f5f5f5; border: 1px solid #e0e0e0; padding: 2px 10px; border-radius: 20px; font-size: 12px; margin: 2px; }
  .tag-orange { background: #FEF3ED; border-color: #E8652D40; color: #E8652D; }
  .section { margin-bottom: 24px; padding: 20px; border: 1px solid #e8e8e8; border-radius: 12px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .highlight { background: #FEF3ED; border: 1px solid #E8652D30; padding: 16px; border-radius: 12px; text-align: center; font-style: italic; font-size: 16px; margin: 20px 0; }
  .alert { background: #FFF8E1; border-left: 3px solid #FFA000; padding: 8px 12px; font-size: 13px; margin: 4px 0; }
  .strength { background: #E8F5E9; border-left: 3px solid #4CAF50; padding: 8px 12px; font-size: 13px; margin: 4px 0; }
  .product { border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px; margin: 8px 0; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e8e8e8; text-align: center; color: #aaa; font-size: 12px; }
  @media print { body { padding: 20px; } .section { break-inside: avoid; } }
</style>
</head>
<body>
  <h1>🌳 El Árbol de ${name}</h1>
  <p class="subtitle">Generado el ${date} · Escuela de Buena Vida</p>

  ${analysis?.fraseMarca ? `<div class="highlight">"${analysis.fraseMarca}"</div>` : ""}

  <h2>🌱 La Semilla</h2>
  <div class="section">
    ${semilla.proposito ? `<h3>Propósito</h3><p>${semilla.proposito}</p>` : ""}
    ${semilla.vision ? `<h3>Visión</h3><p>${semilla.vision}</p>` : ""}
    ${semilla.intencion ? `<h3>Intención</h3><p>${semilla.intencion}</p>` : ""}
    ${semilla.objetivos ? `<h3>Objetivos</h3><p>${semilla.objetivos}</p>` : ""}
  </div>

  <h2>🌿 Las Raíces</h2>
  <div class="section">
    ${raices.creencias ? `<h3>Creencias</h3><p>${raices.creencias}</p>` : ""}
    ${raices.valores?.length > 0 ? `<h3>Valores</h3><p>${raices.valores.map((v: string) => `<span class="tag">${v}</span>`).join(" ")}</p>` : ""}
    ${raices.identidad ? `<h3>Identidad</h3><p>${raices.identidad}</p>` : ""}
    ${raices.historia ? `<h3>Historia</h3><p>${raices.historia}</p>` : ""}
    ${raices.conocimientoHabilidades ? `<h3>Conocimiento y habilidades</h3><p>${raices.conocimientoHabilidades}</p>` : ""}
    ${raices.fortalezas?.length > 0 ? `<h3>Fortalezas</h3><p>${raices.fortalezas.map((f: string) => `<span class="tag">${f}</span>`).join(" ")}</p>` : ""}
    ${raices.experiencia ? `<h3>Experiencia</h3><p>${raices.experiencia}</p>` : ""}
    ${raices.intuicion ? `<h3>Intuición</h3><p>${raices.intuicion}</p>` : ""}
  </div>

  <h2>🪵 El Tronco</h2>
  <div class="section">
    ${tronco.temaPrincipal ? `<h3>Tema principal</h3><p>${tronco.temaPrincipal}</p>` : ""}
    ${tronco.propuestaValor ? `<h3>Propuesta de valor</h3><p>${tronco.propuestaValor}</p>` : ""}
    ${tronco.zonaGenialidad ? `<h3>Zona de genialidad</h3><p>${tronco.zonaGenialidad}</p>` : ""}
  </div>

  <h2>🌲 Las Ramas</h2>
  <div class="section">
    ${ramas.pasiones?.length > 0 ? `<h3>Pasiones</h3><p>${ramas.pasiones.map((p: string) => `<span class="tag">${p}</span>`).join(" ")}</p>` : ""}
    ${ramas.intereses?.length > 0 ? `<h3>Intereses</h3><p>${ramas.intereses.map((i: string) => `<span class="tag">${i}</span>`).join(" ")}</p>` : ""}
    ${ramas.hobbies?.length > 0 ? `<h3>Hobbies</h3><p>${ramas.hobbies.map((h: string) => `<span class="tag">${h}</span>`).join(" ")}</p>` : ""}
    ${ramas.habilidadesSecundarias?.length > 0 ? `<h3>Habilidades secundarias</h3><p>${ramas.habilidadesSecundarias.map((h: string) => `<span class="tag">${h}</span>`).join(" ")}</p>` : ""}
    ${ramas.formatosComunicacion?.length > 0 ? `<h3>Formatos</h3><p>${ramas.formatosComunicacion.map((f: string) => `<span class="tag">${f}</span>`).join(" ")}</p>` : ""}
    ${ramas.contextosProfesionales?.length > 0 ? `<h3>Contextos profesionales</h3><p>${ramas.contextosProfesionales.map((c: string) => `<span class="tag">${c}</span>`).join(" ")}</p>` : ""}
  </div>

  <h2>☁️ La Copa</h2>
  <div class="section">
    ${copa.tonoDeVoz ? `<h3>Tono de voz</h3><p>${copa.tonoDeVoz}</p>` : ""}
    ${copa.narrativa ? `<h3>Narrativa</h3><p>${copa.narrativa}</p>` : ""}
    ${copa.energia ? `<h3>Energía</h3><p>${copa.energia}</p>` : ""}
    ${copa.presencia ? `<h3>Presencia</h3><p>${copa.presencia}</p>` : ""}
    ${copa.percepcion ? `<h3>Percepción</h3><p>${copa.percepcion}</p>` : ""}
    ${(copa.atributos || []).length > 0 ? `<h3>Atributos</h3><p>${copa.atributos.map((a: string) => `<span class="tag">${a}</span>`).join(" ")}</p>` : ""}
    ${arquetipos.length > 0 ? `<h3>Arquetipos</h3><p>${arquetipos.map((a: any) => `<span class="tag tag-orange">${a.nombre} ${a.porcentaje}%</span>`).join(" ")}</p>` : ""}
  </div>

  <h2>🍎 Los Frutos</h2>
  <div class="section">
    ${frutos.queDeseasRecibir ? `<h3>¿Qué deseas recibir?</h3><p>${frutos.queDeseasRecibir}</p>` : ""}
    ${frutos.metaSeguidores ? `<h3>Meta de seguidores</h3><p>${frutos.metaSeguidores}</p>` : ""}
    ${frutos.mensajesQueQuieres ? `<h3>Mensajes que quieres</h3><p>${frutos.mensajesQueQuieres}</p>` : ""}
    ${frutos.impactoDeseado ? `<h3>Impacto deseado</h3><p>${frutos.impactoDeseado}</p>` : ""}
    ${frutos.testimonioIdeal ? `<h3>Testimonio ideal</h3><p>"${frutos.testimonioIdeal}"</p>` : ""}
  </div>

  <h2>🌍 El Entorno</h2>
  <div class="section">
    ${entorno.audienciaPrincipal ? `<h3>Audiencia principal</h3><p>${entorno.audienciaPrincipal}</p>` : ""}
    ${entorno.dondeEstan?.length > 0 ? `<h3>Dónde están</h3><p>${entorno.dondeEstan.map((c: string) => `<span class="tag">${c}</span>`).join(" ")}</p>` : ""}
    ${entorno.competencia ? `<h3>Competencia</h3><p>${entorno.competencia}</p>` : ""}
    ${entorno.aliadosPotenciales ? `<h3>Aliados potenciales</h3><p>${entorno.aliadosPotenciales}</p>` : ""}
    ${entorno.posicionamiento ? `<h3>Posicionamiento</h3><p>${entorno.posicionamiento}</p>` : ""}
  </div>

  <h2>⏳ El Tiempo</h2>
  <div class="section">
    ${tiempo.ritmoPublicacion ? `<h3>Ritmo de publicación</h3><p>${tiempo.ritmoPublicacion}</p>` : ""}
    ${tiempo.proximoHito ? `<h3>Próximo hito</h3><p>${tiempo.proximoHito}</p>` : ""}
    ${tiempo.metaAnual ? `<h3>Meta anual</h3><p>${tiempo.metaAnual}</p>` : ""}
    ${tiempo.buenaVida ? `<h3>Mi buena vida</h3><p>${tiempo.buenaVida}</p>` : ""}
  </div>

  <h2>📦 El Cofre</h2>
  <div class="section">
    ${productos.length > 0 ? productos.map((p: any) => `
      <div class="product">
        <strong>${p.nombreProducto}</strong>${p.precio ? ` — ${p.precio}` : ""}${p.estadoActual && p.estadoActual !== "idea" ? ` <em>(${p.estadoActual})</em>` : ""}
        ${p.oferta ? `<p style="margin-top:4px"><small><strong>Oferta:</strong> ${p.oferta}</small></p>` : ""}
        ${p.packagingNarrativo ? `<p><small><strong>Packaging:</strong> ${p.packagingNarrativo}</small></p>` : ""}
        ${p.cliente ? `<p><small><strong>Cliente:</strong> ${p.cliente}</small></p>` : ""}
        ${p.canales ? `<p><small><strong>Canales:</strong> ${p.canales}</small></p>` : ""}
        ${p.sistemaEntrega ? `<p><small><strong>Entrega:</strong> ${p.sistemaEntrega}</small></p>` : ""}
      </div>
    `).join("") : "<p><em>Sin productos aún</em></p>"}
  </div>

  ${analysis ? `
  <h2>🧠 Análisis de Marca</h2>
  <div class="section">
    <h3>Resumen</h3>
    <p>${analysis.resumen}</p>

    <h3>Personalidad de marca</h3>
    <p>${analysis.personalidad}</p>

    <h3>Fortalezas</h3>
    ${(analysis.fortalezas || []).map((f: string) => `<div class="strength">${f}</div>`).join("")}

    <h3>Alertas</h3>
    ${(analysis.alertas || []).map((a: string) => `<div class="alert">${a}</div>`).join("")}

    <h3>Tono recomendado</h3>
    <p>${analysis.tonoRecomendado}</p>

    <h3>Narrativa recomendada</h3>
    <p>${analysis.narrativaRecomendada}</p>

    <h3>Insight de audiencia</h3>
    <p>${analysis.audienciaInsight}</p>

    <h3>Siguientes pasos</h3>
    <ol style="padding-left:20px">
      ${(analysis.siguientesPasos || []).map((p: string) => `<li style="margin:4px 0;font-size:14px">${p}</li>`).join("")}
    </ol>
  </div>
  ` : ""}

  <div class="footer">
    <p>🌳 El Árbol de la Marca Personal · Escuela de Buena Vida</p>
    <p>escuela.janocabello.com</p>
  </div>
</body>
</html>`;
}
