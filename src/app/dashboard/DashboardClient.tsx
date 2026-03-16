"use client";

import Link from "next/link";
import Image from "next/image";
import AppShell from "@/components/AppShell";

const sections = [
  {
    href: "/ideas",
    icon: "💡",
    title: "Ideas",
    desc: "Apunta lo que se te ocurra. La IA lo conecta con tu estrategia.",
    cta: "Apuntar idea",
  },
  {
    href: "/maestro",
    icon: "🎯",
    title: "El Maestro",
    desc: "Tu director creativo con IA. Titulares, ganchos y pistas para tu siguiente pieza.",
    cta: "Activar",
  },
  {
    href: "/piezas",
    icon: "📝",
    title: "Mis Piezas",
    desc: "Tu banco de piezas guardadas. Edita, planifica o recupera ideas del Maestro.",
    cta: "Ver piezas",
  },
  {
    href: "/planner",
    icon: "📅",
    title: "Planificador",
    desc: "Organiza tu contenido por semana o mes. Kanban, calendario y lista.",
    cta: "Planificar",
  },
  {
    href: "/minority-report",
    icon: "🗺️",
    title: "Minority Report",
    desc: "Tu mapa estratégico completo. Pilares, audiencia, insight y árbol de contenidos.",
    cta: "Ver mapa",
  },
];

export default function DashboardClient() {
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl text-negro mb-1">Tu Brújula</h1>
          <p className="text-muted text-sm">Tu herramienta de estrategia de contenido</p>
        </div>

        {/* Philosophy / How it works */}
        <div className="bg-white rounded-2xl border border-borde/60 p-5 sm:p-7 mb-8">
          <h2 className="font-heading text-lg sm:text-xl text-negro mb-3">
            Cómo funciona esto
          </h2>
          <div className="text-sm text-negro/80 leading-relaxed space-y-3">
            <p>
              La Brújula no te dice qué publicar. Te ayuda a <strong>pensar mejor lo que ya tienes dentro</strong>.
            </p>
            <p>
              Primero defines quién eres, a quién le hablas y de qué va lo tuyo. Eso es tu <strong>Minority Report</strong> — el mapa estratégico que lo sostiene todo.
              Después, cada vez que te sientes a crear, <strong>El Maestro</strong> cruza tu estrategia con el momento real (qué energía tienes, para qué canal, con qué objetivo) y te propone una pieza con ángulo, gancho y chispa.
            </p>
            <p>
              No es un generador de contenido. Es un <strong>director creativo que trabaja contigo</strong>, no por ti.
              Tú pones la voz. La Brújula pone la estructura.
            </p>
          </div>

          {/* Flow visual */}
          <div className="flex items-center justify-between mt-5 pt-5 border-t border-borde/40">
            {[
              { icon: "🗺️", label: "Estrategia" },
              { icon: "💡", label: "Ideas" },
              { icon: "🎯", label: "Maestro" },
              { icon: "📝", label: "Piezas" },
              { icon: "📅", label: "Planifica" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <span className="text-xl sm:text-2xl">{step.icon}</span>
                  <span className="text-[10px] sm:text-xs text-muted mt-1">{step.label}</span>
                </div>
                {i < 4 && (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-borde mx-1 sm:mx-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section label */}
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3 px-1">
          Elige tu modo de trabajo
        </p>

        {/* Workflow blocks */}
        <div className="flex flex-col gap-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group flex items-center gap-4 sm:gap-5 bg-white rounded-2xl border border-borde/60 p-4 sm:p-5 hover:border-naranja/40 hover:shadow-card-hover transition-all"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-naranja/10 flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 group-hover:bg-naranja/15 transition-colors">
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-heading text-lg sm:text-xl text-negro group-hover:text-naranja transition-colors">
                  {s.title}
                </h2>
                <p className="text-muted text-sm leading-snug mt-0.5 hidden sm:block">
                  {s.desc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-sm font-semibold text-naranja hidden sm:inline">
                  {s.cta}
                </span>
                <svg
                  className="w-5 h-5 text-naranja/60 group-hover:text-naranja group-hover:translate-x-0.5 transition-all"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-6 flex justify-center gap-6">
          <Link href="/onboarding" className="text-sm text-muted hover:text-naranja transition-colors">
            Editar mis datos
          </Link>
          <Link href="/settings" className="text-sm text-muted hover:text-naranja transition-colors">
            Configuración
          </Link>
        </div>

        {/* Skool Call Out */}
        <div className="mt-12 bg-negro rounded-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Image */}
            <div className="lg:w-2/5 relative min-h-[240px] sm:min-h-[300px] lg:min-h-0">
              <picture>
                <source srcSet="/gorila-skool.webp" type="image/webp" />
                <Image
                  src="/gorila-skool.png"
                  alt="Gorila con café y comunidad Skool"
                  fill
                  className="object-cover object-top lg:object-center"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </picture>
            </div>

            {/* Content */}
            <div className="lg:w-3/5 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              <span className="text-naranja text-xs font-semibold uppercase tracking-wider mb-2">
                Comunidad
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl text-white mb-3">
                Escuela de Buena Vida
              </h2>
              <p className="text-white/70 text-sm leading-relaxed mb-5">
                Una comunidad para construir una buena vida a través de tu marca personal y aprender el <strong className="text-white">noble arte de la autopromoción</strong>.
              </p>

              <div className="space-y-2.5 text-sm text-white/80 mb-6">
                <p>🔥 Formaciones completas: Pirámides + Árbol de la Marca Personal</p>
                <p>☕ Café mensual en directo para desbloquear dudas reales</p>
                <p>🧠 Mentorías grupales para revisar tu trabajo</p>
                <p>🛠 Biblioteca viva de herramientas, prompts y plantillas</p>
                <p>📍 Filosofía aplicada para pensar mejor y decidir mejor</p>
                <p>🤝 Comunidad de adultos construyendo estructura</p>
              </div>

              <div className="text-white/50 text-sm leading-relaxed mb-6 border-l-2 border-naranja/40 pl-4">
                <p>Aquí no vienes a perseguir seguidores.</p>
                <p>Vienes a construir opciones.</p>
                <p className="mt-2">
                  Si quieres trabajar tu marca personal con criterio y coherencia, este es tu sitio. Te vamos haciendo café (siempre del bueno).
                </p>
                <p className="mt-2">Bienvenido al nido. 🦍☕️</p>
              </div>

              <a
                href="https://www.skool.com/una-buena-vida-comunidad-2471"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-naranja hover:bg-naranja-hover text-white font-semibold px-6 py-3 rounded-xl transition-colors self-start"
              >
                Entrar en la comunidad
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
