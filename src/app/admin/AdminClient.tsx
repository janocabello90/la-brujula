"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import type { AdminStats, AdminUser } from "./page";

interface Props {
  stats: AdminStats;
}

export default function AdminClient({ stats }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "active" | "suggestions">("recent");

  const filtered = stats.users
    .filter(
      (u) =>
        !search ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.displayName.toLowerCase().includes(search.toLowerCase()) ||
        u.temaRaiz.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "active") return (b.suggestionsCount + b.ideasCount) - (a.suggestionsCount + a.ideasCount);
      if (sortBy === "suggestions") return b.suggestionsCount - a.suggestionsCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <AppShell fullWidth>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-3xl text-negro mb-1">Admin Panel</h1>
          <p className="text-muted text-sm">Control de usuarios y métricas de La Brújula</p>
        </div>

        {/* Global stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          <BigStat label="Usuarios" value={stats.totalUsers} />
          <BigStat label="Activos" value={stats.activeUsers} sub={`${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%`} />
          <BigStat label="Ideas" value={stats.totalIdeas} />
          <BigStat label="Sugerencias" value={stats.totalSuggestions} />
          <BigStat label="Piezas guardadas" value={stats.totalPieces} />
          <BigStat label="Publicadas" value={stats.totalPublished} accent />
          <BigStat label="Coste API est." value={stats.estimatedCost} sub="~$0.008/sug" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por email, nombre o tema..."
            className="flex-1 px-4 py-2.5 border border-borde rounded-xl bg-white text-negro text-sm placeholder:text-muted-light focus:outline-none focus:border-naranja transition-colors"
          />
          <div className="flex gap-1.5">
            {(["recent", "active", "suggestions"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                  sortBy === s
                    ? "border-naranja bg-naranja/10 text-naranja font-medium"
                    : "border-borde text-muted hover:border-naranja"
                }`}
              >
                {s === "recent" ? "Recientes" : s === "active" ? "Más activos" : "Más sugerencias"}
              </button>
            ))}
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white rounded-2xl border border-borde/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-borde/60 bg-crema/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Usuario</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Tema</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Setup</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Ideas</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Sugerencias</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Piezas</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Publicadas</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Coste</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Última actividad</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <UserRow key={u.id} user={u} />
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-muted text-sm">
              No se encontraron usuarios
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function BigStat({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? "bg-naranja/10 border-naranja/30" : "bg-white border-borde/60"}`}>
      <div className={`font-heading text-xl sm:text-2xl ${accent ? "text-naranja" : "text-negro"}`}>
        {value}
      </div>
      <div className="text-[10px] sm:text-xs text-muted mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-muted/50 mt-0.5">{sub}</div>}
    </div>
  );
}

function UserRow({ user: u }: { user: AdminUser }) {
  // Setup completeness
  const setupSteps = [u.onboardingCompleted, u.hasApiKey, u.pillarCount >= 3, u.buyerCount > 0, u.hasInsight];
  const setupDone = setupSteps.filter(Boolean).length;
  const setupTotal = setupSteps.length;

  const costEstimate = `$${(u.suggestionsCount * 0.008).toFixed(2)}`;

  const timeAgo = u.lastSuggestionAt ? getTimeAgo(new Date(u.lastSuggestionAt)) : "—";

  return (
    <tr className="border-b border-borde/30 hover:bg-crema/30 transition-colors">
      {/* User */}
      <td className="px-4 py-3">
        <div className="font-medium text-negro">{u.displayName || u.email.split("@")[0]}</div>
        <div className="text-xs text-muted">{u.email}</div>
      </td>
      {/* Tema */}
      <td className="px-3 py-3">
        <div className="text-xs text-negro/70 max-w-[160px] truncate">{u.temaRaiz || "—"}</div>
      </td>
      {/* Setup */}
      <td className="px-3 py-3 text-center">
        <div className="inline-flex items-center gap-1">
          <div className="w-16 h-1.5 bg-borde/50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${setupDone === setupTotal ? "bg-success" : "bg-naranja"}`}
              style={{ width: `${(setupDone / setupTotal) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-muted">{setupDone}/{setupTotal}</span>
        </div>
      </td>
      {/* Ideas */}
      <td className="px-3 py-3 text-center text-negro">{u.ideasCount || "—"}</td>
      {/* Suggestions */}
      <td className="px-3 py-3 text-center font-medium text-negro">{u.suggestionsCount || "—"}</td>
      {/* Pieces */}
      <td className="px-3 py-3 text-center text-negro">{u.piecesCount || "—"}</td>
      {/* Published */}
      <td className="px-3 py-3 text-center">
        <span className={u.publishedCount > 0 ? "text-naranja font-semibold" : "text-muted"}>
          {u.publishedCount || "—"}
        </span>
      </td>
      {/* Cost */}
      <td className="px-3 py-3 text-center text-xs text-muted">{u.suggestionsCount > 0 ? costEstimate : "—"}</td>
      {/* Last activity */}
      <td className="px-3 py-3 text-xs text-muted">{timeAgo}</td>
    </tr>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "ahora";
  if (diffMins < 60) return `hace ${diffMins}min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)}sem`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
