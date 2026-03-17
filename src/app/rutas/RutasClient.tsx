"use client";

import { useState } from "react";
import Link from "next/link";
import { PHASES, RUTA_CONFIG, type UserJourney, type PhaseConfig } from "@/lib/types";

interface RutasClientProps {
  journey: UserJourney;
  arbolCompleted: number;
  arbolTotal: number;
  hasBriefing: boolean;
  hasBuyer: boolean;
  hasInsight: boolean;
  hasTree: boolean;
}

export default function RutasClient({
  journey: initialJourney,
  arbolCompleted,
  arbolTotal,
  hasBriefing,
  hasBuyer,
  hasInsight,
  hasTree,
}: RutasClientProps) {
  const [journey, setJourney] = useState<UserJourney>(initialJourney);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(journey.current_phase);
  const [loadingModules, setLoadingModules] = useState<Set<string>>(new Set());
  const [rediagnoseLoading, setRediagnoseLoading] = useState(false);
  const currentPhase = journey.current_phase;

  // Calculate progress for phase 1
  const phase1Items = [hasBriefing, hasBuyer, hasInsight, hasTree];
  const phase1Progress = phase1Items.filter(Boolean).length;
  const phase1Total = phase1Items.length;

  // Handle module completion toggle
  const handleModuleToggle = async (moduleId: string) => {
    const moduleItem = journey.ruta_modulos?.find((m) => m.id === moduleId);
    if (!moduleItem) return;

    const isCompleting = !moduleItem.completado;
    const endpoint = isCompleting ? "/api/rutas/complete-module" : "/api/rutas/uncomplete-module";

    try {
      setLoadingModules((prev) => new Set(prev).add(moduleId));

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: journey.user_id,
          moduleId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Error:", error);
        alert(`Error: ${error.error || "No se pudo actualizar el módulo"}`);
        return;
      }

      const data = await res.json();
      setJourney(data.journey);
    } catch (error) {
      console.error("Toggle error:", error);
      alert("Error al actualizar el módulo");
    } finally {
      setLoadingModules((prev) => {
        const next = new Set(prev);
        next.delete(moduleId);
        return next;
      });
    }
  };

  // Handle re-diagnose
  const handleRediagnose = async () => {
    try {
      setRediagnoseLoading(true);

      const res = await fetch("/api/rutas/re-diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: journey.user_id,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Error:", error);
        alert(`Error: ${error.error || "No se pudo re-diagnosticar"}`);
        return;
      }

      const data = await res.json();
      setJourney(data.journey);
      alert(`Nuevo diagnóstico completado. Perfil: ${data.journey.perfil_diagnostico}`);
    } catch (error) {
      console.error("Rediagnose error:", error);
      alert("Error al re-diagnosticar");
    } finally {
      setRediagnoseLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl text-negro tracking-tight">
          Las Rutas
        </h1>
        <p className="text-muted text-sm mt-1 max-w-xl">
          Tu camino personalizado de marca personal. De lo que no se ve a lo que el mundo percibe. De pensar a hacer.
        </p>
      </div>

      {/* Current phase indicator */}
      <div className="bg-white border border-borde rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-naranja/10 flex items-center justify-center text-lg">
            {PHASES[currentPhase - 1]?.icon}
          </div>
          <div>
            <p className="text-[10px] font-semibold text-naranja uppercase tracking-widest">
              Fase actual
            </p>
            <h2 className="font-heading text-lg text-negro">
              Fase {currentPhase}: {PHASES[currentPhase - 1]?.name}
            </h2>
          </div>
        </div>
        <p className="text-sm text-muted italic">
          &ldquo;{PHASES[currentPhase - 1]?.tagline}&rdquo;
        </p>

        {/* Ruta assigned badge */}
        {journey.ruta_asignada && (
          <div
            className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{
              background: RUTA_CONFIG[journey.ruta_asignada].color + "15",
              color: RUTA_CONFIG[journey.ruta_asignada].color,
              border: `1px solid ${RUTA_CONFIG[journey.ruta_asignada].color}30`,
            }}
          >
            <span>{RUTA_CONFIG[journey.ruta_asignada].icon}</span>
            {RUTA_CONFIG[journey.ruta_asignada].name}
            <span className="text-xs opacity-70">— {RUTA_CONFIG[journey.ruta_asignada].tagline}</span>
          </div>
        )}
      </div>

      {/* Phase progress bar */}
      <div className="bg-white border border-borde rounded-2xl p-5">
        <div className="flex items-center justify-between gap-2">
          {PHASES.map((phase, i) => {
            const isCompleted = currentPhase > phase.number;
            const isCurrent = currentPhase === phase.number;
            const isLocked = currentPhase < phase.number;
            return (
              <div key={phase.number} className="flex items-center flex-1">
                {/* Node */}
                <div className="flex flex-col items-center gap-1 min-w-[60px]">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isCompleted
                        ? "bg-naranja text-white"
                        : isCurrent
                        ? "bg-naranja/10 text-naranja border-2 border-naranja"
                        : "bg-borde/30 text-muted/40 border-2 border-borde/50"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      phase.number
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium text-center leading-tight ${
                      isCompleted || isCurrent ? "text-negro" : "text-muted/40"
                    }`}
                  >
                    {phase.name}
                  </span>
                </div>
                {/* Connector line */}
                {i < PHASES.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 rounded ${
                      currentPhase > phase.number + 1
                        ? "bg-naranja"
                        : currentPhase > phase.number
                        ? "bg-naranja/30"
                        : "bg-borde/30"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase cards */}
      <div className="space-y-3">
        {PHASES.map((phase) => (
          <PhaseCard
            key={phase.number}
            phase={phase}
            currentPhase={currentPhase}
            expanded={expandedPhase === phase.number}
            onToggle={() => setExpandedPhase(expandedPhase === phase.number ? null : phase.number)}
            journey={journey}
            arbolCompleted={arbolCompleted}
            arbolTotal={arbolTotal}
            phase1Progress={phase1Progress}
            phase1Total={phase1Total}
            onModuleToggle={handleModuleToggle}
            loadingModules={loadingModules}
            onRediagnose={handleRediagnose}
            rediagnoseLoading={rediagnoseLoading}
          />
        ))}
      </div>

      {/* Philosophy note */}
      <div className="bg-naranja/[0.04] border border-naranja/10 rounded-2xl p-5">
        <p className="text-sm text-negro/80 leading-relaxed italic">
          &ldquo;La mayoría empieza por la estrategia y luego se pregunta por qué no funciona.
          La Pirámide se construye de abajo arriba. Las Rutas son el camino completo:
          primero quién eres, luego cómo te ve el mundo, después tu camino, y solo entonces ejecutas.&rdquo;
        </p>
      </div>
    </div>
  );
}

// ─── Phase Card Component ───

interface PhaseCardProps {
  phase: PhaseConfig;
  currentPhase: number;
  expanded: boolean;
  onToggle: () => void;
  journey: UserJourney;
  arbolCompleted: number;
  arbolTotal: number;
  phase1Progress: number;
  phase1Total: number;
  onModuleToggle: (moduleId: string) => Promise<void>;
  loadingModules: Set<string>;
  onRediagnose: () => Promise<void>;
  rediagnoseLoading: boolean;
}

function PhaseCard({
  phase,
  currentPhase,
  expanded,
  onToggle,
  journey,
  arbolCompleted,
  arbolTotal,
  phase1Progress,
  phase1Total,
  onModuleToggle,
  loadingModules,
  onRediagnose,
  rediagnoseLoading,
}: PhaseCardProps) {
  const isCompleted = currentPhase > phase.number;
  const isCurrent = currentPhase === phase.number;
  const isLocked = currentPhase < phase.number;

  // Phase-specific progress
  const getPhaseProgress = () => {
    switch (phase.number) {
      case 1:
        return { current: phase1Progress, total: phase1Total, label: "fundamentos completados" };
      case 2:
        return { current: arbolCompleted, total: arbolTotal, label: "secciones del Árbol" };
      case 3:
        const modulosComplete = journey.ruta_modulos?.filter((m) => m.completado).length || 0;
        const modulosTotal = journey.ruta_modulos?.length || 0;
        return { current: modulosComplete, total: modulosTotal || 1, label: "módulos de la ruta" };
      case 4:
        return { current: journey.piezas_count, total: 10, label: "piezas publicadas" };
      case 5:
        return { current: journey.coherencia_historica?.length || 0, total: 3, label: "revisiones mensuales" };
      default:
        return { current: 0, total: 1, label: "" };
    }
  };

  const progress = getPhaseProgress();
  const progressPct = Math.min(100, Math.round((progress.current / progress.total) * 100));

  // CTA for current phase
  const getPhaseAction = () => {
    switch (phase.number) {
      case 1:
        return { href: "/espejo", label: "Ir a La Pirámide / Espejo" };
      case 2:
        return { href: "/arbol", label: "Ir a El Árbol" };
      case 3:
        return { href: "/rutas", label: "Ver tu ruta" };
      case 4:
        return { href: "/maestro", label: "Ir al Maestro" };
      case 5:
        return { href: "/dashboard", label: "Ver La Brújula" };
      default:
        return { href: "/dashboard", label: "Ir al panel" };
    }
  };

  const action = getPhaseAction();

  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden transition-all ${
        isLocked
          ? "border-borde/40 opacity-60"
          : isCurrent
          ? "border-naranja/30 shadow-sm"
          : "border-borde"
      }`}
    >
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 sm:p-5 text-left"
      >
        {/* Phase number circle */}
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            isCompleted
              ? "bg-naranja text-white"
              : isCurrent
              ? "bg-naranja/10 text-naranja border-2 border-naranja"
              : "bg-borde/20 text-muted/40 border-2 border-borde/40"
          }`}
        >
          {isCompleted ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            phase.number
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base">{phase.icon}</span>
            <h3
              className={`font-heading text-base sm:text-lg ${
                isLocked ? "text-muted/50" : "text-negro"
              }`}
            >
              Fase {phase.number}: {phase.name}
            </h3>
            {isCompleted && (
              <span className="text-[10px] bg-naranja/10 text-naranja px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                Completada
              </span>
            )}
            {isCurrent && (
              <span className="text-[10px] bg-naranja text-white px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                Ahora
              </span>
            )}
            {isLocked && (
              <span className="text-[10px] bg-borde/20 text-muted/50 px-2 py-0.5 rounded-full font-semibold">
                🔒
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${isLocked ? "text-muted/30" : "text-muted"}`}>
            {phase.tagline}
          </p>
        </div>

        {/* Progress mini */}
        {(isCompleted || isCurrent) && (
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <div className="w-20 h-1.5 bg-borde/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-naranja rounded-full transition-all"
                style={{ width: `${isCompleted ? 100 : progressPct}%` }}
              />
            </div>
            <span className="text-[10px] text-muted font-medium w-8 text-right">
              {isCompleted ? "100" : progressPct}%
            </span>
          </div>
        )}

        {/* Expand arrow */}
        <svg
          className={`w-4 h-4 text-muted/40 transition-transform flex-shrink-0 ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-borde/30">
          <div className="pt-4">
            <p className={`text-sm leading-relaxed ${isLocked ? "text-muted/40" : "text-negro/70"}`}>
              {phase.description}
            </p>
          </div>

          {/* Tools in this phase */}
          <div>
            <p className="text-[10px] font-semibold text-muted/60 uppercase tracking-widest mb-2">
              Herramientas
            </p>
            <div className="flex flex-wrap gap-2">
              {phase.tools.map((tool) => (
                <span
                  key={tool}
                  className={`text-xs px-2.5 py-1 rounded-lg ${
                    isLocked
                      ? "bg-borde/10 text-muted/30"
                      : "bg-crema text-negro/70 border border-borde/40"
                  }`}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Progress bar (for current/completed) */}
          {(isCompleted || isCurrent) && progress.total > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold text-muted/60 uppercase tracking-widest">
                  Progreso
                </p>
                <span className="text-xs text-muted">
                  {progress.current}/{progress.total} {progress.label}
                </span>
              </div>
              <div className="w-full h-2 bg-borde/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-naranja rounded-full transition-all duration-500"
                  style={{ width: `${isCompleted ? 100 : progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Unlock condition (for locked phases) */}
          {isLocked && (
            <div className="bg-crema/50 border border-borde/30 rounded-xl p-3">
              <p className="text-xs text-muted/60">
                <span className="font-semibold">Para desbloquear:</span>{" "}
                {phase.unlockCondition}
              </p>
            </div>
          )}

          {/* Phase started date */}
          {journey.phase_started_at?.[String(phase.number)] && (
            <p className="text-[10px] text-muted/40">
              Iniciada:{" "}
              {new Date(journey.phase_started_at[String(phase.number)]!).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}

          {/* Diagnostic profile (phase 2-3) */}
          {phase.number === 2 && journey.perfil_diagnostico && (
            <div className="bg-crema border border-borde/40 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-naranja uppercase tracking-widest mb-2">
                  Tu diagnóstico
                </p>
                <p className="text-sm text-negro font-medium">
                  Perfil {journey.perfil_diagnostico}
                  {journey.diagnostico_coherencia?.score != null && (
                    <span className="text-muted ml-2">
                      — Score: {journey.diagnostico_coherencia.score}/100
                    </span>
                  )}
                </p>
              </div>

              {/* Fortalezas */}
              {journey.diagnostico_coherencia?.fortalezas && journey.diagnostico_coherencia.fortalezas.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-green-700 uppercase tracking-widest mb-1.5">
                    Fortalezas
                  </p>
                  <div className="space-y-1">
                    {journey.diagnostico_coherencia.fortalezas.map((f, i) => (
                      <p key={i} className="text-xs text-negro/70">
                        ✓ {f}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Grietas */}
              {journey.diagnostico_coherencia?.grietas && journey.diagnostico_coherencia.grietas.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-orange-700 uppercase tracking-widest mb-1.5">
                    Áreas a trabajar
                  </p>
                  <div className="space-y-1">
                    {journey.diagnostico_coherencia.grietas.map((g, i) => (
                      <p key={i} className="text-xs text-negro/70">
                        ⚠ {g}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Re-diagnose button */}
              <button
                onClick={onRediagnose}
                disabled={rediagnoseLoading}
                className="w-full mt-2 px-3 py-2 text-xs font-medium bg-naranja text-white rounded-lg hover:bg-naranja/90 disabled:opacity-50 transition-colors"
              >
                {rediagnoseLoading ? "Re-diagnosticando..." : "Re-diagnosticar"}
              </button>
            </div>
          )}

          {/* Route info (phase 3) */}
          {phase.number === 3 && journey.ruta_asignada && (
            <div
              className="rounded-xl p-4 space-y-3"
              style={{
                background: RUTA_CONFIG[journey.ruta_asignada].color + "08",
                border: `1px solid ${RUTA_CONFIG[journey.ruta_asignada].color}20`,
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{RUTA_CONFIG[journey.ruta_asignada].icon}</span>
                  <span
                    className="font-heading text-base font-semibold"
                    style={{ color: RUTA_CONFIG[journey.ruta_asignada].color }}
                  >
                    {RUTA_CONFIG[journey.ruta_asignada].name}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  {RUTA_CONFIG[journey.ruta_asignada].tagline}
                </p>
              </div>

              {/* Progress bar */}
              {journey.ruta_modulos && journey.ruta_modulos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-semibold text-muted/60 uppercase tracking-widest">
                      Progreso
                    </p>
                    <span className="text-xs text-muted font-medium">
                      {journey.ruta_modulos.filter((m) => m.completado).length}/{journey.ruta_modulos.length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-borde/20 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round((journey.ruta_modulos.filter((m) => m.completado).length / journey.ruta_modulos.length) * 100)}%`,
                        backgroundColor: RUTA_CONFIG[journey.ruta_asignada].color,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Route modules */}
              {journey.ruta_modulos && journey.ruta_modulos.length > 0 && (
                <div className="space-y-2 mt-3">
                  {journey.ruta_modulos.map((mod, i) => {
                    const isNextModule = !mod.completado && !journey.ruta_modulos.slice(0, i).some((m) => !m.completado);
                    const isLoading = loadingModules.has(mod.id);
                    return (
                      <button
                        key={mod.id}
                        onClick={() => onModuleToggle(mod.id)}
                        disabled={isLoading}
                        className={`w-full flex items-start gap-3 rounded-lg p-2.5 border transition-all ${
                          mod.completado
                            ? "bg-green-50/50 border-green-200/40 hover:bg-green-100/50"
                            : isNextModule
                            ? "bg-naranja/5 border-naranja/30 hover:bg-naranja/10 ring-1 ring-naranja/20"
                            : "bg-white/50 border-borde/20 hover:bg-white/70"
                        } disabled:opacity-50`}
                      >
                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0 mt-0.5 transition-all ${
                          mod.completado
                            ? "bg-green-500 text-white"
                            : isNextModule
                            ? "bg-naranja text-white"
                            : "bg-borde/30 text-muted"
                        }`}>
                          {isLoading ? "..." : mod.completado ? "✓" : i + 1}
                        </span>
                        <div className="min-w-0 text-left flex-1">
                          <p className={`text-sm font-medium ${mod.completado ? "text-green-800 line-through" : isNextModule ? "text-naranja font-semibold" : "text-negro"}`}>
                            {mod.nombre}
                          </p>
                          <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                            {mod.descripcion}
                          </p>
                          {mod.completado && mod.fecha_completado && (
                            <p className="text-[10px] text-green-700 mt-1">
                              Completada {new Date(mod.fecha_completado).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Completion celebration */}
              {journey.ruta_modulos && journey.ruta_modulos.every((m) => m.completado) && (
                <div className="bg-green-50 border border-green-200/50 rounded-lg p-3 text-center">
                  <p className="text-sm font-semibold text-green-800">
                    🎉 ¡Ruta completada!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Has avanzado a la Fase 4: Ejecuta
                  </p>
                </div>
              )}
            </div>
          )}

          {/* CTA for current phase */}
          {isCurrent && (
            <Link
              href={action.href}
              className="inline-flex items-center gap-2 bg-negro text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-negro/90 transition-colors"
            >
              {action.label}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
