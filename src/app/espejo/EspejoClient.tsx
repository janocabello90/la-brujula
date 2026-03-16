"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

interface Props {
  userId: string;
  userName: string;
  arbol: any | null;
  brujula: any | null;
}

// Each mirror block: where data comes from, where to go to fill it
interface MirrorBlock {
  id: string;
  label: string;
  icon: string;
  value: string | string[] | null;
  type: "text" | "tags" | "list" | "quote";
  editHref: string;
  editLabel: string;
  source: "arbol" | "brujula";
}

export default function EspejoClient({ userId, userName, arbol, brujula }: Props) {
  const [exporting, setExporting] = useState(false);

  // ===== BUILD MIRROR BLOCKS =====
  const blocks: MirrorBlock[] = [
    // Identity core — from Semilla
    {
      id: "proposito",
      label: "Propósito",
      icon: "🌱",
      value: arbol?.semilla?.proposito || null,
      type: "text",
      editHref: "/arbol",
      editLabel: "La Semilla",
      source: "arbol",
    },
    {
      id: "vision",
      label: "Visión",
      icon: "🔭",
      value: arbol?.semilla?.vision || null,
      type: "text",
      editHref: "/arbol",
      editLabel: "La Semilla",
      source: "arbol",
    },
    // From Tronco
    {
      id: "tema",
      label: "Tema principal",
      icon: "🪵",
      value: arbol?.tronco?.temaPrincipal || brujula?.briefing?.temaRaiz || null,
      type: "text",
      editHref: arbol?.tronco?.temaPrincipal ? "/arbol" : "/onboarding",
      editLabel: arbol?.tronco?.temaPrincipal ? "El Tronco" : "Briefing",
      source: arbol?.tronco?.temaPrincipal ? "arbol" : "brujula",
    },
    {
      id: "propuesta",
      label: "Propuesta de valor",
      icon: "💎",
      value: arbol?.tronco?.propuestaValor || brujula?.briefing?.propuestaValor || null,
      type: "text",
      editHref: arbol?.tronco?.propuestaValor ? "/arbol" : "/onboarding",
      editLabel: arbol?.tronco?.propuestaValor ? "El Tronco" : "Briefing",
      source: arbol?.tronco?.propuestaValor ? "arbol" : "brujula",
    },
    {
      id: "genialidad",
      label: "Zona de genialidad",
      icon: "⚡",
      value: arbol?.tronco?.zonaGenialidad || null,
      type: "text",
      editHref: "/arbol",
      editLabel: "El Tronco",
      source: "arbol",
    },
    // Values & Strengths — from Raíces
    {
      id: "valores",
      label: "Valores",
      icon: "🏛️",
      value: arbol?.raices?.valores?.length > 0 ? arbol.raices.valores : null,
      type: "tags",
      editHref: "/arbol",
      editLabel: "Las Raíces",
      source: "arbol",
    },
    {
      id: "fortalezas",
      label: "Fortalezas",
      icon: "💪",
      value: arbol?.raices?.fortalezas?.length > 0 ? arbol.raices.fortalezas : null,
      type: "tags",
      editHref: "/arbol",
      editLabel: "Las Raíces",
      source: "arbol",
    },
    {
      id: "identidad",
      label: "Identidad",
      icon: "🪞",
      value: arbol?.raices?.identidad || null,
      type: "text",
      editHref: "/arbol",
      editLabel: "Las Raíces",
      source: "arbol",
    },
    // Copa — Personality
    {
      id: "tono",
      label: "Tono de voz",
      icon: "🎙️",
      value: arbol?.copa?.tonoDeVoz || null,
      type: "text",
      editHref: "/arbol",
      editLabel: "La Copa",
      source: "arbol",
    },
    {
      id: "arquetipos",
      label: "Arquetipos",
      icon: "🎭",
      value: arbol?.copa?.arquetipos?.filter((a: any) => a.nombre && a.porcentaje > 0)
        .map((a: any) => `${a.nombre} ${a.porcentaje}%`) || null,
      type: "tags",
      editHref: "/arbol",
      editLabel: "La Copa",
      source: "arbol",
    },
    {
      id: "energia",
      label: "Energía",
      icon: "✨",
      value: arbol?.copa?.energia || null,
      type: "text",
      editHref: "/arbol",
      editLabel: "La Copa",
      source: "arbol",
    },
    {
      id: "percepcion",
      label: "Cómo quiero que me perciban",
      icon: "👁️",
      value: arbol?.copa?.percepcion || null,
      type: "text",
      editHref: "/arbol",
      editLabel: "La Copa",
      source: "arbol",
    },
    // Ramas — Interests
    {
      id: "pasiones",
      label: "Pasiones",
      icon: "🔥",
      value: arbol?.ramas?.pasiones?.length > 0 ? arbol.ramas.pasiones : null,
      type: "tags",
      editHref: "/arbol",
      editLabel: "Las Ramas",
      source: "arbol",
    },
    {
      id: "formatos",
      label: "Formatos preferidos",
      icon: "📱",
      value: arbol?.ramas?.formatosComunicacion?.length > 0 ? arbol.ramas.formatosComunicacion : null,
      type: "tags",
      editHref: "/arbol",
      editLabel: "Las Ramas",
      source: "arbol",
    },
    // Entorno — Audience
    {
      id: "audiencia",
      label: "Audiencia principal",
      icon: "👥",
      value: arbol?.entorno?.audienciaPrincipal || null,
      type: "text",
      editHref: "/arbol",
      editLabel: "El Entorno",
      source: "arbol",
    },
    {
      id: "canales",
      label: "Canales",
      icon: "📡",
      value: arbol?.entorno?.dondeEstan?.length > 0
        ? arbol.entorno.dondeEstan
        : brujula?.channels?.canales?.length > 0
          ? brujula.channels.canales
          : null,
      type: "tags",
      editHref: arbol?.entorno?.dondeEstan?.length > 0 ? "/arbol" : "/onboarding",
      editLabel: arbol?.entorno?.dondeEstan?.length > 0 ? "El Entorno" : "Canales",
      source: arbol?.entorno?.dondeEstan?.length > 0 ? "arbol" : "brujula",
    },
    {
      id: "diferencial",
      label: "Posicionamiento",
      icon: "🎯",
      value: arbol?.entorno?.posicionamiento || null,
      type: "text",
      editHref: "/arbol",
      editLabel: "El Entorno",
      source: "arbol",
    },
    // Brújula: Pilares
    {
      id: "pilares",
      label: "Pilares de contenido",
      icon: "🗂️",
      value: brujula?.tree?.pilares?.filter((p: any) => p.nombre).map((p: any) => p.nombre) || null,
      type: "tags",
      editHref: "/onboarding",
      editLabel: "Árbol de contenidos",
      source: "brujula",
    },
    // Brújula: Insight
    {
      id: "insight",
      label: "Insight estratégico",
      icon: "🧠",
      value: brujula?.insight?.insight || null,
      type: "quote",
      editHref: "/onboarding",
      editLabel: "Insight",
      source: "brujula",
    },
    // Frutos
    {
      id: "impacto",
      label: "Impacto deseado",
      icon: "🍎",
      value: arbol?.frutos?.impactoDeseado || null,
      type: "text",
      editHref: "/arbol",
      editLabel: "Los Frutos",
      source: "arbol",
    },
    {
      id: "testimonio",
      label: "Lo que quiero que digan de mí",
      icon: "💬",
      value: arbol?.frutos?.testimonioIdeal || null,
      type: "quote",
      editHref: "/arbol",
      editLabel: "Los Frutos",
      source: "arbol",
    },
    // Tiempo
    {
      id: "buena-vida",
      label: "Mi buena vida",
      icon: "☀️",
      value: arbol?.tiempo?.buenaVida || null,
      type: "text",
      editHref: "/arbol",
      editLabel: "El Tiempo",
      source: "arbol",
    },
  ];

  const filledBlocks = blocks.filter((b) => b.value !== null && (Array.isArray(b.value) ? b.value.length > 0 : true));
  const emptyBlocks = blocks.filter((b) => b.value === null || (Array.isArray(b.value) && b.value.length === 0));
  const completion = Math.round((filledBlocks.length / blocks.length) * 100);

  const exportEspejo = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/espejo/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Error al exportar");
      const html = await res.text();
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 500);
      }
    } catch {
      alert("Error al generar el documento");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl text-negro mb-1">
              El Espejo
            </h1>
            <p className="text-muted text-sm">
              Quién eres, qué haces y para quién. Todo en una vista.
            </p>
          </div>
          <button
            onClick={exportEspejo}
            disabled={exporting}
            className="text-xs px-4 py-2 bg-negro text-white rounded-xl hover:bg-negro/80 transition-colors font-medium flex-shrink-0 disabled:opacity-50"
          >
            {exporting ? "Generando..." : "Exportar PDF"}
          </button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-muted mb-2">
            <span>{filledBlocks.length} de {blocks.length} campos completados</span>
            <span className="font-medium">{completion}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${completion === 100 ? "bg-green-500" : "bg-naranja"}`}
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {/* Name card */}
        <div className="rounded-2xl bg-gradient-to-br from-negro to-negro/90 text-white p-6 sm:p-8 mb-6">
          <p className="text-xs text-white/50 uppercase tracking-widest mb-2">Marca Personal</p>
          <h2 className="font-heading text-2xl sm:text-3xl mb-2">{userName || "Tu nombre"}</h2>
          {(arbol?.tronco?.temaPrincipal || brujula?.briefing?.temaRaiz) && (
            <p className="text-white/80 text-sm">{arbol?.tronco?.temaPrincipal || brujula?.briefing?.temaRaiz}</p>
          )}
          {(arbol?.tronco?.propuestaValor || brujula?.briefing?.propuestaValor) && (
            <p className="text-white/60 text-xs mt-2">{arbol?.tronco?.propuestaValor || brujula?.briefing?.propuestaValor}</p>
          )}
          {arbol?.copa?.arquetipos?.filter((a: any) => a.nombre && a.porcentaje > 0).length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {arbol.copa.arquetipos
                .filter((a: any) => a.nombre && a.porcentaje > 0)
                .sort((a: any, b: any) => b.porcentaje - a.porcentaje)
                .slice(0, 3)
                .map((a: any, i: number) => (
                  <span key={i} className="text-[11px] bg-white/10 text-white/80 px-3 py-1 rounded-full">
                    {a.nombre} {a.porcentaje}%
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Filled blocks */}
        <div className="space-y-3 mb-8">
          {filledBlocks.map((block) => (
            <MirrorCard key={block.id} block={block} />
          ))}
        </div>

        {/* Pending blocks */}
        {emptyBlocks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3 px-1">
              Pendiente de completar ({emptyBlocks.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {emptyBlocks.map((block) => (
                <Link
                  key={block.id}
                  href={block.editHref}
                  className="flex items-center gap-3 rounded-xl border border-dashed border-borde/60 bg-gray-50/50 px-4 py-3 hover:border-naranja/40 hover:bg-white transition-all group"
                >
                  <span className="text-lg opacity-40 group-hover:opacity-70 transition-opacity">{block.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-muted group-hover:text-negro transition-colors">{block.label}</span>
                    <span className="text-[10px] text-muted/50 block">→ {block.editLabel}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ===== MIRROR CARD =====
function MirrorCard({ block }: { block: MirrorBlock }) {
  return (
    <div className="rounded-xl border border-borde/60 bg-white px-5 py-4 hover:border-naranja/20 transition-all group">
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0 mt-0.5">{block.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wide">{block.label}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
              block.source === "arbol"
                ? "bg-green-50 text-green-600 border border-green-200/50"
                : "bg-blue-50 text-blue-600 border border-blue-200/50"
            }`}>
              {block.source === "arbol" ? "Árbol" : "Brújula"}
            </span>
          </div>

          {block.type === "text" && (
            <p className="text-sm text-negro/80 leading-relaxed">{block.value as string}</p>
          )}

          {block.type === "quote" && (
            <p className="text-sm text-negro/80 leading-relaxed italic">&ldquo;{block.value as string}&rdquo;</p>
          )}

          {block.type === "tags" && (
            <div className="flex flex-wrap gap-1.5">
              {(block.value as string[]).map((tag, i) => (
                <span key={i} className="text-xs bg-crema text-negro/70 px-2.5 py-0.5 rounded-full border border-borde/40">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {block.type === "list" && (
            <ul className="space-y-1">
              {(block.value as string[]).map((item, i) => (
                <li key={i} className="text-sm text-negro/80">{item}</li>
              ))}
            </ul>
          )}
        </div>
        <Link
          href={block.editHref}
          className="text-[10px] text-muted/40 hover:text-naranja transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
          title={`Editar en ${block.editLabel}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
