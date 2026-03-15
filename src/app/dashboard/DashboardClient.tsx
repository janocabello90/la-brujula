"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";

export default function DashboardClient() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="font-heading text-3xl sm:text-4xl text-negro mb-1">Tu Brújula</h1>
          <p className="text-muted text-sm">Elige tu modo de trabajo</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Ideas */}
          <Link
            href="/ideas"
            className="group relative bg-white rounded-2xl border border-borde/60 p-6 hover:border-naranja/40 hover:shadow-card-hover transition-all block"
          >
            <div className="w-11 h-11 rounded-xl bg-naranja/10 flex items-center justify-center text-xl mb-4 group-hover:bg-naranja/15 transition-colors">💡</div>
            <h2 className="font-heading text-xl text-negro mb-1.5 group-hover:text-naranja transition-colors">
              Ideas
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-4">
              Tu cajón de ideas. Apunta lo que se te ocurra y la IA lo conecta con tu estrategia.
            </p>
            <span className="text-sm text-naranja font-semibold">
              Apuntar →
            </span>
          </Link>

          {/* Maestro */}
          <Link
            href="/maestro"
            className="group relative bg-white rounded-2xl border border-borde/60 p-6 hover:border-naranja/40 hover:shadow-card-hover transition-all block"
          >
            <div className="w-11 h-11 rounded-xl bg-naranja/10 flex items-center justify-center text-xl mb-4 group-hover:bg-naranja/15 transition-colors">🎯</div>
            <h2 className="font-heading text-xl text-negro mb-1.5 group-hover:text-naranja transition-colors">
              El Maestro
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-4">
              Tu director creativo con IA. Te da titulares, ganchos y pistas creativas para tu siguiente pieza.
            </p>
            <span className="text-sm text-naranja font-semibold">
              Activar →
            </span>
          </Link>

          {/* Planificador */}
          <Link
            href="/planner"
            className="group relative bg-white rounded-2xl border border-borde/60 p-6 hover:border-naranja/40 hover:shadow-card-hover transition-all block"
          >
            <div className="w-11 h-11 rounded-xl bg-naranja/10 flex items-center justify-center text-xl mb-4 group-hover:bg-naranja/15 transition-colors">📅</div>
            <h2 className="font-heading text-xl text-negro mb-1.5 group-hover:text-naranja transition-colors">
              Planificador
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-4">
              Organiza tu contenido por semana o mes. Kanban, calendario y lista. Sincroniza con Google Calendar.
            </p>
            <span className="text-sm text-naranja font-semibold">
              Planificar →
            </span>
          </Link>

          {/* Minority Report */}
          <Link
            href="/minority-report"
            className="group relative bg-white rounded-2xl border border-borde/60 p-6 hover:border-naranja/40 hover:shadow-card-hover transition-all block"
          >
            <div className="w-11 h-11 rounded-xl bg-naranja/10 flex items-center justify-center text-xl mb-4 group-hover:bg-naranja/15 transition-colors">🗺️</div>
            <h2 className="font-heading text-xl text-negro mb-1.5 group-hover:text-naranja transition-colors">
              Minority Report
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-4">
              Tu mapa estratégico completo. Pilares, audiencia, insight y árbol de contenidos en una vista.
            </p>
            <span className="text-sm text-naranja font-semibold">
              Ver mapa →
            </span>
          </Link>
        </div>

        {/* Quick actions */}
        <div className="mt-8 flex justify-center gap-6">
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
