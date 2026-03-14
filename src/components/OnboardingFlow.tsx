"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { STEPS, ANGLES, CHANNELS, OBJECTIVES } from "@/lib/constants";
import type { BrujulaState, Pilar } from "@/lib/types";
import { DEFAULT_STATE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
  initialData?: Partial<BrujulaState>;
}

export default function OnboardingFlow({ userId, initialData }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [briefing, setBriefing] = useState(initialData?.briefing || DEFAULT_STATE.briefing);
  const [buyer, setBuyer] = useState(initialData?.buyer || DEFAULT_STATE.buyer);
  const [empathy, setEmpathy] = useState(initialData?.empathy || DEFAULT_STATE.empathy);
  const [insight, setInsight] = useState(initialData?.insight || DEFAULT_STATE.insight);
  const [tree, setTree] = useState(initialData?.tree || DEFAULT_STATE.tree);
  const [channels, setChannels] = useState(initialData?.channels || DEFAULT_STATE.channels);
  const [apiKey, setApiKey] = useState(initialData?.apiKey || "");

  const currentStep = STEPS[step];

  const saveAndNext = useCallback(async () => {
    setSaving(true);
    const supabase = createClient();

    // Save current step data
    const payload = {
      user_id: userId,
      briefing,
      buyer,
      empathy,
      insight,
      tree,
      channels,
      updated_at: new Date().toISOString(),
    };

    await supabase.from("brujula_data").upsert(payload, { onConflict: "user_id" });

    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Last step — save API key and mark onboarding complete
      if (apiKey) {
        await supabase.from("profiles").update({ api_key: apiKey }).eq("id", userId);
      }
      await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", userId);
      router.push("/dashboard");
    }
    setSaving(false);
  }, [step, briefing, buyer, empathy, insight, tree, channels, apiKey, userId, router]);

  // --- PILLAR MANAGEMENT ---
  const addPilar = () => {
    setTree((prev) => ({
      pilares: [...prev.pilares, { nombre: "", subtemas: [], angulos: [] }],
    }));
  };

  const removePilar = (i: number) => {
    setTree((prev) => ({
      pilares: prev.pilares.filter((_, idx) => idx !== i),
    }));
  };

  const updatePilar = (i: number, field: keyof Pilar, value: any) => {
    setTree((prev) => {
      const copy = [...prev.pilares];
      copy[i] = { ...copy[i], [field]: value };
      return { pilares: copy };
    });
  };

  const addSubtema = (pilarIdx: number, subtema: string) => {
    if (!subtema.trim()) return;
    setTree((prev) => {
      const copy = [...prev.pilares];
      copy[pilarIdx] = {
        ...copy[pilarIdx],
        subtemas: [...copy[pilarIdx].subtemas, subtema.trim()],
      };
      return { pilares: copy };
    });
  };

  const removeSubtema = (pilarIdx: number, subIdx: number) => {
    setTree((prev) => {
      const copy = [...prev.pilares];
      copy[pilarIdx] = {
        ...copy[pilarIdx],
        subtemas: copy[pilarIdx].subtemas.filter((_, i) => i !== subIdx),
      };
      return { pilares: copy };
    });
  };

  const toggleAngulo = (pilarIdx: number, angulo: string) => {
    setTree((prev) => {
      const copy = [...prev.pilares];
      const current = copy[pilarIdx].angulos;
      copy[pilarIdx] = {
        ...copy[pilarIdx],
        angulos: current.includes(angulo)
          ? current.filter((a) => a !== angulo)
          : [...current, angulo],
      };
      return { pilares: copy };
    });
  };

  // --- CHANNEL/OBJECTIVE TOGGLES ---
  const toggleCanal = (canal: string) => {
    setChannels((prev) => ({
      ...prev,
      canales: prev.canales.includes(canal)
        ? prev.canales.filter((c) => c !== canal)
        : [...prev.canales, canal],
    }));
  };

  const toggleObjetivo = (obj: string) => {
    setChannels((prev) => ({
      ...prev,
      objetivosPrincipales: prev.objetivosPrincipales.includes(obj)
        ? prev.objetivosPrincipales.filter((o) => o !== obj)
        : [...prev.objetivosPrincipales, obj],
    }));
  };

  // --- RENDER STEPS ---
  const renderStepContent = () => {
    switch (currentStep.id) {
      case "briefing":
        return (
          <>
            <TextInput label="Tema raíz" value={briefing.temaRaiz} onChange={(v) => setBriefing({ ...briefing, temaRaiz: v })} placeholder="Ej: Marca personal para profesionales" />
            <TextInput label="Propuesta de valor" value={briefing.propuestaValor} onChange={(v) => setBriefing({ ...briefing, propuestaValor: v })} placeholder="¿Qué transformación ofreces?" textarea />
            <TextInput label="Etiqueta profesional" value={briefing.etiquetaProfesional} onChange={(v) => setBriefing({ ...briefing, etiquetaProfesional: v })} placeholder="Ej: Consultor de marca personal" />
            <TextInput label="¿Por qué tú?" value={briefing.porQueTu} onChange={(v) => setBriefing({ ...briefing, porQueTu: v })} placeholder="¿Qué te hace diferente?" textarea />
          </>
        );

      case "buyer":
        return (
          <>
            <TextInput label="Nombre (ficticio)" value={buyer.nombre} onChange={(v) => setBuyer({ ...buyer, nombre: v })} placeholder="Ej: Laura" />
            <TextInput label="Edad" value={buyer.edad} onChange={(v) => setBuyer({ ...buyer, edad: v })} placeholder="Ej: 32 años" />
            <TextInput label="Profesión" value={buyer.profesion} onChange={(v) => setBuyer({ ...buyer, profesion: v })} placeholder="Ej: Freelance de diseño" />
            <TextInput label="¿Qué quiere lograr?" value={buyer.queQuiere} onChange={(v) => setBuyer({ ...buyer, queQuiere: v })} textarea placeholder="Su objetivo principal" />
            <TextInput label="¿Qué le frena?" value={buyer.queLeFrena} onChange={(v) => setBuyer({ ...buyer, queLeFrena: v })} textarea placeholder="Sus miedos y bloqueos" />
            <TextInput label="¿Qué contenido consume?" value={buyer.queConsumo} onChange={(v) => setBuyer({ ...buyer, queConsumo: v })} placeholder="Podcasts, newsletters, cuentas..." />
            <TextInput label="¿Dónde está?" value={buyer.dondeEsta} onChange={(v) => setBuyer({ ...buyer, dondeEsta: v })} placeholder="Instagram, LinkedIn, YouTube..." />
            <TextInput label="¿Cómo habla?" value={buyer.lenguaje} onChange={(v) => setBuyer({ ...buyer, lenguaje: v })} placeholder="Informal, técnico, aspiracional..." />
          </>
        );

      case "empathy":
        return (
          <>
            <TextInput label="¿Qué ve?" value={empathy.queVe} onChange={(v) => setEmpathy({ ...empathy, queVe: v })} textarea placeholder="¿Qué ve en su entorno, en redes, en su sector?" />
            <TextInput label="¿Qué oye?" value={empathy.queOye} onChange={(v) => setEmpathy({ ...empathy, queOye: v })} textarea placeholder="¿Qué le dicen amigos, jefes, la sociedad?" />
            <TextInput label="¿Qué dice y hace?" value={empathy.queDiceHace} onChange={(v) => setEmpathy({ ...empathy, queDiceHace: v })} textarea placeholder="Su comportamiento público" />
            <TextInput label="¿Qué piensa y siente?" value={empathy.quePiensaSiente} onChange={(v) => setEmpathy({ ...empathy, quePiensaSiente: v })} textarea placeholder="Lo que no dice pero le da vueltas" />
            <TextInput label="Dolores / Frustraciones" value={empathy.dolores} onChange={(v) => setEmpathy({ ...empathy, dolores: v })} textarea placeholder="Lo que le quita el sueño" />
            <TextInput label="Deseos / Aspiraciones" value={empathy.deseos} onChange={(v) => setEmpathy({ ...empathy, deseos: v })} textarea placeholder="Lo que le haría feliz" />
          </>
        );

      case "insight":
        return (
          <>
            <TextInput
              label="El Insight"
              value={insight.insight}
              onChange={(v) => setInsight({ ...insight, insight: v })}
              textarea
              placeholder="La verdad oculta que conecta lo que ofreces con lo que necesitan. Ej: 'No necesitan más seguidores, necesitan sentir que lo que dicen importa.'"
            />
            <TextInput
              label="La frase de tu audiencia"
              value={insight.fraseAudiencia}
              onChange={(v) => setInsight({ ...insight, fraseAudiencia: v })}
              placeholder="Lo que dirían en una charla de café. Ej: 'Es que yo tengo mucho que contar pero no sé cómo.'"
            />
          </>
        );

      case "tree":
        return (
          <div>
            {tree.pilares.map((pilar, i) => (
              <div key={i} className="bg-card border border-borde rounded-card p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-naranja">Pilar {i + 1}</span>
                  {tree.pilares.length > 1 && (
                    <button onClick={() => removePilar(i)} className="text-danger text-xs hover:underline">
                      Eliminar
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={pilar.nombre}
                  onChange={(e) => updatePilar(i, "nombre", e.target.value)}
                  placeholder="Nombre del pilar"
                  className="w-full px-4 py-2.5 border border-borde rounded-lg bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-naranja transition-colors mb-3"
                />

                {/* Subtemas */}
                <label className="block text-xs font-medium text-muted mb-1">Subtemas</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {pilar.subtemas.map((sub, j) => (
                    <span key={j} className="subtema-tag">
                      {sub}
                      <button onClick={() => removeSubtema(i, j)} className="text-muted hover:text-danger ml-1">×</button>
                    </span>
                  ))}
                </div>
                <SubtemaInput onAdd={(v) => addSubtema(i, v)} />

                {/* Ángulos */}
                <label className="block text-xs font-medium text-muted mt-3 mb-1">Ángulos</label>
                <div className="flex flex-wrap gap-1.5">
                  {ANGLES.map((ang) => (
                    <button
                      key={ang}
                      onClick={() => toggleAngulo(i, ang)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        pilar.angulos.includes(ang)
                          ? "border-naranja bg-naranja/10 text-naranja"
                          : "border-borde text-muted hover:border-naranja"
                      }`}
                    >
                      {ang}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {tree.pilares.length < 5 && (
              <button
                onClick={addPilar}
                className="w-full py-2.5 border-2 border-dashed border-borde rounded-lg text-muted text-sm hover:border-naranja hover:text-naranja transition-colors"
              >
                + Añadir pilar
              </button>
            )}
          </div>
        );

      case "channels":
        return (
          <>
            <label className="block text-sm font-medium text-negro mb-2">¿Dónde publicas?</label>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {CHANNELS.map((ch) => (
                <div
                  key={ch}
                  onClick={() => toggleCanal(ch)}
                  className={`checkbox-item ${channels.canales.includes(ch) ? "checked" : ""}`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                      channels.canales.includes(ch) ? "bg-naranja border-naranja" : "border-borde"
                    }`}
                  >
                    {channels.canales.includes(ch) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {ch}
                </div>
              ))}
            </div>

            <label className="block text-sm font-medium text-negro mb-2">¿Cuáles son tus objetivos principales?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
              {OBJECTIVES.map((obj) => (
                <div
                  key={obj.value}
                  onClick={() => toggleObjetivo(obj.value)}
                  className={`checkbox-item ${channels.objetivosPrincipales.includes(obj.value) ? "checked" : ""}`}
                >
                  <span>{obj.icon}</span>
                  {obj.label}
                </div>
              ))}
            </div>

            {/* API Key */}
            <div className="border-t border-borde pt-6 mt-4">
              <label className="block text-sm font-medium text-negro mb-1.5">
                API Key de Anthropic <span className="text-muted text-xs">(opcional — la puedes poner después)</span>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-4 py-3 border border-borde rounded-lg bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-naranja transition-colors font-mono text-sm"
              />
              <p className="text-xs text-muted mt-1.5">
                Necesaria para activar el Maestro. La guardamos cifrada en tu cuenta.
              </p>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-crema">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-borde z-50">
        <div
          className="h-full bg-naranja transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-12 pb-24">
        {/* Step header */}
        <div className="mb-8">
          <span className="text-xs font-semibold text-naranja tracking-wide uppercase">
            {currentStep.label}
          </span>
          <h1 className="font-heading text-3xl text-negro mt-1 mb-2">
            {currentStep.title}
          </h1>
          <p className="text-muted text-sm">{currentStep.desc}</p>
        </div>

        {/* Step content */}
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-6 py-2.5 rounded-lg border border-borde text-muted hover:border-negro hover:text-negro transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          <button
            onClick={saveAndNext}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-naranja text-white font-medium hover:bg-naranja-hover transition-colors disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> Guardando...
              </span>
            ) : step === STEPS.length - 1 ? (
              "Completar ✓"
            ) : (
              "Siguiente →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- INPUT HELPER (outside main component to avoid re-mount on every render) ---
function TextInput({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-negro mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-3 border border-borde rounded-lg bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-naranja transition-colors resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-borde rounded-lg bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-naranja transition-colors"
        />
      )}
    </div>
  );
}

// Subtema input with Enter key
function SubtemaInput({ onAdd }: { onAdd: (v: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onAdd(value);
          setValue("");
        }
      }}
      placeholder="Escribe un subtema y pulsa Enter"
      className="w-full px-3 py-2 border border-borde rounded-lg bg-crema text-negro text-sm placeholder:text-muted-light focus:outline-none focus:border-naranja transition-colors"
    />
  );
}
