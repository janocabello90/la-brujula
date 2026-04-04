"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { STEPS, ANGLES, CHANNELS, OBJECTIVES } from "@/lib/constants";
import type { BrujulaState, BuyerData, Pilar } from "@/lib/types";
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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Form state
  const [briefing, setBriefing] = useState(initialData?.briefing || DEFAULT_STATE.briefing);
  // Support multiple buyers — migrate legacy single buyer to array
  const [buyers, setBuyers] = useState<BuyerData[]>(() => {
    if (initialData?.buyers && initialData.buyers.length > 0) return initialData.buyers;
    if (initialData?.buyer && initialData.buyer.nombre) return [initialData.buyer];
    return [{ nombre: '', edad: '', profesion: '', queQuiere: '', queLeFrena: '', queConsumo: '', dondeEsta: '', lenguaje: '' }];
  });
  const [empathy, setEmpathy] = useState(initialData?.empathy || DEFAULT_STATE.empathy);
  const [insight, setInsight] = useState(initialData?.insight || DEFAULT_STATE.insight);
  const [tree, setTree] = useState(initialData?.tree || DEFAULT_STATE.tree);
  const [channels, setChannels] = useState(initialData?.channels || DEFAULT_STATE.channels);
  const [apiKey, setApiKey] = useState(initialData?.apiKey || "");

  const currentStep = STEPS[step];

  // Auto-save with debounce (saves without advancing)
  const autoSave = useCallback(async () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaveStatus('saving');
      const supabase = createClient();

      const payload = {
        user_id: userId,
        briefing,
        buyer: buyers[0] || DEFAULT_STATE.buyer,
        buyers,
        empathy,
        insight,
        tree,
        channels,
        updated_at: new Date().toISOString(),
      };

      await supabase.from("brujula_data").upsert(payload, { onConflict: "user_id" });

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1500);
  }, [briefing, buyers, empathy, insight, tree, channels, userId]);

  const saveAndNext = useCallback(async () => {
    // Clear any pending auto-save timeout
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setSaveStatus('idle');

    setSaving(true);
    const supabase = createClient();

    // Save current step data — save first buyer as legacy `buyer` + full array as `buyers`
    const payload = {
      user_id: userId,
      briefing,
      buyer: buyers[0] || DEFAULT_STATE.buyer,
      buyers,
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
  }, [step, briefing, buyers, empathy, insight, tree, channels, apiKey, userId, router]);

  // --- PILLAR MANAGEMENT ---
  const addPilar = () => {
    setTree((prev) => ({
      pilares: [...prev.pilares, { nombre: "", subtemas: [], angulos: [], titulares: [] }],
    }));
    autoSave();
  };

  const removePilar = (i: number) => {
    setTree((prev) => ({
      pilares: prev.pilares.filter((_, idx) => idx !== i),
    }));
    autoSave();
  };

  const updatePilar = (i: number, field: keyof Pilar, value: any) => {
    setTree((prev) => {
      const copy = [...prev.pilares];
      copy[i] = { ...copy[i], [field]: value };
      return { pilares: copy };
    });
    autoSave();
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
    autoSave();
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
    autoSave();
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
    autoSave();
  };

  const addTitular = (pilarIdx: number, titular: string) => {
    if (!titular.trim()) return;
    setTree((prev) => {
      const copy = [...prev.pilares];
      copy[pilarIdx] = {
        ...copy[pilarIdx],
        titulares: [...(copy[pilarIdx].titulares || []), titular.trim()],
      };
      return { pilares: copy };
    });
    autoSave();
  };

  const removeTitular = (pilarIdx: number, titIdx: number) => {
    setTree((prev) => {
      const copy = [...prev.pilares];
      copy[pilarIdx] = {
        ...copy[pilarIdx],
        titulares: (copy[pilarIdx].titulares || []).filter((_, i) => i !== titIdx),
      };
      return { pilares: copy };
    });
    autoSave();
  };

  // --- CHANNEL/OBJECTIVE TOGGLES ---
  const toggleCanal = (canal: string) => {
    setChannels((prev) => ({
      ...prev,
      canales: prev.canales.includes(canal)
        ? prev.canales.filter((c) => c !== canal)
        : [...prev.canales, canal],
    }));
    autoSave();
  };

  const toggleObjetivo = (obj: string) => {
    setChannels((prev) => ({
      ...prev,
      objetivosPrincipales: prev.objetivosPrincipales.includes(obj)
        ? prev.objetivosPrincipales.filter((o) => o !== obj)
        : [...prev.objetivosPrincipales, obj],
    }));
    autoSave();
  };

  // --- RENDER STEPS ---
  const renderStepContent = () => {
    switch (currentStep.id) {
      case "briefing":
        return (
          <>
            <TextInput
              label="Tema raíz"
              value={briefing.temaRaiz}
              onChange={(v) => {
                setBriefing({ ...briefing, temaRaiz: v });
                autoSave();
              }}
              placeholder="Ej: Marca personal para profesionales"
            />
            <TextInput
              label="Propuesta de valor"
              value={briefing.propuestaValor}
              onChange={(v) => {
                setBriefing({ ...briefing, propuestaValor: v });
                autoSave();
              }}
              placeholder="¿Qué transformación ofreces?"
              textarea
            />
            <TextInput
              label="Etiqueta profesional"
              value={briefing.etiquetaProfesional}
              onChange={(v) => {
                setBriefing({ ...briefing, etiquetaProfesional: v });
                autoSave();
              }}
              placeholder="Ej: Consultor de marca personal"
            />
            <TextInput
              label="¿Por qué tú?"
              value={briefing.porQueTu}
              onChange={(v) => {
                setBriefing({ ...briefing, porQueTu: v });
                autoSave();
              }}
              placeholder="¿Qué te hace diferente?"
              textarea
            />
          </>
        );

      case "buyer":
        return (
          <div>
            {buyers.map((b, i) => {
              const updateBuyer = (field: keyof BuyerData, value: string) => {
                setBuyers((prev) => {
                  const copy = [...prev];
                  copy[i] = { ...copy[i], [field]: value };
                  return copy;
                });
                autoSave();
              };
              const isComplete = b.nombre && b.profesion && b.queQuiere;
              const isLast = i === buyers.length - 1;

              return (
                <div key={i} className="mb-6">
                  {/* Buyer header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-primary">
                      Persona {i + 1}{b.nombre ? ` — ${b.nombre}` : ""}
                    </span>
                    {buyers.length > 1 && (
                      <button
                        onClick={() => {
                          setBuyers((prev) => prev.filter((_, idx) => idx !== i));
                          autoSave();
                        }}
                        className="text-danger text-xs hover:underline"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>

                  <div className="surface-card rounded-2xl signature-shadow p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <TextInput label="Nombre (ficticio)" value={b.nombre} onChange={(v) => updateBuyer("nombre", v)} placeholder={i === 0 ? "Ej: Laura" : i === 1 ? "Ej: Carlos" : "Ej: Ana"} />
                      <TextInput label="Edad" value={b.edad} onChange={(v) => updateBuyer("edad", v)} placeholder="Ej: 32 años" />
                      <TextInput label="Profesión" value={b.profesion} onChange={(v) => updateBuyer("profesion", v)} placeholder={i === 0 ? "Ej: Fisioterapeuta" : i === 1 ? "Ej: Consultor freelance" : "Ej: Profesora de yoga"} />
                    </div>
                    <TextInput label="¿Qué quiere lograr?" value={b.queQuiere} onChange={(v) => updateBuyer("queQuiere", v)} textarea placeholder="Su objetivo principal" />
                    <TextInput label="¿Qué le frena?" value={b.queLeFrena} onChange={(v) => updateBuyer("queLeFrena", v)} textarea placeholder="Sus miedos y bloqueos" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <TextInput label="¿Qué consume?" value={b.queConsumo} onChange={(v) => updateBuyer("queConsumo", v)} placeholder="Podcasts, newsletters..." />
                      <TextInput label="¿Dónde está?" value={b.dondeEsta} onChange={(v) => updateBuyer("dondeEsta", v)} placeholder="Instagram, LinkedIn..." />
                      <TextInput label="¿Cómo habla?" value={b.lenguaje} onChange={(v) => updateBuyer("lenguaje", v)} placeholder="Informal, técnico..." />
                    </div>
                  </div>

                  {/* Add more prompt — only after last completed buyer */}
                  {isLast && isComplete && buyers.length < 5 && (
                    <div className="mt-4 p-4 surface-low rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-on-surface">
                          ¿Quieres añadir otro buyer persona?
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Puedes definir hasta 5 perfiles diferentes. Así la IA entiende que tu audiencia es diversa.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setBuyers((prev) => [
                            ...prev,
                            { nombre: "", edad: "", profesion: "", queQuiere: "", queLeFrena: "", queConsumo: "", dondeEsta: "", lenguaje: "" },
                          ]);
                          autoSave();
                        }}
                        className="px-4 py-2 gradient-denim text-white text-sm font-medium rounded-lg shadow-button hover:opacity-90 transition-opacity flex-shrink-0"
                      >
                        + Añadir persona
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );

      case "empathy":
        return (
          <>
            <TextInput
              label="¿Qué ve?"
              value={empathy.queVe}
              onChange={(v) => {
                setEmpathy({ ...empathy, queVe: v });
                autoSave();
              }}
              textarea
              placeholder="¿Qué ve en su entorno, en redes, en su sector?"
            />
            <TextInput
              label="¿Qué oye?"
              value={empathy.queOye}
              onChange={(v) => {
                setEmpathy({ ...empathy, queOye: v });
                autoSave();
              }}
              textarea
              placeholder="¿Qué le dicen amigos, jefes, la sociedad?"
            />
            <TextInput
              label="¿Qué dice y hace?"
              value={empathy.queDiceHace}
              onChange={(v) => {
                setEmpathy({ ...empathy, queDiceHace: v });
                autoSave();
              }}
              textarea
              placeholder="Su comportamiento público"
            />
            <TextInput
              label="¿Qué piensa y siente?"
              value={empathy.quePiensaSiente}
              onChange={(v) => {
                setEmpathy({ ...empathy, quePiensaSiente: v });
                autoSave();
              }}
              textarea
              placeholder="Lo que no dice pero le da vueltas"
            />
            <TextInput
              label="Dolores / Frustraciones"
              value={empathy.dolores}
              onChange={(v) => {
                setEmpathy({ ...empathy, dolores: v });
                autoSave();
              }}
              textarea
              placeholder="Lo que le quita el sueño"
            />
            <TextInput
              label="Deseos / Aspiraciones"
              value={empathy.deseos}
              onChange={(v) => {
                setEmpathy({ ...empathy, deseos: v });
                autoSave();
              }}
              textarea
              placeholder="Lo que le haría feliz"
            />
          </>
        );

      case "insight":
        return (
          <>
            <TextInput
              label="El Insight"
              value={insight.insight}
              onChange={(v) => {
                setInsight({ ...insight, insight: v });
                autoSave();
              }}
              textarea
              placeholder="La verdad oculta que conecta lo que ofreces con lo que necesitan. Ej: 'No necesitan más seguidores, necesitan sentir que lo que dicen importa.'"
            />
            <TextInput
              label="La frase de tu audiencia"
              value={insight.fraseAudiencia}
              onChange={(v) => {
                setInsight({ ...insight, fraseAudiencia: v });
                autoSave();
              }}
              placeholder="Lo que dirían en una charla de café. Ej: 'Es que yo tengo mucho que contar pero no sé cómo.'"
            />
          </>
        );

      case "tree":
        return (
          <div>
            <p className="text-sm text-on-surface-variant mb-4">
              Define entre 3 y 5 pilares. Cada pilar es un gran tema del que hablas. Dentro de cada uno, añade subtemas concretos y, si quieres, ejemplos de titulares que te inspiren.
            </p>
            {tree.pilares.map((pilar, i) => (
              <div key={i} className="surface-card rounded-2xl signature-shadow p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-primary">Pilar {i + 1}</span>
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
                  placeholder="Ej: Marca Personal, Filosofía, Negocios Digitales..."
                  className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-lg text-on-surface placeholder:text-on-surface-variant/70 focus:ring-2 focus:ring-primary/10 transition-colors mb-3"
                />

                {/* Subtemas */}
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Subtemas <span className="text-on-surface-variant/70">— los temas específicos dentro de este pilar</span>
                </label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {pilar.subtemas.map((sub, j) => (
                    <span key={j} className="subtema-tag">
                      {sub}
                      <button onClick={() => removeSubtema(i, j)} className="text-muted hover:text-danger ml-1">×</button>
                    </span>
                  ))}
                </div>
                <SubtemaInput onAdd={(v) => addSubtema(i, v)} placeholder={
                  i === 0 ? "Ej: briefing, valores, identidad, estrategia... (Enter para añadir)" :
                  i === 1 ? "Ej: estoicismo, lecturas, atención, pensamiento crítico... (Enter)" :
                  "Escribe un subtema y pulsa Enter"
                } />

                {/* Titulares (opcional) */}
                <div className="mt-3">
                  <label className="block text-xs font-medium text-muted mb-1">
                    Titulares de ejemplo <span className="text-muted-light">— opcional, ayuda a la IA a entender tu estilo</span>
                  </label>
                  {(pilar.titulares || []).length > 0 && (
                    <div className="space-y-1 mb-2">
                      {(pilar.titulares || []).map((tit, j) => (
                        <div key={j} className="flex items-start gap-2 text-sm text-negro bg-crema rounded-lg px-3 py-2">
                          <span className="flex-1">{tit}</span>
                          <button onClick={() => removeTitular(i, j)} className="text-muted hover:text-danger text-xs mt-0.5">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <TitularInput onAdd={(v) => addTitular(i, v)} placeholder={
                    i === 0 ? 'Ej: "Tardé 8 años en entender cuáles eran mis valores" (Enter)' :
                    i === 1 ? 'Ej: "La mayor mentira del siglo XXI: más información = pensar mejor" (Enter)' :
                    'Escribe un titular de ejemplo y pulsa Enter (opcional)'
                  } />
                </div>
              </div>
            ))}

            {tree.pilares.length < 5 && (
              <button
                onClick={addPilar}
                className="w-full py-2.5 border-2 border-dashed border-surface-mid rounded-lg text-on-surface-variant text-sm hover:border-primary hover:text-primary transition-colors"
              >
                + Añadir pilar
              </button>
            )}
          </div>
        );

      case "channels":
        return (
          <>
            <label className="block text-sm font-medium text-on-surface mb-2">¿Dónde publicas?</label>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {CHANNELS.map((ch) => (
                <div
                  key={ch}
                  onClick={() => toggleCanal(ch)}
                  className={`checkbox-item ${channels.canales.includes(ch) ? "checked" : ""}`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                      channels.canales.includes(ch) ? "bg-primary border-primary" : "border-surface-mid"
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

            <label className="block text-sm font-medium text-on-surface mb-2">¿Cuáles son tus objetivos principales?</label>
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
            <div className="border-t border-surface-mid pt-6 mt-4">
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                API Key de Anthropic <span className="text-on-surface-variant text-xs">(opcional — la puedes poner después desde Ajustes)</span>
              </label>

              <div className="surface-card rounded-lg p-4 mb-4 text-sm text-on-surface leading-relaxed signature-shadow">
                <p className="font-semibold mb-2">¿Qué es esto y por qué la necesitas?</p>
                <p className="mb-2">
                  El Maestro usa Claude (la IA de Anthropic) para generar tus ideas de contenido. Para que funcione, necesitas tu propia API Key — es como una llave personal que conecta La Brújula con la IA.
                </p>
                <p className="font-semibold mb-2">¿Cómo conseguirla?</p>
                <ol className="list-decimal list-inside space-y-1 mb-2">
                  <li>Ve a <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80">console.anthropic.com</a> y crea una cuenta</li>
                  <li>En <strong>Settings → API Keys</strong>, pulsa <strong>&quot;Create Key&quot;</strong></li>
                  <li>Copia la key (empieza por <code className="bg-surface-low px-1 rounded">sk-ant-...</code>) y pégala aquí abajo</li>
                </ol>
                <p className="font-semibold mb-2">💳 Sobre el coste</p>
                <p className="mb-1">
                  Anthropic funciona con créditos de prepago. Necesitarás añadir saldo en <strong>Settings → Billing</strong> dentro de la consola. Con <strong>5 $</strong> tienes para cientos de ideas generadas — cada petición cuesta menos de 0,01 $.
                </p>
                <p className="text-on-surface-variant text-xs">
                  Tu key es privada y solo se usa para conectar tu cuenta con la IA. Nunca la compartimos ni la usamos para otra cosa.
                </p>
              </div>

              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  autoSave();
                }}
                placeholder="sk-ant-..."
                className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-on-surface placeholder:text-on-surface-variant/70 focus:ring-2 focus:ring-primary/10 transition-colors font-mono text-sm"
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-surface-mid z-50">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-12 pb-24">
        {/* Step header */}
        <div className="mb-8">
          <span className="text-xs font-semibold text-primary tracking-wide uppercase">
            {currentStep.label}
          </span>
          <h1 className="font-headline text-3xl text-on-surface mt-1 mb-2">
            {currentStep.title}
          </h1>
          <p className="text-on-surface-variant text-sm">{currentStep.desc}</p>
        </div>

        {/* Step content */}
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-6 py-2.5 rounded-lg border border-surface-mid text-on-surface-variant hover:border-on-surface hover:text-on-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>

          <div className="flex items-center gap-3">
            {/* Auto-save status indicator */}
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} />
                Guardando...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                ✓ Guardado
              </span>
            )}
          </div>

          <button
            onClick={saveAndNext}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg gradient-denim text-white font-medium shadow-button hover:opacity-90 transition-opacity disabled:opacity-50"
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
      <label className="block text-sm font-medium text-on-surface mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-on-surface placeholder:text-on-surface-variant/70 focus:ring-2 focus:ring-primary/10 transition-colors resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-on-surface placeholder:text-on-surface-variant/70 focus:ring-2 focus:ring-primary/10 transition-colors"
        />
      )}
    </div>
  );
}

// Subtema input with Enter key
function SubtemaInput({ onAdd, placeholder }: { onAdd: (v: string) => void; placeholder?: string }) {
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
      placeholder={placeholder || "Escribe un subtema y pulsa Enter"}
      className="w-full px-3 py-2 bg-surface-container-low border-none rounded-lg text-on-surface text-sm placeholder:text-on-surface-variant/70 focus:ring-2 focus:ring-primary/10 transition-colors"
    />
  );
}

// Titular input with Enter key
function TitularInput({ onAdd, placeholder }: { onAdd: (v: string) => void; placeholder?: string }) {
  const [value, setValue] = useState("");

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (value.trim()) {
            onAdd(value);
            setValue("");
          }
        }
      }}
      placeholder={placeholder || "Escribe un titular de ejemplo y pulsa Enter (opcional)"}
      className="w-full px-3 py-2 bg-surface-container-low border-none rounded-lg text-on-surface text-sm placeholder:text-on-surface-variant/70 focus:ring-2 focus:ring-primary/10 transition-colors"
    />
  );
}
