"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import type { IdeaItem } from "@/lib/types";

interface Props {
  userId: string;
  data: any;
  apiKey: string;
}

export default function IdeasClient({ userId, data, apiKey }: Props) {
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [newIdea, setNewIdea] = useState("");
  const [saving, setSaving] = useState(false);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "raw" | "enriched" | "worked">("all");
  const [toast, setToast] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const pilares = data?.tree?.pilares || [];

  // Load ideas on mount
  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    const supabase = createClient();
    const { data: ideasData } = await supabase
      .from("ideas")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (ideasData) setIdeas(ideasData as IdeaItem[]);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const addIdea = async () => {
    const text = newIdea.trim();
    if (!text) return;
    setSaving(true);
    const supabase = createClient();
    const { data: inserted, error } = await supabase
      .from("ideas")
      .insert({ user_id: userId, text, status: "raw" })
      .select()
      .single();
    if (inserted) {
      setIdeas((prev) => [inserted as IdeaItem, ...prev]);
      setNewIdea("");
      showToast("Idea guardada");
      inputRef.current?.focus();
    }
    if (error) showToast("Error al guardar");
    setSaving(false);
  };

  const enrichIdea = async (idea: IdeaItem) => {
    if (!apiKey) {
      showToast("Necesitas configurar tu API Key en Ajustes");
      return;
    }
    setEnrichingId(idea.id);
    try {
      const res = await fetch("/api/ideas/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ideaId: idea.id, ideaText: idea.text }),
      });
      if (!res.ok) throw new Error("Error al enriquecer");
      const { enrichment } = await res.json();
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === idea.id ? { ...i, status: "enriched" as const, enrichment, pilar: enrichment.pilar, subtema: enrichment.subtema } : i
        )
      );
      showToast("Idea conectada con tu estrategia");
    } catch {
      showToast("Error al conectar la idea");
    }
    setEnrichingId(null);
  };

  const deleteIdea = async (id: string) => {
    const supabase = createClient();
    await supabase.from("ideas").delete().eq("id", id);
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    showToast("Idea eliminada");
  };

  const filteredIdeas = filter === "all" ? ideas : ideas.filter((i) => i.status === filter);

  const statusLabel = (s: string) => {
    switch (s) {
      case "raw": return "Sin conectar";
      case "enriched": return "Conectada";
      case "worked": return "Trabajada";
      default: return s;
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "raw": return "bg-negro/[0.06] text-muted";
      case "enriched": return "bg-naranja/10 text-naranja";
      case "worked": return "bg-success/10 text-success";
      default: return "bg-negro/[0.06] text-muted";
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl text-negro mb-1">Ideas</h1>
          <p className="text-muted text-sm">
            Tu cajón de ideas. Apunta lo que se te ocurra y la IA lo conecta con tu estrategia.
          </p>
        </div>

        {/* Input */}
        <div className="bg-white rounded-2xl border border-borde/60 p-4 mb-6">
          <textarea
            ref={inputRef}
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                addIdea();
              }
            }}
            placeholder='Ej: "El síndrome del perfil bonito pero vacío", "Analogía de la pirámide de Keops"...'
            className="w-full resize-none border-0 bg-transparent text-negro text-sm placeholder:text-muted/50 focus:outline-none leading-relaxed"
            rows={2}
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-borde/40">
            <span className="text-[11px] text-muted">
              Enter para guardar · Shift+Enter nueva línea
            </span>
            <button
              onClick={addIdea}
              disabled={saving || !newIdea.trim()}
              className="bg-naranja text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-naranja-hover transition-colors disabled:opacity-40"
            >
              {saving ? "..." : "💡 Guardar idea"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4">
          {(["all", "raw", "enriched", "worked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                filter === f
                  ? "bg-negro text-white"
                  : "text-muted hover:text-negro hover:bg-negro/[0.04]"
              }`}
            >
              {f === "all" ? `Todas (${ideas.length})` :
               f === "raw" ? `Sin conectar (${ideas.filter(i => i.status === "raw").length})` :
               f === "enriched" ? `Conectadas (${ideas.filter(i => i.status === "enriched").length})` :
               `Trabajadas (${ideas.filter(i => i.status === "worked").length})`}
            </button>
          ))}
        </div>

        {/* Ideas list */}
        <div className="space-y-3">
          {filteredIdeas.length === 0 && (
            <div className="text-center py-12 text-muted text-sm">
              {ideas.length === 0
                ? "Todavía no tienes ideas guardadas. Empieza a apuntar."
                : "No hay ideas con este filtro."}
            </div>
          )}

          {filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              className="bg-white rounded-2xl border border-borde/60 p-5 hover:border-naranja/30 transition-colors"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-sm text-negro font-medium leading-relaxed flex-1">
                  {idea.text}
                </p>
                <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusColor(idea.status)}`}>
                  {statusLabel(idea.status)}
                </span>
              </div>

              {/* Enrichment result */}
              {idea.enrichment && (
                <div className="bg-naranja/[0.04] border border-naranja/15 rounded-xl p-4 mb-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="pill pill-dark text-xs">{idea.enrichment.pilar}</span>
                    <span className="pill pill-accent text-xs">{idea.enrichment.subtema}</span>
                  </div>
                  <p className="text-xs text-negro/70 leading-relaxed mb-2">
                    {idea.enrichment.conexion}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {idea.enrichment.angulos?.map((a, i) => (
                      <span key={i} className="text-[10px] font-medium text-muted bg-negro/[0.04] px-2 py-0.5 rounded">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-1">
                {idea.status === "raw" && (
                  <button
                    onClick={() => enrichIdea(idea)}
                    disabled={enrichingId === idea.id}
                    className="text-xs font-medium text-naranja hover:text-naranja-hover transition-colors disabled:opacity-50"
                  >
                    {enrichingId === idea.id ? (
                      <span className="flex items-center gap-1.5">
                        <span className="loader-sm" /> Conectando...
                      </span>
                    ) : (
                      "🔗 Conectar con mi estrategia"
                    )}
                  </button>
                )}
                {(idea.status === "enriched" || idea.enrichment) && (
                  <Link
                    href={`/maestro?idea=${encodeURIComponent(idea.text)}&ideaId=${idea.id}&pilar=${encodeURIComponent(idea.enrichment?.pilar || "")}`}
                    className="text-xs font-medium text-naranja hover:text-naranja-hover transition-colors"
                  >
                    🎯 Trabajar con el Maestro
                  </Link>
                )}
                <div className="flex-1" />
                <span className="text-[10px] text-muted">
                  {new Date(idea.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </span>
                <button
                  onClick={() => deleteIdea(idea.id)}
                  className="text-[10px] text-muted hover:text-danger transition-colors ml-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-negro text-white text-sm px-5 py-2.5 rounded-xl shadow-lg animate-toast z-50">
            {toast}
          </div>
        )}
      </div>
    </AppShell>
  );
}
