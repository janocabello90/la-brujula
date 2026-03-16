"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";

const sections = [
  {
    href: "/ideas",
    icon: "💡",
    title: "Ideas",
    desc: "Apunta lo que se te ocurra. La IA lo conecta con tu estrategia.",
    cta: "Apuntar idea",
    accent: "naranja",
  },
  {
    href: "/maestro",
    icon: "🎯",
    title: "El Maestro",
    desc: "Tu director creativo con IA. Titulares, ganchos y pistas para tu siguiente pieza.",
    cta: "Activar",
    accent: "naranja",
  },
  {
    href: "/piezas",
    icon: "📝",
    title: "Mis Piezas",
    desc: "Tu banco de piezas guardadas. Edita, planifica o recupera ideas del Maestro.",
    cta: "Ver piezas",
    accent: "naranja",
  },
  {
    href: "/planner",
    icon: "📅",
    title: "Planificador",
    desc: "Organiza tu contenido por semana o mes. Kanban, calendario y lista.",
    cta: "Planificar",
    accent: "naranja",
  },
  {
    href: "/minority-report",
    icon: "🗺️",
    title: "Minority Report",
    desc: "Tu mapa estratégico completo. Pilares, audiencia, insight y árbol de contenidos.",
    cta: "Ver mapa",
    accent: "naranja",
  },
];

export default function DashboardClient() {
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h1 className="font-heading text-3xl sm:text-4xl text-negro mb-1">Tu Brújula</h1>
          <p className="text-muted text-sm">Elige tu modo de trabajo</p>
        </div>

        {/* Workflow blocks — stack on mobile, horizontal rows on desktop */}
        <div className="flex flex-col gap-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group flex items-center gap-4 sm:gap-5 bg-white rounded-2xl border border-borde/60 p-4 sm:p-5 hover:border-naranja/40 hover:shadow-card-hover transition-all"
            >
              {/* Icon */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-naranja/10 flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 group-hover:bg-naranja/15 transition-colors">
                {s.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h2 className="font-heading text-lg sm:text-xl text-negro group-hover:text-naranja transition-colors">
                  {s.title}
                </h2>
                <p className="text-muted text-sm leading-snug mt-0.5 hidden sm:block">
                  {s.desc}
                </p>
              </div>

              {/* CTA arrow */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-sm font-semibold text-naranja hidden sm:inline">
                  {s.cta}
                </span>
                <svg
                  className="w-5 h-5 text-naranja/60 group-hover:text-naranja group-hover:translate-x-0.5 transition-all"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-8 flex justify-center gap-6">
          <Link
            href="/onboarding"
            className="text-sm text-muted hover:text-naranja transition-colors"
          >
            Editar mis datos
          </Link>
          <Link
            href="/settings"
            className="text-sm text-muted hover:text-naranja transition-colors"
          >
            Configuración
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
