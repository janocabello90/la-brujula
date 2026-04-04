"use client";

import { useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  PIRAMIDE_STEPS,
  type PiramideData,
  type PiramideStep,
  type PiramideStepConfig,
  type PiramideExercise,
  type PiramideField,
} from "@/lib/types";

interface Props {
  initialData: PiramideData;
  userId: string;
  isAdmin?: boolean;
}

export default function PiramideClient({ initialData, userId, isAdmin = false }: Props) {
  const [data, setData] = useState<PiramideData>(initialData);
  const [activeStep, setActiveStep] = useState<PiramideStep>(initialData.current_step);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const activeConfig = PIRAMIDE_STEPS.find((s) => s.id === activeStep)!;
  const activeIndex = PIRAMIDE_STEPS.findIndex((s) => s.id === activeStep);
  const isCompleted = data.steps_completed?.includes(activeStep);

  // Check if a step is unlocked (admin sees everything, users unlock sequentially)
  const isStepUnlocked = (stepId: PiramideStep): boolean => {
    if (isAdmin) return true;
    const stepIndex = PIRAMIDE_STEPS.findIndex((s) => s.id === stepId);
    if (stepIndex === 0) return true; // First step always unlocked
    // A step is unlocked if the previous step is completed
    const prevStep = PIRAMIDE_STEPS[stepIndex - 1];
    return data.steps_completed?.includes(prevStep.id) || false;
  };

  // Is the active step locked?
  const isActiveLocked = !isStepUnlocked(activeStep);

  // Get the data object for the current step
  const getStepData = (step: PiramideStep): Record<string, string> => {
    const val = data[step as keyof PiramideData];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      return val as unknown as Record<string, string>;
    }
    return {};
  };

  // Check if step has meaningful content
  const hasContent = (step: PiramideStep): boolean => {
    const stepData = getStepData(step);
    return Object.values(stepData).some(
      (v) => typeof v === "string" && v.trim().length > 10
    );
  };

  // Count filled fields in a step
  const countFilledFields = (step: PiramideStep): { filled: number; total: number } => {
    const config = PIRAMIDE_STEPS.find((s) => s.id === step)!;
    const stepData = getStepData(step);
    const total = config.fields.length;
    const filled = config.fields.filter(
      (f) => stepData[f.key]?.trim().length > 5
    ).length;
    return { filled, total };
  };

  // Auto-save with debounce
  const autoSave = useCallback(
    async (updatedData: PiramideData) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        setSaving(true);
        const { error } = await supabase
          .from("piramide_data")
          .update({
            [activeStep]: updatedData[activeStep as keyof PiramideData],
            current_step: updatedData.current_step,
            steps_completed: updatedData.steps_completed,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        setSaving(false);
        if (!error) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      }, 1500);
    },
    [activeStep, userId, supabase]
  );

  // Handle field change
  const handleFieldChange = (key: string, value: string) => {
    const currentStepData = getStepData(activeStep);
    const updated = {
      ...data,
      [activeStep]: {
        ...currentStepData,
        [key]: value,
      },
    };
    setData(updated as PiramideData);
    autoSave(updated as PiramideData);
  };

  // Complete current step and move to next
  const completeStep = async () => {
    const newCompleted = data.steps_completed?.includes(activeStep)
      ? data.steps_completed
      : [...(data.steps_completed || []), activeStep];

    const nextIndex = activeIndex + 1;
    const nextStep =
      nextIndex < PIRAMIDE_STEPS.length
        ? PIRAMIDE_STEPS[nextIndex].id
        : "completada";

    const updated = {
      ...data,
      steps_completed: newCompleted,
      current_step: nextStep as PiramideStep,
    };

    setSaving(true);
    const updatePayload: Record<string, any> = {
      steps_completed: newCompleted,
      current_step: nextStep,
      [activeStep]: data[activeStep as keyof PiramideData],
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from("piramide_data")
      .update(updatePayload)
      .eq("user_id", userId);

    setSaving(false);
    setData(updated as PiramideData);

    if (nextIndex < PIRAMIDE_STEPS.length) {
      setActiveStep(PIRAMIDE_STEPS[nextIndex].id);
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Navigate to a step (respects locking)
  const goToStep = (step: PiramideStep) => {
    if (!isStepUnlocked(step)) return;
    setActiveStep(step);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Current step stats
  const stepData = getStepData(activeStep);
  const { filled: filledFields, total: totalFields } = countFilledFields(activeStep);

  // Prepare sections
  const preparacionSteps = PIRAMIDE_STEPS.filter((s) => s.level === "preparacion");
  const piramideSteps = PIRAMIDE_STEPS.filter((s) => s.level === "piramide");

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-0 -mx-3 sm:-mx-6 -my-4 sm:-my-8 min-h-[calc(100vh-56px)] lg:min-h-screen">
      {/* ─── Sidebar: Steps navigation ─── */}
      <div className="lg:w-[280px] xl:w-[320px] flex-shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-outline lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <div className="p-4 lg:p-5">
          {/* Title */}
          <div className="mb-5">
            <h2 className="font-headline text-lg text-on-surface">La Pirámide</h2>
            <p className="text-[10px] text-on-surface-variant mt-0.5">
              {data.steps_completed?.length || 0}/{PIRAMIDE_STEPS.length} pasos completados
            </p>
            {/* Overall progress */}
            <div className="w-full h-1.5 bg-borde/20 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-primary-container rounded-full transition-all duration-500"
                style={{
                  width: `${((data.steps_completed?.length || 0) / PIRAMIDE_STEPS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Preparación section */}
          <p className="text-[10px] font-semibold text-on-surface-variant/50 uppercase tracking-widest mb-2">
            Preparación
          </p>
          <div className="space-y-0.5 mb-4">
            {preparacionSteps.map((step) => (
              <StepNavItem
                key={step.id}
                step={step}
                isActive={activeStep === step.id}
                isCompleted={data.steps_completed?.includes(step.id)}
                isLocked={!isStepUnlocked(step.id)}
                hasContent={hasContent(step.id)}
                stats={countFilledFields(step.id)}
                onClick={() => goToStep(step.id)}
              />
            ))}
          </div>

          {/* Pirámide section */}
          <p className="text-[10px] font-semibold text-on-surface-variant/50 uppercase tracking-widest mb-2">
            La Pirámide
          </p>

          {/* Visual pyramid */}
          <div className="mb-3 flex flex-col items-center gap-0.5">
            {[...piramideSteps].reverse().map((step, i) => {
              const isStepComplete = data.steps_completed?.includes(step.id);
              const isStepActive = activeStep === step.id;
              const locked = !isStepUnlocked(step.id);
              const widths = ["w-16", "w-24", "w-32", "w-40", "w-48"];
              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  disabled={locked}
                  className={`${widths[i]} h-7 rounded-sm flex items-center justify-center text-[10px] font-medium transition-all ${
                    locked
                      ? "bg-borde/10 text-on-surface-variant/20 cursor-not-allowed"
                      : isStepActive
                      ? "bg-primary-container text-white"
                      : isStepComplete
                      ? "bg-primary-container/20 text-primary"
                      : "bg-borde/15 text-on-surface-variant/40 hover:bg-borde/25"
                  }`}
                  title={locked ? `Completa ${PIRAMIDE_STEPS[PIRAMIDE_STEPS.findIndex(s => s.id === step.id) - 1]?.label || 'el paso anterior'} para desbloquear` : step.title}
                >
                  {locked ? "🔒" : step.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-0.5">
            {piramideSteps.map((step) => (
              <StepNavItem
                key={step.id}
                step={step}
                isActive={activeStep === step.id}
                isCompleted={data.steps_completed?.includes(step.id)}
                isLocked={!isStepUnlocked(step.id)}
                hasContent={hasContent(step.id)}
                stats={countFilledFields(step.id)}
                onClick={() => goToStep(step.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Main content ─── */}
      <div ref={contentRef} className="flex-1 overflow-y-auto lg:h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
          {/* Step header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{activeConfig.icon}</span>
              {activeConfig.level === "piramide" && (
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary-container/10 px-2 py-0.5 rounded-full">
                  {activeConfig.label}
                </span>
              )}
              {activeConfig.level === "preparacion" && (
                <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest bg-borde/10 px-2 py-0.5 rounded-full">
                  Preparación
                </span>
              )}
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl text-on-surface tracking-tight">
              {activeConfig.title}
            </h1>
            <p className="text-sm text-on-surface-variant italic mt-1">
              &ldquo;{activeConfig.tagline}&rdquo;
            </p>
          </div>

          {/* Intro text */}
          <div className="bg-surface/60 border border-outline rounded-2xl p-5 mb-8">
            <p className="text-sm text-on-surface/70 leading-relaxed">
              {activeConfig.intro}
            </p>
          </div>

          {/* Locked state */}
          {isActiveLocked ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="font-headline text-xl text-on-surface mb-2">Este paso aún no está desbloqueado</h2>
              <p className="text-sm text-on-surface-variant/60 max-w-md mx-auto mb-6">
                Completa <strong>&ldquo;{PIRAMIDE_STEPS[activeIndex - 1]?.label}&rdquo;</strong> para desbloquear este paso.
                Cada nivel se construye sobre el anterior — sin prisas, con profundidad.
              </p>
              <button
                onClick={() => goToStep(PIRAMIDE_STEPS[activeIndex - 1]?.id || 'prologo')}
                className="inline-flex items-center gap-2 text-sm font-medium bg-negro text-white px-5 py-2.5 rounded-xl hover:bg-negro/90 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Ir a {PIRAMIDE_STEPS[activeIndex - 1]?.label}
              </button>
            </div>
          ) : (
            <>
              {/* Exercises */}
              <div className="space-y-10">
                {activeConfig.exercises.map((exercise, exIdx) => (
                  <ExerciseBlock
                    key={exIdx}
                    exercise={exercise}
                    stepData={stepData}
                    onFieldChange={handleFieldChange}
                    exerciseNumber={activeConfig.exercises.length > 1 ? exIdx + 1 : undefined}
                  />
                ))}
              </div>
            </>
          )}

          {/* Footer: Save status + Complete button */}
          {!isActiveLocked && (
          <div className="mt-10 pt-6 border-t border-outline flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant/50">
              {saving && (
                <>
                  <div className="w-3 h-3 rounded-full border-2 border-naranja/30 border-t-naranja animate-spin" />
                  Guardando...
                </>
              )}
              {saved && !saving && (
                <>
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Guardado
                </>
              )}
              {!saving && !saved && (
                <span>
                  {filledFields}/{totalFields} campos completados
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Previous */}
              {activeIndex > 0 && (
                <button
                  onClick={() => goToStep(PIRAMIDE_STEPS[activeIndex - 1].id)}
                  className="text-xs text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>
              )}

              {/* Complete & Continue */}
              <button
                onClick={completeStep}
                disabled={filledFields === 0}
                className={`inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl transition-all ${
                  filledFields === 0
                    ? "bg-borde/20 text-on-surface-variant/40 cursor-not-allowed"
                    : isCompleted
                    ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                    : "bg-negro text-white hover:bg-negro/90"
                }`}
              >
                {isCompleted ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {activeIndex < PIRAMIDE_STEPS.length - 1 ? "Completado — Siguiente" : "Pirámide completada"}
                  </>
                ) : activeIndex < PIRAMIDE_STEPS.length - 1 ? (
                  <>
                    Completar y continuar
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                ) : (
                  <>
                    Completar La Pirámide
                    <span>🏔️</span>
                  </>
                )}
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Exercise Block ───

function ExerciseBlock({
  exercise,
  stepData,
  onFieldChange,
  exerciseNumber,
}: {
  exercise: PiramideExercise;
  stepData: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
  exerciseNumber?: number;
}) {
  const isTable = exercise.layout === "table";
  const isObjectives = exercise.layout === "objectives";

  return (
    <div className="border border-outline rounded-2xl overflow-hidden">
      {/* Exercise header */}
      <div className="bg-surface/40 px-5 py-4 border-b border-outline">
        <h3 className="font-headline text-base text-on-surface">
          {exercise.title}
        </h3>
        {exercise.description && (
          <p className="text-xs text-on-surface/60 leading-relaxed mt-1.5">
            {exercise.description}
          </p>
        )}
        {exercise.theoryLink && (
          <a
            href={exercise.theoryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 mt-2 font-medium"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Ver teoría en la comunidad
          </a>
        )}
      </div>

      {/* Fields */}
      <div className="p-5">
        {isObjectives ? (
          <ObjectivesFields
            exercise={exercise}
            stepData={stepData}
            onFieldChange={onFieldChange}
          />
        ) : isTable ? (
          <TableFields
            exercise={exercise}
            stepData={stepData}
            onFieldChange={onFieldChange}
          />
        ) : (
          <div className="space-y-6">
            {exercise.fields.map((field) => (
              <FieldInput
                key={field.key}
                field={field}
                value={stepData[field.key] || ""}
                onChange={(v) => onFieldChange(field.key, v)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Table Fields (for objectives, metrics, etc.) ───

function TableFields({
  exercise,
  stepData,
  onFieldChange,
}: {
  exercise: PiramideExercise;
  stepData: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
}) {
  const headers = exercise.tableHeaders || [];
  const cols = headers.length;
  const rows: PiramideField[][] = [];

  // Group fields into rows of `cols` items
  for (let i = 0; i < exercise.fields.length; i += cols) {
    rows.push(exercise.fields.slice(i, i + cols));
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-wider pb-2 px-1"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className={rowIdx > 0 ? "border-t border-outline-variant/15" : ""}>
              {row.map((field, colIdx) => (
                <td key={field.key} className="py-1.5 px-1 align-top">
                  <input
                    type="text"
                    value={stepData[field.key] || ""}
                    onChange={(e) => onFieldChange(field.key, e.target.value)}
                    placeholder={field.placeholder || field.label}
                    className={`w-full rounded-lg border border-outline bg-white px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/25 focus:outline-none focus:ring-2 focus:ring-naranja/20 focus:border-naranja/40 transition-all ${
                      colIdx === 0 ? "font-medium" : ""
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Objectives Fields (hierarchical: 3 principales → secundarios → KPIs) ───

function ObjectivesFields({
  exercise,
  stepData,
  onFieldChange,
}: {
  exercise: PiramideExercise;
  stepData: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
}) {
  // Group fields into 3 objective blocks (7 fields each: principal + 3x(sec+kpi))
  const objectiveBlocks = [
    {
      emoji: "❤️",
      color: "border-red-200 bg-red-50/30",
      headerColor: "text-red-700 bg-red-100/60",
      prefix: "obj_pasional",
      label: "Objetivo pasional",
      sublabel: "Lo que te mueve por dentro",
    },
    {
      emoji: "⭐",
      color: "border-amber-200 bg-amber-50/30",
      headerColor: "text-amber-700 bg-amber-100/60",
      prefix: "obj_referencia",
      label: "Objetivo de referencia",
      sublabel: "Cómo quieres ser percibido",
    },
    {
      emoji: "💰",
      color: "border-green-200 bg-green-50/30",
      headerColor: "text-green-700 bg-green-100/60",
      prefix: "obj_economico",
      label: "Objetivo económico",
      sublabel: "La sostenibilidad de tu proyecto",
    },
  ];

  return (
    <div className="space-y-6">
      {objectiveBlocks.map((block) => {
        // Find the main field and secondary fields
        const mainField = exercise.fields.find((f) => f.key === block.prefix);
        const secFields = [1, 2, 3].map((n) => ({
          sec: exercise.fields.find((f) => f.key === `${block.prefix}_sec_${n}`),
          kpi: exercise.fields.find((f) => f.key === `${block.prefix}_sec_${n}_kpi`),
        }));

        return (
          <div key={block.prefix} className={`rounded-xl border ${block.color} overflow-hidden`}>
            {/* Block header */}
            <div className={`px-4 py-2.5 ${block.headerColor} border-b border-inherit`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{block.emoji}</span>
                <div>
                  <p className="text-sm font-semibold">{block.label}</p>
                  <p className="text-[10px] opacity-70">{block.sublabel}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Main objective */}
              {mainField && (
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">
                    {block.emoji} {block.label}
                  </label>
                  {mainField.hint && (
                    <p className="text-xs text-on-surface-variant/60 italic mb-1.5">{mainField.hint}</p>
                  )}
                  <textarea
                    value={stepData[mainField.key] || ""}
                    onChange={(e) => onFieldChange(mainField.key, e.target.value)}
                    placeholder={mainField.placeholder}
                    rows={3}
                    className="w-full rounded-xl border border-outline bg-white px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-naranja/20 focus:border-naranja/40 resize-y transition-all leading-relaxed"
                  />
                </div>
              )}

              {/* Secondary objectives with KPIs */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold text-on-surface-variant/50 uppercase tracking-widest">
                  Objetivos secundarios y KPIs
                </p>
                {secFields.map(({ sec, kpi }, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        value={stepData[sec?.key || ""] || ""}
                        onChange={(e) => sec && onFieldChange(sec.key, e.target.value)}
                        placeholder={sec?.placeholder || `Objetivo secundario ${idx + 1}${idx === 2 ? " (opcional)" : ""}`}
                        className="w-full rounded-lg border border-outline bg-white px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/25 focus:outline-none focus:ring-2 focus:ring-naranja/20 focus:border-naranja/40 transition-all"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-on-surface-variant/40 flex-shrink-0">KPI:</span>
                      <input
                        type="text"
                        value={stepData[kpi?.key || ""] || ""}
                        onChange={(e) => kpi && onFieldChange(kpi.key, e.target.value)}
                        placeholder={kpi?.placeholder || "Indicador medible"}
                        className="w-full rounded-lg border border-outline bg-white px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/25 focus:outline-none focus:ring-2 focus:ring-naranja/20 focus:border-naranja/40 transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Single Field Input ───

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: PiramideField;
  value: string;
  onChange: (v: string) => void;
}) {
  const fieldType = field.type || "textarea";

  return (
    <div>
      <label className="block text-sm font-semibold text-on-surface mb-1.5">
        {field.label}
      </label>
      {field.hint && (
        <p className="text-xs text-on-surface-variant/60 italic mb-2">
          {field.hint}
        </p>
      )}
      {fieldType === "short" ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-xl border border-outline bg-white px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-naranja/20 focus:border-naranja/40 transition-all"
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={5}
          className="w-full rounded-xl border border-outline bg-white px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-naranja/20 focus:border-naranja/40 resize-y transition-all leading-relaxed"
        />
      )}
      {value?.trim().length > 0 && (
        <p className="text-[10px] text-on-surface-variant/40 mt-1 text-right">
          {value.trim().length} caracteres
        </p>
      )}
    </div>
  );
}

// ─── Nav item for sidebar ───

function StepNavItem({
  step,
  isActive,
  isCompleted,
  isLocked,
  hasContent,
  stats,
  onClick,
}: {
  step: PiramideStepConfig;
  isActive: boolean;
  isCompleted?: boolean;
  isLocked?: boolean;
  hasContent: boolean;
  stats: { filled: number; total: number };
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-sm transition-all ${
        isLocked
          ? "text-on-surface-variant/20 cursor-not-allowed"
          : isActive
          ? "bg-primary-container/10 text-primary font-medium"
          : isCompleted
          ? "text-on-surface/70 hover:bg-negro/[0.03]"
          : hasContent
          ? "text-on-surface/50 hover:bg-negro/[0.03]"
          : "text-on-surface-variant/40 hover:bg-negro/[0.03]"
      }`}
    >
      <span className="text-sm flex-shrink-0">{isLocked ? "🔒" : step.icon}</span>
      <span className="flex-1 truncate">{step.label}</span>
      {isLocked ? null : isCompleted ? (
        <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : hasContent ? (
        <span className="text-[9px] text-on-surface-variant/40 flex-shrink-0">
          {stats.filled}/{stats.total}
        </span>
      ) : null}
    </button>
  );
}
