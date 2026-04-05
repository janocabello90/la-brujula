"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/supabase/hooks";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAILS = ["janocabellom@gmail.com", "jano.cmg@gmail.com"];

// Material Symbols icon helper
const Icon = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined text-lg ${className}`}>{name}</span>
);

// Free tools — always accessible
const FREE_TOOLS = [
  { href: "/espejo", label: "El Espejo", icon: "self_improvement" },
  { href: "/entrevistador", label: "Entrevistador", icon: "mic" },
  { href: "/minority-report", label: "Mi Mapa", icon: "map" },
  { href: "/ideas", label: "Ideas", icon: "lightbulb" },
  { href: "/maestro", label: "Maestro", icon: "psychology" },
  { href: "/creador", label: "Creador", icon: "brush" },
  { href: "/piezas", label: "Piezas", icon: "edit_note" },
  { href: "/planner", label: "Planificador", icon: "calendar_month" },
];

interface AppShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  userPhase?: number;
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
  rutasCompleted = false,
}: AppShellProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lockedTooltip, setLockedTooltip] = useState<string | null>(null);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email && ADMIN_EMAILS.includes(user.email)) setIsAdmin(true);
    };
    checkAdmin();
  }, []);

  // ─── Helper: active state classes ────────────────
  const navActive = "text-[#244267] font-bold border-l-4 border-[#244267] bg-white/50";
  const navInactive = "text-on-surface/60 hover:text-[#244267] hover:bg-[#3d5a80]/5 transition-all duration-300";
  const navPhaseActive = "text-[#244267] font-bold border-l-4 border-[#ffce4b] bg-white/50";

  const isActive = (href: string, exact = true) =>
    exact ? pathname === href : pathname.startsWith(href);

  // ─── Locked item ─────────────────────────────────
  const renderLockedItem = (iconName: string, label: string, num: string, blockReason: string) => (
    <div
      className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-35 cursor-not-allowed"
      onMouseEnter={() => setLockedTooltip(blockReason)}
      onMouseLeave={() => setLockedTooltip(null)}
    >
      <Icon name={iconName} />
      {!sidebarCollapsed && (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm truncate">{label}</span>
          <span className="text-[10px] text-on-surface/30">{num}</span>
          <Icon name="lock" className="text-sm text-on-surface/20 ml-auto" />
        </div>
      )}
      {!sidebarCollapsed && lockedTooltip === blockReason && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 bg-inverse-surface text-inverse-on-surface text-xs rounded-xl px-3 py-1.5 whitespace-nowrap signature-shadow">
          {blockReason}
        </div>
      )}
    </div>
  );

  // ─── Phase progress bar ──────────────────────────
  const renderPhaseProgress = () => (
    <div className="mb-3 px-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((phase, i) => (
          <div key={phase} className="flex items-center flex-1">
            <div className={`w-full h-1.5 rounded-full transition-all ${
              userPhase >= phase ? "gradient-denim" : "bg-surface-container-high"
            }`} />
            {i < 3 && <div className="w-1" />}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[9px] text-outline font-medium">Fase {userPhase}/4</span>
        <span className="text-[9px] text-[#244267] font-semibold">{Math.round((userPhase / 4) * 100)}%</span>
      </div>
    </div>
  );

  // ─── Sidebar content ─────────────────────────────
  const sidebarContent = (
    <>
      {!sidebarCollapsed && renderPhaseProgress()}

      {/* Nav container — editorial rounded container */}
      <nav className="bg-surface-container-low p-1.5 rounded-xl space-y-0.5">
        {/* Panel / Inicio */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
            isActive("/dashboard") ? navActive : navInactive
          }`}
        >
          <Icon name="home" />
          {!sidebarCollapsed && <span className="text-sm tracking-tight">Inicio</span>}
        </Link>

        {/* Tu Recorrido header */}
        {!sidebarCollapsed && (
          <p className="text-[10px] font-bold text-[#244267]/40 uppercase tracking-[0.15em] px-3 pt-3 pb-1">
            Tu Recorrido
          </p>
        )}

        {/* Phase 1. La Pirámide */}
        <Link
          href="/piramide"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
            isActive("/piramide") ? navPhaseActive : navInactive
          }`}
        >
          <Icon name="change_history" />
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <span className="text-sm tracking-tight">La Pirámide</span>
              <span className="text-[10px] text-on-surface/40">1</span>
            </div>
          )}
        </Link>

        {/* Phase 2. El Árbol */}
        {piramideCompleted ? (
          <Link
            href="/arbol"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
              isActive("/arbol", false) ? navPhaseActive : navInactive
            }`}
          >
            <Icon name="park" />
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <span className="text-sm tracking-tight">El Árbol</span>
                <span className="text-[10px] text-on-surface/40">2</span>
              </div>
            )}
          </Link>
        ) : (
          renderLockedItem("park", "El Árbol", "2", "Completa La Pirámide primero")
        )}

        {/* Phase 3. Las Rutas */}
        {arbolCompleted ? (
          <Link
            href="/rutas"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
              isActive("/rutas") ? navPhaseActive : navInactive
            }`}
          >
            <Icon name="route" />
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <span className="text-sm tracking-tight">Las Rutas</span>
                <span className="text-[10px] text-on-surface/40">3</span>
              </div>
            )}
          </Link>
        ) : (
          renderLockedItem("route", "Las Rutas", "3", "Completa El Árbol primero")
        )}

        {/* Phase 4. La Brújula */}
        {rutasCompleted ? (
          <Link
            href="/onboarding"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
              isActive("/onboarding", false) ? navPhaseActive : navInactive
            }`}
          >
            <Icon name="explore" />
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <span className="text-sm tracking-tight">La Brújula</span>
                <span className="text-[10px] text-on-surface/40">4</span>
              </div>
            )}
          </Link>
        ) : (
          renderLockedItem("explore", "La Brújula", "4", "Completa Las Rutas primero")
        )}

        {/* Reto 15 días */}
        <Link
          href="/reto"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
            isActive("/reto") ? navPhaseActive : navInactive
          }`}
        >
          <Icon name="local_fire_department" />
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <span className="text-sm tracking-tight">Reto 15 Días</span>
              <span className="text-[9px] font-bold gradient-yellow text-[#1b1c1a] px-1.5 py-0.5 rounded-full leading-none">NUEVO</span>
            </div>
          )}
        </Link>
      </nav>

      {/* Herramientas header */}
      {!sidebarCollapsed && (
        <p className="text-[10px] font-bold text-[#244267]/40 uppercase tracking-[0.15em] px-3 mt-5 mb-2">
          Herramientas
        </p>
      )}

      {/* Free Tools */}
      <nav className="bg-surface-container-low p-1.5 rounded-xl space-y-0.5">
        {FREE_TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
              isActive(tool.href) ? navActive : navInactive
            }`}
          >
            <Icon name={tool.icon} />
            {!sidebarCollapsed && <span className="text-sm tracking-tight">{tool.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Comunidad */}
      <div className="mt-4">
        <a
          href="https://www.skool.com/una-buena-vida-comunidad-2471"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface/60 hover:text-[#244267] hover:bg-[#3d5a80]/5 transition-all duration-300"
        >
          <Icon name="groups" />
          {!sidebarCollapsed && <span className="text-sm font-medium tracking-tight">Comunidad</span>}
        </a>
      </div>
    </>
  );

  return (
    <div className={`min-h-screen bg-surface flex ${mobileOpen ? "overflow-hidden h-screen" : ""}`}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — Desktop: fixed, Mobile: slide-in */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-surface border-r-0 signature-shadow flex flex-col transition-all duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${sidebarCollapsed ? "lg:w-[68px]" : "lg:w-[250px]"} w-[270px]`}
      >
        {/* Header */}
        <div className={`py-5 flex items-center flex-shrink-0 ${sidebarCollapsed ? "px-0 justify-center" : "px-4 justify-between"}`}>
          <Link href="/dashboard" className={`flex items-center overflow-hidden min-w-0 ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
            <img
              src="/gorilla-logo.png"
              alt="Logo"
              className={`rounded-xl bg-primary-container object-cover flex-shrink-0 ${sidebarCollapsed ? "w-10 h-10" : "w-8 h-8"}`}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <span className={`rounded-xl gradient-denim flex items-center justify-center text-white font-bold hidden flex-shrink-0 ${sidebarCollapsed ? "w-10 h-10 text-base" : "w-8 h-8 text-sm"}`}>SBV</span>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-headline text-lg font-bold text-on-surface leading-tight truncate">
                  El Sistema
                </span>
                <span className="text-[10px] tracking-widest text-primary/60 font-medium">
                  Una Buena Vida
                </span>
              </div>
            )}
          </Link>
          {!sidebarCollapsed && (
            <button
              onClick={() => { setSidebarCollapsed(!sidebarCollapsed); setMobileOpen(false); }}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-outline hover:text-primary hover:bg-primary/5 transition-all flex-shrink-0"
              aria-label="Colapsar"
            >
              <Icon name="chevron_left" className="text-base" />
            </button>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-outline hover:text-on-surface transition-colors"
            aria-label="Cerrar"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Expand button when collapsed — below logo */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="hidden lg:flex items-center justify-center w-full py-1.5 text-outline hover:text-primary transition-all"
            aria-label="Expandir"
          >
            <Icon name="chevron_right" className="text-base" />
          </button>
        )}

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-2 px-3 font-body text-sm tracking-tight">
          {sidebarContent}
        </div>

        {/* Bottom: CTA + Settings + Sign out */}
        <div className="px-3 py-4 flex-shrink-0 space-y-2">
          {/* Ver Progreso CTA */}
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl gradient-yellow text-on-surface font-bold text-sm shadow-button hover:shadow-button-hover transition-all"
          >
            {!sidebarCollapsed && "Ver Progreso"}
            {sidebarCollapsed && <Icon name="trending_up" />}
          </Link>

          <div className="space-y-0.5 pt-1">
            <Link
              href="/settings"
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive("/settings") ? navActive : "text-outline hover:text-on-surface hover:bg-primary/5"
              }`}
            >
              <Icon name="settings" />
              {!sidebarCollapsed && <span>Ajustes</span>}
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive("/admin") ? navActive : "text-outline hover:text-on-surface hover:bg-primary/5"
                }`}
              >
                <Icon name="admin_panel_settings" />
                {!sidebarCollapsed && <span>Admin</span>}
              </Link>
            )}
            <button
              onClick={signOut}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-outline hover:text-error hover:bg-error/5 transition-all"
            >
              <Icon name="logout" />
              {!sidebarCollapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        sidebarCollapsed ? "lg:ml-[68px]" : "lg:ml-[250px]"
      }`}>
        {/* Mobile top bar — glassmorphism floating */}
        <header className="lg:hidden sticky top-0 z-30 glass signature-shadow h-14 flex items-center px-4 gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-primary/5 transition-colors"
            aria-label="Menú"
          >
            <Icon name="menu" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/gorilla-logo.png" alt="" className="w-6 h-6 rounded-lg bg-primary-container object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="font-headline text-base font-bold text-on-surface">Sistema Buena Vida</span>
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
