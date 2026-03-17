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
}

export default function PiramideClient({ initialData, userId }: Props) {
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

  // Navigate to a step
  const goToStep = (step: PiramideStep) => {
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
      <div className="lg:w-[280px] xl:w-[320px] flex-shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-borde/60 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <div className="p-4 lg:p-5">
          {/* Title */}
          <div className="mb-5">
            <h2 className="font-heading text-lg text-negro">La Pirámide</h2>
            <p className="text-[10px] text-muted mt-0.5">
              {data.steps_completed?.length || 0}/{PIRAMIDE_STEPS.length} pasos completados
            </p>
            {/* Overall progress */}
            <div className="w-full h-1.5 bg-borde/20 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-naranja rounded-full transition-all duration-500"
                style={{
                  width: `${((data.steps_completed?.length || 0) / PIRAMIDE_STEPS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Preparación section */}
          <p className="text-[10px] font-semibold text-muted/50 uppercase tracking-widest mb-2">
            Preparación
          </p>
          <div className="space-y-0.5 mb-4">
            {preparacionSteps.map((step) => (
              <StepNavItem
                key={step.id}
                step={step}
                isActive={activeStep === step.id}
                isCompleted={data.steps_completed?.includes(step.id)}
                hasContent={hasContent(step.id)}
                stats={countFilledFields(step.id)}
                onClick={() => goToStep(step.id)}
              />
            ))}
          </div>

          {/* Pirámide section */}
          <p className="text-[10px] font-semibold text-muted/50 uppercase tracking-widest mb-2">
            La Pirámide
          </p>

          {/* Visual pyramid */}
          <div className="mb-3 flex flex-col items-center gap-0.5">
            {[...piramideSteps].reverse().map((step, i) => {
              const isStepComplete = data.steps_completed?.includes(step.id);
              const isStepActive = activeStep === step.id;
              const widths = ["w-16", "w-24", "w-32", "w-40", "w-48"];
              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  className={`${widths[i]} h-7 rounded-sm flex items-center justify-center text-[10px] font-medium transition-all ${
                    isStepActive
                      ? "bg-naranja text-white"
                      : isStepComplete
                      ? "bg-naranja/20 text-naranja"
                      : "bg-borde/15 text-muted/40 hover:bg-borde/25"
                  }`}
                  title={step.title}
                >
                  {step.label}
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
                <span className="text-[10px] font-bold text-naranja uppercase tracking-widest bg-naranja/10 px-2 py-0.5 rounded-full">
                  {activeConfig.label}
                </span>
              )}
              {activeConfig.level === "preparacion" && (
                <span className="text-[10px] font-bold text-muted/50 uppercase tracking-widest bg-borde/10 px-2 py-0.5 rounded-full">
                  Preparación
                </span>
              )}
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl text-negro tracking-tight">
              {activeConfig.title}
            </h1>
            <p className="text-sm text-muted italic mt-1">
              &ldquo;{activeConfig.tagline}&rdquo;
            </p>
          </div>

          {/* Intro text */}
          <div className="bg-crema/60 border border-borde/30 rounded-2xl p-5 mb-8">
            <p className="text-sm text-negro/70 leading-relaxed">
              {activeConfig.intro}
            </p>
          </div>

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

          {/* Footer: Save status + Complete button */}
          <div className="mt-10 pt-6 border-t border-borde/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted/50">
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
                  className="text-xs text-muted hover:text-negro transition-colors flex items-center gap-1"
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
                    ? "bg-borde/20 text-muted/40 cursor-not-allowed"
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

  return (
    <div className="border border-borde/30 rounded-2xl overflow-hidden">
      {/* Exercise header */}
      <div className="bg-crema/40 px-5 py-4 border-b border-borde/20">
        <h3 className="font-heading text-base text-negro">
          {exercise.title}
        </h3>
        {exercise.description && (
          <p className="text-xs text-negro/60 leading-relaxed mt-1.5">
            {exercise.description}
          </p>
        )}
        {exercise.theoryLink && (
          <a
            href={exercise.theoryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-naranja hover:text-naranja/80 mt-2 font-medium"
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
        {isTable ? (
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
                className="text-left text-[10px] font-semibold text-muted/60 uppercase tracking-wider pb-2 px-1"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className={rowIdx > 0 ? "border-t border-borde/15" : ""}>
              {row.map((field, colIdx) => (
                <td key={field.key} className="py-1.5 px-1 align-top">
                  <input
                    type="text"
                    value={stepData[field.key] || ""}
                    onChange={(e) => onFieldChange(field.key, e.target.value)}
                    placeholder={field.placeholder || field.label}
                    className={`w-full rounded-lg border border-borde/40 bg-white px-3 py-2 text-sm text-negro placeholder:text-muted/25 focus:outline-none focus:ring-2 focus:ring-naranja/20 focus:border-naranja/40 transition-all ${
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
      <label className="block text-sm font-semibold text-negro mb-1.5">
        {field.label}
      </label>
      {field.hint && (
        <p className="text-xs text-muted/60 italic mb-2">
          {field.hint}
        </p>
      )}
      {fieldType === "short" ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-xl border border-borde/60 bg-white px-4 py-2.5 text-sm text-negro placeholder:text-muted/30 focus:outline-none focus:ring-2 focus:ring-naranja/20 focus:border-naranja/40 transition-all"
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={5}
          className="w-full rounded-xl border border-borde/60 bg-white px-4 py-3 text-sm text-negro placeholder:text-muted/30 focus:outline-none focus:ring-2 focus:ring-naranja/20 focus:border-naranja/40 resize-y transition-all leading-relaxed"
        />
      )}
      {value?.trim().length > 0 && (
        <p className="text-[10px] text-muted/40 mt-1 text-right">
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
  hasContent,
  stats,
  onClick,
}: {
  step: PiramideStepConfig;
  isActive: boolean;
  isCompleted?: boolean;
  hasContent: boolean;
  stats: { filled: number; total: number };
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-sm transition-all ${
        isActive
          ? "bg-naranja/10 text-naranja font-medium"
          : isCompleted
          ? "text-negro/70 hover:bg-negro/[0.03]"
          : hasContent
          ? "text-negro/50 hover:bg-negro/[0.03]"
          : "text-muted/40 hover:bg-negro/[0.03]"
      }`}
    >
      <span className="text-sm flex-shrink-0">{step.icon}</span>
      <span className="flex-1 truncate">{step.label}</span>
      {isCompleted && (
        <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {!isCompleted && hasContent && (
        <span className="text-[9px] text-muted/40 flex-shrink-0">
          {stats.filled}/{stats.total}
        </span>
      )}
    </button>
  );
}
