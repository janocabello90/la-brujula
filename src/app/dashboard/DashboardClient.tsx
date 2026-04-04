"use client";

import { useMemo } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import type { DashboardStats, SmartTask, ArbolSection } from "./page";
import { PHASES, RUTA_CONFIG, type RutaType } from "@/lib/types";

const Icon = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

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

const TASK_ICON_MAP: Record<string, string> = {
  tree: "park", compass: "explore", key: "key", user: "person",
  bulb: "lightbulb", pillars: "account_balance", idea: "auto_awesome",
  wand: "magic_button", sparkle: "link", calendar: "calendar_month",
  save: "save", rocket: "rocket_launch",
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

  return (
    <AppShell userPhase={stats.userPhase} piramideCompleted={stats.piramideCompleted} arbolCompleted={stats.arbolCompleted === stats.arbolTotal} rutasCompleted={stats.rutasCompleted}>
      <div className="max-w-4xl mx-auto">

        {/* ═══ Greeting — editorial large type ═══ */}
        <div className="mb-6">
          <h1 className="font-headline text-3xl sm:text-4xl text-on-surface tracking-tight">
            {getGreeting()}{stats.userName ? `, ${stats.userName.split(" ")[0]}` : ""}
          </h1>
          <p className="text-on-surface-variant text-sm italic mt-2 leading-relaxed font-body">&ldquo;{quote}&rdquo;</p>
        </div>

        {/* ═══ Hero Banner — Bienvenida de Élite ═══ */}
        <div className="mb-8 rounded-2xl gradient-denim p-6 sm:p-8 relative overflow-hidden">
          <span className="absolute top-3 left-6 text-[10px] font-bold tracking-widest text-white/60 uppercase">
            Bienvenida de Élite
          </span>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex-1">
              <h2 className="font-headline text-xl sm:text-2xl text-white leading-tight mb-2">
                Tu viaje hacia la excelencia comienza aquí.
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                Explora tus fases, monitorea tus progresos y conecta con la comunidad del Sistema.
              </p>
            </div>
            <div className="hidden sm:block flex-shrink-0">
              <img
                src="/gorilla-hero.png"
                alt=""
                className="w-28 h-28 rounded-2xl object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          </div>
        </div>

        {/* ═══ Stats — No-border tonal cards ═══ */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <StatCard icon="lightbulb" label="Ideas generadas" value={stats.ideasTotal} href="/ideas" />
          <StatCard icon="bookmark" label="Ideas guardadas" value={stats.piecesTotal} href="/piezas" accent />
          <StatCard icon="edit_note" label="Publicadas" value={stats.plannedPublished} href="/planner" />
        </div>

        {/* ═══ Tus Fases — The 4-phase journey ═══ */}
        <div className="mb-8">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="font-headline text-xl text-on-surface">Tus Fases</h2>
              <p className="text-on-surface-variant text-xs mt-0.5 italic">El mapa de tu evolución personal</p>
            </div>
            <Link href="/rutas" className="text-xs text-primary font-medium hover:underline">
              Ver todas las fases →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <PhaseCard
              phase={1} name="La Pirámide" icon="change_history"
              completed={stats.piramideCompleted} locked={false}
              userPhase={stats.userPhase} href="/piramide"
              description="Cimentando las bases de tu rendimiento."
            />
            <PhaseCard
              phase={2} name="El Árbol" icon="park"
              completed={stats.arbolCompleted === stats.arbolTotal}
              locked={!stats.piramideCompleted}
              userPhase={stats.userPhase} href="/arbol"
              progress={stats.piramideCompleted ? `${stats.arbolCompleted}/${stats.arbolTotal}` : undefined}
              description="Crecimiento orgánico y ramificación."
            />
            <PhaseCard
              phase={3} name="Las Rutas" icon="route"
              completed={stats.rutasCompleted}
              locked={stats.arbolCompleted !== stats.arbolTotal}
              userPhase={stats.userPhase} href="/rutas"
              description="Exploración de caminos y oportunidades."
            />
            <PhaseCard
              phase={4} name="La Brújula" icon="explore"
              completed={false}
              locked={!stats.rutasCompleted}
              userPhase={stats.userPhase} href="/onboarding"
              description="Navegación estratégica de contenido."
            />
          </div>
        </div>

        {/* ═══ Today's Plan ═══ */}
        {stats.todayItems.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.15em] mb-3 px-1">
              Hoy tienes {stats.todayItems.length} pieza{stats.todayItems.length !== 1 ? "s" : ""} planificada{stats.todayItems.length !== 1 ? "s" : ""}
            </h2>
            <div className="flex flex-col gap-2">
              {stats.todayItems.map((item) => (
                <Link
                  key={item.id}
                  href="/planner"
                  className="flex items-center gap-3 rounded-2xl surface-card signature-shadow px-4 py-3 transition-all group hover:shadow-card-hover"
                >
                  <div className="flex-shrink-0 text-xs font-mono text-primary/60 w-12">
                    {item.scheduled_time ? item.scheduled_time.slice(0, 5) : "--:--"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-on-surface font-medium truncate">{item.title}</div>
                    <div className="flex gap-2 mt-0.5">
                      {item.pilar && <span className="text-[10px] text-primary bg-primary/[0.06] px-1.5 py-0.5 rounded-full">{item.pilar}</span>}
                      {item.formato && <span className="text-[10px] text-on-surface-variant">{item.formato}</span>}
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-2xl surface-low px-5 py-7 text-center">
            <p className="text-sm text-on-surface-variant mb-3">No tienes nada planificado para hoy</p>
            <div className="flex justify-center gap-3">
              <Link
                href="/maestro"
                className="text-xs gradient-denim text-white px-5 py-2.5 rounded-xl hover:shadow-button-hover transition-all font-medium shadow-button"
              >
                Generar contenido
              </Link>
              <Link
                href="/planner"
                className="text-xs surface-card text-on-surface px-5 py-2.5 rounded-xl signature-shadow hover:shadow-card-hover transition-all"
              >
                Ir al planificador
              </Link>
            </div>
          </div>
        )}

        {/* ═══ Smart Tasks ═══ */}
        {tasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.15em] mb-3 px-1">
              Tu siguiente paso
            </h2>
            <div className="flex flex-col gap-2">
              <PhaseTask userPhase={stats.userPhase} piramideCompleted={stats.piramideCompleted} arbolCompleted={stats.arbolCompleted === stats.arbolTotal} rutasCompleted={stats.rutasCompleted} />
              {highTasks.map((task) => <TaskRow key={task.id} task={task} urgent />)}
              {otherTasks.map((task) => <TaskRow key={task.id} task={task} />)}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="flex justify-center gap-6 mt-2 pb-4">
          <Link href="/onboarding" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Editar mi briefing</Link>
          <Link href="/settings" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Configuración</Link>
        </div>
      </div>
    </AppShell>
  );
}

// ═══ Helper Components ═══

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-surface-container-high text-on-surface-variant",
    scheduled: "bg-primary/10 text-primary",
    published: "bg-success/10 text-success",
  };
  const labels: Record<string, string> = { draft: "Borrador", scheduled: "Planificada", published: "Publicada" };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  );
}

function StatCard({ icon, label, value, href, accent }: { icon: string; label: string; value: number; href: string; accent?: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-2xl p-4 transition-all hover:shadow-card-hover ${
        accent ? "surface-card signature-shadow" : "surface-card signature-shadow"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`material-symbols-outlined text-lg ${accent ? "text-secondary-container" : "text-primary/60"}`}>{icon}</span>
      </div>
      <div className="font-headline text-2xl sm:text-3xl text-on-surface">{value}</div>
      <div className="text-xs text-on-surface-variant mt-0.5">{label}</div>
    </Link>
  );
}

function PhaseCard({
  phase, name, icon, completed, locked, userPhase, href, progress, description,
}: {
  phase: number; name: string; icon: string; completed: boolean; locked: boolean; userPhase: number; href: string; progress?: string; description?: string;
}) {
  const isActive = userPhase === phase;

  if (locked) {
    return (
      <div className="rounded-2xl surface-low p-4 opacity-50">
        <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-lg text-on-surface-variant">{icon}</span>
        </div>
        <div className="text-sm font-semibold text-on-surface-variant mb-1">{name}</div>
        {description && <p className="text-[10px] text-outline leading-relaxed">{description}</p>}
      </div>
    );
  }

  if (completed) {
    return (
      <Link href={href} className="rounded-2xl surface-card signature-shadow p-4 transition-all hover:shadow-card-hover group">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg text-success">{icon}</span>
          </div>
          <span className="material-symbols-outlined text-sm text-success">check_circle</span>
        </div>
        <div className="text-sm font-semibold text-on-surface mb-1">{name}</div>
        {description && <p className="text-[10px] text-on-surface-variant leading-relaxed">{description}</p>}
        <div className="mt-2 w-full h-1 rounded-full bg-success" />
        <span className="text-[10px] text-success font-medium mt-1 block">Completado</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`rounded-2xl p-4 transition-all hover:shadow-card-hover group ${
        isActive
          ? "surface-card ring-2 ring-secondary-container signature-shadow"
          : "surface-card signature-shadow"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isActive ? "gradient-denim" : "bg-surface-container-high"
        }`}>
          <span className={`material-symbols-outlined text-lg ${isActive ? "text-white" : "text-on-surface-variant"}`}>{icon}</span>
        </div>
        {isActive && <span className="text-[9px] font-bold gradient-yellow text-on-surface px-1.5 py-0.5 rounded-full leading-none">ACTIVA</span>}
      </div>
      <div className={`text-sm font-semibold mb-1 ${isActive ? "text-primary" : "text-on-surface"}`}>{name}</div>
      {description && <p className="text-[10px] text-on-surface-variant leading-relaxed">{description}</p>}
      {progress && (
        <div className="mt-2">
          <div className="w-full h-1 rounded-full bg-surface-container-high">
            <div className="h-1 rounded-full gradient-yellow" style={{ width: `${parseInt(progress) / parseInt(progress.split("/")[1]) * 100}%` }} />
          </div>
          <span className="text-[10px] text-on-surface-variant mt-1 block">{progress}</span>
        </div>
      )}
    </Link>
  );
}

function TaskRow({ task, urgent }: { task: SmartTask; urgent?: boolean }) {
  const iconName = TASK_ICON_MAP[task.icon] || "arrow_forward";
  return (
    <Link
      href={task.href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all group ${
        urgent
          ? "surface-card signature-shadow hover:shadow-card-hover"
          : "surface-low hover:bg-surface-container"
      }`}
    >
      <span className={`material-symbols-outlined text-lg flex-shrink-0 ${urgent ? "text-secondary-container" : "text-on-surface-variant"}`}>{iconName}</span>
      <span className={`text-sm flex-1 ${urgent ? "font-medium text-on-surface" : "text-on-surface/80"}`}>{task.text}</span>
      <span className="material-symbols-outlined text-sm text-outline/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0">chevron_right</span>
    </Link>
  );
}

function PhaseTask({
  userPhase, piramideCompleted, arbolCompleted, rutasCompleted,
}: {
  userPhase: number; piramideCompleted: boolean; arbolCompleted: boolean; rutasCompleted?: boolean;
}) {
  const phaseMessages: Record<number, { text: string; href: string; icon: string }> = {
    1: { text: "Completa La Pirámide — es la base de todo", href: "/piramide", icon: "change_history" },
    2: { text: "Completa El Árbol — diagnostica tu marca", href: "/arbol", icon: "park" },
    3: { text: "Sigue Las Rutas — tu estrategia personalizada", href: "/rutas", icon: "route" },
    4: { text: "Configura La Brújula — tu sistema de contenido", href: "/onboarding", icon: "explore" },
  };
  const task = phaseMessages[userPhase] || phaseMessages[1];

  return (
    <Link
      href={task.href}
      className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all group gradient-denim text-white hover:shadow-button-hover"
    >
      <span className="material-symbols-outlined text-lg flex-shrink-0 text-white/80">{task.icon}</span>
      <span className="text-sm flex-1 font-medium">{task.text}</span>
      <span className="material-symbols-outlined text-sm text-white/40 group-hover:translate-x-0.5 transition-all flex-shrink-0">chevron_right</span>
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
