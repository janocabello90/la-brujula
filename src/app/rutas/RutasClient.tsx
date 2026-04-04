"use client";

import { useState } from "react";
import Link from "next/link";
import { PHASES, RUTA_CONFIG, type UserJourney, type PhaseConfig, type GeneratedStrategy } from "@/lib/types";

interface RutasClientProps {
  journey: UserJourney;
  arbolCompleted: number;
  arbolTotal: number;
  hasBriefing: boolean;
  hasBuyer: boolean;
  hasInsight: boolean;
  hasTree: boolean;
  piramideData?: any;
  arbolData?: any;
  brujulaData?: any;
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

  // Strategy generation state
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [generatingStrategyId, setGeneratingStrategyId] = useState<string | null>(null);
  const [strategies, setStrategies] = useState<Record<string, GeneratedStrategy>>({});
  const [strategyError, setStrategyError] = useState<string | null>(null);

  const currentPhase = journey.current_phase;

  // Calculate progress for phase 1
  const phase1Items = [hasBriefing, hasBuyer, hasInsight, hasTree];
  const phase1Progress = phase1Items.filter(Boolean).length;
  const phase1Total = phase1Items.length;

  // Handle generating strategy for a module
  const handleGenerateStrategy = async (moduleId: string) => {
    if (strategies[moduleId]) {
      // Already generated, just toggle expand
      setExpandedModuleId(expandedModuleId === moduleId ? null : moduleId);
      return;
    }

    try {
      setGeneratingStrategyId(moduleId);
      setStrategyError(null);

      const res = await fetch("/api/rutas/generate-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: journey.user_id,
          moduleId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        setStrategyError(error.error || "Error al generar la estrategia");
        return;
      }

      const data = await res.json();
      setStrategies((prev) => ({ ...prev, [moduleId]: data.strategy }));
      setExpandedModuleId(moduleId);
    } catch (err: any) {
      console.error("Strategy generation error:", err);
      setStrategyError("Error al conectar con el servidor");
    } finally {
      setGeneratingStrategyId(null);
    }
  };

  // Handle module completion
  const handleCompleteModule = async (moduleId: string) => {
    const moduleItem = journey.ruta_modulos?.find((m) => m.id === moduleId);
    if (!moduleItem) return;

    try {
      setLoadingModules((prev) => new Set(prev).add(moduleId));

      const res = await fetch("/api/rutas/complete-module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: journey.user_id,
          moduleId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
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
      setStrategies({});
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
        <h1 className="font-headline text-2xl sm:text-3xl text-on-surface tracking-tight">
          Las Rutas
        </h1>
        <p className="text-on-surface-variant text-sm mt-1 max-w-xl">
          Tu camino personalizado de marca personal. De lo que no se ve a lo que el mundo percibe. De pensar a hacer.
        </p>
      </div>

      {/* Current phase indicator */}
      <div className="bg-white border border-outline rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-lg">
            {PHASES[currentPhase - 1]?.icon}
          </div>
          <div>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-widest">
              Fase actual
            </p>
            <h2 className="font-headline text-lg text-on-surface">
              Fase {currentPhase}: {PHASES[currentPhase - 1]?.name}
            </h2>
          </div>
        </div>
        <p className="text-sm text-on-surface-variant italic">
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
      <div className="bg-white border border-outline rounded-2xl p-5">
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
                        ? "bg-primary-container text-white"
                        : isCurrent
                        ? "bg-primary-container/10 text-primary border-2 border-naranja"
                        : "bg-borde/30 text-on-surface-variant/40 border-2 border-outline/50"
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
                      isCompleted || isCurrent ? "text-on-surface" : "text-on-surface-variant/40"
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
                        ? "bg-primary-container"
                        : currentPhase > phase.number
                        ? "bg-primary-container/30"
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
            onCompleteModule={handleCompleteModule}
            loadingModules={loadingModules}
            onGenerateStrategy={handleGenerateStrategy}
            expandedModuleId={expandedModuleId}
            generatingStrategyId={generatingStrategyId}
            strategies={strategies}
            onRediagnose={handleRediagnose}
            rediagnoseLoading={rediagnoseLoading}
            strategyError={strategyError}
          />
        ))}
      </div>

      {/* Philosophy note */}
      <div className="bg-primary-container/[0.04] border border-naranja/10 rounded-2xl p-5">
        <p className="text-sm text-on-surface/80 leading-relaxed italic">
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
  onCompleteModule: (moduleId: string) => Promise<void>;
  loadingModules: Set<string>;
  onGenerateStrategy: (moduleId: string) => Promise<void>;
  expandedModuleId: string | null;
  generatingStrategyId: string | null;
  strategies: Record<string, GeneratedStrategy>;
  onRediagnose: () => Promise<void>;
  rediagnoseLoading: boolean;
  strategyError: string | null;
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
  onCompleteModule,
  loadingModules,
  onGenerateStrategy,
  expandedModuleId,
  generatingStrategyId,
  strategies,
  onRediagnose,
  rediagnoseLoading,
  strategyError,
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
        return { current: modulosComplete, total: modulosTotal || 1, label: "módulos completados" };
      case 4:
        return { current: 0, total: 1, label: "fase próximamente" };
      case 5:
        return { current: 0, total: 1, label: "fase próximamente" };
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
        return { href: "#", label: "Ver tu ruta" };
      case 4:
        return { href: "#", label: "Próximamente" };
      case 5:
        return { href: "#", label: "Próximamente" };
      default:
        return { href: "/dashboard", label: "Ir al panel" };
    }
  };

  const action = getPhaseAction();

  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden transition-all ${
        isLocked
          ? "border-outline/40 opacity-60"
          : isCurrent
          ? "border-naranja/30 shadow-sm"
          : "border-outline"
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
              ? "bg-primary-container text-white"
              : isCurrent
              ? "bg-primary-container/10 text-primary border-2 border-naranja"
              : "bg-borde/20 text-on-surface-variant/40 border-2 border-outline/40"
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
              className={`font-headline text-base sm:text-lg ${
                isLocked ? "text-on-surface-variant/50" : "text-on-surface"
              }`}
            >
              Fase {phase.number}: {phase.name}
            </h3>
            {isCompleted && (
              <span className="text-[10px] bg-primary-container/10 text-primary px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                Completada
              </span>
            )}
            {isCurrent && (
              <span className="text-[10px] bg-primary-container text-white px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                Ahora
              </span>
            )}
            {isLocked && (
              <span className="text-[10px] bg-borde/20 text-on-surface-variant/50 px-2 py-0.5 rounded-full font-semibold">
                🔒
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${isLocked ? "text-on-surface-variant/30" : "text-on-surface-variant"}`}>
            {phase.tagline}
          </p>
        </div>

        {/* Progress mini */}
        {(isCompleted || isCurrent) && (
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <div className="w-20 h-1.5 bg-borde/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-container rounded-full transition-all"
                style={{ width: `${isCompleted ? 100 : progressPct}%` }}
              />
            </div>
            <span className="text-[10px] text-on-surface-variant font-medium w-8 text-right">
              {isCompleted ? "100" : progressPct}%
            </span>
          </div>
        )}

        {/* Expand arrow */}
        <svg
          className={`w-4 h-4 text-on-surface-variant/40 transition-transform flex-shrink-0 ${
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
        <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-outline/30">
          <div className="pt-4">
            <p className={`text-sm leading-relaxed ${isLocked ? "text-on-surface-variant/40" : "text-on-surface/70"}`}>
              {phase.description}
            </p>
          </div>

          {/* Tools in this phase */}
          <div>
            <p className="text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-2">
              Herramientas
            </p>
            <div className="flex flex-wrap gap-2">
              {phase.tools.map((tool) => (
                <span
                  key={tool}
                  className={`text-xs px-2.5 py-1 rounded-lg ${
                    isLocked
                      ? "bg-borde/10 text-on-surface-variant/30"
                      : "bg-surface text-on-surface/70 border border-outline/40"
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
                <p className="text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-widest">
                  Progreso
                </p>
                <span className="text-xs text-on-surface-variant">
                  {progress.current}/{progress.total} {progress.label}
                </span>
              </div>
              <div className="w-full h-2 bg-borde/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-container rounded-full transition-all duration-500"
                  style={{ width: `${isCompleted ? 100 : progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Unlock condition (for locked phases) */}
          {isLocked && (
            <div className="bg-surface/50 border border-outline/30 rounded-xl p-3">
              <p className="text-xs text-on-surface-variant/60">
                <span className="font-semibold">Para desbloquear:</span>{" "}
                {phase.unlockCondition}
              </p>
            </div>
          )}

          {/* Phase 3 - Ruta Modulos with Strategy Generation */}
          {phase.number === 3 && journey.ruta_asignada && (
            <RutaModulesSection
              journey={journey}
              onGenerateStrategy={onGenerateStrategy}
              expandedModuleId={expandedModuleId}
              generatingStrategyId={generatingStrategyId}
              strategies={strategies}
              onCompleteModule={onCompleteModule}
              loadingModules={loadingModules}
              strategyError={strategyError}
              onRediagnose={onRediagnose}
              rediagnoseLoading={rediagnoseLoading}
            />
          )}

          {/* Phase 4 & 5 - Coming Soon */}
          {(phase.number === 4 || phase.number === 5) && (
            <div
              className="rounded-xl p-6 text-center space-y-4"
              style={{
                background: "#f5f5f5",
                border: "2px dashed #bbb",
              }}
            >
              <div className="text-4xl">🔒</div>
              <div>
                <p className="font-headline text-lg text-on-surface mb-2">Próximamente</p>
                <p className="text-sm text-on-surface-variant">
                  {phase.number === 4
                    ? "Ejecución — Pon tu estrategia en marcha con El Maestro y El Planificador"
                    : "Evolución — Mide tu progreso y ajusta tu marca con El Espejo"}
                </p>
              </div>
              <p className="text-xs text-on-surface-variant/60 italic">
                Desbloquea completando la Fase {phase.number - 1}
              </p>
            </div>
          )}

          {/* Diagnostic info (phase 2-3) */}
          {phase.number === 2 && journey.perfil_diagnostico && (
            <DiagnosticSection
              journey={journey}
              onRediagnose={onRediagnose}
              rediagnoseLoading={rediagnoseLoading}
            />
          )}

          {/* CTA */}
          {isCurrent && phase.number !== 4 && phase.number !== 5 && (
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

// ─── Ruta Modules Section ───

interface RutaModulesSectionProps {
  journey: UserJourney;
  onGenerateStrategy: (moduleId: string) => Promise<void>;
  expandedModuleId: string | null;
  generatingStrategyId: string | null;
  strategies: Record<string, GeneratedStrategy>;
  onCompleteModule: (moduleId: string) => Promise<void>;
  loadingModules: Set<string>;
  strategyError: string | null;
  onRediagnose: () => Promise<void>;
  rediagnoseLoading: boolean;
}

function RutaModulesSection({
  journey,
  onGenerateStrategy,
  expandedModuleId,
  generatingStrategyId,
  strategies,
  onCompleteModule,
  loadingModules,
  strategyError,
  onRediagnose,
  rediagnoseLoading,
}: RutaModulesSectionProps) {
  if (!journey.ruta_asignada || !journey.ruta_modulos?.length) return null;

  const ruta = RUTA_CONFIG[journey.ruta_asignada];

  return (
    <div
      className="rounded-xl p-4 space-y-4"
      style={{
        background: ruta.color + "08",
        border: `1px solid ${ruta.color}20`,
      }}
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{ruta.icon}</span>
          <span
            className="font-headline text-base font-semibold"
            style={{ color: ruta.color }}
          >
            {ruta.name}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant">
          {ruta.tagline}
        </p>
      </div>

      {/* Progress bar */}
      {journey.ruta_modulos && journey.ruta_modulos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-widest">
              Progreso
            </p>
            <span className="text-xs text-on-surface-variant font-medium">
              {journey.ruta_modulos.filter((m) => m.completado).length}/{journey.ruta_modulos.length}
            </span>
          </div>
          <div className="w-full h-2 bg-borde/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.round((journey.ruta_modulos.filter((m) => m.completado).length / journey.ruta_modulos.length) * 100)}%`,
                backgroundColor: ruta.color,
              }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {strategyError && (
        <div className="bg-red-50 border border-red-200/50 rounded-lg p-3">
          <p className="text-xs text-red-700">{strategyError}</p>
        </div>
      )}

      {/* Modules list */}
      {journey.ruta_modulos && journey.ruta_modulos.length > 0 && (
        <div className="space-y-2">
          {journey.ruta_modulos.map((mod, i) => {
            const isNextModule =
              !mod.completado &&
              !journey.ruta_modulos!.slice(0, i).some((m) => !m.completado);
            const isLoading = loadingModules.has(mod.id);
            const isGenerating = generatingStrategyId === mod.id;
            const isExpanded = expandedModuleId === mod.id;
            const strategy = strategies[mod.id];

            return (
              <div key={mod.id} className="space-y-2">
                {/* Module card */}
                <button
                  onClick={() => onGenerateStrategy(mod.id)}
                  disabled={isLoading || mod.completado}
                  className={`w-full flex items-start gap-3 rounded-lg p-3 border transition-all ${
                    mod.completado
                      ? "bg-green-50/50 border-green-200/40 cursor-default"
                      : isNextModule
                      ? "bg-primary-container/5 border-naranja/30 hover:bg-primary-container/10 ring-1 ring-naranja/20"
                      : "bg-white/50 border-outline/20 hover:bg-white/70"
                  } disabled:opacity-50`}
                >
                  <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0 mt-0.5 transition-all ${
                    mod.completado
                      ? "bg-green-500 text-white"
                      : isNextModule
                      ? "bg-primary-container text-white"
                      : "bg-borde/30 text-on-surface-variant"
                  }`}>
                    {isGenerating ? "⟳" : mod.completado ? "✓" : i + 1}
                  </span>
                  <div className="min-w-0 text-left flex-1">
                    <p className={`text-sm font-medium ${
                      mod.completado
                        ? "text-green-800 line-through"
                        : isNextModule
                        ? "text-primary font-semibold"
                        : "text-on-surface"
                    }`}>
                      {mod.nombre}
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                      {mod.descripcion}
                    </p>
                    {mod.completado && mod.fecha_completado && (
                      <p className="text-[10px] text-green-700 mt-1">
                        Completada {new Date(mod.fecha_completado).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    )}
                  </div>
                </button>

                {/* Strategy display */}
                {isExpanded && strategy && !mod.completado && (
                  <div className="bg-white border border-outline/50 rounded-lg p-4 space-y-4">
                    {/* Insight */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-primary uppercase tracking-widest">
                        Insight Estratégico
                      </p>
                      <p className="text-sm text-on-surface/80 leading-relaxed">
                        {strategy.insight}
                      </p>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-semibold text-on-surface/60 uppercase tracking-widest">
                        Tus 3 Tareas
                      </p>
                      {strategy.tareas.map((tarea, idx) => (
                        <div
                          key={idx}
                          className="bg-surface/50 border border-outline/30 rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-xl flex-shrink-0">
                              {idx === 0 ? "1️⃣" : idx === 1 ? "2️⃣" : "3️⃣"}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-on-surface">
                                {tarea.titulo}
                              </p>
                              <p className="text-xs text-on-surface/70 mt-1">
                                {tarea.descripcion}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            <Link
                              href={tarea.link}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-negro text-white text-xs font-medium rounded-lg hover:bg-negro/90 transition-colors"
                            >
                              {tarea.herramienta}
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </Link>
                          </div>
                          <p className="text-[10px] text-on-surface-variant italic pt-1">
                            {tarea.accion}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Reflexion */}
                    <div className="bg-primary-container/5 border border-naranja/20 rounded-lg p-3 space-y-1">
                      <p className="text-[10px] font-semibold text-primary uppercase tracking-widest">
                        Para Reflexionar
                      </p>
                      <p className="text-sm text-on-surface/70 italic">
                        {strategy.reflexion}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => onCompleteModule(mod.id)}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? "Actualizando..." : "Marcar Completado"}
                      </button>
                      <button
                        onClick={() => onGenerateStrategy(mod.id)}
                        className="flex-1 px-4 py-2 bg-borde/20 text-on-surface text-sm font-medium rounded-lg hover:bg-borde/30 transition-colors"
                      >
                        Regenerar
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

      {/* Re-diagnose button */}
      <button
        onClick={onRediagnose}
        disabled={rediagnoseLoading}
        className="w-full px-3 py-2 text-xs font-medium bg-primary-container/10 text-primary rounded-lg hover:bg-primary-container/20 disabled:opacity-50 transition-colors border border-naranja/20"
      >
        {rediagnoseLoading ? "Re-diagnosticando..." : "Re-diagnosticar"}
      </button>
    </div>
  );
}

// ─── Diagnostic Section ───

interface DiagnosticSectionProps {
  journey: UserJourney;
  onRediagnose: () => Promise<void>;
  rediagnoseLoading: boolean;
}

function DiagnosticSection({
  journey,
  onRediagnose,
  rediagnoseLoading,
}: DiagnosticSectionProps) {
  return (
    <div className="bg-surface border border-outline/40 rounded-xl p-4 space-y-3">
      <div>
        <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2">
          Tu diagnóstico
        </p>
        <p className="text-sm text-on-surface font-medium">
          Perfil {journey.perfil_diagnostico}
          {journey.diagnostico_coherencia?.score != null && (
            <span className="text-on-surface-variant ml-2">
              — Score: {journey.diagnostico_coherencia.score}/100
            </span>
          )}
        </p>
      </div>

      {/* Fortalezas */}
      {journey.diagnostico_coherencia?.fortalezas &&
        journey.diagnostico_coherencia.fortalezas.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-green-700 uppercase tracking-widest mb-1.5">
              Fortalezas
            </p>
            <div className="space-y-1">
              {journey.diagnostico_coherencia.fortalezas.map((f, i) => (
                <p key={i} className="text-xs text-on-surface/70">
                  ✓ {f}
                </p>
              ))}
            </div>
          </div>
        )}

      {/* Grietas */}
      {journey.diagnostico_coherencia?.grietas &&
        journey.diagnostico_coherencia.grietas.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-orange-700 uppercase tracking-widest mb-1.5">
              Áreas a trabajar
            </p>
            <div className="space-y-1">
              {journey.diagnostico_coherencia.grietas.map((g, i) => (
                <p key={i} className="text-xs text-on-surface/70">
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
        className="w-full mt-2 px-3 py-2 text-xs font-medium bg-primary-container text-white rounded-lg hover:bg-primary-container/90 disabled:opacity-50 transition-colors"
      >
        {rediagnoseLoading ? "Re-diagnosticando..." : "Re-diagnosticar"}
      </button>
    </div>
  );
}
