import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Falta userId" }, { status: 400 });
    }

    const supabase = await createServerClient();

    const [{ data: profile }, { data: arbolData }, { data: brujulaData }] = await Promise.all([
      supabase.from("profiles").select("display_name").eq("id", userId).single(),
      supabase.from("arbol_data").select("*").eq("user_id", userId).single(),
      supabase.from("brujula_data").select("*").eq("user_id", userId).single(),
    ]);

    const name = profile?.display_name || "Tu Marca";
    const html = generateEspejoHTML(name, arbolData, brujulaData);

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err: any) {
    console.error("Espejo export error:", err);
    return NextResponse.json({ error: "Error al exportar." }, { status: 500 });
  }
}

function val(v: any): string {
  if (!v) return "";
  if (typeof v === "string") return v.trim();
  return "";
}

function tags(arr: any[]): string {
  if (!arr || !Array.isArray(arr)) return "";
  const filtered = arr.filter((a) => typeof a === "string" && a.trim());
  if (filtered.length === 0) return "";
  return filtered.map((t) => `<span class="tag">${t}</span>`).join(" ");
}

function generateEspejoHTML(name: string, arbol: any, brujula: any): string {
  const a = arbol || {};
  const b = brujula || {};
  const semilla = a.semilla || {};
  const raices = a.raices || {};
  const tronco = a.tronco || {};
  const ramas = a.ramas || {};
  const copa = a.copa || {};
  const frutos = a.frutos || {};
  const entorno = a.entorno || {};
  const tiempo = a.tiempo || {};
  const briefing = b.briefing || {};
  const insight = b.insight || {};
  const tree = b.tree || {};
  const channels = b.channels || {};

  const arquetipos = (copa.arquetipos || []).filter((x: any) => x.nombre && x.porcentaje > 0);
  const pilares = (tree.pilares || []).filter((p: any) => p.nombre);

  const date = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>El Espejo de ${name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', sans-serif; color: #1a1a1a; line-height: 1.5; max-width: 750px; margin: 0 auto; padding: 40px 30px; }

  .header { background: #1a1a1a; color: white; padding: 32px; border-radius: 16px; margin-bottom: 28px; }
  .header h1 { font-size: 28px; margin-bottom: 4px; }
  .header .subtitle { color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .header .tema { color: rgba(255,255,255,0.8); font-size: 15px; }
  .header .propuesta { color: rgba(255,255,255,0.55); font-size: 13px; margin-top: 6px; }
  .header .arquetipos { margin-top: 14px; display: flex; gap: 8px; flex-wrap: wrap; }
  .header .arq-tag { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.75); padding: 3px 12px; border-radius: 20px; font-size: 12px; }

  .section-label { font-size: 10px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.8px; margin: 24px 0 10px; }

  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
  .card { border: 1px solid #e8e8e8; border-radius: 12px; padding: 16px; }
  .card-label { font-size: 10px; font-weight: 600; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .card-value { font-size: 13px; color: #333; }
  .card-full { grid-column: 1 / -1; }

  .tag { display: inline-block; background: #f5f5f5; border: 1px solid #e0e0e0; padding: 2px 10px; border-radius: 20px; font-size: 11px; margin: 2px; color: #555; }
  .tag-accent { background: #FEF3ED; border-color: #E8652D40; color: #E8652D; }

  .quote { font-style: italic; color: #555; border-left: 3px solid #E8652D; padding-left: 12px; font-size: 13px; }

  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e8e8e8; text-align: center; color: #bbb; font-size: 11px; }

  @media print {
    body { padding: 20px; }
    .card { break-inside: avoid; }
    .header { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  }
</style>
</head>
<body>

<div class="header">
  <p class="subtitle">Marca Personal</p>
  <h1>${name}</h1>
  ${val(tronco.temaPrincipal) || val(briefing.temaRaiz) ? `<p class="tema">${val(tronco.temaPrincipal) || val(briefing.temaRaiz)}</p>` : ""}
  ${val(tronco.propuestaValor) || val(briefing.propuestaValor) ? `<p class="propuesta">${val(tronco.propuestaValor) || val(briefing.propuestaValor)}</p>` : ""}
  ${arquetipos.length > 0 ? `
    <div class="arquetipos">
      ${arquetipos.map((x: any) => `<span class="arq-tag">${x.nombre} ${x.porcentaje}%</span>`).join("")}
    </div>
  ` : ""}
</div>

<p class="section-label">Esencia</p>
<div class="grid">
  ${val(semilla.proposito) ? `<div class="card"><div class="card-label">🌱 Propósito</div><div class="card-value">${semilla.proposito}</div></div>` : ""}
  ${val(semilla.vision) ? `<div class="card"><div class="card-label">🔭 Visión</div><div class="card-value">${semilla.vision}</div></div>` : ""}
  ${val(tronco.zonaGenialidad) ? `<div class="card card-full"><div class="card-label">⚡ Zona de genialidad</div><div class="card-value">${tronco.zonaGenialidad}</div></div>` : ""}
</div>

${(raices.valores?.length > 0 || raices.fortalezas?.length > 0 || val(raices.identidad)) ? `
<p class="section-label">Raíces</p>
<div class="grid">
  ${raices.valores?.length > 0 ? `<div class="card"><div class="card-label">🏛️ Valores</div><div class="card-value">${tags(raices.valores)}</div></div>` : ""}
  ${raices.fortalezas?.length > 0 ? `<div class="card"><div class="card-label">💪 Fortalezas</div><div class="card-value">${tags(raices.fortalezas)}</div></div>` : ""}
  ${val(raices.identidad) ? `<div class="card card-full"><div class="card-label">🪞 Identidad</div><div class="card-value">${raices.identidad}</div></div>` : ""}
</div>
` : ""}

${(val(copa.tonoDeVoz) || val(copa.energia) || val(copa.percepcion) || copa.atributos?.length > 0) ? `
<p class="section-label">Personalidad</p>
<div class="grid">
  ${val(copa.tonoDeVoz) ? `<div class="card"><div class="card-label">🎙️ Tono de voz</div><div class="card-value">${copa.tonoDeVoz}</div></div>` : ""}
  ${val(copa.energia) ? `<div class="card"><div class="card-label">✨ Energía</div><div class="card-value">${copa.energia}</div></div>` : ""}
  ${val(copa.percepcion) ? `<div class="card card-full"><div class="card-label">👁️ Cómo quiero que me perciban</div><div class="card-value">${copa.percepcion}</div></div>` : ""}
  ${copa.atributos?.length > 0 ? `<div class="card card-full"><div class="card-label">🎭 Atributos</div><div class="card-value">${tags(copa.atributos)}</div></div>` : ""}
</div>
` : ""}

${(ramas.pasiones?.length > 0 || ramas.formatosComunicacion?.length > 0) ? `
<p class="section-label">Territorio</p>
<div class="grid">
  ${ramas.pasiones?.length > 0 ? `<div class="card"><div class="card-label">🔥 Pasiones</div><div class="card-value">${tags(ramas.pasiones)}</div></div>` : ""}
  ${ramas.intereses?.length > 0 ? `<div class="card"><div class="card-label">🔍 Intereses</div><div class="card-value">${tags(ramas.intereses)}</div></div>` : ""}
  ${ramas.formatosComunicacion?.length > 0 ? `<div class="card"><div class="card-label">📱 Formatos</div><div class="card-value">${tags(ramas.formatosComunicacion)}</div></div>` : ""}
  ${pilares.length > 0 ? `<div class="card"><div class="card-label">🗂️ Pilares</div><div class="card-value">${tags(pilares.map((p: any) => p.nombre))}</div></div>` : ""}
</div>
` : ""}

${(val(entorno.audienciaPrincipal) || entorno.dondeEstan?.length > 0 || channels.canales?.length > 0 || val(entorno.posicionamiento)) ? `
<p class="section-label">Audiencia y Mercado</p>
<div class="grid">
  ${val(entorno.audienciaPrincipal) ? `<div class="card"><div class="card-label">👥 Audiencia</div><div class="card-value">${entorno.audienciaPrincipal}</div></div>` : ""}
  ${(entorno.dondeEstan?.length > 0 || channels.canales?.length > 0) ? `<div class="card"><div class="card-label">📡 Canales</div><div class="card-value">${tags(entorno.dondeEstan?.length > 0 ? entorno.dondeEstan : channels.canales)}</div></div>` : ""}
  ${val(entorno.posicionamiento) ? `<div class="card card-full"><div class="card-label">🎯 Posicionamiento</div><div class="card-value">${entorno.posicionamiento}</div></div>` : ""}
</div>
` : ""}

${val(insight.insight) ? `
<p class="section-label">Insight</p>
<div class="card" style="margin-bottom:12px">
  <div class="quote">${insight.insight}</div>
</div>
` : ""}

${(val(frutos.impactoDeseado) || val(frutos.testimonioIdeal) || val(tiempo.buenaVida)) ? `
<p class="section-label">Destino</p>
<div class="grid">
  ${val(frutos.impactoDeseado) ? `<div class="card"><div class="card-label">🍎 Impacto deseado</div><div class="card-value">${frutos.impactoDeseado}</div></div>` : ""}
  ${val(frutos.testimonioIdeal) ? `<div class="card"><div class="card-label">💬 Quiero que digan</div><div class="card-value quote">${frutos.testimonioIdeal}</div></div>` : ""}
  ${val(tiempo.buenaVida) ? `<div class="card card-full"><div class="card-label">☀️ Mi buena vida</div><div class="card-value">${tiempo.buenaVida}</div></div>` : ""}
</div>
` : ""}

<div class="footer">
  <p>🪞 El Espejo · ${name} · ${date}</p>
  <p>El Sistema de Buena Vida · sistema.janocabello.com</p>
</div>

</body>
</html>`;
}
