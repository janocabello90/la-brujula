"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/supabase/hooks";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAILS = ["janocabellom@gmail.com", "jano.cmg@gmail.com"];

const BRUJULA_SECTIONS = [
  { href: "/minority-report", label: "Mi Mapa", icon: "🗺️" },
  { href: "/ideas", label: "Ideas", icon: "💡" },
  { href: "/maestro", label: "Maestro", icon: "🎯" },
  { href: "/piezas", label: "Piezas", icon: "📝" },
  { href: "/planner", label: "Planificador", icon: "📅" },
];

interface AppShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function AppShell({ children, fullWidth = false }: AppShellProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [brujulaOpen, setBrujulaOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    // Auto-expand brújula when navigating to one of its pages
    if (["/minority-report", "/ideas", "/maestro", "/piezas", "/planner", "/onboarding"].some((p) => pathname.startsWith(p))) {
      setBrujulaOpen(true);
    }
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

  const isBrujulaRoute = ["/minority-report", "/ideas", "/maestro", "/piezas", "/planner", "/onboarding"].some(
    (p) => pathname.startsWith(p)
  );
  const isBrujulaExpanded = isBrujulaRoute || brujulaOpen;

  const sidebarContent = (
    <>
      {/* Panel — Top level */}
      <div className="mb-3">
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

      {/* Tools label */}
      {!sidebarCollapsed && (
        <p className="text-[10px] font-semibold text-muted/60 uppercase tracking-widest px-2 mb-2">
          Herramientas
        </p>
      )}

      {/* La Brújula — Expandable */}
      <div className="mb-1">
        <button
          onClick={() => setBrujulaOpen(!brujulaOpen)}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all w-full text-left ${
            isBrujulaRoute
              ? "bg-naranja/10 text-naranja font-semibold"
              : "text-negro/70 hover:bg-negro/[0.04]"
          }`}
        >
          <span className="text-lg flex-shrink-0">🧭</span>
          {!sidebarCollapsed && (
            <>
              <span className="text-sm flex-1">La Brújula</span>
              <svg className={`w-3.5 h-3.5 transition-transform ${isBrujulaExpanded ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        {/* Sub-sections when Brújula is expanded */}
        {isBrujulaExpanded && !sidebarCollapsed && (
          <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-naranja/20 pl-3">
            {BRUJULA_SECTIONS.map((s) => {
              const isActive = pathname === s.href;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] transition-all ${
                    isActive
                      ? "bg-negro text-white font-medium"
                      : "text-negro/60 hover:text-negro hover:bg-negro/[0.03]"
                  }`}
                >
                  <span className="text-xs">{s.icon}</span>
                  {s.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Collapsed: sub-icons */}
        {isBrujulaExpanded && sidebarCollapsed && (
          <div className="mt-1 space-y-0.5 flex flex-col items-center">
            {BRUJULA_SECTIONS.map((s) => {
              const isActive = pathname === s.href;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-all ${
                    isActive ? "bg-negro text-white" : "text-negro/50 hover:bg-negro/[0.04]"
                  }`}
                  title={s.label}
                >
                  {s.icon}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* La Pirámide — Próximamente */}
      <div className="mb-1 opacity-40 cursor-default">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl">
          <span className="text-lg flex-shrink-0">🔺</span>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <span className="text-sm text-negro/70 block">La Pirámide</span>
              <span className="text-[10px] text-muted block">Próximamente</span>
            </div>
          )}
        </div>
      </div>

      {/* El Árbol — Active */}
      <div className="mb-1">
        <Link
          href="/arbol"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all ${
            pathname.startsWith("/arbol")
              ? "bg-naranja/10 text-naranja font-semibold"
              : "text-negro/70 hover:bg-negro/[0.04]"
          }`}
        >
          <span className="text-lg flex-shrink-0">🌳</span>
          {!sidebarCollapsed && <span className="text-sm">El Árbol</span>}
        </Link>
      </div>

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
    <div className="min-h-screen bg-crema flex">
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
                Escuela de Buena Vida
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
            <span className="font-heading text-base text-negro">Escuela de Buena Vida</span>
          </Link>
        </header>

        {/* Page content */}
        <main className={`flex-1 w-full ${fullWidth ? "max-w-[1800px]" : "max-w-5xl"} mx-auto px-4 sm:px-6 py-6 sm:py-8`}>
          {children}
        </main>
      </div>
    </div>
  );
}
