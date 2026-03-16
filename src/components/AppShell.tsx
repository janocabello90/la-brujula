"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/supabase/hooks";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAILS = ["janocabellom@gmail.com", "jano.cmg@gmail.com"];

interface AppShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function AppShell({ children, fullWidth = false }: AppShellProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
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

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/minority-report", label: "Mi Mapa", icon: "🗺️" },
    { href: "/ideas", label: "Ideas", icon: "💡" },
    { href: "/maestro", label: "Maestro", icon: "🎯" },
    { href: "/piezas", label: "Piezas", icon: "📝" },
    { href: "/planner", label: "Planificador", icon: "📅" },
    { href: "/settings", label: "Ajustes", icon: "⚙️" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: "👑" }] : []),
  ];

  return (
    <div className="min-h-screen bg-crema">
      {/* Top nav */}
      <nav className="border-b border-borde/70 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className={`${fullWidth ? "max-w-[1800px]" : "max-w-5xl"} mx-auto px-4 sm:px-6 flex items-center justify-between h-14`}>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="text-xl">🧭</span>
            <span className="font-heading text-lg text-negro hidden sm:inline">
              La Brújula
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? "bg-negro text-white font-medium"
                      : "text-muted hover:text-negro hover:bg-negro/[0.04]"
                  }`}
                >
                  {isActive ? item.label : `${item.icon} ${item.label}`}
                </Link>
              );
            })}
            <button
              onClick={signOut}
              className="ml-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted hover:text-danger hover:bg-danger/5 transition-all"
            >
              Salir
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col items-center justify-center w-9 h-9 rounded-lg hover:bg-negro/[0.04] transition-colors"
            aria-label="Menú"
          >
            <span className={`block w-5 h-0.5 bg-negro rounded-full transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
            <span className={`block w-5 h-0.5 bg-negro rounded-full transition-all duration-200 mt-1 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-negro rounded-full transition-all duration-200 mt-1 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-borde/50 bg-white/95 backdrop-blur-md">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive
                        ? "bg-negro text-white font-medium"
                        : "text-negro/70 hover:bg-negro/[0.04]"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={signOut}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-danger/70 hover:bg-danger/5 transition-all"
              >
                <span className="text-base">👋</span>
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Content */}
      <main className={`${fullWidth ? "max-w-[1800px]" : "max-w-5xl"} mx-auto px-4 sm:px-6 py-6 sm:py-8`}>
        {children}
      </main>
    </div>
  );
}
