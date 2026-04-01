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
  const [brujulaOpen, setBrujulaOpen] = useState(false);
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

  // Check if a free tool is active
  const isFreeToolRoute = FREE_TOOLS.some((tool) => pathname === tool.href);
  const isOnboardingRoute = pathname === "/onboarding" || pathname.startsWith("/onboarding/");
  const isBrujulaRoute = isFreeToolRoute || isOnboardingRoute;

  // Helper: render locked item
  const renderLockedItem = (icon: string, label: string, blockReason: string) => (
    <div
      className="relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl opacity-40 cursor-not-allowed"
      onMouseEnter={() => setLockedTooltip(blockReason)}
      onMouseLeave={() => setLockedTooltip(null)}
    >
      <span className="text-lg flex-shrink-0">{icon}</span>
      {!sidebarCollapsed && (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm text-negro/30 truncate">{label}</span>
          <span className="text-sm flex-shrink-0">🔒</span>
        </div>
      )}
      {!sidebarCollapsed && lockedTooltip === blockReason && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 bg-negro text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          {blockReason}
        </div>
      )}
    </div>
  );

  // Helper: render phase progress indicator
  const renderPhaseProgress = () => (
    <div className="flex items-center justify-center gap-2 mb-4 px-2">
      <div className="flex items-center gap-1.5">
        {/* Phase 1 */}
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
          userPhase >= 1 ? "bg-naranja text-white" : "bg-borde/40 text-negro/40"
        }`}>
          1
        </div>
        <div className={`w-4 h-0.5 ${userPhase >= 2 ? "bg-naranja" : "bg-borde/40"}`} />

        {/* Phase 2 */}
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
          userPhase >= 2 ? "bg-naranja text-white" : "bg-borde/40 text-negro/40"
        }`}>
          2
        </div>
        <div className={`w-4 h-0.5 ${userPhase >= 3 ? "bg-naranja" : "bg-borde/40"}`} />

        {/* Phase 3 */}
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
          userPhase >= 3 ? "bg-naranja text-white" : "bg-borde/40 text-negro/40"
        }`}>
          3
        </div>
        <div className={`w-4 h-0.5 ${userPhase >= 4 ? "bg-naranja" : "bg-borde/40"}`} />

        {/* Phase 4 */}
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
          userPhase >= 4 ? "bg-naranja text-white" : "bg-borde/40 text-negro/40"
        }`}>
          4
        </div>
      </div>
    </div>
  );

  const sidebarContent = (
    <>
      {/* Phase progress indicator */}
      {!sidebarCollapsed && renderPhaseProgress()}

      {/* Panel — Top level */}
      <div className="mb-1">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all ${
            pathname === "/dashboard"
              ? "bg-negro text-white font-medium"
              : "text-negro/70 hover:bg-negro/[0.04]"
          }`}
        >
          <span className="text-lg flex-shrink-0">📊</span>
          {!sidebarCollapsed && <span className="text-sm">Panel</span>}
        </Link>
      </div>

      {/* Tu Recorrido section header */}
      {!sidebarCollapsed && (
        <p className="text-[10px] font-semibold text-muted/60 uppercase tracking-widest px-2 my-3 mb-2">
          Tu Recorrido
        </p>
      )}

      {/* Phase 1. La Pirámide — Always accessible */}
      <div className="mb-1">
        <Link
          href="/piramide"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all ${
            pathname === "/piramide"
              ? "bg-naranja/10 text-naranja font-semibold"
              : "text-negro/70 hover:bg-negro/[0.04]"
          }`}
        >
          <span className="text-lg flex-shrink-0">🔺</span>
          {!sidebarCollapsed && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm">La Pirámide</span>
              <span className={`text-[10px] italic ${pathname === "/piramide" ? "text-naranja/70" : "text-naranja"}`}>Fase 1</span>
            </div>
          )}
        </Link>
      </div>

      {/* Phase 2. El Árbol — Unlocks after Pirámide completed */}
      <div className="mb-1">
        {piramideCompleted ? (
          <Link
            href="/arbol"
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all ${
              pathname.startsWith("/arbol")
                ? "bg-naranja/10 text-naranja font-semibold"
                : "text-negro/70 hover:bg-negro/[0.04]"
            }`}
          >
            <span className="text-lg flex-shrink-0">🌳</span>
            {!sidebarCollapsed && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm">El Árbol</span>
                <span className={`text-[10px] italic ${pathname.startsWith("/arbol") ? "text-naranja/70" : "text-naranja"}`}>Fase 2</span>
              </div>
            )}
          </Link>
        ) : (
          renderLockedItem("🌳", "El Árbol", "Completa La Pirámide primero")
        )}
      </div>

      {/* Phase 3. Las Rutas — Unlocks after Árbol completed */}
      <div className="mb-1">
        {arbolCompleted ? (
          <Link
            href="/rutas"
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all ${
              pathname === "/rutas"
                ? "bg-naranja/10 text-naranja font-semibold"
                : "text-negro/70 hover:bg-negro/[0.04]"
            }`}
          >
            <span className="text-lg flex-shrink-0">🗺️</span>
            {!sidebarCollapsed && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm">Las Rutas</span>
                <span className={`text-[10px] italic ${pathname === "/rutas" ? "text-naranja/70" : "text-naranja"}`}>Fase 3</span>
              </div>
            )}
          </Link>
        ) : (
          renderLockedItem("🗺️", "Las Rutas", "Completa El Árbol primero")
        )}
      </div>

      {/* Phase 4. La Brújula — Unlocks after Rutas completed, links to /onboarding */}
      <div className="mb-3">
        {rutasCompleted ? (
          <Link
            href="/onboarding"
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all ${
              isOnboardingRoute
                ? "bg-naranja/10 text-naranja font-semibold"
                : "text-negro/70 hover:bg-negro/[0.04]"
            }`}
          >
            <span className="text-lg flex-shrink-0">🧭</span>
            {!sidebarCollapsed && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm">La Brújula</span>
                <span className={`text-[10px] italic ${isOnboardingRoute ? "text-naranja/70" : "text-naranja"}`}>Fase 4</span>
              </div>
            )}
          </Link>
        ) : (
          renderLockedItem("🧭", "La Brújula", "Completa Las Rutas primero")
        )}
      </div>

      {/* Herramientas section header */}
      {!sidebarCollapsed && (
        <p className="text-[10px] font-semibold text-muted/60 uppercase tracking-widest px-2 my-3 mb-2">
          Herramientas
        </p>
      )}

      {/* Free Tools — Always accessible */}
      {FREE_TOOLS.map((tool) => {
        const isActive = pathname === tool.href;
        return (
          <div key={tool.href} className="mb-1">
            <Link
              href={tool.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all ${
                isActive
                  ? "bg-negro text-white font-medium"
                  : "text-negro/70 hover:bg-negro/[0.04]"
              }`}
            >
              <span className="text-lg flex-shrink-0">{tool.icon}</span>
              {!sidebarCollapsed && <span className="text-sm">{tool.label}</span>}
            </Link>
          </div>
        );
      })}

      {/* Divider */}
      <div className="my-3 mx-2 h-px bg-borde/40" />

      {/* Comunidad */}
      <a
        href="https://www.skool.com/una-buena-vida-comunidad-2471"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-negro/60 hover:bg-negro/[0.04] transition-all"
      >
        <span className="text-lg flex-shrink-0">🦍</span>
        {!sidebarCollapsed && <span className="text-sm">La Comunidad</span>}
      </a>
    </>
  );

  return (
    <div className={`min-h-screen bg-crema flex ${mobileOpen ? "overflow-hidden h-screen" : ""}`}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-negro/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — Desktop: fixed, Mobile: slide-in */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-white border-r border-borde/60 flex flex-col transition-all duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${sidebarCollapsed ? "lg:w-[68px]" : "lg:w-[240px]"} w-[260px]`}
      >
        {/* Header */}
        <div className="px-3 h-14 flex items-center justify-between border-b border-borde/40 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden min-w-0">
            <span className="text-xl flex-shrink-0">🎓</span>
            {!sidebarCollapsed && (
              <span className="font-heading text-[15px] text-negro whitespace-nowrap truncate">
                El Sistema de Buena Vida
              </span>
            )}
          </Link>
          <button
            onClick={() => {
              setSidebarCollapsed(!sidebarCollapsed);
              setMobileOpen(false);
            }}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded text-muted hover:text-negro transition-colors flex-shrink-0"
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
        <div className="flex-1 overflow-y-auto py-3 px-2">
          {sidebarContent}
        </div>

        {/* Bottom: Settings, Admin, Sign out */}
        <div className="border-t border-borde/40 px-2 py-3 flex-shrink-0 space-y-0.5">
          <Link
            href="/settings"
            className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-sm transition-all ${
              pathname === "/settings"
                ? "bg-negro text-white font-medium"
                : "text-muted hover:text-negro hover:bg-negro/[0.04]"
            }`}
          >
            <span className="text-lg flex-shrink-0">⚙️</span>
            {!sidebarCollapsed && <span>Ajustes</span>}
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-sm transition-all ${
                pathname === "/admin"
                  ? "bg-negro text-white font-medium"
                  : "text-muted hover:text-negro hover:bg-negro/[0.04]"
              }`}
            >
              <span className="text-lg flex-shrink-0">👑</span>
              {!sidebarCollapsed && <span>Admin</span>}
            </Link>
          )}
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-sm text-muted hover:text-danger hover:bg-danger/5 transition-all"
          >
            <span className="text-lg flex-shrink-0">👋</span>
            {!sidebarCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        sidebarCollapsed ? "lg:ml-[68px]" : "lg:ml-[240px]"
      }`}>
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-borde/70 h-14 flex items-center px-4 gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center justify-center w-9 h-9 rounded-lg hover:bg-negro/[0.04] transition-colors"
            aria-label="Menú"
          >
            <span className="block w-5 h-0.5 bg-negro rounded-full" />
            <span className="block w-5 h-0.5 bg-negro rounded-full mt-1" />
            <span className="block w-5 h-0.5 bg-negro rounded-full mt-1" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-lg">🎓</span>
            <span className="font-heading text-base text-negro">El Sistema de Buena Vida</span>
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
