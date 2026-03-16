"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import type { PlannerItem } from "@/lib/types";

// ─── Types ─────────────────────────────────────────────

type ViewMode = "week" | "month" | "list";

// ─── Helpers ───────────────────────────────────────────

const DAYS_SHORT = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const PILAR_COLORS: Record<string, string> = {};
const COLOR_PALETTE = [
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", pill: "bg-amber-100 text-amber-800", dot: "bg-amber-400" },
  { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", pill: "bg-sky-100 text-sky-800", dot: "bg-sky-400" },
  { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", pill: "bg-violet-100 text-violet-800", dot: "bg-violet-400" },
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", pill: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-400" },
  { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", pill: "bg-rose-100 text-rose-800", dot: "bg-rose-400" },
  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", pill: "bg-orange-100 text-orange-800", dot: "bg-orange-400" },
  { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", pill: "bg-teal-100 text-teal-800", dot: "bg-teal-400" },
  { bg: "bg-fuchsia-50", border: "border-fuchsia-200", text: "text-fuchsia-700", pill: "bg-fuchsia-100 text-fuchsia-800", dot: "bg-fuchsia-400" },
];

let colorIndex = 0;
function getPilarColor(pilar: string) {
  if (!PILAR_COLORS[pilar]) {
    PILAR_COLORS[pilar] = String(colorIndex % COLOR_PALETTE.length);
    colorIndex++;
  }
  return COLOR_PALETTE[Number(PILAR_COLORS[pilar])];
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function isToday(d: Date): boolean {
  return d.toDateString() === new Date().toDateString();
}

function isPast(d: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
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

function getMonthDates(year: number, month: number): { date: Date; isCurrentMonth: boolean }[] {
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7; // Monday = 0
  const result: { date: Date; isCurrentMonth: boolean }[] = [];
  // Previous month padding
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    result.push({ date: d, isCurrentMonth: false });
  }
  // Current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    result.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  // Next month padding to complete grid (6 rows = 42)
  while (result.length < 42) {
    const d = new Date(year, month + 1, result.length - daysInMonth - startDay + 1);
    result.push({ date: d, isCurrentMonth: false });
  }
  return result;
}

// ─── Component ─────────────────────────────────────────

interface Props {
  userId: string;
}

export default function PlannerClient({ userId }: Props) {
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [toast, setToast] = useState("");

  // ─── Data range computation ────────────────────────
  const weekDates = getWeekDates(weekOffset);
  const monthDates = getMonthDates(monthDate.year, monthDate.month);

  // We load all items for the visible range + unassigned
  const rangeStart = view === "week" ? formatDateISO(weekDates[0]) : formatDateISO(monthDates[0].date);
  const rangeEnd = view === "week" ? formatDateISO(weekDates[6]) : formatDateISO(monthDates[monthDates.length - 1].date);

  // ─── Data loading ──────────────────────────────────
  const loadItems = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: rangeItems } = await supabase
      .from("planner_items")
      .select("*")
      .eq("user_id", userId)
      .gte("scheduled_date", rangeStart)
      .lte("scheduled_date", rangeEnd)
      .order("scheduled_time", { ascending: true });

    const { data: unassigned } = await supabase
      .from("planner_items")
      .select("*")
      .eq("user_id", userId)
      .is("scheduled_date", null)
      .order("created_at", { ascending: false });

    setItems([...(rangeItems || []), ...(unassigned || [])]);
    setLoading(false);
  }, [userId, rangeStart, rangeEnd]);

  useEffect(() => { loadItems(); }, [loadItems]);

  // ─── Toast helper ──────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ─── Item helpers ──────────────────────────────────
  const getItemsForDate = (dateStr: string) =>
    items.filter((item) => item.scheduled_date === dateStr);
  const unassignedItems = items.filter((item) => !item.scheduled_date);
  const scheduledUnsyncedItems = items.filter(
    (i) => i.scheduled_date && !i.gcal_synced && i.status !== "published"
  );

  // ─── Drag & Drop ──────────────────────────────────
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDragItemId(itemId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", itemId);
  };
  const handleDragEnd = () => { setDragItemId(null); setDropTarget(null); };
  const handleDragOver = (e: React.DragEvent, dateStr: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(dateStr ?? "backlog");
  };
  const handleDragLeave = () => setDropTarget(null);
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
      .update({ scheduled_date: targetDate, status: targetDate ? "scheduled" : "draft", updated_at: new Date().toISOString() })
      .eq("id", itemId);
  };

  // ─── CRUD ──────────────────────────────────────────
  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setExpandedId(null);
    const supabase = createClient();
    await supabase.from("planner_items").delete().eq("id", id);
    showToast("Pieza eliminada");
  };

  const updateTime = async (id: string, time: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, scheduled_time: time } : item)));
    const supabase = createClient();
    await supabase.from("planner_items").update({ scheduled_time: time, updated_at: new Date().toISOString() }).eq("id", id);
  };

  const toggleStatus = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newStatus = item.status === "published" ? "scheduled" : "published";
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i)));
    const supabase = createClient();
    await supabase.from("planner_items").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", id);
    showToast(newStatus === "published" ? "Marcada como publicada" : "Desmarcada");
  };

  // ─── Google Calendar Sync ─────────────────────────
  const buildGcalUrl = (item: PlannerItem): string => {
    const dateClean = (item.scheduled_date || "").replace(/-/g, "");
    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", `[${item.pilar}] ${item.formato} — ${item.title}`);

    if (item.scheduled_time) {
      // Timed event: local times (no Z = Google treats as local timezone)
      const [hh, mm] = item.scheduled_time.split(":");
      const startTime = `${hh}${mm}00`;
      const endH = String(Math.min(23, parseInt(hh) + 1)).padStart(2, "0");
      const endTime = `${endH}${mm}00`;
      url.searchParams.set("dates", `${dateClean}T${startTime}/${dateClean}T${endTime}`);
    } else {
      // All-day event
      const nextDay = new Date(item.scheduled_date + "T12:00:00");
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayClean = nextDay.toISOString().split("T")[0].replace(/-/g, "");
      url.searchParams.set("dates", `${dateClean}/${nextDayClean}`);
    }

    const details = [
      item.sugerencia || "",
      `Pilar: ${item.pilar}`,
      item.canal ? `Canal: ${item.canal}` : "",
      "— Creado con La Brújula de Contenido",
    ].filter(Boolean).join("\n");
    url.searchParams.set("details", details);

    return url.toString();
  };

  const syncToCalendar = (item: PlannerItem) => {
    if (!item.scheduled_date) {
      showToast("Asigna una fecha antes de sincronizar");
      return;
    }
    const opened = window.open(buildGcalUrl(item), "_blank", "noopener,noreferrer");
    if (!opened) {
      showToast("Tu navegador bloqueó la ventana. Permite popups para este sitio.");
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, gcal_synced: true } : i)));
    const supabase = createClient();
    supabase.from("planner_items").update({ gcal_synced: true, updated_at: new Date().toISOString() }).eq("id", item.id).then(() => {});
    showToast("Abierto en Google Calendar ✓");
  };

  const syncAllToCalendar = () => {
    if (scheduledUnsyncedItems.length === 0) return;
    setSyncingAll(true);
    // Open one at a time to avoid popup blocker
    syncToCalendar(scheduledUnsyncedItems[0]);
    setSyncingAll(false);
    if (scheduledUnsyncedItems.length > 1) {
      showToast(`Sincronizado 1/${scheduledUnsyncedItems.length}. Pulsa de nuevo para el siguiente.`);
    }
  };

  // ─── Navigation ────────────────────────────────────
  const goToday = () => {
    if (view === "week") setWeekOffset(0);
    else {
      const now = new Date();
      setMonthDate({ year: now.getFullYear(), month: now.getMonth() });
    }
  };

  const goPrev = () => {
    if (view === "week") setWeekOffset((w) => w - 1);
    else setMonthDate((m) => m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 });
  };

  const goNext = () => {
    if (view === "week") setWeekOffset((w) => w + 1);
    else setMonthDate((m) => m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 });
  };

  const periodLabel = view === "week"
    ? (() => {
        const s = weekDates[0], e = weekDates[6];
        return s.getMonth() === e.getMonth()
          ? `${s.getDate()} – ${e.getDate()} de ${s.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`
          : `${s.getDate()} ${s.toLocaleDateString("es-ES", { month: "short" })} – ${e.getDate()} ${e.toLocaleDateString("es-ES", { month: "short", year: "numeric" })}`;
      })()
    : `${MONTHS[monthDate.month]} ${monthDate.year}`;

  // ═══════════════════════════════════════════════════
  // CARD COMPONENTS
  // ═══════════════════════════════════════════════════

  // ── Full card (week view + backlog) ────────────────
  const FullCard = ({ item }: { item: PlannerItem }) => {
    const isExpanded = expandedId === item.id;
    const colors = getPilarColor(item.pilar);
    const isDone = item.status === "published";

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, item.id)}
        onDragEnd={handleDragEnd}
        className={`group relative rounded-xl border-2 p-3 mb-2.5 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
          isDone ? "border-success/30 bg-success/5 opacity-70" : `${colors.border} ${colors.bg}`
        } ${dragItemId === item.id ? "opacity-30 scale-95" : ""}`}
      >
        <div className="flex items-start gap-2">
          <button onClick={(e) => { e.stopPropagation(); toggleStatus(item.id); }}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
              isDone ? "bg-success border-success" : "border-gray-300 hover:border-naranja"
            }`}>
            {isDone && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </button>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
            <div className="flex flex-wrap gap-1.5 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${colors.pill}`}>{item.pilar}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">{item.formato}</span>
            </div>
            <p className={`text-sm font-semibold leading-snug ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>{item.title}</p>
            <div className="flex items-center gap-2 mt-1">
              {item.scheduled_time && <span className="text-[11px] text-gray-500">{item.scheduled_time}</span>}
              {item.canal && <span className="text-[11px] text-gray-400">{item.canal}</span>}
              {item.gcal_synced && <span className="text-[10px] text-success font-medium ml-auto">✓ Cal</span>}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200/60">
            <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-4">{item.sugerencia}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-white/60 rounded-lg px-2 py-1 border border-gray-200">
                <input type="time" value={item.scheduled_time || ""} onChange={(e) => updateTime(item.id, e.target.value)}
                  className="text-xs bg-transparent text-gray-700 focus:outline-none" onClick={(e) => e.stopPropagation()} />
              </div>
              {item.scheduled_date && !item.gcal_synced && (
                <button onClick={(e) => { e.stopPropagation(); syncToCalendar(item); }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-naranja/10 text-naranja font-medium hover:bg-naranja/20 transition-colors">
                  📅 Sync
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                className="text-xs px-2 py-1 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/5 transition-colors ml-auto">
                🗑
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Compact dot (month calendar cell) ──────────────
  const MonthDot = ({ item }: { item: PlannerItem }) => {
    const colors = getPilarColor(item.pilar);
    const isDone = item.status === "published";
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, item.id)}
        onDragEnd={handleDragEnd}
        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
        title={`${item.pilar} · ${item.formato} — ${item.title}`}
        className={`cursor-pointer rounded-lg px-1.5 py-0.5 text-[10px] font-medium truncate mb-0.5 transition-all hover:shadow ${
          isDone ? "bg-success/10 text-success line-through" : `${colors.bg} ${colors.text}`
        } ${dragItemId === item.id ? "opacity-30" : ""}`}
      >
        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${isDone ? "bg-success" : colors.dot}`} />
        {item.title}
      </div>
    );
  };

  // ── List row ───────────────────────────────────────
  const ListRow = ({ item }: { item: PlannerItem }) => {
    const colors = getPilarColor(item.pilar);
    const isDone = item.status === "published";
    const isExpanded = expandedId === item.id;

    return (
      <div className={`border-2 rounded-xl p-4 mb-2 transition-all ${isDone ? "border-success/20 bg-success/5 opacity-70" : `${colors.border} ${colors.bg}`}`}>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => toggleStatus(item.id)}
            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
              isDone ? "bg-success border-success" : "border-gray-300 hover:border-naranja"
            }`}>
            {isDone && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </button>

          {/* Date */}
          <div className="w-16 sm:w-20 flex-shrink-0 text-center">
            {item.scheduled_date ? (
              <span className="text-xs font-semibold text-gray-600">
                {new Date(item.scheduled_date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 italic">Sin fecha</span>
            )}
            {item.scheduled_time && <span className="block text-[10px] text-gray-400">{item.scheduled_time}</span>}
          </div>

          {/* Pills */}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${colors.pill}`}>{item.pilar}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 flex-shrink-0">{item.formato}</span>

          {/* Title */}
          <p className={`flex-1 text-sm font-semibold cursor-pointer ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}
            onClick={() => setExpandedId(isExpanded ? null : item.id)}>
            {item.title}
          </p>

          {/* Canal */}
          {item.canal && <span className="text-[11px] text-gray-400 hidden sm:block">{item.canal}</span>}

          {/* Sync status */}
          {item.gcal_synced ? (
            <span className="text-[10px] text-success font-semibold">✓ Cal</span>
          ) : item.scheduled_date ? (
            <button onClick={() => syncToCalendar(item)}
              className="text-xs px-2.5 py-1 rounded-lg bg-naranja/10 text-naranja font-medium hover:bg-naranja/20 transition-colors">
              📅
            </button>
          ) : null}

          <button onClick={() => deleteItem(item.id)}
            className="text-gray-300 hover:text-danger transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200/60 ml-8">
            <p className="text-xs text-gray-600 leading-relaxed mb-2">{item.sugerencia}</p>
            <div className="flex items-center gap-2">
              <input type="time" value={item.scheduled_time || ""} onChange={(e) => updateTime(item.id, e.target.value)}
                className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:border-naranja" />
            </div>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  // EXPANDED DETAIL OVERLAY (for month view)
  // ═══════════════════════════════════════════════════
  const expandedItem = items.find((i) => i.id === expandedId);

  // ─── Loading state ─────────────────────────────────
  if (loading) {
    return (
      <AppShell fullWidth>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="loader" />
          <p className="text-sm text-muted">Cargando planificador...</p>
        </div>
      </AppShell>
    );
  }

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════
  return (
    <AppShell fullWidth>
      <div>
        {/* ── Header ─────────────────────────────── */}
        <div className="flex flex-col gap-4 mb-5">
          {/* Row 1: Title + Sync */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl text-negro">Planificador</h1>
              <p className="text-muted text-sm hidden sm:block">Organiza tu contenido arrastrando las piezas</p>
            </div>

            {scheduledUnsyncedItems.length > 0 && (
              <button onClick={syncAllToCalendar} disabled={syncingAll}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-naranja text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-naranja-hover transition-colors shadow-sm disabled:opacity-60">
                {syncingAll ? (
                  <><span className="loader-sm" /> Sincronizando...</>
                ) : (
                  <>📅 <span className="hidden sm:inline">Sincronizar con Calendar</span><span className="sm:hidden">Sync</span> ({scheduledUnsyncedItems.length})</>
                )}
              </button>
            )}
          </div>

          {/* Row 2: View toggle + Navigation */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* View toggle */}
            <div className="inline-flex bg-white border border-borde rounded-xl overflow-hidden shadow-sm">
              {([
                { key: "week" as ViewMode, label: "Semanal", icon: "📋" },
                { key: "month" as ViewMode, label: "Mensual", icon: "📅" },
                { key: "list" as ViewMode, label: "Lista", icon: "📝" },
              ]).map((v) => (
                <button key={v.key} onClick={() => setView(v.key)}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                    view === v.key ? "bg-naranja text-white" : "text-muted hover:text-negro hover:bg-crema"
                  }`}>
                  <span className="sm:hidden">{v.icon}</span>
                  <span className="hidden sm:inline">{v.icon} {v.label}</span>
                </button>
              ))}
            </div>

            {/* Period nav */}
            {view !== "list" && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-negro mr-1">{periodLabel}</span>
                <div className="inline-flex bg-white border border-borde rounded-xl overflow-hidden shadow-sm">
                  <button onClick={goPrev} className="px-2.5 py-1.5 text-muted hover:text-negro hover:bg-crema transition-colors border-r border-borde">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={goToday} className="px-3 py-1.5 text-xs text-naranja font-semibold hover:bg-naranja/5 transition-colors">Hoy</button>
                  <button onClick={goNext} className="px-2.5 py-1.5 text-muted hover:text-negro hover:bg-crema transition-colors border-l border-borde">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            WEEK VIEW (Kanban)
        ═══════════════════════════════════════════ */}
        {view === "week" && (
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4">
            {/* Backlog */}
            <div
              className={`w-36 sm:w-44 lg:w-52 flex-shrink-0 rounded-2xl transition-all ${
                dropTarget === "backlog" ? "bg-naranja/10 ring-2 ring-naranja/30" : "bg-gray-50"
              }`}
              onDragOver={(e) => handleDragOver(e, null)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, null)}
            >
              <div className="sticky top-0 bg-gray-100/80 backdrop-blur-sm rounded-t-2xl px-3 py-2.5 border-b border-gray-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">Bandeja</span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-gray-200 text-[10px] font-bold text-gray-600 flex items-center justify-center">{unassignedItems.length}</span>
                </div>
              </div>
              <div className="p-2 min-h-[350px] sm:min-h-[450px]">
                {unassignedItems.map((item) => <FullCard key={item.id} item={item} />)}
                {unassignedItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 opacity-40">
                    <span className="text-xl mb-1">📥</span>
                    <span className="text-[10px] text-gray-400 text-center">Sin asignar</span>
                  </div>
                )}
              </div>
            </div>

            {/* Days */}
            {weekDates.map((date, i) => {
              const dateStr = formatDateISO(date);
              const dayItems = getItemsForDate(dateStr);
              const today = isToday(date);
              const past = isPast(date) && !today;
              const isDropHere = dropTarget === dateStr;

              return (
                <div key={dateStr}
                  className={`flex-1 min-w-[120px] sm:min-w-[150px] lg:min-w-[170px] rounded-2xl transition-all ${
                    isDropHere ? "bg-naranja/10 ring-2 ring-naranja/30 scale-[1.01]"
                    : today ? "bg-naranja/5" : past ? "bg-gray-50/70" : "bg-white/50"
                  }`}
                  onDragOver={(e) => handleDragOver(e, dateStr)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, dateStr)}
                >
                  <div className={`sticky top-0 backdrop-blur-sm rounded-t-2xl px-2 py-2.5 border-b ${today ? "bg-naranja/10 border-naranja/20" : "bg-white/80 border-gray-200/60"}`}>
                    <div className="flex flex-col items-center">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${today ? "text-naranja" : past ? "text-gray-400" : "text-gray-500"}`}>{DAYS_SHORT[i]}</span>
                      <span className={`text-lg sm:text-xl font-bold ${today ? "text-naranja" : past ? "text-gray-400" : "text-gray-800"}`}>{date.getDate()}</span>
                      {today && <div className="w-1.5 h-1.5 rounded-full bg-naranja mt-0.5" />}
                    </div>
                    {dayItems.length > 0 && (
                      <div className="flex justify-center mt-1">
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${today ? "bg-naranja/20 text-naranja" : "bg-gray-100 text-gray-500"}`}>
                          {dayItems.length}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-1.5 sm:p-2 min-h-[350px] sm:min-h-[400px]">
                    {dayItems.map((item) => <FullCard key={item.id} item={item} />)}
                    {dayItems.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 opacity-30">
                        <svg className="w-6 h-6 text-gray-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        <span className="text-[10px] text-gray-400">Arrastra</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════════════════════════════════════════
            MONTH VIEW (Calendar grid)
        ═══════════════════════════════════════════ */}
        {view === "month" && (
          <div className="bg-white rounded-2xl border border-borde shadow-sm overflow-x-auto">
            <div className="min-w-[500px]">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-borde">
              {DAYS_SHORT.map((d) => (
                <div key={d} className="py-2 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 border-r border-borde last:border-r-0">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {monthDates.map(({ date, isCurrentMonth }, idx) => {
                const dateStr = formatDateISO(date);
                const dayItems = getItemsForDate(dateStr);
                const today = isToday(date);
                const isDropHere = dropTarget === dateStr;

                return (
                  <div key={idx}
                    className={`min-h-[80px] sm:min-h-[110px] border-r border-b border-borde last:border-r-0 p-1 transition-all ${
                      !isCurrentMonth ? "bg-gray-50/50" : today ? "bg-naranja/5" : "bg-white"
                    } ${isDropHere ? "bg-naranja/10 ring-inset ring-2 ring-naranja/30" : ""}`}
                    onDragOver={(e) => handleDragOver(e, dateStr)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, dateStr)}
                  >
                    <div className={`text-right mb-0.5 ${!isCurrentMonth ? "opacity-30" : ""}`}>
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                        today ? "bg-naranja text-white" : "text-gray-600"
                      }`}>
                        {date.getDate()}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {dayItems.slice(0, 3).map((item) => (
                        <MonthDot key={item.id} item={item} />
                      ))}
                      {dayItems.length > 3 && (
                        <span className="text-[9px] text-gray-400 pl-1">+{dayItems.length - 3} más</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            LIST VIEW
        ═══════════════════════════════════════════ */}
        {view === "list" && (
          <div>
            {/* Unassigned */}
            {unassignedItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400" /> Sin fecha asignada ({unassignedItems.length})
                </h3>
                {unassignedItems.map((item) => <ListRow key={item.id} item={item} />)}
              </div>
            )}

            {/* Scheduled, sorted by date */}
            {(() => {
              const scheduled = items.filter((i) => i.scheduled_date).sort((a, b) =>
                (a.scheduled_date || "").localeCompare(b.scheduled_date || "") || (a.scheduled_time || "").localeCompare(b.scheduled_time || "")
              );
              if (scheduled.length === 0 && unassignedItems.length === 0) return null;

              // Group by date
              const groups: Record<string, PlannerItem[]> = {};
              scheduled.forEach((item) => {
                const d = item.scheduled_date || "sin-fecha";
                if (!groups[d]) groups[d] = [];
                groups[d].push(item);
              });

              return Object.entries(groups).map(([date, dateItems]) => (
                <div key={date} className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isToday(new Date(date + "T00:00:00")) ? "bg-naranja" : "bg-gray-300"}`} />
                    {new Date(date + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                    {isToday(new Date(date + "T00:00:00")) && <span className="text-naranja text-[10px] font-semibold ml-1">HOY</span>}
                  </h3>
                  {dateItems.map((item) => <ListRow key={item.id} item={item} />)}
                </div>
              ));
            })()}
          </div>
        )}

        {/* ── Detail overlay for month view ─────── */}
        {view === "month" && expandedItem && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setExpandedId(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              {(() => {
                const colors = getPilarColor(expandedItem.pilar);
                const isDone = expandedItem.status === "published";
                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${colors.pill}`}>{expandedItem.pilar}</span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{expandedItem.formato}</span>
                      </div>
                      <button onClick={() => setExpandedId(null)} className="text-gray-400 hover:text-negro transition-colors">✕</button>
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>{expandedItem.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                      {expandedItem.scheduled_date && <span>{new Date(expandedItem.scheduled_date + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</span>}
                      {expandedItem.scheduled_time && <span>{expandedItem.scheduled_time}</span>}
                      {expandedItem.canal && <span>· {expandedItem.canal}</span>}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{expandedItem.sugerencia}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => toggleStatus(expandedItem.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${isDone ? "bg-gray-100 text-gray-600" : "bg-success/10 text-success"}`}>
                        {isDone ? "Desmarcar" : "✓ Marcar publicada"}
                      </button>
                      <input type="time" value={expandedItem.scheduled_time || ""} onChange={(e) => updateTime(expandedItem.id, e.target.value)}
                        className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:border-naranja" />
                      {expandedItem.scheduled_date && !expandedItem.gcal_synced && (
                        <button onClick={() => syncToCalendar(expandedItem)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-naranja/10 text-naranja font-medium hover:bg-naranja/20 transition-colors">
                          📅 Sync Calendar
                        </button>
                      )}
                      {expandedItem.gcal_synced && <span className="text-xs text-success font-semibold">✓ En Calendar</span>}
                      <button onClick={() => { deleteItem(expandedItem.id); setExpandedId(null); }}
                        className="text-xs px-3 py-1.5 rounded-lg text-danger hover:bg-danger/5 transition-colors ml-auto">
                        Eliminar
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* ── Empty state ─────────────────────────── */}
        {items.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-borde mt-4">
            <span className="text-5xl mb-4 block">📋</span>
            <h3 className="font-heading text-2xl text-negro mb-2">Tu planificador está vacío</h3>
            <p className="text-muted text-sm mb-6 max-w-md mx-auto">
              Ve al Maestro, genera sugerencias de contenido y pulsa &ldquo;Planificar esta pieza&rdquo; para que aparezcan aquí.
            </p>
            <Link href="/maestro" className="inline-flex items-center gap-2 px-6 py-2.5 bg-naranja text-white font-semibold rounded-xl hover:bg-naranja-hover transition-colors">
              🎯 Ir al Maestro
            </Link>
          </div>
        )}

        {/* ── Toast ───────────────────────────────── */}
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-negro text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 z-50 ${
          toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}>
          {toast}
        </div>
      </div>

      <style jsx>{`
        .line-clamp-4 { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </AppShell>
  );
}
