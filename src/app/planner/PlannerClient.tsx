"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import type { PlannerItem } from "@/lib/types";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

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

function formatDateShort(d: Date): string {
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

interface Props {
  userId: string;
}

export default function PlannerClient({ userId }: Props) {
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const weekDates = getWeekDates(weekOffset);
  const weekStart = formatDateISO(weekDates[0]);
  const weekEnd = formatDateISO(weekDates[6]);

  // Load items
  const loadItems = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    // Get items for this week + unassigned
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

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Get items for a specific date
  const getItemsForDate = (dateStr: string) =>
    items.filter((item) => item.scheduled_date === dateStr);

  const unassignedItems = items.filter((item) => !item.scheduled_date);

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDragItemId(itemId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string | null) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    if (!itemId) return;

    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, scheduled_date: targetDate, status: targetDate ? "scheduled" : "draft" }
          : item
      )
    );
    setDragItemId(null);

    // Save to DB
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

  // Delete item
  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    const supabase = createClient();
    await supabase.from("planner_items").delete().eq("id", id);
  };

  // Update time
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

  // Toggle published
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
  };

  // Sync to Google Calendar
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
        // Open Google Calendar in new tab to create the event
        if (data.gcalUrl) {
          window.open(data.gcalUrl, "_blank");
        }
      }
    } catch {
      // Silently fail for now
    }
    setSyncingId(null);
  };

  // Card component
  const PlannerCard = ({ item }: { item: PlannerItem }) => {
    const isExpanded = expandedId === item.id;

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, item.id)}
        className={`bg-card border rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
          item.status === "published"
            ? "border-success/40 bg-success/5"
            : "border-borde"
        } ${dragItemId === item.id ? "opacity-40" : ""}`}
      >
        {/* Header */}
        <div className="flex items-start gap-2">
          <button
            onClick={() => toggleStatus(item.id)}
            className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
              item.status === "published"
                ? "bg-success border-success"
                : "border-borde hover:border-naranja"
            }`}
          >
            {item.status === "published" && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
            <div className="flex flex-wrap gap-1 mb-1">
              <span className="pill pill-dark text-[10px]">{item.pilar}</span>
              <span className="pill pill-accent text-[10px]">{item.formato}</span>
            </div>
            <p className={`text-xs font-medium text-negro truncate ${item.status === "published" ? "line-through text-muted" : ""}`}>
              {item.title}
            </p>
            {item.scheduled_time && (
              <p className="text-[10px] text-muted mt-0.5">{item.scheduled_time}h</p>
            )}
          </div>
        </div>

        {/* Expanded view */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-borde">
            {item.canal && (
              <p className="text-xs text-muted mb-2">Canal: <span className="text-negro">{item.canal}</span></p>
            )}
            <p className="text-xs text-negro leading-relaxed whitespace-pre-line mb-3">
              {item.sugerencia}
            </p>

            {/* Time editor */}
            <div className="flex items-center gap-2 mb-3">
              <label className="text-xs text-muted">Hora:</label>
              <input
                type="time"
                value={item.scheduled_time || ""}
                onChange={(e) => updateTime(item.id, e.target.value)}
                className="px-2 py-1 border border-borde rounded text-xs bg-crema text-negro focus:outline-none focus:border-naranja"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {item.scheduled_date && item.scheduled_time && (
                <button
                  onClick={() => syncToCalendar(item)}
                  disabled={item.gcal_synced || syncingId === item.id}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    item.gcal_synced
                      ? "bg-success/10 text-success"
                      : "bg-naranja/10 text-naranja hover:bg-naranja/20"
                  } disabled:opacity-50`}
                >
                  {syncingId === item.id
                    ? "Sincronizando..."
                    : item.gcal_synced
                    ? "✓ En Calendar"
                    : "📅 Sync Calendar"}
                </button>
              )}
              <button
                onClick={() => deleteItem(item.id)}
                className="text-xs px-3 py-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors ml-auto"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <span className="loader" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-3xl text-negro">Planificador</h1>
            <p className="text-muted text-sm">Arrastra tus piezas al día que quieras</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="px-3 py-1.5 border border-borde rounded-lg text-sm text-muted hover:text-negro transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1.5 border border-borde rounded-lg text-sm text-naranja font-medium hover:bg-naranja/5 transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="px-3 py-1.5 border border-borde rounded-lg text-sm text-muted hover:text-negro transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Unassigned column */}
          <div
            className="w-48 flex-shrink-0"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, null)}
          >
            <div className="bg-card border border-borde rounded-card p-3 min-h-[400px]">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                Sin asignar ({unassignedItems.length})
              </h3>
              {unassignedItems.map((item) => (
                <PlannerCard key={item.id} item={item} />
              ))}
              {unassignedItems.length === 0 && (
                <p className="text-xs text-muted-light text-center py-8">
                  Las piezas sin fecha aparecen aquí
                </p>
              )}
            </div>
          </div>

          {/* Week columns */}
          <div className="flex-1 grid grid-cols-7 gap-2">
            {weekDates.map((date, i) => {
              const dateStr = formatDateISO(date);
              const dayItems = getItemsForDate(dateStr);
              const today = isToday(date);

              return (
                <div
                  key={dateStr}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, dateStr)}
                  className={`min-h-[400px] rounded-card border p-2 transition-colors ${
                    today
                      ? "border-naranja/40 bg-naranja/5"
                      : "border-borde bg-card"
                  }`}
                >
                  <div className="text-center mb-3">
                    <div className={`text-xs font-semibold ${today ? "text-naranja" : "text-muted"}`}>
                      {DAYS[i]}
                    </div>
                    <div className={`text-sm font-medium ${today ? "text-naranja" : "text-negro"}`}>
                      {formatDateShort(date)}
                    </div>
                  </div>

                  {dayItems.map((item) => (
                    <PlannerCard key={item.id} item={item} />
                  ))}

                  {dayItems.length === 0 && (
                    <div className="flex items-center justify-center h-20 border-2 border-dashed border-borde/50 rounded-lg">
                      <span className="text-[10px] text-muted-light">Arrastra aquí</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
