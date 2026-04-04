"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import type { SavedPiece, SuggestionResult } from "@/lib/types";

interface Props {
  userId: string;
}

export default function PiezasClient({ userId }: Props) {
  const [pieces, setPieces] = useState<SavedPiece[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<SuggestionResult | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Plan form
  const [planningId, setPlanningId] = useState<string | null>(null);
  const [planDate, setPlanDate] = useState("");
  const [planTime, setPlanTime] = useState("10:00");
  const [planSaving, setPlanSaving] = useState(false);

  useEffect(() => {
    loadPieces();
  }, []);

  const loadPieces = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("saved_pieces")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setPieces(data as SavedPiece[]);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const deletePiece = async (id: string) => {
    const supabase = createClient();
    await supabase.from("saved_pieces").delete().eq("id", id);
    setPieces((prev) => prev.filter((p) => p.id !== id));
    showToast("Pieza eliminada");
  };

  const startEditing = (piece: SavedPiece) => {
    setEditingId(piece.id);
    setEditData({ ...piece.suggestion });
    setEditNotes(piece.notes || "");
    setExpandedId(piece.id);
  };

  const saveEdits = async () => {
    if (!editingId || !editData) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("saved_pieces")
      .update({
        suggestion: editData,
        notes: editNotes,
        status: "editing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingId);
    setPieces((prev) =>
      prev.map((p) =>
        p.id === editingId
          ? { ...p, suggestion: editData, notes: editNotes, status: "editing" as const }
          : p
      )
    );
    setEditingId(null);
    setEditData(null);
    setSaving(false);
    showToast("Pieza actualizada");
  };

  const planPiece = async (piece: SavedPiece) => {
    if (!planDate) return;
    setPlanSaving(true);
    const supabase = createClient();
    const s = piece.suggestion;
    const sugerenciaText = [
      s.enfoque ? `Enfoque: ${s.enfoque}` : "",
      s.gancho ? `Gancho: "${s.gancho}"` : "",
      ...(s.pistas || []).map((p) => `▸ ${p}`),
      s.cta ? `CTA: ${s.cta}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await supabase.from("planner_items").insert({
      user_id: userId,
      scheduled_date: planDate,
      scheduled_time: planTime,
      title: s.titulares?.[0] || s.subtema,
      pilar: s.pilar,
      formato: s.formato,
      tono: s.tono,
      canal: piece.canal || "",
      sugerencia: sugerenciaText,
      estrategia: s.estrategia || "",
      status: "scheduled",
    });

    // Mark as planned
    await supabase
      .from("saved_pieces")
      .update({ status: "planned" })
      .eq("id", piece.id);

    setPieces((prev) =>
      prev.map((p) => (p.id === piece.id ? { ...p, status: "planned" as const } : p))
    );
    setPlanningId(null);
    setPlanSaving(false);
    showToast("Pieza planificada");
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case "saved": return "Guardada";
      case "editing": return "Editada";
      case "planned": return "Planificada";
      default: return s;
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "saved": return "bg-negro/[0.06] text-on-surface-variant";
      case "editing": return "bg-primary-container/10 text-primary";
      case "planned": return "bg-success/10 text-success";
      default: return "bg-negro/[0.06] text-on-surface-variant";
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-headline text-3xl text-on-surface mb-1">Mis Piezas</h1>
          <p className="text-on-surface-variant text-sm">
            Piezas del Maestro guardadas para trabajar cuando quieras.
          </p>
        </div>

        {pieces.length === 0 && (
          <div className="text-center py-16">
            <p className="text-on-surface-variant text-sm mb-3">No tienes piezas guardadas todavía.</p>
            <Link href="/maestro" className="text-primary text-sm font-medium hover:underline">
              Ir al Maestro →
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {pieces.map((piece) => {
            const s = piece.suggestion;
            const isExpanded = expandedId === piece.id;
            const isEditing = editingId === piece.id;
            const isPlanning = planningId === piece.id;

            return (
              <div
                key={piece.id}
                className="bg-white rounded-2xl border border-outline/60 overflow-hidden hover:border-primary/30 transition-colors"
              >
                {/* Header — always visible */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => {
                    if (!isEditing) setExpandedId(isExpanded ? null : piece.id);
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-on-surface font-medium leading-snug">
                        {s.titulares?.[0] || s.subtema}
                      </p>
                      {piece.notes && (
                        <p className="text-xs text-primary mt-1 italic">{piece.notes}</p>
                      )}
                    </div>
                    <span
                      className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusColor(
                        piece.status
                      )}`}
                    >
                      {statusLabel(piece.status)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="pill pill-dark text-xs">{s.pilar}</span>
                    <span className="pill pill-accent text-xs">{s.formato}</span>
                    <span className="pill pill-light text-xs">{s.tono}</span>
                    {piece.canal && <span className="pill pill-light text-xs">{piece.canal}</span>}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-outline/40 px-5 pb-5 pt-4">
                    {/* Titulares */}
                    {isEditing ? (
                      <div className="mb-4">
                        <label className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 block">Titulares</label>
                        {editData?.titulares?.map((t, i) => (
                          <input
                            key={i}
                            value={t}
                            onChange={(e) => {
                              const newTitulares = [...(editData.titulares || [])];
                              newTitulares[i] = e.target.value;
                              setEditData({ ...editData, titulares: newTitulares });
                            }}
                            className="w-full px-3 py-2 border border-outline rounded-lg bg-white text-on-surface text-sm mb-2 focus:outline-none focus:border-primary"
                          />
                        ))}
                      </div>
                    ) : (
                      s.titulares?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Titulares</h4>
                          {s.titulares.map((t, i) => (
                            <div key={i} className="flex items-start gap-2 mb-1.5">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-container/15 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                              <p className="text-sm text-on-surface leading-snug">{t}</p>
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {/* Gancho */}
                    {isEditing ? (
                      <div className="mb-4">
                        <label className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1 block">Gancho</label>
                        <textarea
                          value={editData?.gancho || ""}
                          onChange={(e) => setEditData({ ...editData!, gancho: e.target.value })}
                          className="w-full px-3 py-2 border border-outline rounded-lg bg-white text-on-surface text-sm resize-none focus:outline-none focus:border-primary"
                          rows={2}
                        />
                      </div>
                    ) : (
                      s.gancho && (
                        <div className="bg-negro/[0.03] border-l-4 border-primary rounded-r-lg px-4 py-3 mb-4">
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Gancho</p>
                          <p className="text-sm text-on-surface italic">&ldquo;{s.gancho}&rdquo;</p>
                        </div>
                      )
                    )}

                    {/* Enfoque */}
                    {isEditing ? (
                      <div className="mb-4">
                        <label className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1 block">Enfoque</label>
                        <textarea
                          value={editData?.enfoque || ""}
                          onChange={(e) => setEditData({ ...editData!, enfoque: e.target.value })}
                          className="w-full px-3 py-2 border border-outline rounded-lg bg-white text-on-surface text-sm resize-none focus:outline-none focus:border-primary"
                          rows={2}
                        />
                      </div>
                    ) : (
                      s.enfoque && (
                        <div className="mb-4">
                          <p className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1">Enfoque</p>
                          <p className="text-sm text-on-surface/80">{s.enfoque}</p>
                        </div>
                      )
                    )}

                    {/* Pistas */}
                    {isEditing ? (
                      <div className="mb-4">
                        <label className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 block">Pistas creativas</label>
                        {editData?.pistas?.map((p, i) => (
                          <input
                            key={i}
                            value={p}
                            onChange={(e) => {
                              const newPistas = [...(editData.pistas || [])];
                              newPistas[i] = e.target.value;
                              setEditData({ ...editData, pistas: newPistas });
                            }}
                            className="w-full px-3 py-2 border border-outline rounded-lg bg-white text-on-surface text-sm mb-2 focus:outline-none focus:border-primary"
                          />
                        ))}
                      </div>
                    ) : (
                      s.pistas?.length > 0 && (
                        <div className="bg-card border border-outline rounded-xl p-4 mb-4">
                          <p className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Pistas creativas</p>
                          {s.pistas.map((p, i) => (
                            <div key={i} className="flex items-start gap-2 mb-1.5">
                              <span className="text-primary mt-0.5">▸</span>
                              <p className="text-sm text-on-surface/80 leading-snug">{p}</p>
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {/* CTA */}
                    {isEditing ? (
                      <div className="mb-4">
                        <label className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1 block">CTA / Cierre</label>
                        <input
                          value={editData?.cta || ""}
                          onChange={(e) => setEditData({ ...editData!, cta: e.target.value })}
                          className="w-full px-3 py-2 border border-outline rounded-lg bg-white text-on-surface text-sm focus:outline-none focus:border-primary"
                        />
                      </div>
                    ) : (
                      s.cta && (
                        <div className="mb-4">
                          <p className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1">CTA</p>
                          <p className="text-sm text-on-surface/80">{s.cta}</p>
                        </div>
                      )
                    )}

                    {/* Notes */}
                    {isEditing && (
                      <div className="mb-4">
                        <label className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1 block">Notas personales</label>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Tus apuntes sobre esta pieza..."
                          className="w-full px-3 py-2 border border-outline rounded-lg bg-white text-on-surface text-sm resize-none focus:outline-none focus:border-primary"
                          rows={2}
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveEdits}
                            disabled={saving}
                            className="bg-primary-container text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-primary-container-hover transition-colors disabled:opacity-50"
                          >
                            {saving ? "Guardando..." : "Guardar cambios"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditData(null);
                            }}
                            className="text-xs text-on-surface-variant hover:text-on-surface transition-colors px-3 py-2"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(piece)}
                            className="text-xs font-medium text-on-surface hover:text-primary transition-colors"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => {
                              setPlanningId(piece.id);
                              const tomorrow = new Date();
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              setPlanDate(tomorrow.toISOString().split("T")[0]);
                            }}
                            className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                          >
                            📅 Planificar
                          </button>
                          <div className="flex-1" />
                          <span className="text-[10px] text-on-surface-variant">
                            {new Date(piece.created_at).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <button
                            onClick={() => deletePiece(piece.id)}
                            className="text-[10px] text-on-surface-variant hover:text-danger transition-colors"
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>

                    {/* Plan form inline */}
                    {isPlanning && (
                      <div className="bg-surface rounded-lg p-4 mt-3">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs text-on-surface-variant mb-1">Fecha</label>
                            <input
                              type="date"
                              value={planDate}
                              onChange={(e) => setPlanDate(e.target.value)}
                              className="w-full px-3 py-2 border border-outline rounded-lg bg-white text-on-surface text-sm focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-on-surface-variant mb-1">Hora</label>
                            <input
                              type="time"
                              value={planTime}
                              onChange={(e) => setPlanTime(e.target.value)}
                              className="w-full px-3 py-2 border border-outline rounded-lg bg-white text-on-surface text-sm focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => planPiece(piece)}
                            disabled={planSaving || !planDate}
                            className="flex-1 bg-primary-container text-white text-sm font-medium py-2.5 rounded-lg hover:bg-primary-container-hover transition-colors disabled:opacity-50"
                          >
                            {planSaving ? "..." : "Confirmar"}
                          </button>
                          <button
                            onClick={() => setPlanningId(null)}
                            className="px-4 py-2.5 border border-outline rounded-lg text-on-surface-variant text-sm hover:text-on-surface transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
