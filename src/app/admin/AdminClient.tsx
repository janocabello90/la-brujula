"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import type { AdminStats, AdminUser } from "./page";

interface Props {
  stats: AdminStats;
}

function getRolePill(role: string) {
  const pillClasses: Record<string, string> = {
    admin: "pill-denim",
    vip: "pill-accent",
    premium: "gradient-denim",
    free: "pill-light",
  };
  return pillClasses[role] || "pill-light";
}

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    admin: "Admin",
    vip: "VIP",
    premium: "Premium",
    free: "Free",
  };
  return labels[role] || "Free";
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

function isExpiringsoon(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  const today = new Date();
  const expDate = new Date(expiresAt);
  const daysUntil = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntil <= 7 && daysUntil > 0;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-ES");
}

function exportCSV(users: AdminUser[], stats: AdminStats) {
  const header = [
    "Nombre", "Email", "Tema raíz", "Rol", "Estado", "Vencimiento", "Notas", "Onboarding", "API Key",
    "Pilares", "Buyers", "Insight", "Ideas", "Sugerencias",
    "Piezas", "Planificadas", "Publicadas", "Coste est.", "Última actividad", "Registro"
  ];

  const rows = users.map((u) => {
    const setupSteps = [u.onboardingCompleted, u.hasApiKey, u.pillarCount >= 3, u.buyerCount > 0, u.hasInsight];
    const setupDone = setupSteps.filter(Boolean).length;
    return [
      u.displayName || u.email.split("@")[0],
      u.email,
      u.temaRaiz || "",
      getRoleLabel(u.role),
      u.isActive ? "Activo" : "Inactivo",
      formatDate(u.expiresAt),
      u.notes || "",
      `${setupDone}/5`,
      u.hasApiKey ? "Sí" : "No",
      u.pillarCount,
      u.buyerCount,
      u.hasInsight ? "Sí" : "No",
      u.ideasCount,
      u.suggestionsCount,
      u.piecesCount,
      u.plannedCount,
      u.publishedCount,
      `$${(u.suggestionsCount * 0.008).toFixed(2)}`,
      u.lastSuggestionAt ? new Date(u.lastSuggestionAt).toLocaleDateString("es-ES") : "—",
      u.createdAt ? new Date(u.createdAt).toLocaleDateString("es-ES") : "—",
    ];
  });

  // Summary row
  rows.push([]);
  rows.push(["TOTALES", "", "", "", "", "", "",
    "", "",
    "", "", "",
    stats.totalIdeas, stats.totalSuggestions,
    stats.totalPieces, "", stats.totalPublished,
    stats.estimatedCost, "", ""
  ]);

  const escapeCSV = (v: unknown) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const csv = [header, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `brujula-admin-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminClient({ stats }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "active" | "suggestions">("recent");
  const [roleFilter, setRoleFilter] = useState<"all" | "free" | "premium" | "vip" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "expired">("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const filtered = stats.users
    .filter((u) => {
      // Search filter
      if (search && !u.email.toLowerCase().includes(search.toLowerCase()) &&
          !u.displayName.toLowerCase().includes(search.toLowerCase()) &&
          !u.temaRaiz.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // Role filter
      if (roleFilter !== "all" && u.role !== roleFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "active" && !u.isActive) return false;
        if (statusFilter === "inactive" && u.isActive) return false;
        if (statusFilter === "expired" && !isExpired(u.expiresAt)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "active") return (b.suggestionsCount + b.ideasCount) - (a.suggestionsCount + a.ideasCount);
      if (sortBy === "suggestions") return b.suggestionsCount - a.suggestionsCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleBulkToggleActive = async () => {
    if (selectedUsers.size === 0) return;

    // Get the first selected user to determine the new state (toggle)
    const firstUserId = Array.from(selectedUsers)[0];
    const firstUser = stats.users.find(u => u.id === firstUserId);
    if (!firstUser) return;

    const newActive = !firstUser.isActive;

    for (const userId of Array.from(selectedUsers)) {
      try {
        await fetch("/api/admin/update-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, isActive: newActive }),
        });
      } catch (error) {
        console.error("Error updating user", userId, error);
      }
    }

    // Clear selection and reload
    setSelectedUsers(new Set());
    window.location.reload();
  };

  const allSelected = filtered.length > 0 && selectedUsers.size === filtered.length;
  const _someSelected = selectedUsers.size > 0 && !allSelected;

  return (
    <AppShell fullWidth>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-headline text-3xl text-on-surface mb-1">Admin Panel</h1>
            <p className="text-on-surface-variant text-sm">Control de usuarios y métricas de La Brújula</p>
          </div>
          <Link
            href="/admin/alumnos"
            className="bg-primary-container text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-container-hover transition-colors flex-shrink-0"
          >
            📋 Ver ejercicios de alumnos
          </Link>
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
        <div className="space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por email, nombre o tema..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
            />
            <div className="flex gap-1.5">
              {(["recent", "active", "suggestions"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`text-xs px-3 py-2 rounded-lg transition-colors ${
                    sortBy === s
                      ? "bg-primary-container text-primary font-medium"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-primary-container/30"
                  }`}
                >
                  {s === "recent" ? "Recientes" : s === "active" ? "Más activos" : "Más sugerencias"}
                </button>
              ))}
              <button
                onClick={() => exportCSV(filtered, stats)}
                className="text-xs px-3 py-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-primary-container/30 transition-colors"
              >
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Role and Status filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
            >
              <option value="all">Todos los roles</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="expired">Expirados</option>
            </select>

            {selectedUsers.size > 0 && (
              <button
                onClick={handleBulkToggleActive}
                className="px-4 py-2.5 rounded-xl bg-primary-container text-primary text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Cambiar estado ({selectedUsers.size})
              </button>
            )}
          </div>
        </div>

        {/* Users table */}
        <div className="surface-card signature-shadow rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline/20 bg-surface-container-low">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(new Set(filtered.map(u => u.id)));
                        } else {
                          setSelectedUsers(new Set());
                        }
                      }}
                      className="w-4 h-4 rounded"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Usuario</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Rol</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Estado</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Tema</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Setup</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Sugerencias</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Coste</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Última actividad</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    isSelected={selectedUsers.has(u.id)}
                    onSelectChange={(selected) => {
                      const newSelected = new Set(selectedUsers);
                      if (selected) {
                        newSelected.add(u.id);
                      } else {
                        newSelected.delete(u.id);
                      }
                      setSelectedUsers(newSelected);
                    }}
                    isExpanded={expandedUserId === u.id}
                    onToggleExpand={() => {
                      setExpandedUserId(expandedUserId === u.id ? null : u.id);
                    }}
                    onUserUpdated={() => {
                      setExpandedUserId(null);
                      window.location.reload();
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-on-surface-variant text-sm">
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
    <div className={`rounded-xl border p-4 ${accent ? "bg-primary-container/10 border-naranja/30" : "bg-white border-outline-variant/60"}`}>
      <div className={`font-headline text-xl sm:text-2xl ${accent ? "text-primary" : "text-on-surface"}`}>
        {value}
      </div>
      <div className="text-[10px] sm:text-xs text-on-surface-variant mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-on-surface-variant/50 mt-0.5">{sub}</div>}
    </div>
  );
}

function UserRow({
  user: u,
  isSelected,
  onSelectChange,
  isExpanded,
  onToggleExpand,
  onUserUpdated,
}: {
  user: AdminUser;
  isSelected: boolean;
  onSelectChange: (selected: boolean) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUserUpdated: () => void;
}) {
  // Setup completeness
  const setupSteps = [u.onboardingCompleted, u.hasApiKey, u.pillarCount >= 3, u.buyerCount > 0, u.hasInsight];
  const setupDone = setupSteps.filter(Boolean).length;
  const setupTotal = setupSteps.length;

  const costEstimate = `$${(u.suggestionsCount * 0.008).toFixed(2)}`;
  const timeAgo = u.lastSuggestionAt ? getTimeAgo(new Date(u.lastSuggestionAt)) : "—";

  return (
    <>
      <tr className="border-b border-outline/20 hover:bg-surface-container-low/50 transition-colors">
        {/* Checkbox */}
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelectChange(e.target.checked)}
            className="w-4 h-4 rounded"
          />
        </td>
        {/* User */}
        <td className="px-4 py-3">
          <div className="font-medium text-on-surface">{u.displayName || u.email.split("@")[0]}</div>
          <div className="text-xs text-on-surface-variant">{u.email}</div>
        </td>
        {/* Role pill */}
        <td className="px-3 py-3">
          <span className={`pill text-xs font-medium ${getRolePill(u.role)}`}>
            {getRoleLabel(u.role)}
          </span>
        </td>
        {/* Status indicator */}
        <td className="px-3 py-3">
          <div className="flex items-center gap-2 justify-center">
            <div className={`w-2 h-2 rounded-full ${u.isActive ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-xs text-on-surface">{u.isActive ? "Activo" : "Inactivo"}</span>
          </div>
        </td>
        {/* Tema */}
        <td className="px-3 py-3">
          <div className="text-xs text-on-surface/70 max-w-[140px] truncate">{u.temaRaiz || "—"}</div>
        </td>
        {/* Setup */}
        <td className="px-3 py-3 text-center">
          <div className="inline-flex items-center gap-1">
            <div className="w-12 h-1.5 bg-outline/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${setupDone === setupTotal ? "bg-success" : "bg-primary-container"}`}
                style={{ width: `${(setupDone / setupTotal) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-on-surface-variant">{setupDone}/{setupTotal}</span>
          </div>
        </td>
        {/* Suggestions */}
        <td className="px-3 py-3 text-center font-medium text-on-surface">{u.suggestionsCount || "—"}</td>
        {/* Cost */}
        <td className="px-3 py-3 text-center text-xs text-on-surface-variant">{u.suggestionsCount > 0 ? costEstimate : "—"}</td>
        {/* Last activity */}
        <td className="px-3 py-3 text-xs text-on-surface-variant">{timeAgo}</td>
        {/* Actions */}
        <td className="px-3 py-3 text-center">
          <button
            onClick={onToggleExpand}
            className="text-xs px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-primary-container/30 transition-colors"
          >
            <span className="material-symbols-outlined text-sm align-middle">
              {isExpanded ? "expand_less" : "expand_more"}
            </span>
          </button>
        </td>
      </tr>

      {/* Expanded panel */}
      {isExpanded && (
        <tr>
          <td colSpan={10} className="px-4 py-4 bg-surface-container-low/50">
            <UserManagementPanel user={u} onUserUpdated={onUserUpdated} />
          </td>
        </tr>
      )}
    </>
  );
}

function UserManagementPanel({ user: u, onUserUpdated }: { user: AdminUser; onUserUpdated: () => void }) {
  const [role, setRole] = useState(u.role);
  const [isActive, setIsActive] = useState(u.isActive);
  const [expiresAt, setExpiresAt] = useState(u.expiresAt || "");
  const [notes, setNotes] = useState(u.notes);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sent" | "error">("idle");

  const hasChanges = role !== u.role || isActive !== u.isActive || expiresAt !== (u.expiresAt || "") || notes !== u.notes;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: u.id,
          role,
          isActive,
          expiresAt: expiresAt || null,
          notes,
        }),
      });
      if (res.ok) {
        onUserUpdated();
      }
    } catch (error) {
      console.error("Error saving user", error);
    } finally {
      setSaving(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendStatus("idle");
    try {
      const res = await fetch("/api/admin/resend-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: u.email }),
      });
      if (res.ok) {
        setResendStatus("sent");
        setTimeout(() => setResendStatus("idle"), 3000);
      } else {
        setResendStatus("error");
        setTimeout(() => setResendStatus("idle"), 3000);
      }
    } catch {
      setResendStatus("error");
      setTimeout(() => setResendStatus("idle"), 3000);
    }
    setResending(false);
  };

  return (
    <div className="surface-card signature-shadow rounded-2xl p-6 max-w-2xl">
      <h3 className="font-headline text-lg text-on-surface mb-4">Gestionar usuario</h3>

      <div className="space-y-4">
        {/* Role selector */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="free">Free</option>
            <option value="premium">Premium</option>
            <option value="vip">VIP</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Active toggle */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Estado</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isActive ? "bg-success" : "bg-outline/30"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-on-surface-variant">{isActive ? "Activo" : "Inactivo"}</span>
          </div>
        </div>

        {/* Expiration date */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Fecha de vencimiento</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {expiresAt && (
              <button
                onClick={() => setExpiresAt("")}
                className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface-variant text-sm hover:bg-outline/20 transition-colors"
              >
                Sin límite
              </button>
            )}
          </div>
          {expiresAt && isExpired(expiresAt) && (
            <p className="text-xs text-red-500 mt-1">Expirado</p>
          )}
          {expiresAt && isExpiringsoon(expiresAt) && (
            <p className="text-xs text-yellow-600 mt-1">Vence pronto</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas internas..."
            className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-outline/20">
          <button
            onClick={handleResend}
            disabled={resending || resendStatus === "sent"}
            className={`text-sm px-4 py-2 rounded-lg transition-colors ${
              resendStatus === "sent"
                ? "bg-green-50 text-green-600"
                : resendStatus === "error"
                ? "bg-red-50 text-red-600"
                : "bg-surface-container-low text-on-surface-variant hover:bg-primary-container/30"
            }`}
          >
            {resending ? "..." : resendStatus === "sent" ? "Enviado" : resendStatus === "error" ? "Error" : "Reenviar acceso"}
          </button>

          <div className="flex-1" />

          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`text-sm px-6 py-2 rounded-lg font-medium transition-colors ${
              hasChanges
                ? "gradient-denim text-white hover:opacity-90"
                : "bg-surface-container-low text-on-surface-variant cursor-not-allowed opacity-50"
            }`}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
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
