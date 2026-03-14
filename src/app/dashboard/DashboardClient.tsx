"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";

export default function DashboardClient() {
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl text-negro mb-2">Tu Brújula</h1>
          <p className="text-muted">Elige tu modo de trabajo</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Minority Report */}
          <Link
            href="/minority-report"
            className="bg-card rounded-card shadow-card p-8 hover:shadow-lg transition-shadow group block"
          >
            <div className="text-4xl mb-4">🗺️</div>
            <h2 className="font-heading text-2xl text-negro mb-2 group-hover:text-naranja transition-colors">
              Minority Report
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Tu mapa estratégico completo. Pilares, subtemas, ángulos, buyer
              persona, insight... Todo lo que necesitas ver antes de crear.
            </p>
            <div className="mt-4 text-sm text-naranja font-medium">
              Ver mi mapa →
            </div>
          </Link>

          {/* Maestro */}
          <Link
            href="/maestro"
            className="bg-card rounded-card shadow-card p-8 hover:shadow-lg transition-shadow group block"
          >
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="font-heading text-2xl text-negro mb-2 group-hover:text-naranja transition-colors">
              El Maestro
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Dile cómo estás, qué quieres lograr y en qué canal. La IA analiza
              tu perfil completo y te sugiere la pieza perfecta.
            </p>
            <div className="mt-4 text-sm text-naranja font-medium">
              Activar el Maestro →
            </div>
          </Link>
        </div>

        {/* Quick actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/onboarding"
            className="text-sm text-muted hover:text-naranja transition-colors"
          >
            ✏️ Editar mis datos
          </Link>
          <Link
            href="/settings"
            className="text-sm text-muted hover:text-naranja transition-colors"
          >
            ⚙️ Configuración
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
