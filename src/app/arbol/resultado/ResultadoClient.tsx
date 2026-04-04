"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

interface Analysis {
  resumen: string;
  personalidad: string;
  fortalezas: string[];
  alertas: string[];
  tonoRecomendado: string;
  narrativaRecomendada: string;
  audienciaInsight: string;
  siguientesPasos: string[];
  fraseMarca: string;
}

interface Props {
  userId: string;
  userName: string;
  hasApiKey: boolean;
  arbolData: any;
}

export default function ResultadoClient({ userId, userName, hasApiKey, arbolData }: Props) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string[] | null>(null);
  const [exporting, setExporting] = useState(false);
  const treeRef = useRef<HTMLDivElement>(null);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalyzeError("");
    try {
      const res = await fetch("/api/arbol/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error");
      setAnalysis(json.analysis);
    } catch (err: any) {
      setAnalyzeError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const syncBrujula = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/arbol/sync-brujula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error");
      setSyncResult(json.synced);
    } catch (err: any) {
      setSyncResult(["Error: " + err.message]);
    } finally {
      setSyncing(false);
    }
  };

  const exportDocument = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/arbol/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, analysis }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error");
      }
      const html = await res.text();
      // Open in new window for print-to-PDF
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 500);
      }
    } catch (err: any) {
      alert("Error al exportar: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  // Count completed sections
  const sectionKeys = ["semilla", "raices", "tronco", "ramas", "copa", "frutos", "entorno", "tiempo", "cofre"];
  const completedCount = sectionKeys.filter((key) => {
    const s = arbolData[key];
    if (!s || typeof s !== "object") return false;
    return Object.values(s).some((v: any) => {
      if (Array.isArray(v)) return v.length > 0 && v.some((item: any) => typeof item === "string" ? item.trim().length > 0 : typeof item === "object" && Object.values(item).some((iv: any) => typeof iv === "string" && iv.trim().length > 0));
      if (typeof v === "string") return v.trim().length > 0;
      return false;
    });
  }).length;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-headline text-xl sm:text-3xl text-on-surface mb-1">
                Tu Árbol Completo
              </h1>
              <p className="text-on-surface-variant text-xs sm:text-sm">
                {completedCount}/9 secciones · {userName}
              </p>
            </div>
            <Link
              href="/arbol"
              className="text-xs px-3 sm:px-4 py-2 border border-outline rounded-xl hover:border-primary/40 transition-colors text-on-surface-variant hover:text-on-surface flex-shrink-0"
            >
              ← Volver
            </Link>
          </div>
        </div>

        {/* ===== VISUAL TREE INFOGRAPHIC ===== */}
        <div ref={treeRef} className="mb-10">
          <TreeInfographic data={arbolData} userName={userName} />
        </div>

        {/* ===== AI ANALYSIS ===== */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-lg text-on-surface">Análisis de tu Marca</h2>
            {!analysis && (
              <button
                onClick={runAnalysis}
                disabled={analyzing || !hasApiKey}
                className="text-xs px-5 py-2.5 bg-primary-container text-white rounded-xl hover:bg-primary-container-hover transition-colors disabled:opacity-50 font-medium"
              >
                {analyzing ? "Analizando..." : !hasApiKey ? "Configura tu API Key" : "Analizar con IA"}
              </button>
            )}
          </div>

          {analyzeError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 mb-4">
              {analyzeError}
            </div>
          )}

          {analyzing && (
            <div className="p-8 rounded-2xl border border-outline/60 bg-white text-center">
              <div className="animate-pulse">
                <div className="text-3xl mb-3">🧠</div>
                <p className="text-sm text-on-surface-variant">Analizando tu Árbol en profundidad...</p>
                <p className="text-xs text-on-surface-variant/60 mt-1">Esto puede tardar unos segundos</p>
              </div>
            </div>
          )}

          {analysis && <AnalysisView analysis={analysis} />}
        </div>

        {/* ===== ACTIONS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* Sync with Brújula */}
          <button
            onClick={syncBrujula}
            disabled={syncing}
            className="rounded-2xl border border-outline/60 bg-white hover:border-primary/40 hover:shadow-card-hover p-5 transition-all text-left group"
          >
            <div className="text-2xl mb-2">🔄</div>
            <h3 className="font-headline text-sm text-on-surface mb-1">Sincronizar con La Brújula</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {syncing ? "Sincronizando..." : "Actualiza tu tono, canales y tema raíz en La Brújula con los datos del Árbol."}
            </p>
          </button>

          {/* Export Document */}
          <button
            onClick={exportDocument}
            disabled={exporting}
            className="rounded-2xl border border-outline/60 bg-white hover:border-primary/40 hover:shadow-card-hover p-5 transition-all text-left group"
          >
            <div className="text-2xl mb-2">📄</div>
            <h3 className="font-headline text-sm text-on-surface mb-1">Exportar PDF</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {exporting ? "Generando..." : "Descarga tu Árbol completo con toda la información y el análisis."}
            </p>
          </button>

          {/* Go to Maestro */}
          <Link
            href="/maestro"
            className="rounded-2xl border border-outline/60 bg-white hover:border-primary/40 hover:shadow-card-hover p-5 transition-all text-left group"
          >
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-headline text-sm text-on-surface mb-1">Crear Contenido</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Lleva tu Árbol al Maestro y genera contenido alineado con tu marca.
            </p>
          </Link>
        </div>

        {/* Sync result */}
        {syncResult && (
          <div className="mb-10 p-5 rounded-2xl border border-green-200 bg-green-50/50">
            <h3 className="font-headline text-sm text-green-800 mb-2">Sincronización completada</h3>
            <ul className="space-y-1">
              {syncResult.map((s, i) => (
                <li key={i} className="text-xs text-green-700 flex items-center gap-2">
                  <span>✓</span> {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next steps from analysis */}
        {analysis && (
          <div className="mb-10">
            <h2 className="font-headline text-lg text-on-surface mb-4">Tus Siguientes Pasos</h2>
            <div className="space-y-2">
              {analysis.siguientesPasos.map((paso, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-outline/60 bg-white px-4 py-3">
                  <span className="text-primary font-headline text-sm flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-on-surface/80">{paso}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ===== VISUAL TREE INFOGRAPHIC =====
function TreeInfographic({ data, userName }: { data: any; userName: string }) {
  const copa = data.copa || {};
  const tronco = data.tronco || {};
  const ramas = data.ramas || {};
  const raices = data.raices || {};
  const semilla = data.semilla || {};
  const frutos = data.frutos || {};
  const entorno = data.entorno || {};
  const tiempo = data.tiempo || {};
  const cofre = data.cofre || {};

  const arquetipos = (copa.arquetipos || []).filter((a: any) => a.nombre && a.porcentaje > 0).sort((a: any, b: any) => b.porcentaje - a.porcentaje);

  return (
    <div className="rounded-3xl border border-outline/60 bg-gradient-to-b from-blue-50/30 via-green-50/20 to-amber-50/30 overflow-hidden">
      {/* Top: Name + Tagline */}
      <div className="text-center pt-8 pb-4 px-6">
        <h2 className="font-headline text-xl sm:text-2xl text-on-surface">
          🌳 El Árbol de {userName || "tu Marca"}
        </h2>
        {tronco.temaPrincipal && (
          <p className="text-sm text-primary font-medium mt-1">{tronco.temaPrincipal}</p>
        )}
      </div>

      {/* FRUTOS — Top of tree */}
      <div className="px-3 sm:px-6 pb-2">
        <div className="flex justify-center gap-2 flex-wrap">
          {frutos.queDeseasRecibir && (
            <TreeTag icon="🍎" text={frutos.queDeseasRecibir} color="red" />
          )}
          {frutos.impactoDeseado && (
            <TreeTag icon="💫" text={frutos.impactoDeseado} color="red" />
          )}
          {frutos.testimonioIdeal && (
            <TreeTag icon="💬" text={`"${frutos.testimonioIdeal}"`} color="red" />
          )}
        </div>
      </div>

      {/* COPA — Canopy */}
      <div className="mx-3 sm:mx-6 rounded-2xl bg-green-100/60 border border-green-200/50 p-3 sm:p-5 mb-2">
        <div className="text-center mb-3">
          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">☁️ La Copa</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {copa.tonoDeVoz && <TreePill label="Tono" value={copa.tonoDeVoz} />}
          {copa.energia && <TreePill label="Energía" value={copa.energia} />}
          {copa.presencia && <TreePill label="Presencia" value={copa.presencia} />}
          {copa.percepcion && <TreePill label="Percepción" value={copa.percepcion} />}
        </div>
        {arquetipos.length > 0 && (
          <div className="flex justify-center gap-2 mt-3 flex-wrap">
            {arquetipos.map((a: any, i: number) => (
              <span key={i} className="text-xs bg-green-200/70 text-green-800 px-2.5 py-1 rounded-full">
                {a.nombre} {a.porcentaje}%
              </span>
            ))}
          </div>
        )}
        {(copa.atributos || []).length > 0 && (
          <div className="flex justify-center gap-1.5 mt-2 flex-wrap">
            {copa.atributos.map((a: string, i: number) => (
              <span key={i} className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200/50">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* RAMAS — Branches */}
      <div className="mx-3 sm:mx-6 mb-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {ramas.pasiones?.length > 0 && (
            <BranchGroup label="Pasiones" items={ramas.pasiones} emoji="🔥" />
          )}
          {ramas.intereses?.length > 0 && (
            <BranchGroup label="Intereses" items={ramas.intereses} emoji="🔍" />
          )}
          {ramas.hobbies?.length > 0 && (
            <BranchGroup label="Hobbies" items={ramas.hobbies} emoji="🎮" />
          )}
          {ramas.habilidadesSecundarias?.length > 0 && (
            <BranchGroup label="Habilidades" items={ramas.habilidadesSecundarias} emoji="🛠️" />
          )}
          {ramas.formatosComunicacion?.length > 0 && (
            <BranchGroup label="Formatos" items={ramas.formatosComunicacion} emoji="📱" />
          )}
          {ramas.contextosProfesionales?.length > 0 && (
            <BranchGroup label="Contextos" items={ramas.contextosProfesionales} emoji="💼" />
          )}
        </div>
      </div>

      {/* TRONCO — Trunk */}
      <div className="mx-auto w-48 sm:w-56">
        <div className="bg-amber-100/80 border border-amber-200/60 rounded-xl p-4 text-center">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide block mb-2">🪵 El Tronco</span>
          {tronco.temaPrincipal && <p className="text-xs text-amber-800 font-medium">{tronco.temaPrincipal}</p>}
          {tronco.propuestaValor && <p className="text-[10px] text-amber-700/80 mt-1">{tronco.propuestaValor}</p>}
          {tronco.zonaGenialidad && <p className="text-[10px] text-amber-600/70 mt-1 italic">{tronco.zonaGenialidad}</p>}
        </div>
      </div>

      {/* Divider — Soil line */}
      <div className="mx-6 my-3 flex items-center gap-2">
        <div className="flex-1 h-px bg-amber-300/40" />
        <span className="text-[10px] text-amber-500/60">· · · suelo · · ·</span>
        <div className="flex-1 h-px bg-amber-300/40" />
      </div>

      {/* RAÍCES — Roots */}
      <div className="mx-3 sm:mx-6 mb-3">
        <div className="bg-amber-50/60 border border-amber-200/40 rounded-xl p-3 sm:p-5">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide block mb-3 text-center">🌿 Las Raíces</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {raices.valores?.length > 0 && (
              <div>
                <span className="text-[10px] text-amber-600 font-medium block mb-1">Valores</span>
                <div className="flex flex-wrap gap-1">
                  {raices.valores.map((v: string, i: number) => (
                    <span key={i} className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{v}</span>
                  ))}
                </div>
              </div>
            )}
            {raices.fortalezas?.length > 0 && (
              <div>
                <span className="text-[10px] text-amber-600 font-medium block mb-1">Fortalezas</span>
                <div className="flex flex-wrap gap-1">
                  {raices.fortalezas.map((f: string, i: number) => (
                    <span key={i} className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
            )}
            {raices.identidad && (
              <div className="col-span-2">
                <span className="text-[10px] text-amber-600 font-medium block mb-1">Identidad</span>
                <p className="text-[11px] text-amber-800">{raices.identidad}</p>
              </div>
            )}
            {raices.creencias && (
              <div className="col-span-2">
                <span className="text-[10px] text-amber-600 font-medium block mb-1">Creencias</span>
                <p className="text-[11px] text-amber-800">{raices.creencias}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEMILLA — Seed */}
      <div className="mx-auto w-56 sm:w-64 mb-4">
        <div className="bg-amber-100/50 border border-amber-200/50 rounded-xl p-4 text-center">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide block mb-2">🌱 La Semilla</span>
          {semilla.proposito && <p className="text-xs text-amber-800 font-medium">{semilla.proposito}</p>}
          {semilla.vision && <p className="text-[10px] text-amber-700/80 mt-1">Visión: {semilla.vision}</p>}
          {semilla.intencion && <p className="text-[10px] text-amber-600/70 mt-1">Intención: {semilla.intencion}</p>}
        </div>
      </div>

      {/* Bottom bar: Entorno + Tiempo + Cofre */}
      <div className="bg-white/60 border-t border-outline/40 px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Entorno */}
          <div>
            <span className="text-xs font-semibold text-on-surface-variant block mb-2">🌍 Entorno</span>
            {entorno.audienciaPrincipal && <p className="text-[11px] text-on-surface/70 mb-1">{entorno.audienciaPrincipal}</p>}
            {entorno.dondeEstan?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {entorno.dondeEstan.map((c: string, i: number) => (
                  <span key={i} className="text-[10px] bg-gray-100 text-on-surface-variant px-2 py-0.5 rounded-full">{c}</span>
                ))}
              </div>
            )}
            {entorno.posicionamiento && <p className="text-[10px] text-on-surface/50 mt-1 italic">{entorno.posicionamiento}</p>}
          </div>

          {/* Tiempo */}
          <div>
            <span className="text-xs font-semibold text-on-surface-variant block mb-2">⏳ Tiempo</span>
            {tiempo.ritmoPublicacion && <p className="text-[11px] text-on-surface/70 mb-1">Ritmo: {tiempo.ritmoPublicacion}</p>}
            {tiempo.proximoHito && <p className="text-[11px] text-on-surface/70 mb-1">Próximo hito: {tiempo.proximoHito}</p>}
            {tiempo.buenaVida && <p className="text-[10px] text-on-surface/50 italic">{tiempo.buenaVida}</p>}
          </div>

          {/* Cofre */}
          <div>
            <span className="text-xs font-semibold text-on-surface-variant block mb-2">📦 El Cofre</span>
            {(cofre.productos || []).filter((p: any) => p.nombreProducto).map((p: any, i: number) => (
              <div key={i} className="mb-2">
                <p className="text-[11px] text-on-surface/70 font-medium">{p.nombreProducto}</p>
                {p.precio && <span className="text-[10px] text-primary">{p.precio}</span>}
                {p.estadoActual && p.estadoActual !== "idea" && (
                  <span className="text-[10px] text-on-surface-variant ml-2">({p.estadoActual})</span>
                )}
              </div>
            ))}
            {(cofre.productos || []).filter((p: any) => p.nombreProducto).length === 0 && (
              <p className="text-[10px] text-on-surface-variant italic">Sin productos aún</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TreeTag({ icon, text }: { icon: string; text: string; color?: string }) {
  return (
    <span className="text-[11px] bg-red-50 text-red-700 border border-red-200/50 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 max-w-xs">
      <span>{icon}</span>
      <span className="truncate">{text}</span>
    </span>
  );
}

function TreePill({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-[10px] sm:text-[11px] bg-white/60 text-green-800 border border-green-200/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg max-w-[200px] sm:max-w-xs">
      <span className="text-green-600/70">{label}:</span> <span className="line-clamp-2">{value}</span>
    </span>
  );
}

function BranchGroup({ label, items, emoji }: { label: string; items: string[]; emoji: string }) {
  return (
    <div className="bg-green-50/60 border border-green-200/30 rounded-lg p-3">
      <span className="text-[10px] text-green-700 font-medium block mb-1.5">{emoji} {label}</span>
      <div className="flex flex-wrap gap-1">
        {items.filter(Boolean).map((item, i) => (
          <span key={i} className="text-[10px] bg-green-100/80 text-green-700 px-2 py-0.5 rounded-full">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ===== ANALYSIS VIEW =====
function AnalysisView({ analysis }: { analysis: Analysis }) {
  return (
    <div className="space-y-6">
      {/* Frase de marca — Hero */}
      <div className="rounded-2xl bg-primary-container/5 border border-primary/20 p-6 text-center">
        <p className="font-headline text-lg sm:text-xl text-on-surface leading-relaxed">
          &ldquo;{analysis.fraseMarca}&rdquo;
        </p>
      </div>

      {/* Resumen */}
      <div className="rounded-2xl border border-outline/60 bg-white p-5">
        <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">Resumen de tu marca</h3>
        <p className="text-sm text-on-surface/80 leading-relaxed">{analysis.resumen}</p>
      </div>

      {/* Personalidad */}
      <div className="rounded-2xl border border-outline/60 bg-white p-5">
        <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">Tu personalidad de marca</h3>
        <p className="text-sm text-on-surface/80 leading-relaxed">{analysis.personalidad}</p>
      </div>

      {/* Two columns: Fortalezas + Alertas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-green-200 bg-green-50/30 p-5">
          <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">Fortalezas</h3>
          <ul className="space-y-2">
            {analysis.fortalezas.map((f, i) => (
              <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5">
          <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Alertas</h3>
          <ul className="space-y-2">
            {analysis.alertas.map((a, i) => (
              <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tono + Narrativa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-outline/60 bg-white p-5">
          <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">Tono recomendado</h3>
          <p className="text-sm text-on-surface/80 leading-relaxed">{analysis.tonoRecomendado}</p>
        </div>
        <div className="rounded-2xl border border-outline/60 bg-white p-5">
          <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">Narrativa</h3>
          <p className="text-sm text-on-surface/80 leading-relaxed">{analysis.narrativaRecomendada}</p>
        </div>
      </div>

      {/* Audiencia insight */}
      <div className="rounded-2xl border border-outline/60 bg-white p-5">
        <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">Insight de audiencia</h3>
        <p className="text-sm text-on-surface/80 leading-relaxed">{analysis.audienciaInsight}</p>
      </div>
    </div>
  );
}
