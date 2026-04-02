"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/supabase/hooks";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAILS = ["janocabellom@gmail.com", "jano.cmg@gmail.com"];

// Free tools — always accessible
const FREE_TOOLS = [
  { href: "/espejo", label: "El Espejo", icon: "🪞" },
  { href: "/entrevistador", label: "Entrevistador", icon: "🎙️" },
  { href: "/minority-report", label: "Mi Mapa", icon: "🗺️" },
  { href: "/ideas", label: "Ideas", icon: "💡" },
  { href: "/maestro", label: "Maestro", icon: "🎯" },
  { href: "/piezas", label: "Piezas", icon: "📝" },
  { href: "/planner", label: "Planificador", icon: "📅" },
];

interface AppShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  userPhase?: number; // 1-4
  piramideCompleted?: boolean;
  arbolCompleted?: boolean;
  rutasCompleted?: boolean;
}

export default function AppShell({
  children,
  fullWidth = false,
  userPhase = 1,
  piramideCompleted = false,
  arbolCompleted = false,
  rutasCompleted = false
}: AppShellProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lockedTooltip, setLockedTooltip] = useState<string | null>(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email && ADMIN_EMAILS.includes(user.email)) {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, []);

  // Helper: render locked item
  const renderLockedItem = (icon: string, label: string, blockReason: string) => (
    <div
      className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl opacity-35 cursor-not-allowed"
      onMouseEnter={() => setLockedTooltip(blockReason)}
      onMouseLeave={() => setLockedTooltip(null)}
    >
      <span className="text-base flex-shrink-0">{icon}</span>
      {!sidebarCollapsed && (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm text-negro/30 truncate">{label}</span>
          <svg className="w-3.5 h-3.5 text-negro/20 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )}
      {!sidebarCollapsed && lockedTooltip === blockReason && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 bg-negro text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg">
          {blockReason}
        </div>
      )}
    </div>
  );

  // Helper: render phase progress indicator
  const renderPhaseProgress = () => {
    const phases = [1, 2, 3, 4];
    return (
      <div className="mb-3 px-3">
        <div className="flex items-center gap-1">
          {phases.map((phase, i) => (
            <div key={phase} className="flex items-center flex-1">
              <div className={`w-full h-1.5 rounded-full transition-all ${
                userPhase >= phase ? "bg-denim" : "bg-borde/50"
              }`} />
              {i < phases.length - 1 && <div className="w-1" />}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[9px] text-muted-light font-medium">Fase {userPhase}/4</span>
          <span className="text-[9px] text-denim font-semibold">{Math.round((userPhase / 4) * 100)}%</span>
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <>
      {/* Phase progress indicator */}
      {!sidebarCollapsed && renderPhaseProgress()}

      {/* Panel — Top level */}
      <div className="mb-0.5">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
            pathname === "/dashboard"
              ? "bg-denim text-white font-medium shadow-button"
              : "text-negro/70 hover:bg-denim/[0.06]"
          }`}
        >
          <span className="text-base flex-shrink-0">📊</span>
          {!sidebarCollapsed && <span className="text-sm">Panel</span>}
        </Link>
      </div>

      {/* Tu Recorrido section header */}
      {!sidebarCollapsed && (
        <p className="text-[10px] font-bold text-denim/40 uppercase tracking-[0.12em] px-3 mt-5 mb-2">
          Tu Recorrido
        </p>
      )}

      {/* Phase 1. La Pirámide — Always accessible */}
      <div className="mb-0.5">
        <Link
          href="/piramide"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
            pathname === "/piramide"
              ? "bg-amarillo/20 text-negro font-semibold border border-amarillo/30"
              : "text-negro/70 hover:bg-denim/[0.06]"
          }`}
        >
          <span className="text-base flex-shrink-0">🔺</span>
          {!sidebarCollapsed && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm">La Pirámide</span>
              <span className={`text-[10px] font-medium ${pathname === "/piramide" ? "text-denim" : "text-denim/60"}`}>1</span>
            </div>
          )}
        </Link>
      </div>

      {/* Phase 2. El Árbol — Unlocks after Pirámide completed */}
      <div className="mb-0.5">
        {piramideCompleted ? (
          <Link
            href="/arbol"
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
              pathname.startsWith("/arbol")
                ? "bg-amarillo/20 text-negro font-semibold border border-amarillo/30"
                : "text-negro/70 hover:bg-denim/[0.06]"
            }`}
          >
            <span className="text-base flex-shrink-0">🌳</span>
            {!sidebarCollapsed && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm">El Árbol</span>
                <span className={`text-[10px] font-medium ${pathname.startsWith("/arbol") ? "text-denim" : "text-denim/60"}`}>2</span>
              </div>
            )}
          </Link>
        ) : (
          renderLockedItem("🌳", "El Árbol", "Completa La Pirámide primero")
        )}
      </div>

      {/* Phase 3. Las Rutas — Unlocks after Árbol completed */}
      <div className="mb-0.5">
        {arbolCompleted ? (
          <Link
            href="/rutas"
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
              pathname === "/rutas"
                ? "bg-amarillo/20 text-negro font-semibold border border-amarillo/30"
                : "text-negro/70 hover:bg-denim/[0.06]"
            }`}
          >
            <span className="text-base flex-shrink-0">🗺️</span>
            {!sidebarCollapsed && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm">Las Rutas</span>
                <span className={`text-[10px] font-medium ${pathname === "/rutas" ? "text-denim" : "text-denim/60"}`}>3</span>
              </div>
            )}
          </Link>
        ) : (
          renderLockedItem("🗺️", "Las Rutas", "Completa El Árbol primero")
        )}
      </div>

      {/* Phase 4. La Brújula — Unlocks after Rutas completed */}
      <div className="mb-2">
        {rutasCompleted ? (
          <Link
            href="/onboarding"
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
              pathname === "/onboarding" || pathname.startsWith("/onboarding/")
                ? "bg-amarillo/20 text-negro font-semibold border border-amarillo/30"
                : "text-negro/70 hover:bg-denim/[0.06]"
            }`}
          >
            <span className="text-base flex-shrink-0">🧭</span>
            {!sidebarCollapsed && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm">La Brújula</span>
                <span className={`text-[10px] font-medium ${pathname === "/onboarding" ? "text-denim" : "text-denim/60"}`}>4</span>
              </div>
            )}
          </Link>
        ) : (
          renderLockedItem("🧭", "La Brújula", "Completa Las Rutas primero")
        )}
      </div>

      {/* Herramientas section header */}
      {!sidebarCollapsed && (
        <p className="text-[10px] font-bold text-denim/40 uppercase tracking-[0.12em] px-3 mt-4 mb-2">
          Herramientas
        </p>
      )}

      {/* Free Tools — Always accessible */}
      {FREE_TOOLS.map((tool) => {
        const isActive = pathname === tool.href;
        return (
          <div key={tool.href} className="mb-0.5">
            <Link
              href={tool.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? "bg-denim text-white font-medium shadow-button"
                  : "text-negro/70 hover:bg-denim/[0.06]"
              }`}
            >
              <span className="text-base flex-shrink-0">{tool.icon}</span>
              {!sidebarCollapsed && <span className="text-sm">{tool.label}</span>}
            </Link>
          </div>
        );
      })}

      {/* Divider */}
      <div className="my-4 mx-3 h-px bg-borde/50" />

      {/* Comunidad */}
      <a
        href="https://www.skool.com/una-buena-vida-comunidad-2471"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-negro/60 hover:bg-amarillo/10 hover:text-negro transition-all"
      >
        <span className="text-base flex-shrink-0">🦍</span>
        {!sidebarCollapsed && <span className="text-sm font-medium">La Comunidad</span>}
      </a>
    </>
  );

  return (
    <div className={`min-h-screen bg-crema flex ${mobileOpen ? "overflow-hidden h-screen" : ""}`}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-negro/25 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — Desktop: fixed, Mobile: slide-in */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-white border-r border-borde/40 flex flex-col transition-all duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${sidebarCollapsed ? "lg:w-[68px]" : "lg:w-[250px]"} w-[270px]`}
      >
        {/* Header */}
        <div className="px-4 h-16 flex items-center justify-between border-b border-borde/30 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden min-w-0">
            <span className="text-xl flex-shrink-0">🦍</span>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-heading text-[14px] text-negro leading-tight truncate">
                  Sistema Buena Vida
                </span>
                <span className="text-[10px] text-denim font-medium">by Jano Cabello</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => {
              setSidebarCollapsed(!sidebarCollapsed);
              setMobileOpen(false);
            }}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-muted hover:text-denim hover:bg-denim/[0.06] transition-all flex-shrink-0"
            aria-label={sidebarCollapsed ? "Expandir" : "Colapsar"}
          >
            <svg className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-negro transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-4 px-2.5">
          {sidebarContent}
        </div>

        {/* Bottom: Settings, Admin, Sign out */}
        <div className="border-t border-borde/30 px-2.5 py-3 flex-shrink-0 space-y-0.5">
          <Link
            href="/settings"
            className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm transition-all ${
              pathname === "/settings"
                ? "bg-denim text-white font-medium"
                : "text-muted hover:text-negro hover:bg-denim/[0.06]"
            }`}
          >
            <span className="text-base flex-shrink-0">⚙️</span>
            {!sidebarCollapsed && <span>Ajustes</span>}
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm transition-all ${
                pathname === "/admin"
                  ? "bg-denim text-white font-medium"
                  : "text-muted hover:text-negro hover:bg-denim/[0.06]"
              }`}
            >
              <span className="text-base flex-shrink-0">👑</span>
              {!sidebarCollapsed && <span>Admin</span>}
            </Link>
          )}
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-muted hover:text-danger hover:bg-danger/5 transition-all"
          >
            <span className="text-base flex-shrink-0">👋</span>
            {!sidebarCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        sidebarCollapsed ? "lg:ml-[68px]" : "lg:ml-[250px]"
      }`}>
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-borde/40 h-14 flex items-center px-4 gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center justify-center w-9 h-9 rounded-lg hover:bg-denim/[0.06] transition-colors"
            aria-label="Menú"
          >
            <span className="block w-5 h-0.5 bg-negro rounded-full" />
            <span className="block w-5 h-0.5 bg-negro rounded-full mt-1" />
            <span className="block w-5 h-0.5 bg-negro rounded-full mt-1" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-lg">🦍</span>
            <span className="font-heading text-base text-negro">Sistema Buena Vida</span>
          </Link>
        </header>

        {/* Page content */}
        <main className={`flex-1 w-full ${fullWidth ? "max-w-[1800px]" : "max-w-5xl"} mx-auto px-3 sm:px-6 py-4 sm:py-8`}>
          {children}
        </main>
      </div>
    </div>
  );
}
