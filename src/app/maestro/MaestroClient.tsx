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
  const [creadorSaving, setCreadorSaving] = useState(false);
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

  const [showFormatPicker, setShowFormatPicker] = useState(false);

  const FORMAT_OPTIONS = [
    { id: "video_short", label: "Vídeo Corto", desc: "Reels, TikTok, Shorts", icon: "movie" },
    { id: "video_long", label: "Vídeo Largo", desc: "YouTube, Podcast", icon: "videocam" },
    { id: "article", label: "Artículo", desc: "Blog, largo formato", icon: "article" },
    { id: "newsletter", label: "Newsletter", desc: "Email editorial", icon: "mail" },
    { id: "post", label: "Post", desc: "Redes sociales", icon: "edit_note" },
    { id: "carousel", label: "Carrusel", desc: "Slides visuales", icon: "view_carousel" },
  ];

  const handleCreateWithFormat = async (projectType: string) => {
    if (!result) return;

    setCreadorSaving(true);
    setShowFormatPicker(false);

    try {
      const title = result.titulares?.[0] || result.subtema || "Sin título";

      let content: any = {};

      if (projectType === "video_long" || projectType === "video_short") {
        content = {
          hook: result.gancho || "",
          retention: "",
          closing: result.cta || "",
          steps: [{ text: result.enfoque || "" }],
          visual_notes: "",
        };
      } else if (projectType === "article" || projectType === "newsletter" || projectType === "post") {
        content = {
          body: (result.enfoque || "") + "\n\n" + (result.pistas || []).join("\n"),
          subtitle: result.subtema || "",
        };
      } else if (projectType === "carousel") {
        content = {};
      }

      const res = await fetch("/api/creador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title,
          project_type: projectType,
          content,
          source_suggestion: result,
          canal: selection.canal || "",
          pilar: result.pilar || "",
          formato: result.formato || "",
          tono: result.tono || "",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al crear el proyecto");
      }

      const data = await res.json();
      const projectId = data.project?.id || data.id;

      if (projectId) {
        window.location.href = `/creador/${projectId}`;
      } else {
        setError("No se pudo obtener el ID del proyecto");
        setCreadorSaving(false);
      }
    } catch (err: any) {
      setError(err.message || "Error al crear el proyecto");
      setCreadorSaving(false);
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
      <h3 className="text-sm font-semibold text-on-surface mb-2">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((opt) => (
          <div
            key={opt.value}
            onClick={() => selectOption(field, opt.value)}
            className={`option-card ${selection[field] === opt.value ? "selected" : ""}`}
          >
            {opt.icon && <div className="text-lg mb-1">{opt.icon}</div>}
            <div className="font-medium text-sm">{opt.label}</div>
            {opt.desc && <div className="text-xs text-on-surface-variant mt-0.5">{opt.desc}</div>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-headline text-3xl text-on-surface mb-1">El Maestro</h1>
          <p className="text-on-surface-variant text-sm">
            Cuéntame cómo estás hoy y qué quieres lograr. Yo te digo qué crear.
          </p>
        </div>

        {/* Idea banner */}
        {ideaText && (
          <div className="bg-primary/[0.06] rounded-2xl p-4 mb-6 signature-shadow">
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Trabajando idea</p>
            <p className="text-sm text-on-surface font-medium">&ldquo;{ideaText}&rdquo;</p>
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
          <h3 className="text-sm font-semibold text-on-surface mb-2">¿En qué canal?</h3>
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
            <h3 className="text-sm font-semibold text-on-surface mb-1">
              ¿Sobre qué pilar? <span className="text-on-surface-variant font-normal">(opcional)</span>
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
          <div className="surface-card signature-shadow rounded-2xl p-4 mb-6">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
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
            className="w-full gradient-denim text-white font-semibold py-3.5 rounded-2xl hover:shadow-card-hover transition-shadow disabled:opacity-40 disabled:cursor-not-allowed mb-4"
          >
            🎯 Generar sugerencia
          </button>
        ) : (
          <div className="bg-primary rounded-2xl p-6 sm:p-8 mb-4 text-center signature-shadow">
            <div className="flex justify-center mb-4">
              <span className="loader" />
            </div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">El Maestro está pensando...</p>
            <div className={`transition-opacity duration-400 ${quoteFading ? "opacity-0" : "opacity-100"}`} style={{ minHeight: "4.5rem" }}>
              <p className="text-white text-sm sm:text-base font-medium italic leading-relaxed">
                &ldquo;{currentQuote.text}&rdquo;
              </p>
              <p className="text-gradient-yellow text-xs font-semibold mt-2">— {currentQuote.author}</p>
            </div>
          </div>
        )}

        {!apiKey && (
          <p className="text-center text-sm text-on-surface-variant mb-4">
            ⚠️ Necesitas{" "}
            <Link href="/settings" className="text-primary hover:underline">
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

            <h3 className="font-headline text-xl text-on-surface mb-1">{result.subtema}</h3>
            <p className="text-sm text-on-surface-variant mb-5">Ángulo: {result.angulo}</p>

            {/* Titulares */}
            {result.titulares && result.titulares.length > 0 && (
              <div className="surface-low rounded-2xl p-4 mb-4 signature-shadow">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Ideas de titular</h4>
                <div className="space-y-2">
                  {result.titulares.map((t, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                      <p className="text-sm text-on-surface font-medium leading-snug">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gancho */}
            {result.gancho && (
              <div className="surface-low rounded-2xl border-l-4 border-primary px-4 py-3 mb-4 signature-shadow">
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Gancho de apertura</h4>
                <p className="text-sm text-on-surface font-medium italic leading-relaxed">&ldquo;{result.gancho}&rdquo;</p>
              </div>
            )}

            {/* Enfoque */}
            {result.enfoque && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Enfoque</h4>
                <p className="text-sm text-on-surface/80 leading-relaxed">{result.enfoque}</p>
              </div>
            )}

            {/* Pistas creativas */}
            {result.pistas && result.pistas.length > 0 && (
              <div className="surface-card signature-shadow rounded-2xl p-4 mb-4">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3">Pistas creativas</h4>
                <div className="space-y-2.5">
                  {result.pistas.map((p, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 text-primary mt-0.5">▸</span>
                      <p className="text-sm text-on-surface/80 leading-snug">{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            {result.cta && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Cierre / CTA</h4>
                <p className="text-sm text-on-surface/80 leading-relaxed">{result.cta}</p>
              </div>
            )}

            {/* Estrategia + Por qué ahora (compact) */}
            {(result.estrategia || result.porQueAhora) && (
              <div className="border-t border-surface-mid pt-4 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.estrategia && (
                  <div>
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">🧠 Estrategia</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{result.estrategia}</p>
                  </div>
                )}
                {result.porQueAhora && (
                  <div>
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">⏰ Por qué ahora</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{result.porQueAhora}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tendencia en Redes */}
            {result.tendencia && (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-4 mt-4 signature-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-purple-600 text-lg">trending_up</span>
                  <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider">Tendencia en Redes</h4>
                  <span className="ml-auto pill text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 font-bold rounded-full">
                    {result.tendencia.objetivo}
                  </span>
                </div>
                <p className="text-sm font-headline text-on-surface font-bold mb-1">{result.tendencia.nombre}</p>
                <p className="text-sm text-on-surface/80 leading-relaxed">{result.tendencia.aplicacion}</p>
              </div>
            )}

            {/* Legacy: show old sugerencia if present (old history entries) */}
            {result.sugerencia && !result.pistas && (
              <div className="border-t border-surface-mid pt-4 mt-4">
                <h4 className="text-sm font-semibold text-on-surface mb-2">💡 Sugerencia</h4>
                <div className="text-sm text-on-surface leading-relaxed whitespace-pre-line">{result.sugerencia}</div>
              </div>
            )}

            {/* Action buttons */}
            <div className="border-t border-surface-mid pt-4 mt-4 space-y-3">
              {/* Trabajar sobre esta idea */}
              {creadorSaving ? (
                <div className="w-full py-3 gradient-yellow text-on-surface rounded-2xl font-bold text-sm text-center opacity-70">
                  Preparando...
                </div>
              ) : showFormatPicker ? (
                <div className="surface-card signature-shadow rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-headline text-on-surface">Elige el formato</p>
                    <button onClick={() => setShowFormatPicker(false)} className="text-on-surface-variant hover:text-on-surface text-xs">✕</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FORMAT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleCreateWithFormat(opt.id)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-container-low hover:bg-primary/10 transition-colors group"
                      >
                        <span className="material-symbols-outlined text-xl text-on-surface-variant group-hover:text-primary transition-colors">{opt.icon}</span>
                        <span className="text-xs font-medium text-on-surface">{opt.label}</span>
                        <span className="text-[10px] text-on-surface-variant leading-tight">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowFormatPicker(true)}
                  className="w-full py-3 gradient-yellow text-on-surface rounded-2xl font-bold hover:shadow-card-hover transition-shadow text-sm"
                >
                  🎨 Trabajar sobre esta idea
                </button>
              )}

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
                      className="py-3 gradient-denim text-white rounded-2xl font-medium hover:shadow-card-hover transition-shadow text-sm"
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
                      className={`py-3 rounded-2xl font-medium text-sm transition-colors ${
                        pieceSaved
                          ? "surface-card text-success signature-shadow"
                          : "surface-card text-on-surface signature-shadow hover:shadow-card-hover"
                      }`}
                    >
                      {pieceSaving ? "..." : pieceSaved ? "✓ Guardada" : "💾 Guardar para después"}
                    </button>
                  </div>
                ) : (
                  <div className="surface-low rounded-2xl p-4 signature-shadow">
                    <h4 className="text-sm font-semibold text-on-surface mb-3">
                      📅 ¿Cuándo quieres crear esta pieza?
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Fecha</label>
                        <input
                          type="date"
                          value={planDate}
                          onChange={(e) => setPlanDate(e.target.value)}
                          className="w-full px-3 py-2 bg-surface-container-low border-none rounded-xl text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Hora</label>
                        <input
                          type="time"
                          value={planTime}
                          onChange={(e) => setPlanTime(e.target.value)}
                          className="w-full px-3 py-2 bg-surface-container-low border-none rounded-xl text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/10"
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
                        className="flex-1 gradient-denim text-white text-sm font-medium py-2.5 rounded-xl hover:shadow-card-hover transition-shadow disabled:opacity-50"
                      >
                        {planSaving ? "Guardando..." : "Confirmar"}
                      </button>
                      <button
                        onClick={() => setShowPlanForm(false)}
                        className="px-4 py-2.5 surface-card text-on-surface-variant rounded-xl text-sm hover:shadow-card-hover transition-shadow"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-2">
                  <p className="text-success font-medium text-sm">✓ Añadida al planificador</p>
                  <Link href="/planner" className="text-primary text-xs hover:underline mt-1 inline-block">
                    Ver planificador →
                  </Link>
                </div>
              )}

              {/* Link to saved pieces */}
              {pieceSaved && (
                <div className="text-center">
                  <Link href="/piezas" className="text-primary text-xs hover:underline">
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
