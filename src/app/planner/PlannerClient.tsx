"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import type { PlannerItem } from "@/lib/types";

// ─── Helpers ───────────────────────────────────────────

const DAYS_SHORT = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

const PILAR_COLORS: Record<string, string> = {};
const COLOR_PALETTE = [
  { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", pill: "bg-amber-100 text-amber-800" },
  { bg: "bg-sky-50", border: "border-sky-300", text: "text-sky-700", pill: "bg-sky-100 text-sky-800" },
  { bg: "bg-violet-50", border: "border-violet-300", text: "text-violet-700", pill: "bg-violet-100 text-violet-800" },
  { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", pill: "bg-emerald-100 text-emerald-800" },
  { bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-700", pill: "bg-rose-100 text-rose-800" },
  { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", pill: "bg-orange-100 text-orange-800" },
  { bg: "bg-teal-50", border: "border-teal-300", text: "text-teal-700", pill: "bg-teal-100 text-teal-800" },
  { bg: "bg-fuchsia-50", border: "border-fuchsia-300", text: "text-fuchsia-700", pill: "bg-fuchsia-100 text-fuchsia-800" },
];

let colorIndex = 0;
function getPilarColor(pilar: string) {
  if (!PILAR_COLORS[pilar]) {
    PILAR_COLORS[pilar] = String(colorIndex % COLOR_PALETTE.length);
    colorIndex++;
  }
  return COLOR_PALETTE[Number(PILAR_COLORS[pilar])];
}

function getWeekDates(offset: number): Date[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day === 0 ? 7 : day) - 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDateISO(d: Date): string {
  return d.toISOString().split("T")[0];
}

function isToday(d: Date): boolean {
  return d.toDateString() === new Date().toDateString();
}

function isPast(d: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

// ─── Component ─────────────────────────────────────────

interface Props {
  userId: string;
}

export default function PlannerClient({ userId }: Props) {
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [toast, setToast] = useState("");

  const weekDates = getWeekDates(weekOffset);
  const weekStart = formatDateISO(weekDates[0]);
  const weekEnd = formatDateISO(weekDates[6]);

  // ─── Data loading ──────────────────────────────────
  const loadItems = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: weekItems } = await supabase
      .from("planner_items")
      .select("*")
      .eq("user_id", userId)
      .gte("scheduled_date", weekStart)
      .lte("scheduled_date", weekEnd)
      .order("scheduled_time", { ascending: true });

    const { data: unassigned } = await supabase
      .from("planner_items")
      .select("*")
      .eq("user_id", userId)
      .is("scheduled_date", null)
      .order("created_at", { ascending: false });

    setItems([...(weekItems || []), ...(unassigned || [])]);
    setLoading(false);
  }, [userId, weekStart, weekEnd]);

  useEffect(() => { loadItems(); }, [loadItems]);

  // Toast helper
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ─── Item helpers ──────────────────────────────────
  const getItemsForDate = (dateStr: string) =>
    items.filter((item) => item.scheduled_date === dateStr);

  const unassignedItems = items.filter((item) => !item.scheduled_date);

  const scheduledUnsyncedItems = items.filter(
    (i) => i.scheduled_date && i.scheduled_time && !i.gcal_synced && i.status !== "published"
  );

  // ─── Drag & Drop ──────────────────────────────────
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDragItemId(itemId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", itemId);
    // Make drag image slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDragItemId(null);
    setDropTarget(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(dateStr);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string | null) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    if (!itemId) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, scheduled_date: targetDate, status: targetDate ? "scheduled" : "draft" }
          : item
      )
    );
    setDragItemId(null);
    setDropTarget(null);

    const supabase = createClient();
    await supabase
      .from("planner_items")
      .update({
        scheduled_date: targetDate,
        status: targetDate ? "scheduled" : "draft",
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId);
  };

  // ─── CRUD & Sync ──────────────────────────────────
  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setExpandedId(null);
    const supabase = createClient();
    await supabase.from("planner_items").delete().eq("id", id);
    showToast("Pieza eliminada");
  };

  const updateTime = async (id: string, time: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, scheduled_time: time } : item))
    );
    const supabase = createClient();
    await supabase
      .from("planner_items")
      .update({ scheduled_time: time, updated_at: new Date().toISOString() })
      .eq("id", id);
  };

  const toggleStatus = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newStatus = item.status === "published" ? "scheduled" : "published";
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
    const supabase = createClient();
    await supabase
      .from("planner_items")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id);
    showToast(newStatus === "published" ? "Marcada como publicada" : "Desmarcada");
  };

  const syncToCalendar = async (item: PlannerItem) => {
    if (!item.scheduled_date || !item.scheduled_time) return;
    setSyncingId(item.id);
    try {
      const res = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          userId,
          summary: `[${item.pilar}] ${item.formato} — ${item.title}`,
          description: item.sugerencia,
          date: item.scheduled_date,
          time: item.scheduled_time,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, gcal_synced: true } : i))
        );
        if (data.gcalUrl) {
          window.open(data.gcalUrl, "_blank");
        }
        showToast("Sincronizado con Google Calendar");
      }
    } catch {
      showToast("Error al sincronizar");
    }
    setSyncingId(null);
  };

  const syncAllToCalendar = async () => {
    if (scheduledUnsyncedItems.length === 0) return;
    setSyncingAll(true);
    for (const item of scheduledUnsyncedItems) {
      await syncToCalendar(item);
      // Small delay between syncs
      await new Promise((r) => setTimeout(r, 300));
    }
    setSyncingAll(false);
    showToast(`${scheduledUnsyncedItems.length} piezas sincronizadas`);
  };

  // ─── Card component ────────────────────────────────
  const PlannerCard = ({ item }: { item: PlannerItem }) => {
    const isExpanded = expandedId === item.id;
    const colors = getPilarColor(item.pilar);
    const isDone = item.status === "published";

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, item.id)}
        onDragEnd={handleDragEnd}
        className={`group relative rounded-xl border-2 p-3 mb-2.5 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
          isDone
            ? "border-success/30 bg-success/5 opacity-70"
            : `${colors.border} ${colors.bg}`
        } ${dragItemId === item.id ? "opacity-30 scale-95" : ""}`}
      >
        {/* Drag handle indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-40 transition-opacity">
          <svg className="w-4 h-4 text-current" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="4" r="1.2" />
            <circle cx="11" cy="4" r="1.2" />
            <circle cx="5" cy="8" r="1.2" />
            <circle cx="11" cy="8" r="1.2" />
            <circle cx="5" cy="12" r="1.2" />
            <circle cx="11" cy="12" r="1.2" />
          </svg>
        </div>

        {/* Header row */}
        <div className="flex items-start gap-2.5">
          {/* Checkbox */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleStatus(item.id); }}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
              isDone
                ? "bg-success border-success scale-110"
                : "border-gray-300 hover:border-naranja hover:scale-110"
            }`}
          >
            {isDone && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {/* Content */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setExpandedId(isExpanded ? null : item.id)}
          >
            {/* Pills */}
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${colors.pill}`}>
                {item.pilar}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                {item.formato}
              </span>
            </div>

            {/* Title */}
            <p className={`text-sm font-semibold leading-snug ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
              {item.title}
            </p>

            {/* Time + Canal */}
            <div className="flex items-center gap-2 mt-1.5">
              {item.scheduled_time && (
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                  {item.scheduled_time}
                </span>
              )}
              {item.canal && (
                <span className="text-[11px] text-gray-400">{item.canal}</span>
              )}
              {item.gcal_synced && (
                <span className="text-[11px] text-success font-medium ml-auto">✓ Calendar</span>
              )}
            </div>
          </div>
        </div>

        {/* Expanded view */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200/60 animate-fadeIn">
            {/* Sugerencia preview */}
            <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-4">
              {item.sugerencia}
            </p>

            {/* Time + Actions row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Time picker */}
              <div className="flex items-center gap-1.5 bg-white/60 rounded-lg px-2 py-1 border border-gray-200">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                <input
                  type="time"
                  value={item.scheduled_time || ""}
                  onChange={(e) => updateTime(item.id, e.target.value)}
                  className="text-xs bg-transparent text-gray-700 focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Sync button */}
              {item.scheduled_date && item.scheduled_time && !item.gcal_synced && (
                <button
                  onClick={(e) => { e.stopPropagation(); syncToCalendar(item); }}
                  disabled={syncingId === item.id}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-naranja/10 text-naranja font-medium hover:bg-naranja/20 transition-colors disabled:opacity-50"
                >
                  {syncingId === item.id ? (
                    <><span className="loader-sm !w-3 !h-3 !border-naranja/30 !border-t-naranja" /> Sync...</>
                  ) : (
                    <>📅 Sync</>
                  )}
                </button>
              )}

              {/* Delete */}
              <button
                onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                className="text-xs px-2.5 py-1 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/5 transition-colors ml-auto"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── Empty column placeholder ──────────────────────
  const EmptyColumn = () => (
    <div className="flex flex-col items-center justify-center py-8 opacity-40">
      <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      <span className="text-[11px] text-gray-400">Arrastra aquí</span>
    </div>
  );

  // ─── Loading state ─────────────────────────────────
  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="loader" />
          <p className="text-sm text-muted">Cargando planificador...</p>
        </div>
      </AppShell>
    );
  }

  // ─── Week label ────────────────────────────────────
  const weekLabel = (() => {
    const s = weekDates[0];
    const e = weekDates[6];
    const sameMonth = s.getMonth() === e.getMonth();
    if (sameMonth) {
      return `${s.getDate()} – ${e.getDate()} de ${s.toLocaleDateString("es-ES", { month: "long" })} ${s.getFullYear()}`;
    }
    return `${s.getDate()} ${s.toLocaleDateString("es-ES", { month: "short" })} – ${e.getDate()} ${e.toLocaleDateString("es-ES", { month: "short" })} ${s.getFullYear()}`;
  })();

  // ─── Render ────────────────────────────────────────
  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto px-2">
        {/* ── Header ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-3xl text-negro mb-0.5">Planificador</h1>
            <p className="text-muted text-sm">{weekLabel}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Week navigation */}
            <div className="inline-flex items-center bg-white border border-borde rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                className="px-3 py-2 text-sm text-muted hover:text-negro hover:bg-crema transition-colors border-r border-borde"
                title="Semana anterior"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setWeekOffset(0)}
                className="px-4 py-2 text-sm text-naranja font-semibold hover:bg-naranja/5 transition-colors"
              >
                Hoy
              </button>
              <button
                onClick={() => setWeekOffset((w) => w + 1)}
                className="px-3 py-2 text-sm text-muted hover:text-negro hover:bg-crema transition-colors border-l border-borde"
                title="Semana siguiente"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Sync all button */}
            {scheduledUnsyncedItems.length > 0 && (
              <button
                onClick={syncAllToCalendar}
                disabled={syncingAll}
                className="inline-flex items-center gap-2 px-4 py-2 bg-naranja text-white text-sm font-semibold rounded-xl hover:bg-naranja-hover transition-colors shadow-sm disabled:opacity-60"
              >
                {syncingAll ? (
                  <><span className="loader-sm" /> Sincronizando...</>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Sincronizar con Calendar ({scheduledUnsyncedItems.length})
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── Kanban Board ────────────────────────── */}
        <div className="flex gap-3 overflow-x-auto pb-4">
          {/* Backlog column */}
          <div
            className={`w-56 flex-shrink-0 rounded-2xl transition-all duration-200 ${
              dropTarget === "backlog"
                ? "bg-naranja/10 ring-2 ring-naranja/30"
                : "bg-gray-50"
            }`}
            onDragOver={(e) => handleDragOver(e, "backlog")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, null)}
          >
            {/* Column header */}
            <div className="sticky top-0 bg-gray-100/80 backdrop-blur-sm rounded-t-2xl px-4 py-3 border-b border-gray-200/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Bandeja</span>
                </div>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-[10px] font-bold text-gray-600">
                  {unassignedItems.length}
                </span>
              </div>
            </div>

            {/* Column body */}
            <div className="p-2.5 min-h-[450px]">
              {unassignedItems.map((item) => (
                <PlannerCard key={item.id} item={item} />
              ))}
              {unassignedItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 opacity-40">
                  <span className="text-2xl mb-2">📥</span>
                  <span className="text-[11px] text-gray-400 text-center">
                    Las piezas sin fecha<br />aparecen aquí
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Day columns */}
          {weekDates.map((date, i) => {
            const dateStr = formatDateISO(date);
            const dayItems = getItemsForDate(dateStr);
            const today = isToday(date);
            const past = isPast(date) && !today;
            const isDropHere = dropTarget === dateStr;
            const dayNum = date.getDate();

            return (
              <div
                key={dateStr}
                className={`flex-1 min-w-[170px] rounded-2xl transition-all duration-200 ${
                  isDropHere
                    ? "bg-naranja/10 ring-2 ring-naranja/30 scale-[1.01]"
                    : today
                    ? "bg-naranja/5"
                    : past
                    ? "bg-gray-50/70"
                    : "bg-white/50"
                }`}
                onDragOver={(e) => handleDragOver(e, dateStr)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, dateStr)}
              >
                {/* Column header */}
                <div className={`sticky top-0 backdrop-blur-sm rounded-t-2xl px-3 py-3 border-b ${
                  today
                    ? "bg-naranja/10 border-naranja/20"
                    : "bg-white/80 border-gray-200/60"
                }`}>
                  <div className="flex flex-col items-center">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      today ? "text-naranja" : past ? "text-gray-400" : "text-gray-500"
                    }`}>
                      {DAYS_SHORT[i]}
                    </span>
                    <span className={`text-xl font-bold mt-0.5 ${
                      today ? "text-naranja" : past ? "text-gray-400" : "text-gray-800"
                    }`}>
                      {dayNum}
                    </span>
                    {today && (
                      <div className="w-1.5 h-1.5 rounded-full bg-naranja mt-1" />
                    )}
                  </div>
                  {dayItems.length > 0 && (
                    <div className="flex justify-center mt-1.5">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        today ? "bg-naranja/20 text-naranja" : "bg-gray-100 text-gray-500"
                      }`}>
                        {dayItems.length} {dayItems.length === 1 ? "pieza" : "piezas"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Column body */}
                <div className="p-2 min-h-[400px]">
                  {dayItems.map((item) => (
                    <PlannerCard key={item.id} item={item} />
                  ))}
                  {dayItems.length === 0 && <EmptyColumn />}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Empty state ─────────────────────────── */}
        {items.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-borde mt-4">
            <span className="text-5xl mb-4 block">📋</span>
            <h3 className="font-heading text-2xl text-negro mb-2">Tu planificador está vacío</h3>
            <p className="text-muted text-sm mb-6 max-w-md mx-auto">
              Ve al Maestro, genera sugerencias de contenido y pulsa &ldquo;Planificar esta pieza&rdquo;
              para que aparezcan aquí.
            </p>
            <Link
              href="/maestro"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-naranja text-white font-semibold rounded-xl hover:bg-naranja-hover transition-colors"
            >
              🎯 Ir al Maestro
            </Link>
          </div>
        )}

        {/* ── Toast ───────────────────────────────── */}
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-negro text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 z-50 ${
            toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          {toast}
        </div>
      </div>

      {/* ── Custom animation ─────────────────────── */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 500px; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </AppShell>
  );
}
