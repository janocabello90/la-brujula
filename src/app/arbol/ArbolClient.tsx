"use client";

import { useState, useCallback, useRef } from "react";
import AppShell from "@/components/AppShell";
import type { ArbolData, ArquetipoSeleccion } from "@/lib/types";
import { DEFAULT_ARBOL, RUTA_CONFIG } from "@/lib/types";
import type { RutaType, DiagnosticProfile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface DiagnosticResult {
  profile: DiagnosticProfile;
  ruta: RutaType;
  diagnostico: {
    score: number;
    grietas: string[];
    fortalezas: string[];
    sectionScores: { name: string; score: number; layer: string }[];
    layers: { foundation: number; core: number; expression: number; reach: number };
  };
  modulos: { id: string; nombre: string; descripcion: string; completado: boolean; fecha_completado: string | null }[];
  completedSections: number;
}

// ===== STEP DEFINITIONS =====
const ARBOL_STEPS = [
  {
    id: "semilla",
    icon: "🌱",
    title: "La Semilla",
    subtitle: "Donde empieza todo",
    desc: "Tu propósito, tu visión, tu intención y tus objetivos. Si las semillas están mal plantadas, el árbol crecerá torcido.",
  },
  {
    id: "raices",
    icon: "🌿",
    title: "Las Raíces",
    subtitle: "Todo lo que no se ve, pero sostiene todo",
    desc: "Tu historia, creencias, valores, identidad, habilidades y fortalezas. Aquí no se miente. Esto no se publica, pero explica TODO lo que publicas.",
  },
  {
    id: "tronco",
    icon: "🪵",
    title: "El Tronco",
    subtitle: "Aquello por lo que quieres ser reconocido",
    desc: "Tu tema principal, tu propuesta de valor y tu zona de genialidad. Aquí no vale el 'yo hablo un poco de todo'.",
  },
  {
    id: "ramas",
    icon: "🌲",
    title: "Las Ramas",
    subtitle: "Lo humano, lo diverso, lo que te hace único",
    desc: "Tus pasiones, intereses, hobbies, habilidades secundarias y formatos. No conectamos solo con profesionales, conectamos con personas completas.",
  },
  {
    id: "copa",
    icon: "☁️",
    title: "La Copa",
    subtitle: "Lo que el mundo ve de ti",
    desc: "La atmósfera, la sombra, la sensación de estar contigo. Tus atributos, tu arquetipo, tu tono, tu narrativa, tu energía y tu presencia.",
  },
  {
    id: "frutos",
    icon: "🍎",
    title: "Los Frutos",
    subtitle: "El impacto real en otros",
    desc: "El resultado de tus acciones. ¿Qué deseas recibir? ¿Qué impacto quieres dejar? Si no hay frutos, hay que revisar raíces, tronco o copa.",
  },
  {
    id: "entorno",
    icon: "🌍",
    title: "El Entorno",
    subtitle: "Tu audiencia y mercado",
    desc: "Quién te rodea, dónde se mueve tu audiencia, quién más habla de lo tuyo y qué te hace diferente.",
  },
  {
    id: "tiempo",
    icon: "⏳",
    title: "El Tiempo",
    subtitle: "Tu ritmo y tus metas",
    desc: "Nada sano crece rápido. A qué velocidad quieres crecer, cuáles son tus hitos y cómo defines tu buena vida.",
  },
  {
    id: "cofre",
    icon: "📦",
    title: "El Cofre",
    subtitle: "La materialización real",
    desc: "Donde tu árbol deja de ser concepto y se convierte en sustento. No es solo qué vendes — es cómo lo empaquetas, lo entregas y lo haces accesible.",
  },
];

// ===== ARQUETIPOS DE JUNG =====
const ARQUETIPOS = [
  { nombre: "El Sabio", desc: "Busca la verdad y el conocimiento. Enseña, reflexiona, analiza.", emoji: "🦉" },
  { nombre: "El Rebelde", desc: "Rompe reglas. Desafía lo establecido. Provoca para transformar.", emoji: "🔥" },
  { nombre: "El Creador", desc: "Innova, crea, imagina. Convierte ideas en realidad.", emoji: "🎨" },
  { nombre: "El Héroe", desc: "Supera obstáculos. Inspira con esfuerzo y valentía.", emoji: "⚔️" },
  { nombre: "El Cuidador", desc: "Sirve, protege, acompaña. Su motor es la empatía.", emoji: "🤲" },
  { nombre: "El Explorador", desc: "Busca libertad y aventura. Descubre caminos nuevos.", emoji: "🧭" },
  { nombre: "El Mago", desc: "Transforma realidades. Hace posible lo imposible.", emoji: "✨" },
  { nombre: "El Bufón", desc: "Usa el humor y la cercanía. Conecta desde la irreverencia.", emoji: "🃏" },
  { nombre: "El Amante", desc: "Pasión, conexión, belleza. Busca relaciones profundas.", emoji: "❤️" },
  { nombre: "El Gobernante", desc: "Lidera, ordena, estructura. Transmite autoridad.", emoji: "👑" },
  { nombre: "El Inocente", desc: "Optimismo, sencillez, pureza. Inspira desde la autenticidad.", emoji: "🌸" },
  { nombre: "El Hombre Corriente", desc: "Cercanía, pertenencia, realismo. Conecta como uno más.", emoji: "🤝" },
];

interface Props {
  userId: string;
  userName: string;
  userEmail?: string;
  initialData: any | null;
  brujulaData: any | null;
}

export default function ArbolClient({ userId, userName, userEmail = "", initialData, brujulaData }: Props) {
  const [view, setView] = useState<"questionnaire" | "canvas">(
    initialData?.completed ? "canvas" : "questionnaire"
  );
  const [step, setStep] = useState(initialData?.onboarding_step || 0);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [diagResult, setDiagResult] = useState<DiagnosticResult | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagError, setDiagError] = useState<string | null>(null);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const runDiagnostic = useCallback(async () => {
    setDiagLoading(true);
    setDiagError(null);
    try {
      const res = await fetch("/api/arbol/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setDiagError(json.error || "Error al diagnosticar");
        return;
      }
      setDiagResult(json);
    } catch {
      setDiagError("Error de conexión al diagnosticar");
    } finally {
      setDiagLoading(false);
    }
  }, [userId]);
  const [data, setData] = useState<ArbolData>(() => {
    if (initialData) {
      // Handle migration from old "producto" to new "cofre"
      const cofre = initialData.cofre || initialData.producto || DEFAULT_ARBOL.cofre;
      return {
        semilla: { ...DEFAULT_ARBOL.semilla, ...initialData.semilla },
        raices: { ...DEFAULT_ARBOL.raices, ...initialData.raices },
        tronco: { ...DEFAULT_ARBOL.tronco, ...initialData.tronco },
        ramas: { ...DEFAULT_ARBOL.ramas, ...initialData.ramas },
        copa: { ...DEFAULT_ARBOL.copa, ...initialData.copa },
        frutos: { ...DEFAULT_ARBOL.frutos, ...initialData.frutos },
        entorno: { ...DEFAULT_ARBOL.entorno, ...initialData.entorno },
        tiempo: { ...DEFAULT_ARBOL.tiempo, ...initialData.tiempo },
        cofre: { ...DEFAULT_ARBOL.cofre, ...cofre },
      };
    }
    // Pre-fill from Brújula if available
    if (brujulaData) {
      const prefilled = JSON.parse(JSON.stringify(DEFAULT_ARBOL));
      if (brujulaData.briefing) {
        prefilled.tronco.propuestaValor = brujulaData.briefing.propuestaValor || "";
        prefilled.tronco.temaPrincipal = brujulaData.briefing.temaRaiz || "";
      }
      if (brujulaData.channels?.canales?.length > 0) {
        prefilled.entorno.dondeEstan = brujulaData.channels.canales;
      }
      return prefilled;
    }
    return JSON.parse(JSON.stringify(DEFAULT_ARBOL));
  });

  const save = useCallback(
    async (nextStep?: number, markComplete?: boolean) => {
      setSaving(true);
      const supabase = createClient();
      const payload: any = {
        user_id: userId,
        semilla: data.semilla,
        raices: data.raices,
        tronco: data.tronco,
        ramas: data.ramas,
        copa: data.copa,
        frutos: data.frutos,
        entorno: data.entorno,
        tiempo: data.tiempo,
        cofre: data.cofre,
        onboarding_step: nextStep ?? step,
        completed: markComplete ?? (initialData?.completed || false),
        updated_at: new Date().toISOString(),
      };
      await supabase.from("arbol_data").upsert(payload, { onConflict: "user_id" });
      setSaving(false);
    },
    [data, step, userId, initialData]
  );

  // Auto-save with debounce (same pattern as Pirámide)
  const autoSave = useCallback(async () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaveStatus("saving");
      const supabase = createClient();
      const payload: any = {
        user_id: userId,
        semilla: data.semilla,
        raices: data.raices,
        tronco: data.tronco,
        ramas: data.ramas,
        copa: data.copa,
        frutos: data.frutos,
        entorno: data.entorno,
        tiempo: data.tiempo,
        cofre: data.cofre,
        onboarding_step: step,
        completed: initialData?.completed || false,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("arbol_data").upsert(payload, { onConflict: "user_id" });

      if (!error) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("idle");
      }
    }, 1500);
  }, [data, step, userId, initialData]);

  const goNext = async () => {
    // Clear debounce timer for immediate save on step change
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    if (step < ARBOL_STEPS.length - 1) {
      const next = step + 1;
      setStep(next);
      await save(next);
    } else {
      await save(step, true);
      setView("canvas");
      // Auto-run diagnostic when completing the tree
      runDiagnostic();
      // Notify admin when Árbol is completed (first time)
      if (!initialData?.completed) {
        fetch("/api/admin/notify-exercise", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseType: "arbol",
            studentName: userName || userEmail.split("@")[0],
            studentEmail: userEmail,
          }),
        }).catch(() => {}); // fire-and-forget
      }
    }
  };

  const goPrev = () => {
    if (step > 0) {
      // Clear debounce timer for immediate save on step change
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      save(step - 1);
      setStep(step - 1);
    }
  };

  const currentStep = ARBOL_STEPS[step];

  const updateField = (section: keyof ArbolData, field: string, value: any) => {
    setData((prev) => {
      const updated = {
        ...prev,
        [section]: { ...prev[section], [field]: value },
      };
      // Trigger debounced auto-save
      autoSave();
      return updated;
    });
  };

  if (view === "canvas") {
    return (
      <AppShell>
        <ArbolCanvas
          data={data}
          setData={setData}
          userName={userName}
          onSave={() => save(step, true)}
          saving={saving}
          onEditSection={(idx: number) => { setStep(idx); setView("questionnaire"); }}
          diagResult={diagResult}
          diagLoading={diagLoading}
          diagError={diagError}
          onRunDiagnostic={runDiagnostic}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant">Paso {step + 1} de {ARBOL_STEPS.length}</span>
            {initialData?.completed && (
              <button onClick={() => setView("canvas")} className="text-xs text-primary hover:underline">
                Ver mi Árbol →
              </button>
            )}
          </div>
          <div className="w-full h-1.5 bg-borde/40 rounded-full overflow-hidden">
            <div className="h-full bg-primary-container rounded-full transition-all duration-500" style={{ width: `${((step + 1) / ARBOL_STEPS.length) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-2 overflow-x-auto gap-1 pb-1 -mx-1 px-1 scrollbar-hide">
            {ARBOL_STEPS.map((s, i) => (
              <button key={s.id} onClick={() => {
                // Clear debounce timer and save immediately when jumping to a step
                if (saveTimeout.current) clearTimeout(saveTimeout.current);
                save(i);
                setStep(i);
              }} className={`text-sm transition-all flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg ${i === step ? "scale-110 bg-primary-container/10" : i < step ? "opacity-70" : "opacity-30"}`} title={s.title}>
                {s.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Step header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{currentStep.icon}</span>
            <div>
              <h1 className="font-headline text-2xl text-on-surface">{currentStep.title}</h1>
              <p className="text-sm text-on-surface-variant">{currentStep.subtitle}</p>
            </div>
          </div>
          <p className="text-sm text-on-surface/60 mt-2 leading-relaxed">{currentStep.desc}</p>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl border border-outline/60 p-6 sm:p-8 shadow-card">
          {step === 0 && <StepSemilla data={data.semilla} update={(f, v) => updateField("semilla", f, v)} />}
          {step === 1 && <StepRaices data={data.raices} update={(f, v) => updateField("raices", f, v)} />}
          {step === 2 && <StepTronco data={data.tronco} update={(f, v) => updateField("tronco", f, v)} />}
          {step === 3 && <StepRamas data={data.ramas} update={(f, v) => updateField("ramas", f, v)} />}
          {step === 4 && <StepCopa data={data.copa} update={(f, v) => updateField("copa", f, v)} />}
          {step === 5 && <StepFrutos data={data.frutos} update={(f, v) => updateField("frutos", f, v)} />}
          {step === 6 && <StepEntorno data={data.entorno} update={(f, v) => updateField("entorno", f, v)} />}
          {step === 7 && <StepTiempo data={data.tiempo} update={(f, v) => updateField("tiempo", f, v)} />}
          {step === 8 && <StepCofre data={data.cofre} setData={(cofre) => {
            setData((prev) => ({ ...prev, cofre }));
            autoSave();
          }} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 gap-3">
          <button onClick={goPrev} disabled={step === 0} className="text-sm text-on-surface-variant hover:text-on-surface disabled:opacity-30 transition-colors py-2">← Anterior</button>
          <div className="flex items-center gap-3">
            {/* Auto-save status indicator */}
            {saveStatus === "saving" && (
              <span className="text-xs text-on-surface-variant animate-pulse">Guardando...</span>
            )}
            {saveStatus === "saved" && (
              <span className="text-xs text-green-600 font-medium">Guardado ✓</span>
            )}
            <button onClick={goNext} disabled={saving} className="bg-primary-container text-white font-semibold px-5 sm:px-6 py-2.5 rounded-xl hover:bg-primary-container-hover transition-colors disabled:opacity-50 text-sm min-w-0">
              {saving ? "Guardando..." : step === ARBOL_STEPS.length - 1 ? "Ver mi Árbol 🌳" : "Siguiente →"}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ===== SHARED COMPONENTS =====

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="block text-sm font-semibold text-on-surface">{children}</label>
      {hint && <p className="text-xs text-on-surface-variant mt-0.5">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, multiline }: { value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  const cls = "w-full px-4 py-3 border border-outline rounded-xl bg-surface text-on-surface placeholder:text-on-surface-variant-light focus:outline-none focus:border-naranja transition-colors text-sm";
  if (multiline) return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls + " resize-none"} />;
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />;
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (tags: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  const add = () => { const t = input.trim(); if (t && !tags.includes(t)) { onChange([...tags, t]); setInput(""); } };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-primary-container/10 text-primary text-xs font-medium px-2.5 py-1 rounded-lg">
            {tag}
            <button onClick={() => onChange(tags.filter((_, idx) => idx !== i))} className="hover:text-danger ml-0.5">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder={placeholder} className="flex-1 px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface text-sm placeholder:text-on-surface-variant-light focus:outline-none focus:border-naranja transition-colors" />
        <button onClick={add} className="text-xs px-3 py-2 bg-primary-container/10 text-primary rounded-lg hover:bg-primary-container/20 transition-colors font-medium">Añadir</button>
      </div>
    </div>
  );
}

// ===== STEP COMPONENTS =====

function StepSemilla({ data, update }: { data: any; update: (f: string, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel hint="¿Para qué existe tu marca personal? No busques frases épicas. Busca verdad.">Tu propósito</FieldLabel>
        <TextInput value={data.proposito} onChange={(v) => update("proposito", v)} placeholder="Mi marca existe para..." multiline />
      </div>
      <div>
        <FieldLabel hint="¿Hacia dónde quieres llevar tu vida y tu trabajo?">Tu visión</FieldLabel>
        <TextInput value={data.vision} onChange={(v) => update("vision", v)} placeholder="Quiero llegar a..." multiline />
      </div>
      <div>
        <FieldLabel hint="¿Qué quieres provocar en los demás con lo que comunicas?">Tu intención</FieldLabel>
        <TextInput value={data.intencion} onChange={(v) => update("intencion", v)} placeholder="Quiero que la gente..." multiline />
      </div>
      <div>
        <FieldLabel hint="¿Qué te gustaría conseguir gracias a comunicarte mejor?">Tus objetivos</FieldLabel>
        <TextInput value={data.objetivos} onChange={(v) => update("objetivos", v)} placeholder="Me gustaría conseguir..." multiline />
      </div>
    </div>
  );
}

function StepRaices({ data, update }: { data: any; update: (f: string, v: any) => void }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-on-surface-variant italic">Esto no se publica directamente... pero cada cosa que publiques tendrá raíces aquí.</p>
      <div>
        <FieldLabel hint="Las creencias que guían tus decisiones y tu forma de ver el mundo.">Tus creencias clave</FieldLabel>
        <TextInput value={data.creencias} onChange={(v) => update("creencias", v)} placeholder="Creo firmemente que..." multiline />
      </div>
      <div>
        <FieldLabel hint="Los principios innegociables que definen cómo actúas.">Tus valores</FieldLabel>
        <TagInput tags={data.valores || []} onChange={(v) => update("valores", v)} placeholder="Ej: Honestidad, Libertad, Compromiso..." />
      </div>
      <div>
        <FieldLabel hint="¿Cómo te defines de verdad? No tu etiqueta profesional — tu identidad real.">Tu identidad</FieldLabel>
        <TextInput value={data.identidad} onChange={(v) => update("identidad", v)} placeholder="Soy alguien que..." multiline />
      </div>
      <div>
        <FieldLabel hint="Tu recorrido. Lo que te ha traído hasta aquí.">Tu historia</FieldLabel>
        <TextInput value={data.historia} onChange={(v) => update("historia", v)} placeholder="Empecé cuando..." multiline />
      </div>
      <div>
        <FieldLabel hint="¿Qué sabes hacer de verdad? Conocimientos y habilidades reales.">Conocimiento y habilidades</FieldLabel>
        <TextInput value={data.conocimientoHabilidades} onChange={(v) => update("conocimientoHabilidades", v)} placeholder="Sé de... / Domino..." multiline />
      </div>
      <div>
        <FieldLabel hint="Lo que se te da bien de forma natural.">Tus fortalezas</FieldLabel>
        <TagInput tags={data.fortalezas || []} onChange={(v) => update("fortalezas", v)} placeholder="Ej: Comunicar, Escuchar, Simplificar..." />
      </div>
      <div>
        <FieldLabel hint="Incluso la invisible — cosas que sabes hacer aunque sea de forma innata.">Tu experiencia</FieldLabel>
        <TextInput value={data.experiencia} onChange={(v) => update("experiencia", v)} placeholder="He trabajado en... / He vivido..." multiline />
      </div>
      <div>
        <FieldLabel hint="Lo que sabes sin saber explicar por qué lo sabes.">Tu intuición</FieldLabel>
        <TextInput value={data.intuicion} onChange={(v) => update("intuicion", v)} placeholder="Suelo intuir que... / Tengo olfato para..." multiline />
      </div>
    </div>
  );
}

function StepTronco({ data, update }: { data: any; update: (f: string, v: any) => void }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-on-surface-variant italic">Si aquí eres concreto, tu comunicación después será clara.</p>
      <div>
        <FieldLabel hint="¿De qué va tu marca personal? El tema que lideras.">Tu tema principal</FieldLabel>
        <TextInput value={data.temaPrincipal} onChange={(v) => update("temaPrincipal", v)} placeholder="Mi marca va de..." multiline />
      </div>
      <div>
        <FieldLabel hint="¿Qué aportas a la vida de los demás?">Tu propuesta de valor</FieldLabel>
        <TextInput value={data.propuestaValor} onChange={(v) => update("propuestaValor", v)} placeholder="Ayudo a [quién] a [qué] mediante [cómo]" multiline />
      </div>
      <div>
        <FieldLabel hint="¿Qué sabes hacer excepcionalmente bien? Aquello donde brillas.">Tu zona de genialidad</FieldLabel>
        <TextInput value={data.zonaGenialidad} onChange={(v) => update("zonaGenialidad", v)} placeholder="Lo que hago mejor que nadie es..." multiline />
      </div>
    </div>
  );
}

function StepRamas({ data, update }: { data: any; update: (f: string, v: any) => void }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-on-surface-variant italic">Un árbol solo con tronco es un poste. Las ramas son tu riqueza humana.</p>
      <div>
        <FieldLabel hint="Cosas que te mueven, que te encienden.">Pasiones</FieldLabel>
        <TagInput tags={data.pasiones || []} onChange={(v) => update("pasiones", v)} placeholder="Ej: La música, Emprender, Viajar..." />
      </div>
      <div>
        <FieldLabel hint="Aquello que te gusta explorar, aprender, investigar.">Intereses</FieldLabel>
        <TagInput tags={data.intereses || []} onChange={(v) => update("intereses", v)} placeholder="Ej: Psicología, Tecnología, Filosofía..." />
      </div>
      <div>
        <FieldLabel hint="Lo que disfrutas sin presión ni obligación.">Hobbies</FieldLabel>
        <TagInput tags={data.hobbies || []} onChange={(v) => update("hobbies", v)} placeholder="Ej: Surf, Cocinar, Leer, Senderismo..." />
      </div>
      <div>
        <FieldLabel hint="Cosas que no son tu profesión pero suman a tu perfil.">Habilidades secundarias</FieldLabel>
        <TagInput tags={data.habilidadesSecundarias || []} onChange={(v) => update("habilidadesSecundarias", v)} placeholder="Ej: Diseño, Escritura, Hablar en público..." />
      </div>
      <div>
        <FieldLabel hint="¿Dónde actúas hoy profesionalmente?">Contextos profesionales</FieldLabel>
        <TagInput tags={data.contextosProfesionales || []} onChange={(v) => update("contextosProfesionales", v)} placeholder="Ej: Consultoría, Formación online, Freelance..." />
      </div>
      <div>
        <FieldLabel hint="¿Cómo te expresas mejor? ¿Qué formatos se te dan bien?">Formatos de comunicación</FieldLabel>
        <TagInput tags={data.formatosComunicacion || []} onChange={(v) => update("formatosComunicacion", v)} placeholder="Ej: Texto, Vídeo, Voz, Charlas, Formación..." />
      </div>
    </div>
  );
}

function StepCopa({ data, update }: { data: any; update: (f: string, v: any) => void }) {
  const [showArchCalc, setShowArchCalc] = useState(false);
  const arquetipos: ArquetipoSeleccion[] = data.arquetipos || [];

  const toggleArquetipo = (nombre: string) => {
    const exists = arquetipos.find((a) => a.nombre === nombre);
    if (exists) {
      update("arquetipos", arquetipos.filter((a) => a.nombre !== nombre));
    } else {
      update("arquetipos", [...arquetipos, { nombre, porcentaje: 50 }]);
    }
  };

  const updatePorcentaje = (nombre: string, porcentaje: number) => {
    update("arquetipos", arquetipos.map((a) => a.nombre === nombre ? { ...a, porcentaje } : a));
  };

  // Generate personality description
  const getPersonalityDesc = () => {
    if (arquetipos.length === 0) return null;
    const sorted = [...arquetipos].sort((a, b) => b.porcentaje - a.porcentaje);
    const dominant = sorted[0];
    if (!dominant || dominant.porcentaje === 0) return null;

    const archData: Record<string, { comunicacion: string; fortaleza: string; riesgo: string }> = {
      "El Sabio": { comunicacion: "enseñas con profundidad y reflexión", fortaleza: "tu capacidad de analizar y transmitir verdad", riesgo: "parecer distante o demasiado teórico" },
      "El Rebelde": { comunicacion: "provocas, desafías y rompes moldes", fortaleza: "tu valentía para decir lo que otros no dicen", riesgo: "polarizar sin propósito o cansar" },
      "El Creador": { comunicacion: "innovas y sorprendes con tu originalidad", fortaleza: "tu capacidad de convertir ideas en algo nuevo", riesgo: "dispersarte en demasiados proyectos" },
      "El Héroe": { comunicacion: "inspiras con historias de superación y esfuerzo", fortaleza: "tu determinación y capacidad de motivar", riesgo: "parecer inalcanzable o agotarte" },
      "El Cuidador": { comunicacion: "acompañas, sostienes y cuidas a tu comunidad", fortaleza: "tu empatía y capacidad de crear espacios seguros", riesgo: "darlo todo sin cuidarte" },
      "El Explorador": { comunicacion: "compartes descubrimientos y caminos nuevos", fortaleza: "tu curiosidad y espíritu aventurero", riesgo: "no profundizar lo suficiente" },
      "El Mago": { comunicacion: "transformas perspectivas y abres posibilidades", fortaleza: "tu visión y capacidad de cambio", riesgo: "prometer más de lo que puedes cumplir" },
      "El Bufón": { comunicacion: "conectas con humor, cercanía e irreverencia", fortaleza: "tu capacidad de hacer accesible lo complejo", riesgo: "que no te tomen en serio" },
      "El Amante": { comunicacion: "conectas desde la pasión, la belleza y la emoción", fortaleza: "tu intensidad y capacidad de inspirar", riesgo: "depender de la validación externa" },
      "El Gobernante": { comunicacion: "lideras con estructura, orden y autoridad", fortaleza: "tu capacidad de organizar y dirigir", riesgo: "parecer autoritario o rígido" },
      "El Inocente": { comunicacion: "inspiras con optimismo, sencillez y autenticidad", fortaleza: "tu frescura y transparencia", riesgo: "que te perciban como ingenuo" },
      "El Hombre Corriente": { comunicacion: "conectas como uno más, desde la cercanía y el realismo", fortaleza: "tu accesibilidad y sentido de pertenencia", riesgo: "no diferenciarte lo suficiente" },
    };

    const dominantData = archData[dominant.nombre];
    if (!dominantData) return null;

    let desc = `Tu arquetipo dominante es ${dominant.nombre} (${dominant.porcentaje}%): ${dominantData.comunicacion}. Tu mayor fortaleza es ${dominantData.fortaleza}. Cuidado con ${dominantData.riesgo}.`;

    const others = sorted.filter((_, i) => i > 0 && sorted[i].porcentaje > 0);
    if (others.length > 0) {
      const otherDescs = others.map((a) => `${a.nombre} (${a.porcentaje}%)`);
      desc += ` También te identificas con ${otherDescs.join(", ")}, lo que da riqueza y matices a tu personalidad de marca.`;
    }
    return desc;
  };

  const personality = getPersonalityDesc();

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel hint="Características que quieres que tu marca represente.">Atributos que quieres representar</FieldLabel>
        <TagInput tags={data.atributos || []} onChange={(v) => update("atributos", v)} placeholder="Ej: Confianza, Cercanía, Autoridad, Creatividad..." />
      </div>

      {/* Archetype Calculator */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel hint="Selecciona los arquetipos con los que te identificas y pon el % de cada uno (independientes, no tienen que sumar 100).">Tu arquetipo de marca</FieldLabel>
          <button onClick={() => setShowArchCalc(!showArchCalc)} className="text-xs text-primary hover:underline">
            {showArchCalc ? "Ocultar guía" : "Ver los 12 arquetipos"}
          </button>
        </div>

        {showArchCalc && (
          <div className="bg-surface/60 rounded-xl border border-outline/40 p-4 mb-3 space-y-2">
            <p className="text-xs text-on-surface-variant mb-2">Haz clic para seleccionar los que te representen:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ARQUETIPOS.map((a) => {
                const selected = arquetipos.some((s) => s.nombre === a.nombre);
                return (
                  <button
                    key={a.nombre}
                    onClick={() => toggleArquetipo(a.nombre)}
                    className={`text-left text-xs px-3 py-2.5 rounded-lg border transition-colors ${
                      selected ? "border-naranja bg-primary-container/10 text-primary" : "border-outline text-on-surface-variant hover:border-naranja/40"
                    }`}
                  >
                    <span className="font-semibold">{a.emoji} {a.nombre}</span>
                    <span className="block text-[10px] opacity-70 mt-0.5">{a.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected archetypes with percentage sliders */}
        {arquetipos.length > 0 && (
          <div className="space-y-3 bg-white rounded-xl border border-outline/40 p-4">
            <p className="text-xs text-on-surface-variant">¿Cuánto te identificas con cada uno? (0% = nada, 100% = totalmente)</p>
            {arquetipos.map((a) => (
              <div key={a.nombre} className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs font-semibold text-on-surface w-20 sm:w-36 flex-shrink-0 truncate">{a.nombre}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={a.porcentaje}
                  onChange={(e) => updatePorcentaje(a.nombre, Number(e.target.value))}
                  className="flex-1 accent-naranja"
                />
                <span className="text-xs font-bold w-10 text-right text-primary">{a.porcentaje}%</span>
              </div>
            ))}

            {/* Personality result */}
            {personality && (
              <div className="mt-3 bg-primary-container/[0.06] rounded-xl p-4 border border-naranja/20">
                <p className="text-xs font-semibold text-primary mb-1">Tu personalidad de marca:</p>
                <p className="text-sm text-on-surface/80 leading-relaxed">{personality.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <FieldLabel hint="¿Cómo suenas? Cercano, técnico, emocional, reflexivo, divertido...">Tu tono de voz</FieldLabel>
        <TextInput value={data.tonoDeVoz} onChange={(v) => update("tonoDeVoz", v)} placeholder="Ej: Directo y cercano, con un punto provocador pero siempre desde el cariño" multiline />
      </div>
      <div>
        <FieldLabel hint="¿Qué historia cuentas? El hilo conductor de tu comunicación.">Tu narrativa</FieldLabel>
        <TextInput value={data.narrativa} onChange={(v) => update("narrativa", v)} placeholder="La historia que cuento es la de alguien que..." multiline />
      </div>
      <div>
        <FieldLabel hint="¿Qué emoción llevas al mundo? Misterio, vitalidad, calma, rebeldía...">Tu energía</FieldLabel>
        <TextInput value={data.energia} onChange={(v) => update("energia", v)} placeholder="Ej: Vitalidad y movimiento, con momentos de profundidad reflexiva" />
      </div>
      <div>
        <FieldLabel hint="¿Cómo apareces en escena? De calle, uniforme, en casa, en estudio...">Tu presencia</FieldLabel>
        <TextInput value={data.presencia} onChange={(v) => update("presencia", v)} placeholder="Ej: Casual, accesible, como si estuviese hablando con un amigo en un café" />
      </div>
      <div>
        <FieldLabel hint="¿Cómo quieres que me perciban? ¿Cómo quiero que se sienta alguien cuando está conmigo?">Percepción deseada</FieldLabel>
        <TextInput value={data.percepcion} onChange={(v) => update("percepcion", v)} placeholder="Quiero que sientan..." multiline />
      </div>
    </div>
  );
}

function StepFrutos({ data, update }: { data: any; update: (f: string, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel hint="¿Qué esperas recibir cuando haces bien tu trabajo?">¿Qué deseas recibir?</FieldLabel>
        <TextInput value={data.queDeseasRecibir} onChange={(v) => update("queDeseasRecibir", v)} placeholder="Ej: Reconocimiento, ingresos que me den libertad, mensajes de agradecimiento..." multiline />
      </div>
      <div>
        <FieldLabel hint="Sé concreto. ¿Cuántos seguidores, suscriptores o alcance te gustaría tener?">Meta de alcance</FieldLabel>
        <TextInput value={data.metaSeguidores} onChange={(v) => update("metaSeguidores", v)} placeholder="Ej: 10.000 seguidores en IG, 1.000 suscriptores newsletter..." multiline />
      </div>
      <div>
        <FieldLabel hint="¿Qué tipo de mensajes te gustaría encontrar en tu bandeja de entrada?">Mensajes que quieres recibir</FieldLabel>
        <TextInput value={data.mensajesQueQuieres} onChange={(v) => update("mensajesQueQuieres", v)} placeholder="Ej: 'Tu contenido me ayudó a dar el paso', 'Quiero trabajar contigo'..." multiline />
      </div>
      <div>
        <FieldLabel hint="¿Qué cambio quieres provocar en los demás con tu marca?">Impacto deseado</FieldLabel>
        <TextInput value={data.impactoDeseado} onChange={(v) => update("impactoDeseado", v)} placeholder="Quiero que la gente..." multiline />
      </div>
      <div>
        <FieldLabel hint="La frase que te encantaría leer en un testimonio.">Testimonio ideal</FieldLabel>
        <TextInput value={data.testimonioIdeal} onChange={(v) => update("testimonioIdeal", v)} placeholder="&quot;Gracias a [tu nombre] ahora puedo...&quot;" multiline />
      </div>
    </div>
  );
}

function StepEntorno({ data, update }: { data: any; update: (f: string, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel hint="¿Quién es tu audiencia ideal?">Audiencia principal</FieldLabel>
        <TextInput value={data.audienciaPrincipal} onChange={(v) => update("audienciaPrincipal", v)} placeholder="Profesionales de 30-45 años que..." multiline />
      </div>
      <div>
        <FieldLabel hint="Los canales donde se mueve tu audiencia.">Dónde están</FieldLabel>
        <TagInput tags={data.dondeEstan || []} onChange={(v) => update("dondeEstan", v)} placeholder="Ej: Instagram, LinkedIn, YouTube..." />
      </div>
      <div>
        <FieldLabel hint="¿Quién más habla de tu tema?">Competencia / referentes</FieldLabel>
        <TextInput value={data.competencia} onChange={(v) => update("competencia", v)} placeholder="En mi espacio también están..." multiline />
      </div>
      <div>
        <FieldLabel hint="Personas o marcas con las que podrías colaborar.">Aliados potenciales</FieldLabel>
        <TextInput value={data.aliadosPotenciales} onChange={(v) => update("aliadosPotenciales", v)} placeholder="Podría colaborar con..." multiline />
      </div>
      <div>
        <FieldLabel hint="¿Qué te hace diferente?">Tu posicionamiento</FieldLabel>
        <TextInput value={data.posicionamiento} onChange={(v) => update("posicionamiento", v)} placeholder="Lo que me diferencia es..." multiline />
      </div>
    </div>
  );
}

function StepTiempo({ data, update }: { data: any; update: (f: string, v: any) => void }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-on-surface-variant italic">Nada sano crece rápido. Mantente coherente frente a las tendencias y verás los frutos crecer.</p>
      <div>
        <FieldLabel hint="¿Con qué frecuencia publicas y en qué canales?">Ritmo de publicación</FieldLabel>
        <TextInput value={data.ritmoPublicacion} onChange={(v) => update("ritmoPublicacion", v)} placeholder="Ej: 3 posts/semana en IG, 1 newsletter semanal..." multiline />
      </div>
      <div>
        <FieldLabel hint="¿Cuál es tu próxima meta a 90 días?">Próximo hito</FieldLabel>
        <TextInput value={data.proximoHito} onChange={(v) => update("proximoHito", v)} placeholder="En los próximos 90 días quiero..." multiline />
      </div>
      <div>
        <FieldLabel hint="¿Dónde quieres estar dentro de un año?">Meta anual</FieldLabel>
        <TextInput value={data.metaAnual} onChange={(v) => update("metaAnual", v)} placeholder="Dentro de 12 meses quiero haber..." multiline />
      </div>
      <div>
        <FieldLabel hint="¿Qué es para ti el éxito? ¿Cómo es tu buena vida?">Tu buena vida</FieldLabel>
        <TextInput value={data.buenaVida} onChange={(v) => update("buenaVida", v)} placeholder="Para mí, una buena vida es..." multiline />
      </div>
    </div>
  );
}

function StepCofre({ data, setData }: { data: any; setData: (v: any) => void }) {
  const estados = [
    { value: "idea", label: "Es una idea" },
    { value: "en_desarrollo", label: "En desarrollo" },
    { value: "validado", label: "Validado" },
    { value: "vendiendo", label: "Ya se vende" },
  ];

  const productos = data.productos || [{ nombreProducto: "", oferta: "", packagingNarrativo: "", cliente: "", canales: "", sistemaEntrega: "", precio: "", estadoActual: "idea" }];

  const addProducto = () => {
    setData({ productos: [...productos, { nombreProducto: "", oferta: "", packagingNarrativo: "", cliente: "", canales: "", sistemaEntrega: "", precio: "", estadoActual: "idea" }] });
  };
  const removeProducto = (i: number) => {
    setData({ productos: productos.filter((_: any, idx: number) => idx !== i) });
  };
  const updateProducto = (i: number, field: string, value: any) => {
    const updated = [...productos];
    updated[i] = { ...updated[i], [field]: value };
    setData({ productos: updated });
  };

  return (
    <div className="space-y-5">
      <p className="text-xs text-on-surface-variant italic">Si alguien no puede comprarlo, no existe. Cuanto más concreto, mejor.</p>
      {productos.map((prod: any, i: number) => (
        <div key={i} className="bg-surface/50 rounded-xl border border-outline/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant uppercase">Producto {i + 1}</span>
            {productos.length > 1 && (
              <button onClick={() => removeProducto(i)} className="text-xs text-danger/60 hover:text-danger">Eliminar</button>
            )}
          </div>
          <TextInput value={prod.nombreProducto} onChange={(v) => updateProducto(i, "nombreProducto", v)} placeholder="¿Qué vendes? (mentoría, curso, consultoría...)" />
          <TextInput value={prod.oferta} onChange={(v) => updateProducto(i, "oferta", v)} placeholder="¿Qué lo hace deseable? (promesa, transformación, dolor que alivia)" multiline />
          <TextInput value={prod.packagingNarrativo} onChange={(v) => updateProducto(i, "packagingNarrativo", v)} placeholder="¿Cómo lo cuentas? (tu relato de venta, la historia que lo envuelve)" multiline />
          <TextInput value={prod.cliente} onChange={(v) => updateProducto(i, "cliente", v)} placeholder="¿Quién lo necesita? ¿Cómo lo quiere consumir?" multiline />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput value={prod.canales} onChange={(v) => updateProducto(i, "canales", v)} placeholder="¿Cómo se accede?" />
            <TextInput value={prod.precio} onChange={(v) => updateProducto(i, "precio", v)} placeholder="Precio" />
          </div>
          <TextInput value={prod.sistemaEntrega} onChange={(v) => updateProducto(i, "sistemaEntrega", v)} placeholder="¿Cómo lo entregas? (estructura, ritmo, acompañamiento, soporte)" multiline />
          <div>
            <p className="text-xs text-on-surface-variant mb-1">Estado</p>
            <div className="flex flex-wrap gap-1.5">
              {estados.map((e) => (
                <button key={e.value} onClick={() => updateProducto(i, "estadoActual", e.value)}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors ${prod.estadoActual === e.value ? "border-naranja bg-primary-container/10 text-primary font-medium" : "border-outline text-on-surface-variant hover:border-naranja/40"}`}>
                  {e.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
      {productos.length < 8 && (
        <button onClick={addProducto} className="text-sm text-primary hover:underline">+ Añadir producto</button>
      )}
    </div>
  );
}

// ===== CANVAS VIEW =====

function ArbolCanvas({ data, setData, userName, onSave, saving, onEditSection, diagResult, diagLoading, diagError, onRunDiagnostic }: {
  data: ArbolData; setData: (d: ArbolData) => void; userName: string; onSave: () => void; saving: boolean; onEditSection: (idx: number) => void;
  diagResult: DiagnosticResult | null; diagLoading: boolean; diagError: string | null; onRunDiagnostic: () => void;
}) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const sections = [
    {
      icon: "🌱", title: "La Semilla",
      summary: data.semilla.proposito || "Sin completar",
      highlights: [
        data.semilla.vision && `Visión: ${data.semilla.vision.slice(0, 80)}`,
        data.semilla.intencion && `Intención: ${data.semilla.intencion.slice(0, 80)}`,
      ].filter(Boolean),
    },
    {
      icon: "🌿", title: "Las Raíces",
      summary: data.raices.identidad || data.raices.historia?.slice(0, 80) || "Sin completar",
      highlights: [
        data.raices.valores?.length > 0 && `Valores: ${data.raices.valores.join(", ")}`,
        data.raices.fortalezas?.length > 0 && `Fortalezas: ${data.raices.fortalezas.join(", ")}`,
      ].filter(Boolean),
    },
    {
      icon: "🪵", title: "El Tronco",
      summary: data.tronco.propuestaValor || "Sin completar",
      highlights: [
        data.tronco.temaPrincipal && `Tema: ${data.tronco.temaPrincipal}`,
        data.tronco.zonaGenialidad && `Genialidad: ${data.tronco.zonaGenialidad.slice(0, 80)}`,
      ].filter(Boolean),
    },
    {
      icon: "🌲", title: "Las Ramas",
      summary: [...(data.ramas.pasiones || []), ...(data.ramas.intereses || [])].slice(0, 5).join(" · ") || "Sin completar",
      highlights: [
        data.ramas.pasiones?.length > 0 && `Pasiones: ${data.ramas.pasiones.join(", ")}`,
        data.ramas.hobbies?.length > 0 && `Hobbies: ${data.ramas.hobbies.join(", ")}`,
        data.ramas.formatosComunicacion?.length > 0 && `Formatos: ${data.ramas.formatosComunicacion.join(", ")}`,
      ].filter(Boolean),
    },
    {
      icon: "☁️", title: "La Copa",
      summary: data.copa.tonoDeVoz || "Sin completar",
      highlights: [
        data.copa.arquetipos?.length > 0 && `Arquetipos: ${data.copa.arquetipos.map((a: ArquetipoSeleccion) => `${a.nombre} ${a.porcentaje}%`).join(", ")}`,
        data.copa.energia && `Energía: ${data.copa.energia}`,
        data.copa.presencia && `Presencia: ${data.copa.presencia}`,
      ].filter(Boolean),
    },
    {
      icon: "🍎", title: "Los Frutos",
      summary: data.frutos.queDeseasRecibir || "Sin completar",
      highlights: [
        data.frutos.metaSeguidores && `Meta: ${data.frutos.metaSeguidores.slice(0, 80)}`,
        data.frutos.impactoDeseado && `Impacto: ${data.frutos.impactoDeseado.slice(0, 80)}`,
      ].filter(Boolean),
    },
    {
      icon: "🌍", title: "El Entorno",
      summary: data.entorno.audienciaPrincipal || "Sin completar",
      highlights: [
        data.entorno.dondeEstan?.length > 0 && `Canales: ${data.entorno.dondeEstan.join(", ")}`,
        data.entorno.posicionamiento && `Diferencial: ${data.entorno.posicionamiento.slice(0, 80)}`,
      ].filter(Boolean),
    },
    {
      icon: "⏳", title: "El Tiempo",
      summary: data.tiempo.proximoHito || data.tiempo.ritmoPublicacion || "Sin completar",
      highlights: [
        data.tiempo.metaAnual && `Meta anual: ${data.tiempo.metaAnual.slice(0, 80)}`,
        data.tiempo.buenaVida && `Buena vida: ${data.tiempo.buenaVida.slice(0, 80)}`,
      ].filter(Boolean),
    },
    {
      icon: "📦", title: "El Cofre",
      summary: data.cofre.productos?.filter((p: any) => p.nombreProducto).map((p: any) => p.nombreProducto).join(" · ") || "Sin completar",
      highlights: data.cofre.productos?.filter((p: any) => p.nombreProducto).map((p: any) =>
        `${p.nombreProducto}${p.precio ? ` — ${p.precio}` : ""}${p.estadoActual && p.estadoActual !== "idea" ? ` (${p.estadoActual})` : ""}`
      ) || [],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-headline text-xl sm:text-3xl text-on-surface mb-1">🌳 El Árbol de {userName || "tu Marca"}</h1>
          <div className="flex gap-2 flex-shrink-0">
            <a href="/arbol/resultado" className="text-xs px-3 sm:px-4 py-2 bg-negro text-white rounded-xl hover:bg-negro/80 transition-colors font-medium">
              Resultado
            </a>
            <button onClick={onSave} disabled={saving} className="text-xs px-3 sm:px-4 py-2 bg-primary-container text-white rounded-xl hover:bg-primary-container-hover transition-colors disabled:opacity-50 font-medium">
              {saving ? "..." : "Guardar"}
            </button>
          </div>
        </div>
        <p className="text-on-surface-variant text-xs sm:text-sm mt-1">Tu marca personal en una sola vista. Haz clic en cualquier sección para editarla.</p>
      </div>

      <div className="space-y-3">
        {sections.map((section, idx) => {
          const isExpanded = expandedSection === idx;
          const isEmpty = section.summary === "Sin completar";
          return (
            <div key={idx} className={`rounded-2xl border transition-all ${isEmpty ? "border-outline/40 bg-white/50 opacity-60" : isExpanded ? "border-naranja/40 bg-white shadow-card" : "border-outline/60 bg-white hover:border-naranja/30 hover:shadow-card-hover"}`}>
              <button onClick={() => setExpandedSection(isExpanded ? null : idx)} className="w-full text-left px-3 sm:px-5 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
                <span className="text-2xl flex-shrink-0">{section.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline text-base text-on-surface">{section.title}</h3>
                    {isEmpty && <span className="text-[10px] bg-borde/30 text-on-surface-variant px-2 py-0.5 rounded-full">Pendiente</span>}
                  </div>
                  <p className="text-sm text-on-surface/60 truncate mt-0.5">{section.summary}</p>
                </div>
                <svg className={`w-4 h-4 text-on-surface-variant flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isExpanded && (
                <div className="px-3 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-outline/30">
                  <div className="mt-4 space-y-2">
                    {section.highlights.map((h, hi) => (<p key={hi} className="text-sm text-on-surface/70 leading-relaxed">{h}</p>))}
                    {section.highlights.length === 0 && <p className="text-sm text-on-surface-variant italic">Aún no has completado esta sección.</p>}
                  </div>
                  <button onClick={() => onEditSection(idx)} className="mt-4 text-xs text-primary font-medium hover:underline">Editar sección →</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-on-surface-variant">{sections.filter((s) => s.summary !== "Sin completar").length} de {sections.length} secciones completadas</p>
      </div>

      {/* Diagnostic Section */}
      <div className="mt-10 border-t border-outline/40 pt-8">
        {!diagResult && !diagLoading && (
          <div className="text-center">
            <h3 className="font-headline text-lg text-on-surface mb-2">Diagnostica tu Árbol</h3>
            <p className="text-sm text-on-surface-variant mb-4 max-w-md mx-auto">
              Analiza la coherencia de tu marca personal, identifica grietas y fortalezas, y descubre qué ruta seguir.
            </p>
            <button
              onClick={onRunDiagnostic}
              disabled={diagLoading}
              className="px-6 py-3 bg-negro text-white rounded-xl hover:bg-negro/80 transition-colors font-medium text-sm"
            >
              🔬 Diagnosticar mi Árbol
            </button>
            {diagError && (
              <p className="mt-3 text-sm text-red-600">{diagError}</p>
            )}
          </div>
        )}

        {diagLoading && (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-2 border-naranja/30 border-t-naranja rounded-full animate-spin mb-3" />
            <p className="text-sm text-on-surface-variant">Analizando tu Árbol...</p>
          </div>
        )}

        {diagResult && (
          <div className="space-y-6">
            {/* Score + Profile Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={diagResult.diagnostico.score >= 70 ? "#22c55e" : diagResult.diagnostico.score >= 40 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(diagResult.diagnostico.score / 100) * 264} 264`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-headline font-bold text-on-surface">{diagResult.diagnostico.score}</span>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-headline text-xl text-on-surface">Perfil {diagResult.profile}</h3>
                <div
                  className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{
                    background: RUTA_CONFIG[diagResult.ruta].color + "15",
                    color: RUTA_CONFIG[diagResult.ruta].color,
                    border: `1px solid ${RUTA_CONFIG[diagResult.ruta].color}30`,
                  }}
                >
                  <span>{RUTA_CONFIG[diagResult.ruta].icon}</span>
                  {RUTA_CONFIG[diagResult.ruta].name}
                </div>
                <p className="text-xs text-on-surface-variant mt-1">{RUTA_CONFIG[diagResult.ruta].tagline}</p>
              </div>
            </div>

            {/* Layer Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: "foundation", label: "Cimientos", icon: "🏗️", desc: "Semilla + Raíces" },
                { key: "core", label: "Núcleo", icon: "🪵", desc: "Tronco" },
                { key: "expression", label: "Expresión", icon: "☁️", desc: "Ramas + Copa" },
                { key: "reach", label: "Alcance", icon: "📡", desc: "Frutos + Entorno" },
              ].map((layer) => {
                const score = diagResult.diagnostico.layers[layer.key as keyof typeof diagResult.diagnostico.layers];
                return (
                  <div key={layer.key} className="bg-white border border-outline/40 rounded-xl p-3 text-center">
                    <span className="text-lg">{layer.icon}</span>
                    <p className="text-xs font-medium text-on-surface mt-1">{layer.label}</p>
                    <p className="text-[10px] text-on-surface-variant">{layer.desc}</p>
                    <div className="mt-2 w-full h-1.5 bg-borde/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${score}%`,
                          background: score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                    <p className="text-xs font-medium mt-1" style={{ color: score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444" }}>
                      {score}%
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Fortalezas & Grietas */}
            <div className="grid sm:grid-cols-2 gap-4">
              {diagResult.diagnostico.fortalezas.length > 0 && (
                <div className="bg-green-50/50 border border-green-200/60 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Fortalezas</h4>
                  <ul className="space-y-1.5">
                    {diagResult.diagnostico.fortalezas.map((f, i) => (
                      <li key={i} className="text-xs text-green-700 flex items-start gap-2">
                        <span className="flex-shrink-0 mt-0.5">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {diagResult.diagnostico.grietas.length > 0 && (
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-amber-800 mb-2">Grietas</h4>
                  <ul className="space-y-1.5">
                    {diagResult.diagnostico.grietas.map((g, i) => (
                      <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                        <span className="flex-shrink-0 mt-0.5">⚠</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Tu Ruta */}
            <div
              className="rounded-xl p-5"
              style={{
                background: RUTA_CONFIG[diagResult.ruta].color + "08",
                border: `1px solid ${RUTA_CONFIG[diagResult.ruta].color}25`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{RUTA_CONFIG[diagResult.ruta].icon}</span>
                <h4
                  className="font-headline text-base font-semibold"
                  style={{ color: RUTA_CONFIG[diagResult.ruta].color }}
                >
                  {RUTA_CONFIG[diagResult.ruta].name}
                </h4>
              </div>
              <p className="text-xs text-on-surface-variant mb-4">{diagResult.modulos.length} módulos para tu camino</p>
              <div className="space-y-2">
                {diagResult.modulos.map((mod, i) => (
                  <div key={mod.id} className="flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-outline/20">
                    <span className="text-xs font-bold text-on-surface-variant w-5 flex-shrink-0 mt-0.5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-on-surface">{mod.nombre}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{mod.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="/rutas"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                style={{ background: RUTA_CONFIG[diagResult.ruta].color }}
              >
                Ir a Las Rutas →
              </a>
            </div>

            {/* Re-run button */}
            <div className="text-center">
              <button
                onClick={onRunDiagnostic}
                className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
              >
                🔄 Volver a diagnosticar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
