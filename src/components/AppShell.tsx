"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/supabase/hooks";

interface AppShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function AppShell({ children, fullWidth = false }: AppShellProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/minority-report", label: "Mi Mapa", icon: "🗺️" },
    { href: "/ideas", label: "Ideas", icon: "💡" },
    { href: "/maestro", label: "Maestro", icon: "🎯" },
    { href: "/piezas", label: "Piezas", icon: "📝" },
    { href: "/planner", label: "Planificador", icon: "📅" },
    { href: "/settings", label: "Ajustes", icon: "⚙️" },
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

          <div className="flex items-center gap-0.5">
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
                  <span className="sm:hidden">{item.icon}</span>
                  <span className="hidden sm:inline">{isActive ? item.label : `${item.icon} ${item.label}`}</span>
                </Link>
              );
            })}
            <button
              onClick={signOut}
              className="ml-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted hover:text-danger hover:bg-danger/5 transition-all"
            >
              <span className="sm:hidden">👋</span>
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className={`${fullWidth ? "max-w-[1800px]" : "max-w-5xl"} mx-auto px-4 sm:px-6 py-6 sm:py-8`}>
        {children}
      </main>
    </div>
  );
}
