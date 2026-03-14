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
    { href: "/maestro", label: "Maestro", icon: "🎯" },
    { href: "/planner", label: "Planificador", icon: "📅" },
    { href: "/settings", label: "Ajustes", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-crema">
      {/* Top nav */}
      <nav className="border-b border-borde bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className={`${fullWidth ? "max-w-[1800px]" : "max-w-5xl"} mx-auto px-4 sm:px-6 flex items-center justify-between h-14`}>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">🧭</span>
            <span className="font-heading text-lg font-semibold text-negro hidden sm:inline">
              La Brújula
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-naranja/10 text-naranja font-medium"
                    : "text-muted hover:text-negro"
                }`}
              >
                <span className="sm:hidden">{item.icon}</span>
                <span className="hidden sm:inline">{item.icon} {item.label}</span>
              </Link>
            ))}
            <button
              onClick={signOut}
              className="ml-2 px-3 py-1.5 rounded-lg text-sm text-muted hover:text-danger transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className={`${fullWidth ? "max-w-[1800px]" : "max-w-5xl"} mx-auto px-4 sm:px-6 py-6 sm:py-8`}>{children}</main>
    </div>
  );
}
