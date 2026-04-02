"use client";

import { useMemo } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import type { DashboardStats, SmartTask, ArbolSection } from "./page";
import { PHASES, RUTA_CONFIG, type RutaType } from "@/lib/types";

// Frases rotativas — estilo Jano
const QUOTES = [
  "Tu marca personal no es lo que dices de ti. Es lo que haces cuando nadie mira.",
  "El mejor contenido no sale de un calendario. Sale de alguien que tiene algo que decir.",
  "No necesitas más seguidores. Necesitas más claridad.",
  "La constancia sin estrategia es ruido. La estrategia sin acción es un PowerPoint bonito.",
  "Publicar no es el objetivo. Conectar sí.",
  "El contenido que más impacta es el que te da un poco de miedo publicar.",
  "No compitas por atención. Compite por confianza.",
  "Tu voz ya existe. Solo necesitas estructura para que se escuche.",
  "El que piensa bien, crea bien. El que crea bien, atrae bien.",
  "Crear contenido sin saber quién eres es como gritar en una habitación vacía.",
  "Lo que te hace diferente no es tu nicho. Es tu forma de pensar.",
  "Deja de pensar qué publicar y empieza a pensar qué quieres provocar.",
  "Una buena marca personal no se construye con hacks. Se construye con decisiones.",
  "Si no sabes para quién creas, estás creando para el algoritmo. Y el algoritmo no compra.",
  "Hoy es un buen día para crear algo que importe.",
];

const TASK_ICONS: Record<string, string> = {
  tree: "🌳",
  compass: "🧭",
  key: "🔑",
  user: "👤",
  bulb: "💡",
  pillars: "🏛️",
  idea: "💭",
  wand: "✨",
  sparkle: "🔗",
  calendar: "📅",
  save: "💾",
  rocket: "🚀",
};

interface DashboardClientStats extends DashboardStats {
  piramideCompleted: boolean;
  rutasCompleted: boolean;
  userPhase: number;
}

interface Props {
  stats: DashboardClientStats;
  tasks: SmartTask[];
}

export default function DashboardClient({ stats, tasks }: Props) {
  const quote = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  const highTasks = tasks.filter((t) => t.priority === "high");
  const otherTasks = tasks.filter((t) => t.priority !== "high");

  // Brújula setup progress
  const brujulaSteps = [
    { label: "Briefing", done: stats.hasMinorityReport },
    { label: "Buyer Persona", done: stats.hasBuyerPersona },
    { label: "Insight", done: stats.hasInsight },
    { label: "Árbol de contenidos", done: stats.hasTree },
    { label: "API Key", done: stats.hasApiKey },
  ];
  const brujulaCompleted = brujulaSteps.filter((s) => s.done).length;

  return (
    <AppShell userPhase={stats.userPhase} piramideCompleted={stats.piramideCompleted} arbolCompleted={stats.arbolCompleted === stats.arbolTotal} rutasCompleted={stats.rutasCompleted}>
      <div className="max-w-3xl mx-auto">
        {/* Greeting + Quote */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl text-negro mb-1.5">
            {getGreeting()}{stats.userName ? `, ${stats.userName.split(" ")[0]}` : ""} 🦍
          </h1>
          <p className="text-muted text-sm italic mt-1 leading-relaxed">&ldquo;{quote}&rdquo;</p>
        </div>

        {/* ===== LAS RUTAS — Journey Banner ===== */}
        <Link
          href="/rutas"
          className="block mb-6 rounded-2xl border border-denim/15 bg-gradient-to-r from-denim/[0.04] via-transparent to-amarillo/[0.04] hover:border-denim/30 transition-all group"
        >
          <div className="flex items-center gap-4 p-4 sm:p-5">
            {/* Phase progress dots */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {PHASES.map((phase) => (
                <div
                  key={phase.number}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    stats.journeyPhase > phase.number
                      ? "bg-denim"
                      : stats.journeyPhase === phase.number
                      ? "bg-amarillo ring-2 ring-amarillo/30"
                      : "bg-borde/40"
                  }`}
                />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-negro font-medium">
                <span className="text-denim">{PHASES[stats.journeyPhase - 1]?.icon}</span>{" "}
                Fase {stats.journeyPhase}: {PHASES[stats.journeyPhase - 1]?.name}
                {stats.journeyRuta && (
                  <span
                    className="ml-2 text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: RUTA_CONFIG[stats.journeyRuta as RutaType]?.color + "15",
                      color: RUTA_CONFIG[stats.journeyRuta as RutaType]?.color,
                    }}
                  >
                    {RUTA_CONFIG[stats.journeyRuta as RutaType]?.name}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted mt-0.5">
                {PHASES[stats.journeyPhase - 1]?.tagline}
              </p>
            </div>
            <svg className="w-4 h-4 text-muted/30 group-hover:text-denim transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* ===== PROGRESS SECTION: 4-PHASE JOURNEY ===== */}
        <div className="mb-8">
          <div className="hidden sm:flex items-center justify-between gap-3">
            <PhaseCard phase={1} name="La Pirámide" icon="🔺" completed={stats.piramideCompleted} locked={false} userPhase={stats.userPhase} href="/piramide" />
            <PhaseArrow active={stats.piramideCompleted} />
            <PhaseCard phase={2} name="El Árbol" icon="🌳" completed={stats.arbolCompleted === stats.arbolTotal} locked={!stats.piramideCompleted} userPhase={stats.userPhase} href="/arbol" progress={stats.piramideCompleted ? `${stats.arbolCompleted}/${stats.arbolTotal}` : undefined} />
            <PhaseArrow active={stats.arbolCompleted === stats.arbolTotal} />
            <PhaseCard phase={3} name="Las Rutas" icon="🗺️" completed={stats.rutasCompleted} locked={stats.arbolCompleted !== stats.arbolTotal} userPhase={stats.userPhase} href="/rutas" />
            <PhaseArrow active={stats.rutasCompleted} />
            <PhaseCard phase={4} name="La Brújula" icon="🧭" completed={false} locked={!stats.rutasCompleted} userPhase={stats.userPhase} href="/onboarding" />
          </div>

          {/* Mobile 2x2 grid */}
          <div className="sm:hidden grid grid-cols-2 gap-3">
            <PhaseCard phase={1} name="La Pirámide" icon="🔺" completed={stats.piramideCompleted} locked={false} userPhase={stats.userPhase} href="/piramide" />
            <PhaseCard phase={2} name="El Árbol" icon="🌳" completed={stats.arbolCompleted === stats.arbolTotal} locked={!stats.piramideCompleted} userPhase={stats.userPhase} href="/arbol" progress={stats.piramideCompleted ? `${stats.arbolCompleted}/${stats.arbolTotal}` : undefined} />
            <PhaseCard phase={3} name="Las Rutas" icon="🗺️" completed={stats.rutasCompleted} locked={stats.arbolCompleted !== stats.arbolTotal} userPhase={stats.userPhase} href="/rutas" />
            <PhaseCard phase={4} name="La Brújula" icon="🧭" completed={false} locked={!stats.rutasCompleted} userPhase={stats.userPhase} href="/onboarding" />
          </div>
        </div>

        {/* ===== TODAY'S PLAN ===== */}
        {stats.todayItems.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-[10px] font-bold text-denim/40 uppercase tracking-[0.12em] mb-3 px-1">
              Hoy tienes {stats.todayItems.length} pieza{stats.todayItems.length !== 1 ? "s" : ""} planificada{stats.todayItems.length !== 1 ? "s" : ""}
            </h2>
            <div className="flex flex-col gap-2">
              {stats.todayItems.map((item) => (
                <Link
                  key={item.id}
                  href="/planner"
                  className="flex items-center gap-3 rounded-xl border bg-denim/[0.03] border-denim/15 hover:border-denim/30 px-4 py-3 transition-all group"
                >
                  <div className="flex-shrink-0 text-xs font-mono text-denim/60 w-12">
                    {item.scheduled_time ? item.scheduled_time.slice(0, 5) : "--:--"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-negro font-medium truncate">{item.title}</div>
                    <div className="flex gap-2 mt-0.5">
                      {item.pilar && (
                        <span className="text-[10px] text-denim bg-denim/[0.06] px-1.5 py-0.5 rounded">{item.pilar}</span>
                      )}
                      {item.formato && (
                        <span className="text-[10px] text-muted">{item.formato}</span>
                      )}
                      {item.canal && (
                        <span className="text-[10px] text-muted">{item.canal}</span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border border-dashed border-borde/50 bg-white/50 px-5 py-7 text-center">
            <p className="text-sm text-muted mb-3">No tienes nada planificado para hoy</p>
            <div className="flex justify-center gap-3">
              <Link
                href="/maestro"
                className="text-xs bg-denim text-white px-5 py-2.5 rounded-xl hover:bg-denim-dark transition-colors font-medium shadow-button"
              >
                Generar contenido
              </Link>
              <Link
                href="/planner"
                className="text-xs bg-white text-negro border border-borde px-5 py-2.5 rounded-xl hover:border-denim/30 transition-colors"
              >
                Ir al planificador
              </Link>
            </div>
          </div>
        )}

        {/* ===== STATS BAR ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Ideas" value={stats.ideasTotal} sub={stats.ideasRaw > 0 ? `${stats.ideasRaw} sin conectar` : undefined} href="/ideas" />
          <StatCard label="Generadas" value={stats.suggestionsTotal} href="/maestro" />
          <StatCard label="Guardadas" value={stats.piecesTotal} sub={stats.piecesEditing > 0 ? `${stats.piecesEditing} editando` : undefined} href="/piezas" />
          <StatCard label="Publicadas" value={stats.plannedPublished} sub={stats.plannedScheduled > 0 ? `${stats.plannedScheduled} planificadas` : undefined} accent href="/planner" />
        </div>

        {/* ===== SMART TASKS ===== */}
        {tasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[10px] font-bold text-denim/40 uppercase tracking-[0.12em] mb-3 px-1">
              Tu siguiente paso
            </h2>
            <div className="flex flex-col gap-2">
              <PhaseTask userPhase={stats.userPhase} piramideCompleted={stats.piramideCompleted} arbolCompleted={stats.arbolCompleted === stats.arbolTotal} rutasCompleted={stats.rutasCompleted} />
              {highTasks.map((task) => (
                <TaskRow key={task.id} task={task} urgent />
              ))}
              {otherTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="flex justify-center gap-6 mt-2 pb-4">
          <Link href="/onboarding" className="text-sm text-muted hover:text-denim transition-colors">
            Editar mi briefing
          </Link>
          <Link href="/settings" className="text-sm text-muted hover:text-denim transition-colors">
            Configuración
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

// --- Helper Components ---

function PhaseArrow({ active }: { active: boolean }) {
  return (
    <div className={`flex-shrink-0 transition-colors ${active ? "text-denim/40" : "text-borde/50"}`}>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-borde/30 text-muted",
    scheduled: "bg-denim/10 text-denim",
    published: "bg-success/10 text-success",
  };
  const labels: Record<string, string> = {
    draft: "Borrador",
    scheduled: "Planificada",
    published: "Publicada",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  );
}

function StatCard({ label, value, sub, accent, href }: { label: string; value: number; sub?: string; accent?: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border p-4 transition-all hover:shadow-card-hover ${
        accent
          ? "bg-amarillo/10 border-amarillo/25 hover:border-amarillo/40"
          : "bg-white border-borde/50 hover:border-denim/25"
      }`}
    >
      <div className={`font-heading text-2xl sm:text-3xl ${accent ? "text-denim" : "text-negro"}`}>
        {value}
      </div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-muted/60 mt-1">{sub}</div>}
    </Link>
  );
}

function TaskRow({ task, urgent }: { task: SmartTask; urgent?: boolean }) {
  const icon = TASK_ICONS[task.icon] || "→";
  return (
    <Link
      href={task.href}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all group ${
        urgent
          ? "bg-amarillo/[0.06] border-amarillo/20 hover:border-denim/30"
          : "bg-white border-borde/50 hover:border-denim/25"
      }`}
    >
      <span className="text-base flex-shrink-0">{icon}</span>
      <span className={`text-sm flex-1 ${urgent ? "font-medium text-negro" : "text-negro/80"}`}>
        {task.text}
      </span>
      <svg
        className="w-4 h-4 text-muted/30 group-hover:text-denim group-hover:translate-x-0.5 transition-all flex-shrink-0"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function PhaseCard({
  phase, name, icon, completed, locked, userPhase, href, progress,
}: {
  phase: number; name: string; icon: string; completed: boolean; locked: boolean; userPhase: number; href: string; progress?: string;
}) {
  const isActive = userPhase === phase;

  if (locked) {
    return (
      <div className="flex-1 rounded-2xl border bg-crema-dark/50 border-borde/30 p-4 text-center opacity-50">
        <div className="text-2xl mb-2">{icon}</div>
        <div className="text-sm font-semibold text-muted mb-1">{name}</div>
        <div className="text-[10px] text-muted/50">Bloqueado</div>
      </div>
    );
  }

  if (completed) {
    return (
      <Link
        href={href}
        className="flex-1 rounded-2xl border bg-success/[0.06] border-success/20 hover:border-success/35 p-4 text-center transition-all hover:shadow-card-hover"
      >
        <div className="text-2xl mb-2">{icon}</div>
        <div className="text-sm font-semibold text-success mb-1">{name}</div>
        <div className="text-[10px] text-success font-medium">✓ Completada</div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`flex-1 rounded-2xl border p-4 text-center transition-all hover:shadow-card-hover ${
        isActive
          ? "bg-denim/[0.05] border-denim/25 hover:border-denim/40 ring-1 ring-denim/10"
          : "bg-white border-borde/50 hover:border-denim/25"
      }`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-sm font-semibold mb-1 ${isActive ? "text-denim" : "text-negro"}`}>
        {name}
      </div>
      {progress ? (
        <div className="text-[10px] text-muted mb-2">{progress}</div>
      ) : null}
      <div className={`text-[10px] ${isActive ? "text-denim font-medium" : "text-muted"}`}>
        {isActive ? "Tu siguiente paso →" : "En progreso"}
      </div>
    </Link>
  );
}

function PhaseTask({
  userPhase, piramideCompleted, arbolCompleted, rutasCompleted,
}: {
  userPhase: number; piramideCompleted: boolean; arbolCompleted: boolean; rutasCompleted?: boolean;
}) {
  const phaseMessages: Record<number, { text: string; href: string; icon: string }> = {
    1: { text: "Completa La Pirámide — es la base de todo", href: "/piramide", icon: "🔺" },
    2: { text: "Completa El Árbol — diagnostica tu marca", href: "/arbol", icon: "🌳" },
    3: { text: "Sigue Las Rutas — tu estrategia personalizada", href: "/rutas", icon: "🗺️" },
    4: { text: "Configura La Brújula — tu sistema de contenido", href: "/onboarding", icon: "🧭" },
  };

  const task = phaseMessages[userPhase] || phaseMessages[1];

  return (
    <Link
      href={task.href}
      className="flex items-center gap-3 rounded-xl border px-4 py-3 transition-all group bg-denim/[0.04] border-denim/15 hover:border-denim/30"
    >
      <span className="text-base flex-shrink-0">{task.icon}</span>
      <span className="text-sm flex-1 font-medium text-negro">{task.text}</span>
      <svg
        className="w-4 h-4 text-muted/30 group-hover:text-denim group-hover:translate-x-0.5 transition-all flex-shrink-0"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 7) return "Buenas noches";
  if (hour < 13) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}
