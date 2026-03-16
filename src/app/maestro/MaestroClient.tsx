"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { OBJECTIVES, ENERGY_LEVELS, FORMAT_MAP } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { SuggestionResult, MaestroSelection } from "@/lib/types";

// ─── Fallback quotes (used while Supabase loads) ──────────
const FALLBACK_QUOTES = [
  { text: "El contenido es fuego. Las redes sociales son gasolina.", author: "Jay Baer" },
  { text: "La gente no compra lo que haces, compra por qué lo haces.", author: "Simon Sinek" },
  { text: "Tu marca personal es lo que dicen de ti cuando no estás en la sala.", author: "Jeff Bezos" },
  { text: "La mejor forma de predecir el futuro es creándolo.", author: "Peter Drucker" },
  { text: "La creatividad es la inteligencia divirtiéndose.", author: "Albert Einstein" },
];

interface Quote {
  text: string;
  author: string;
}

interface Props {
  userId: string;
  data: any;
  apiKey: string;
  history: any[];
}

export default function MaestroClient({ userId, data, apiKey }: Props) {
  const searchParams = useSearchParams();
  const ideaText = searchParams.get("idea") || "";
  const ideaId = searchParams.get("ideaId") || "";
  const ideaPilar = searchParams.get("pilar") || "";

  const [selection, setSelection] = useState<MaestroSelection>({
    objetivo: null,
    energia: null,
    canal: null,
    pilar: ideaPilar || null,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuggestionResult | null>(null);
  const [error, setError] = useState("");
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planDate, setPlanDate] = useState("");
  const [planTime, setPlanTime] = useState("10:00");
  const [planSaving, setPlanSaving] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  const [pieceSaved, setPieceSaved] = useState(false);
  const [pieceSaving, setPieceSaving] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<Quote>(FALLBACK_QUOTES[0]);
  const [quoteFading, setQuoteFading] = useState(false);
  const quotesRef = useRef<Quote[]>(FALLBACK_QUOTES);

  // ─── Load quotes from Supabase on mount ──────────────────
  useEffect(() => {
    fetch("/api/quotes")
      .then((r) => r.json())
      .then((data) => {
        if (data.quotes && data.quotes.length > 0) {
          quotesRef.current = data.quotes;
        }
      })
      .catch(() => {
        // Keep fallback quotes
      });
  }, []);

  // ─── Rotate quotes while loading ─────────────────────────
  const pickRandomQuote = useCallback(() => {
    const quotes = quotesRef.current;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, []);

  useEffect(() => {
    if (!loading) return;
    setCurrentQuote(pickRandomQuote());
    const interval = setInterval(() => {
      setQuoteFading(true);
      setTimeout(() => {
        setCurrentQuote(pickRandomQuote());
        setQuoteFading(false);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, [loading, pickRandomQuote]);

  const pilares = data?.tree?.pilares || [];
  const canales = data?.channels?.canales || [];

  const selectOption = (field: keyof MaestroSelection, value: string) => {
    setSelection((prev) => ({
      ...prev,
      [field]: prev[field] === value ? null : value,
    }));
  };

  const canGenerate = selection.objetivo && selection.energia && selection.canal;

  const generate = async () => {
    if (!canGenerate) return;
    if (!apiKey) {
      setError("Necesitas configurar tu API Key de Anthropic en Ajustes para usar el Maestro.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          selection,
          ideaText: ideaText || undefined,
          ideaId: ideaId || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al generar la sugerencia");
      }

      const data = await res.json();
      setResult(data.suggestion);
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const OptionGrid = ({
    title,
    field,
    options,
  }: {
    title: string;
    field: keyof MaestroSelection;
    options: { value: string; label: string; icon?: string; desc?: string }[];
  }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-negro mb-2">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((opt) => (
          <div
            key={opt.value}
            onClick={() => selectOption(field, opt.value)}
            className={`option-card ${selection[field] === opt.value ? "selected" : ""}`}
          >
            {opt.icon && <div className="text-lg mb-1">{opt.icon}</div>}
            <div className="font-medium text-sm">{opt.label}</div>
            {opt.desc && <div className="text-xs text-muted mt-0.5">{opt.desc}</div>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-3xl text-negro mb-1">El Maestro</h1>
          <p className="text-muted text-sm">
            Cuéntame cómo estás hoy y qué quieres lograr. Yo te digo qué crear.
          </p>
        </div>

        {/* Idea banner */}
        {ideaText && (
          <div className="bg-naranja/[0.06] border border-naranja/20 rounded-xl p-4 mb-6">
            <p className="text-[10px] font-bold text-naranja uppercase tracking-wider mb-1">Trabajando idea</p>
            <p className="text-sm text-negro font-medium">&ldquo;{ideaText}&rdquo;</p>
          </div>
        )}

        {/* Step 1: Objetivo */}
        <OptionGrid
          title="¿Qué quieres conseguir?"
          field="objetivo"
          options={OBJECTIVES}
        />

        {/* Step 2: Energía */}
        <OptionGrid
          title="¿Cómo estás de energía?"
          field="energia"
          options={ENERGY_LEVELS.map((e) => ({
            value: e.value,
            label: e.label,
            icon: e.icon,
            desc: e.desc,
          }))}
        />

        {/* Step 3: Canal */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-negro mb-2">¿En qué canal?</h3>
          <div className="flex flex-wrap gap-2">
            {canales.map((ch: string) => (
              <div
                key={ch}
                onClick={() => selectOption("canal", ch)}
                className={`option-card !inline-block !w-auto px-4 ${
                  selection.canal === ch ? "selected" : ""
                }`}
              >
                {ch}
              </div>
            ))}
          </div>
        </div>

        {/* Step 4: Pilar (optional) */}
        {pilares.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-negro mb-1">
              ¿Sobre qué pilar? <span className="text-muted font-normal">(opcional)</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {pilares.map((p: any, i: number) => (
                <div
                  key={i}
                  onClick={() => selectOption("pilar", p.nombre)}
                  className={`option-card !inline-block !w-auto px-4 ${
                    selection.pilar === p.nombre ? "selected" : ""
                  }`}
                >
                  {p.nombre}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formats preview */}
        {selection.energia && (
          <div className="bg-card border border-borde rounded-card p-4 mb-6">
            <span className="text-xs font-semibold text-muted uppercase tracking-wide">
              Formatos posibles para tu energía
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {FORMAT_MAP[selection.energia]?.map((f) => (
                <span key={f} className="pill pill-light text-xs">{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* Generate button */}
        {!loading ? (
          <button
            onClick={generate}
            disabled={!canGenerate}
            className="w-full bg-naranja text-white font-semibold py-3.5 rounded-lg hover:bg-naranja-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-4"
          >
            🎯 Generar sugerencia
          </button>
        ) : (
          <div className="bg-negro rounded-2xl p-6 sm:p-8 mb-4 text-center">
            <div className="flex justify-center mb-4">
              <span className="loader" />
            </div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">El Maestro está pensando...</p>
            <div className={`transition-opacity duration-400 ${quoteFading ? "opacity-0" : "opacity-100"}`} style={{ minHeight: "4.5rem" }}>
              <p className="text-white text-sm sm:text-base font-medium italic leading-relaxed">
                &ldquo;{currentQuote.text}&rdquo;
              </p>
              <p className="text-naranja text-xs font-semibold mt-2">— {currentQuote.author}</p>
            </div>
          </div>
        )}

        {!apiKey && (
          <p className="text-center text-sm text-muted mb-4">
            ⚠️ Necesitas{" "}
            <Link href="/settings" className="text-naranja hover:underline">
              configurar tu API Key
            </Link>{" "}
            para usar el Maestro.
          </p>
        )}

        {error && (
          <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 text-danger text-sm mb-4">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="suggestion-result">
            {/* Header pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="pill pill-dark">{result.pilar}</span>
              <span className="pill pill-accent">{result.formato}</span>
              <span className="pill pill-light">{result.tono}</span>
            </div>

            <h3 className="font-heading text-xl text-negro mb-1">{result.subtema}</h3>
            <p className="text-sm text-muted mb-5">Ángulo: {result.angulo}</p>

            {/* Titulares */}
            {result.titulares && result.titulares.length > 0 && (
              <div className="bg-naranja/5 border border-naranja/20 rounded-xl p-4 mb-4">
                <h4 className="text-xs font-bold text-naranja uppercase tracking-wider mb-3">Ideas de titular</h4>
                <div className="space-y-2">
                  {result.titulares.map((t, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-naranja/15 text-naranja text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                      <p className="text-sm text-negro font-medium leading-snug">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gancho */}
            {result.gancho && (
              <div className="bg-negro/[0.03] border-l-4 border-naranja rounded-r-lg px-4 py-3 mb-4">
                <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Gancho de apertura</h4>
                <p className="text-sm text-negro font-medium italic leading-relaxed">&ldquo;{result.gancho}&rdquo;</p>
              </div>
            )}

            {/* Enfoque */}
            {result.enfoque && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-negro uppercase tracking-wider mb-2">Enfoque</h4>
                <p className="text-sm text-negro/80 leading-relaxed">{result.enfoque}</p>
              </div>
            )}

            {/* Pistas creativas */}
            {result.pistas && result.pistas.length > 0 && (
              <div className="bg-card border border-borde rounded-xl p-4 mb-4">
                <h4 className="text-xs font-bold text-negro uppercase tracking-wider mb-3">Pistas creativas</h4>
                <div className="space-y-2.5">
                  {result.pistas.map((p, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 text-naranja mt-0.5">▸</span>
                      <p className="text-sm text-negro/80 leading-snug">{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            {result.cta && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-negro uppercase tracking-wider mb-2">Cierre / CTA</h4>
                <p className="text-sm text-negro/80 leading-relaxed">{result.cta}</p>
              </div>
            )}

            {/* Estrategia + Por qué ahora (compact) */}
            {(result.estrategia || result.porQueAhora) && (
              <div className="border-t border-borde pt-4 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.estrategia && (
                  <div>
                    <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">🧠 Estrategia</h4>
                    <p className="text-xs text-muted leading-relaxed">{result.estrategia}</p>
                  </div>
                )}
                {result.porQueAhora && (
                  <div>
                    <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">⏰ Por qué ahora</h4>
                    <p className="text-xs text-muted leading-relaxed">{result.porQueAhora}</p>
                  </div>
                )}
              </div>
            )}

            {/* Legacy: show old sugerencia if present (old history entries) */}
            {result.sugerencia && !result.pistas && (
              <div className="border-t border-borde pt-4 mt-4">
                <h4 className="text-sm font-semibold text-negro mb-2">💡 Sugerencia</h4>
                <div className="text-sm text-negro leading-relaxed whitespace-pre-line">{result.sugerencia}</div>
              </div>
            )}

            {/* Action buttons */}
            <div className="border-t border-borde pt-4 mt-4 space-y-3">
              {/* Planificar */}
              {!planSaved ? (
                !showPlanForm ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setShowPlanForm(true);
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setPlanDate(tomorrow.toISOString().split("T")[0]);
                      }}
                      className="py-3 bg-naranja text-white rounded-lg font-medium hover:bg-naranja-hover transition-colors text-sm"
                    >
                      📅 Planificar
                    </button>
                    <button
                      onClick={async () => {
                        if (!result || pieceSaved) return;
                        setPieceSaving(true);
                        const supabase = createClient();
                        await supabase.from("saved_pieces").insert({
                          user_id: userId,
                          suggestion: result,
                          canal: selection.canal || "",
                          notes: "",
                          status: "saved",
                        });
                        setPieceSaving(false);
                        setPieceSaved(true);
                      }}
                      disabled={pieceSaving || pieceSaved}
                      className={`py-3 rounded-lg font-medium text-sm transition-colors ${
                        pieceSaved
                          ? "bg-success/10 text-success border border-success/30"
                          : "border-2 border-negro/15 text-negro hover:border-negro/30"
                      }`}
                    >
                      {pieceSaving ? "..." : pieceSaved ? "✓ Guardada" : "💾 Guardar para después"}
                    </button>
                  </div>
                ) : (
                  <div className="bg-crema rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-negro mb-3">
                      📅 ¿Cuándo quieres crear esta pieza?
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-muted mb-1">Fecha</label>
                        <input
                          type="date"
                          value={planDate}
                          onChange={(e) => setPlanDate(e.target.value)}
                          className="w-full px-3 py-2 border border-borde rounded-lg bg-white text-negro text-sm focus:outline-none focus:border-naranja"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1">Hora</label>
                        <input
                          type="time"
                          value={planTime}
                          onChange={(e) => setPlanTime(e.target.value)}
                          className="w-full px-3 py-2 border border-borde rounded-lg bg-white text-negro text-sm focus:outline-none focus:border-naranja"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          if (!planDate || !result) return;
                          setPlanSaving(true);
                          const supabase = createClient();
                          const sugerenciaText = [
                            result.enfoque ? `Enfoque: ${result.enfoque}` : "",
                            result.gancho ? `Gancho: "${result.gancho}"` : "",
                            ...(result.pistas || []).map((p) => `▸ ${p}`),
                            result.cta ? `CTA: ${result.cta}` : "",
                          ].filter(Boolean).join("\n");
                          await supabase.from("planner_items").insert({
                            user_id: userId,
                            scheduled_date: planDate,
                            scheduled_time: planTime,
                            title: result.titulares?.[0] || result.subtema,
                            pilar: result.pilar,
                            formato: result.formato,
                            tono: result.tono,
                            canal: selection.canal || "",
                            sugerencia: sugerenciaText || result.sugerencia || "",
                            estrategia: result.estrategia || "",
                            status: "scheduled",
                          });
                          setPlanSaving(false);
                          setPlanSaved(true);
                          setShowPlanForm(false);
                        }}
                        disabled={planSaving || !planDate}
                        className="flex-1 bg-naranja text-white text-sm font-medium py-2.5 rounded-lg hover:bg-naranja-hover transition-colors disabled:opacity-50"
                      >
                        {planSaving ? "Guardando..." : "Confirmar"}
                      </button>
                      <button
                        onClick={() => setShowPlanForm(false)}
                        className="px-4 py-2.5 border border-borde rounded-lg text-muted text-sm hover:text-negro transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-2">
                  <p className="text-success font-medium text-sm">✓ Añadida al planificador</p>
                  <Link href="/planner" className="text-naranja text-xs hover:underline mt-1 inline-block">
                    Ver planificador →
                  </Link>
                </div>
              )}

              {/* Link to saved pieces */}
              {pieceSaved && (
                <div className="text-center">
                  <Link href="/piezas" className="text-naranja text-xs hover:underline">
                    Ver mis piezas guardadas →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
