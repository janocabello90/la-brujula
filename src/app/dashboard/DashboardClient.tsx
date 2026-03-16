"use client";

import { useMemo } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import type { DashboardStats, SmartTask } from "./page";

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

interface Props {
  stats: DashboardStats;
  tasks: SmartTask[];
}

const sections = [
  { href: "/ideas", icon: "💡", title: "Ideas", cta: "Apuntar idea" },
  { href: "/maestro", icon: "🎯", title: "El Maestro", cta: "Activar" },
  { href: "/piezas", icon: "📝", title: "Mis Piezas", cta: "Ver piezas" },
  { href: "/planner", icon: "📅", title: "Planificador", cta: "Planificar" },
  { href: "/minority-report", icon: "🗺️", title: "Minority Report", cta: "Ver mapa" },
];

export default function DashboardClient({ stats, tasks }: Props) {
  // Pick a quote based on today's date so it's consistent within a day
  const quote = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  const highTasks = tasks.filter((t) => t.priority === "high");
  const otherTasks = tasks.filter((t) => t.priority !== "high");

  // Summary line
  const totalCreated = stats.suggestionsTotal;
  const totalPublished = stats.plannedPublished;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        {/* Greeting + Quote */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl text-negro mb-1">
            {getGreeting()}{stats.userName ? `, ${stats.userName.split(" ")[0]}` : ""}
          </h1>
          <p className="text-muted text-sm italic mt-1">&ldquo;{quote}&rdquo;</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Ideas" value={stats.ideasTotal} sub={stats.ideasRaw > 0 ? `${stats.ideasRaw} sin conectar` : undefined} href="/ideas" />
          <StatCard label="Piezas generadas" value={totalCreated} href="/maestro" />
          <StatCard label="Guardadas" value={stats.piecesTotal} sub={stats.piecesEditing > 0 ? `${stats.piecesEditing} editando` : undefined} href="/piezas" />
          <StatCard label="Publicadas" value={totalPublished} sub={stats.plannedScheduled > 0 ? `${stats.plannedScheduled} planificadas` : undefined} accent href="/planner" />
        </div>

        {/* Smart Tasks */}
        {tasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3 px-1">
              Tu siguiente paso
            </h2>
            <div className="flex flex-col gap-2">
              {highTasks.map((task) => (
                <TaskRow key={task.id} task={task} urgent />
              ))}
              {otherTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Quick nav blocks */}
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3 px-1">
          Herramientas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group flex flex-col items-center gap-1.5 bg-white rounded-xl border border-borde/60 py-4 px-3 hover:border-naranja/40 hover:shadow-card-hover transition-all text-center"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{s.icon}</span>
              <span className="text-sm font-medium text-negro group-hover:text-naranja transition-colors">{s.title}</span>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex justify-center gap-6">
          <Link href="/onboarding" className="text-sm text-muted hover:text-naranja transition-colors">
            Editar mis datos
          </Link>
          <Link href="/settings" className="text-sm text-muted hover:text-naranja transition-colors">
            Configuración
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 flex items-start gap-4 bg-negro/[0.03] border border-borde/40 rounded-xl p-4 sm:p-5">
          <span className="text-2xl flex-shrink-0">🦍</span>
          <div className="text-sm text-negro/70 leading-relaxed">
            <p>
              Si algo del proceso te chirría, mi recomendación es que revises tu{" "}
              <strong className="text-negro">Pirámide de la Marca Personal</strong> o me preguntes directamente en la comunidad.
            </p>
            <p className="mt-2">
              <a
                href="https://www.skool.com/una-buena-vida-comunidad-2471"
                target="_blank"
                rel="noopener noreferrer"
                className="text-naranja font-semibold hover:underline"
              >
                Escuela de Buena Vida →
              </a>
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// --- Helper Components ---

function StatCard({ label, value, sub, accent, href }: { label: string; value: number; sub?: string; accent?: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={`rounded-xl border p-4 transition-all hover:shadow-card-hover ${
        accent
          ? "bg-naranja/10 border-naranja/30 hover:border-naranja/50"
          : "bg-white border-borde/60 hover:border-naranja/40"
      }`}
    >
      <div className={`font-heading text-2xl sm:text-3xl ${accent ? "text-naranja" : "text-negro"}`}>
        {value}
      </div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-muted/60 mt-1">{sub}</div>}
    </Link>
  );
}

function TaskRow({ task, urgent }: { task: SmartTask; urgent?: boolean }) {
  return (
    <Link
      href={task.href}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all group ${
        urgent
          ? "bg-naranja/5 border-naranja/25 hover:border-naranja/50"
          : "bg-white border-borde/60 hover:border-naranja/40"
      }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
        urgent ? "border-naranja" : "border-borde"
      }`}>
        {task.done && (
          <svg className="w-3 h-3 text-naranja" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-sm flex-1 ${urgent ? "font-medium text-negro" : "text-negro/80"}`}>
        {task.text}
      </span>
      <svg
        className="w-4 h-4 text-muted/40 group-hover:text-naranja group-hover:translate-x-0.5 transition-all flex-shrink-0"
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
