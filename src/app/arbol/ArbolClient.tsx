"use client";

import { useState, useCallback, useEffect } from "react";
import AppShell from "@/components/AppShell";
import type { ArbolData } from "@/lib/types";
import { DEFAULT_ARBOL } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

// ===== STEP DEFINITIONS =====
const ARBOL_STEPS = [
  {
    id: "semilla",
    icon: "🌱",
    title: "La Semilla",
    subtitle: "Quién eres en esencia",
    desc: "Tu identidad, tus valores y el propósito que te mueve. Antes de construir nada, hay que plantar bien.",
  },
  {
    id: "raices",
    icon: "🌿",
    title: "Las Raíces",
    subtitle: "Tu historia y experiencias",
    desc: "Lo que te ha traído hasta aquí. Los momentos que te formaron y lo que aprendiste del camino.",
  },
  {
    id: "tronco",
    icon: "🪵",
    title: "El Tronco",
    subtitle: "Tu propuesta de valor",
    desc: "El centro de tu marca. Qué haces, para quién, cómo lo haces y por qué eres tú quien debe hacerlo.",
  },
  {
    id: "ramas",
    icon: "🌲",
    title: "Las Ramas",
    subtitle: "Tus pilares de contenido",
    desc: "Los grandes temas de los que hablas. Cada rama sostiene un universo de ideas.",
  },
  {
    id: "copa",
    icon: "☁️",
    title: "La Copa",
    subtitle: "Tu visión y misión",
    desc: "A dónde te diriges, qué impacto quieres generar y la frase que te guía cuando todo se complica.",
  },
  {
    id: "frutos",
    icon: "🍎",
    title: "Los Frutos",
    subtitle: "Lo que ofreces al mundo",
    desc: "Tus productos, servicios y la transformación que generas en quienes confían en ti.",
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
    desc: "A qué velocidad quieres crecer, cuáles son tus hitos y cómo defines tu buena vida.",
  },
  {
    id: "producto",
    icon: "📦",
    title: "El Producto",
    subtitle: "Tu oferta concreta",
    desc: "El producto o servicio estrella que monetiza tu marca. Nombre, precio, para quién y cómo lo vendes.",
  },
];

interface Props {
  userId: string;
  userName: string;
  initialData: any | null;
  brujulaData: any | null;
}

export default function ArbolClient({ userId, userName, initialData, brujulaData }: Props) {
  const [view, setView] = useState<"questionnaire" | "canvas">(
    initialData?.completed ? "canvas" : "questionnaire"
  );
  const [step, setStep] = useState(initialData?.onboarding_step || 0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ArbolData>(() => {
    if (initialData) {
      return {
        semilla: { ...DEFAULT_ARBOL.semilla, ...initialData.semilla },
        raices: { ...DEFAULT_ARBOL.raices, ...initialData.raices },
        tronco: { ...DEFAULT_ARBOL.tronco, ...initialData.tronco },
        ramas: { ...DEFAULT_ARBOL.ramas, ...initialData.ramas },
        copa: { ...DEFAULT_ARBOL.copa, ...initialData.copa },
        frutos: { ...DEFAULT_ARBOL.frutos, ...initialData.frutos },
        entorno: { ...DEFAULT_ARBOL.entorno, ...initialData.entorno },
        tiempo: { ...DEFAULT_ARBOL.tiempo, ...initialData.tiempo },
        producto: { ...DEFAULT_ARBOL.producto, ...initialData.producto },
      };
    }
    // Pre-fill from Brújula if available
    if (brujulaData) {
      const prefilled = { ...DEFAULT_ARBOL };
      if (brujulaData.briefing) {
        prefilled.tronco.propuestaValor = brujulaData.briefing.propuestaValor || "";
        prefilled.tronco.etiquetaProfesional = brujulaData.briefing.etiquetaProfesional || "";
        prefilled.tronco.aQuienAyudas = brujulaData.briefing.porQueTu || "";
      }
      if (brujulaData.tree?.pilares?.length > 0) {
        prefilled.ramas.pilares = brujulaData.tree.pilares.map((p: any) => ({
          nombre: p.nombre || "",
          descripcion: "",
          subtemas: p.subtemas || [],
        }));
      }
      if (brujulaData.channels?.canales?.length > 0) {
        prefilled.entorno.dondeEstan = brujulaData.channels.canales;
      }
      return prefilled;
    }
    return { ...DEFAULT_ARBOL };
  });

  // Save to Supabase
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
        producto: data.producto,
        onboarding_step: nextStep ?? step,
        completed: markComplete ?? (initialData?.completed || false),
        updated_at: new Date().toISOString(),
      };
      await supabase.from("arbol_data").upsert(payload, { onConflict: "user_id" });
      setSaving(false);
    },
    [data, step, userId, initialData]
  );

  // Navigate steps
  const goNext = async () => {
    if (step < ARBOL_STEPS.length - 1) {
      const next = step + 1;
      setStep(next);
      await save(next);
    } else {
      // Complete!
      await save(step, true);
      setView("canvas");
    }
  };

  const goPrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const currentStep = ARBOL_STEPS[step];

  // Update a section field
  const updateField = (section: keyof ArbolData, field: string, value: any) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
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
          onEditSection={(idx: number) => {
            setStep(idx);
            setView("questionnaire");
          }}
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
            <span className="text-xs text-muted">
              Paso {step + 1} de {ARBOL_STEPS.length}
            </span>
            {initialData?.completed && (
              <button
                onClick={() => setView("canvas")}
                className="text-xs text-naranja hover:underline"
              >
                Ver mi Árbol →
              </button>
            )}
          </div>
          <div className="w-full h-1.5 bg-borde/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-naranja rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / ARBOL_STEPS.length) * 100}%` }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-2">
            {ARBOL_STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => { save(step); setStep(i); }}
                className={`text-sm transition-all ${
                  i === step ? "scale-125" : i < step ? "opacity-70" : "opacity-30"
                }`}
                title={s.title}
              >
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
              <h1 className="font-heading text-2xl text-negro">{currentStep.title}</h1>
              <p className="text-sm text-muted">{currentStep.subtitle}</p>
            </div>
          </div>
          <p className="text-sm text-negro/60 mt-2 leading-relaxed">{currentStep.desc}</p>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl border border-borde/60 p-6 sm:p-8 shadow-card">
          {step === 0 && <StepSemilla data={data.semilla} update={(f, v) => updateField("semilla", f, v)} />}
          {step === 1 && <StepRaices data={data.raices} update={(f, v) => updateField("raices", f, v)} />}
          {step === 2 && <StepTronco data={data.tronco} update={(f, v) => updateField("tronco", f, v)} />}
          {step === 3 && <StepRamas data={data.ramas} setData={(ramas) => setData((prev) => ({ ...prev, ramas }))} />}
          {step === 4 && <StepCopa data={data.copa} update={(f, v) => updateField("copa", f, v)} />}
          {step === 5 && <StepFrutos data={data.frutos} update={(f, v) => updateField("frutos", f, v)} />}
          {step === 6 && <StepEntorno data={data.entorno} update={(f, v) => updateField("entorno", f, v)} />}
          {step === 7 && <StepTiempo data={data.tiempo} update={(f, v) => updateField("tiempo", f, v)} />}
          {step === 8 && <StepProducto data={data.producto} update={(f, v) => updateField("producto", f, v)} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goPrev}
            disabled={step === 0}
            className="text-sm text-muted hover:text-negro disabled:opacity-30 transition-colors"
          >
            ← Anterior
          </button>
          <button
            onClick={goNext}
            disabled={saving}
            className="bg-naranja text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-naranja-hover transition-colors disabled:opacity-50 text-sm"
          >
            {saving ? "Guardando..." : step === ARBOL_STEPS.length - 1 ? "Ver mi Árbol 🌳" : "Siguiente →"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

// ===== STEP COMPONENTS =====

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="block text-sm font-semibold text-negro">{children}</label>
      {hint && <p className="text-xs text-muted mt-0.5">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, multiline }: { value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  const cls = "w-full px-4 py-3 border border-borde rounded-xl bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-naranja transition-colors text-sm";
  if (multiline) {
    return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className={cls + " resize-none"} />;
  }
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />;
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (tags: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput("");
    }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-naranja/10 text-naranja text-xs font-medium px-2.5 py-1 rounded-lg">
            {tag}
            <button onClick={() => onChange(tags.filter((_, idx) => idx !== i))} className="hover:text-danger ml-0.5">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-borde rounded-lg bg-crema text-negro text-sm placeholder:text-muted-light focus:outline-none focus:border-naranja transition-colors"
        />
        <button onClick={add} className="text-xs px-3 py-2 bg-naranja/10 text-naranja rounded-lg hover:bg-naranja/20 transition-colors font-medium">
          Añadir
        </button>
      </div>
    </div>
  );
}

function StepSemilla({ data, update }: { data: any; update: (f: string, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel hint="En 2-3 frases, ¿quién eres más allá de tu profesión?">¿Quién eres?</FieldLabel>
        <TextInput value={data.quienEres} onChange={(v) => update("quienEres", v)} placeholder="Soy alguien que cree en..." multiline />
      </div>
      <div>
        <FieldLabel hint="Los principios que guían tus decisiones. Escribe y pulsa Enter.">Tus valores fundamentales</FieldLabel>
        <TagInput tags={data.valoresCore || []} onChange={(v) => update("valoresCore", v)} placeholder="Ej: Honestidad, Libertad, Impacto..." />
      </div>
      <div>
        <FieldLabel hint="¿Para qué haces lo que haces? ¿Qué te levanta por las mañanas?">Tu propósito</FieldLabel>
        <TextInput value={data.proposito} onChange={(v) => update("proposito", v)} placeholder="Ayudo a... para que puedan..." multiline />
      </div>
      <div>
        <FieldLabel hint="Esa habilidad o perspectiva única que te hace diferente.">Tu superpoder</FieldLabel>
        <TextInput value={data.superpoder} onChange={(v) => update("superpoder", v)} placeholder="Lo que mejor se me da es..." />
      </div>
    </div>
  );
}

function StepRaices({ data, update }: { data: any; update: (f: string, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel hint="El camino que te trajo hasta aquí. No necesitas contarlo todo, solo lo relevante.">Tu historia</FieldLabel>
        <TextInput value={data.historia} onChange={(v) => update("historia", v)} placeholder="Empecé cuando... y después de..." multiline />
      </div>
      <div>
        <FieldLabel hint="Momentos que te cambiaron o definieron como profesional.">Momentos clave</FieldLabel>
        <TagInput tags={data.momentosClave || []} onChange={(v) => update("momentosClave", v)} placeholder="Ej: Dejé mi trabajo corporativo, Mi primer cliente..." />
      </div>
      <div>
        <FieldLabel hint="¿Qué lecciones sacaste del camino?">Aprendizajes</FieldLabel>
        <TextInput value={data.aprendizajes} onChange={(v) => update("aprendizajes", v)} placeholder="Aprendí que..." multiline />
      </div>
      <div>
        <FieldLabel hint="¿Qué no quieres volver a vivir? Esto también define tu marca.">De qué huyes</FieldLabel>
        <TextInput value={data.deQueHuyes} onChange={(v) => update("deQueHuyes", v)} placeholder="No quiero volver a..." multiline />
      </div>
    </div>
  );
}

function StepTronco({ data, update }: { data: any; update: (f: string, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel hint="En una frase clara: ¿qué ofreces y qué te hace especial?">Propuesta de valor</FieldLabel>
        <TextInput value={data.propuestaValor} onChange={(v) => update("propuestaValor", v)} placeholder="Ayudo a [quién] a [qué] a través de [cómo]" multiline />
      </div>
      <div>
        <FieldLabel hint="¿Cómo te defines cuando alguien te pregunta a qué te dedicas?">Etiqueta profesional</FieldLabel>
        <TextInput value={data.etiquetaProfesional} onChange={(v) => update("etiquetaProfesional", v)} placeholder="Ej: Consultor de marca personal, Coach de negocios..." />
      </div>
      <div>
        <FieldLabel hint="El dolor principal que solucionas.">Problema que resuelves</FieldLabel>
        <TextInput value={data.problemaQueResuelves} onChange={(v) => update("problemaQueResuelves", v)} placeholder="El problema de mi audiencia es..." multiline />
      </div>
      <div>
        <FieldLabel hint="Describe a quién va dirigido tu trabajo.">A quién ayudas</FieldLabel>
        <TextInput value={data.aQuienAyudas} onChange={(v) => update("aQuienAyudas", v)} placeholder="Profesionales que... / Personas que quieren..." multiline />
      </div>
      <div>
        <FieldLabel hint="Tu método, enfoque o forma única de trabajar.">Cómo lo haces</FieldLabel>
        <TextInput value={data.comoLoHaces} onChange={(v) => update("comoLoHaces", v)} placeholder="Mi enfoque combina... / Uso un método basado en..." multiline />
      </div>
    </div>
  );
}

function StepRamas({ data, setData }: { data: any; setData: (v: any) => void }) {
  const addPilar = () => {
    setData({ pilares: [...data.pilares, { nombre: "", descripcion: "", subtemas: [] }] });
  };
  const removePilar = (i: number) => {
    setData({ pilares: data.pilares.filter((_: any, idx: number) => idx !== i) });
  };
  const updatePilar = (i: number, field: string, value: any) => {
    const updated = [...data.pilares];
    updated[i] = { ...updated[i], [field]: value };
    setData({ pilares: updated });
  };

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted">
        Define entre 3 y 5 pilares: los grandes temas de los que hablas. Cada pilar puede tener subtemas.
      </p>
      {data.pilares.map((pilar: any, i: number) => (
        <div key={i} className="bg-crema/50 rounded-xl border border-borde/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase">Pilar {i + 1}</span>
            {data.pilares.length > 1 && (
              <button onClick={() => removePilar(i)} className="text-xs text-danger/60 hover:text-danger">
                Eliminar
              </button>
            )}
          </div>
          <TextInput
            value={pilar.nombre}
            onChange={(v) => updatePilar(i, "nombre", v)}
            placeholder="Nombre del pilar (ej: Marca Personal)"
          />
          <TextInput
            value={pilar.descripcion}
            onChange={(v) => updatePilar(i, "descripcion", v)}
            placeholder="Breve descripción de este pilar"
            multiline
          />
          <div>
            <p className="text-xs text-muted mb-1">Subtemas</p>
            <TagInput
              tags={pilar.subtemas || []}
              onChange={(v) => updatePilar(i, "subtemas", v)}
              placeholder="Añadir subtema..."
            />
          </div>
        </div>
      ))}
      {data.pilares.length < 6 && (
        <button onClick={addPilar} className="text-sm text-naranja hover:underline">
          + Añadir pilar
        </button>
      )}
    </div>
  );
}

function StepCopa({ data, update }: { data: any; update: (f: string, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel hint="¿Dónde quieres estar en 3-5 años?">Tu visión</FieldLabel>
        <TextInput value={data.vision} onChange={(v) => update("vision", v)} placeholder="En unos años quiero..." multiline />
      </div>
      <div>
        <FieldLabel hint="¿Qué haces cada día para acercarte a esa visión?">Tu misión</FieldLabel>
        <TextInput value={data.mision} onChange={(v) => update("mision", v)} placeholder="Cada día me dedico a..." multiline />
      </div>
      <div>
        <FieldLabel hint="¿Qué cambio quieres generar en las personas o en tu entorno?">Impacto deseado</FieldLabel>
        <TextInput value={data.impacto} onChange={(v) => update("impacto", v)} placeholder="Quiero que la gente..." multiline />
      </div>
      <div>
        <FieldLabel hint="Una frase que puedas releer cuando tengas dudas. Tu Norte.">Tu frase brújula</FieldLabel>
        <TextInput value={data.fraseBrujula} onChange={(v) => update("fraseBrujula", v)} placeholder="Cuando pierda el rumbo, recordaré que..." />
      </div>
    </div>
  );
}

function StepFrutos({ data, update }: { data: any; update: (f: string, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel hint="Tu servicio o producto principal. Lo que te da de comer.">Producto estrella</FieldLabel>
        <TextInput value={data.productoEstrella} onChange={(v) => update("productoEstrella", v)} placeholder="Ej: Mentoría 1:1 de marca personal, Curso online de..." />
      </div>
      <div>
        <FieldLabel hint="Otros productos, servicios o fuentes de ingreso.">Otros productos</FieldLabel>
        <TagInput tags={data.otrosProductos || []} onChange={(v) => update("otrosProductos", v)} placeholder="Ej: Comunidad de pago, Ebook, Consultoría..." />
      </div>
      <div>
        <FieldLabel hint="¿Qué consigue tu cliente ideal después de trabajar contigo?">Resultado para el cliente</FieldLabel>
        <TextInput value={data.resultadoCliente} onChange={(v) => update("resultadoCliente", v)} placeholder="Después de trabajar conmigo, mis clientes..." multiline />
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
        <FieldLabel hint="¿Quién es tu audiencia ideal? Descríbela con detalle.">Audiencia principal</FieldLabel>
        <TextInput value={data.audienciaPrincipal} onChange={(v) => update("audienciaPrincipal", v)} placeholder="Profesionales de 30-45 años que..." multiline />
      </div>
      <div>
        <FieldLabel hint="Los canales donde se mueve tu audiencia.">Dónde están</FieldLabel>
        <TagInput tags={data.dondeEstan || []} onChange={(v) => update("dondeEstan", v)} placeholder="Ej: Instagram, LinkedIn, YouTube..." />
      </div>
      <div>
        <FieldLabel hint="¿Quién más habla de tu tema? No es malo, es contexto.">Competencia / referentes</FieldLabel>
        <TextInput value={data.competencia} onChange={(v) => update("competencia", v)} placeholder="En mi espacio también están..." multiline />
      </div>
      <div>
        <FieldLabel hint="Personas o marcas con las que podrías colaborar.">Aliados potenciales</FieldLabel>
        <TextInput value={data.aliadosPotenciales} onChange={(v) => update("aliadosPotenciales", v)} placeholder="Podría colaborar con..." multiline />
      </div>
      <div>
        <FieldLabel hint="¿Qué te hace diferente respecto a quienes hablan de lo mismo?">Tu posicionamiento</FieldLabel>
        <TextInput value={data.posicionamiento} onChange={(v) => update("posicionamiento", v)} placeholder="Lo que me diferencia es..." multiline />
      </div>
    </div>
  );
}

function StepTiempo({ data, update }: { data: any; update: (f: string, v: any) => void }) {
  return (
    <div className="space-y-5">
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

function StepProducto({ data, update }: { data: any; update: (f: string, v: any) => void }) {
  const estados = [
    { value: "idea", label: "Es una idea" },
    { value: "en_desarrollo", label: "En desarrollo" },
    { value: "validado", label: "Validado (ya hay interés)" },
    { value: "vendiendo", label: "Ya se vende" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel hint="El nombre de tu producto o servicio estrella.">Nombre del producto</FieldLabel>
        <TextInput value={data.nombreProducto} onChange={(v) => update("nombreProducto", v)} placeholder="Ej: Mentoría 'De Cero a Marca', Curso 'Brújula de Contenido'..." />
      </div>
      <div>
        <FieldLabel hint="¿Para quién es este producto exactamente?">Para quién</FieldLabel>
        <TextInput value={data.paraQuien} onChange={(v) => update("paraQuien", v)} placeholder="Profesionales que quieren..." multiline />
      </div>
      <div>
        <FieldLabel hint="¿Qué transformación obtiene quien lo compra?">Qué consigue el cliente</FieldLabel>
        <TextInput value={data.queConsigue} onChange={(v) => update("queConsigue", v)} placeholder="Al terminar, tendrán..." multiline />
      </div>
      <div>
        <FieldLabel hint="Rango de precio o precio exacto.">Precio</FieldLabel>
        <TextInput value={data.precio} onChange={(v) => update("precio", v)} placeholder="Ej: 497€, 97€/mes, Gratuito..." />
      </div>
      <div>
        <FieldLabel hint="¿Cómo llegas a tus clientes? ¿Dónde se compra?">Canal de venta</FieldLabel>
        <TextInput value={data.canalVenta} onChange={(v) => update("canalVenta", v)} placeholder="Ej: Web propia, Llamada de venta, DMs de Instagram..." />
      </div>
      <div>
        <FieldLabel>Estado actual</FieldLabel>
        <div className="flex flex-wrap gap-2 mt-1">
          {estados.map((e) => (
            <button
              key={e.value}
              onClick={() => update("estadoActual", e.value)}
              className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                data.estadoActual === e.value
                  ? "border-naranja bg-naranja/10 text-naranja font-medium"
                  : "border-borde text-muted hover:border-naranja"
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== CANVAS VIEW =====

function ArbolCanvas({
  data,
  setData,
  userName,
  onSave,
  saving,
  onEditSection,
}: {
  data: ArbolData;
  setData: (d: ArbolData) => void;
  userName: string;
  onSave: () => void;
  saving: boolean;
  onEditSection: (idx: number) => void;
}) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const sections = [
    {
      icon: "🌱",
      title: "La Semilla",
      summary: data.semilla.quienEres || data.semilla.proposito || "Sin completar",
      highlights: [
        data.semilla.valoresCore?.length > 0 && `Valores: ${data.semilla.valoresCore.join(", ")}`,
        data.semilla.superpoder && `Superpoder: ${data.semilla.superpoder}`,
      ].filter(Boolean),
    },
    {
      icon: "🌿",
      title: "Las Raíces",
      summary: data.raices.historia || "Sin completar",
      highlights: [
        data.raices.momentosClave?.length > 0 && `${data.raices.momentosClave.length} momentos clave`,
        data.raices.deQueHuyes && `Huye de: ${data.raices.deQueHuyes.slice(0, 60)}...`,
      ].filter(Boolean),
    },
    {
      icon: "🪵",
      title: "El Tronco",
      summary: data.tronco.propuestaValor || "Sin completar",
      highlights: [
        data.tronco.etiquetaProfesional && data.tronco.etiquetaProfesional,
        data.tronco.problemaQueResuelves && `Resuelve: ${data.tronco.problemaQueResuelves.slice(0, 60)}...`,
      ].filter(Boolean),
    },
    {
      icon: "🌲",
      title: "Las Ramas",
      summary: data.ramas.pilares?.map((p) => p.nombre).filter(Boolean).join(" · ") || "Sin completar",
      highlights: data.ramas.pilares?.filter((p) => p.nombre).map((p) => `${p.nombre}${p.subtemas?.length ? ` (${p.subtemas.length} subtemas)` : ""}`),
    },
    {
      icon: "☁️",
      title: "La Copa",
      summary: data.copa.vision || "Sin completar",
      highlights: [
        data.copa.mision && `Misión: ${data.copa.mision.slice(0, 60)}...`,
        data.copa.fraseBrujula && `"${data.copa.fraseBrujula}"`,
      ].filter(Boolean),
    },
    {
      icon: "🍎",
      title: "Los Frutos",
      summary: data.frutos.productoEstrella || "Sin completar",
      highlights: [
        data.frutos.otrosProductos?.length > 0 && `+${data.frutos.otrosProductos.length} productos más`,
        data.frutos.resultadoCliente && `Resultado: ${data.frutos.resultadoCliente.slice(0, 60)}...`,
      ].filter(Boolean),
    },
    {
      icon: "🌍",
      title: "El Entorno",
      summary: data.entorno.audienciaPrincipal || "Sin completar",
      highlights: [
        data.entorno.dondeEstan?.length > 0 && `Canales: ${data.entorno.dondeEstan.join(", ")}`,
        data.entorno.posicionamiento && `Diferencial: ${data.entorno.posicionamiento.slice(0, 60)}...`,
      ].filter(Boolean),
    },
    {
      icon: "⏳",
      title: "El Tiempo",
      summary: data.tiempo.proximoHito || data.tiempo.ritmoPublicacion || "Sin completar",
      highlights: [
        data.tiempo.metaAnual && `Meta anual: ${data.tiempo.metaAnual.slice(0, 60)}...`,
        data.tiempo.buenaVida && `Buena vida: ${data.tiempo.buenaVida.slice(0, 60)}...`,
      ].filter(Boolean),
    },
    {
      icon: "📦",
      title: "El Producto",
      summary: data.producto.nombreProducto || "Sin completar",
      highlights: [
        data.producto.precio && `Precio: ${data.producto.precio}`,
        data.producto.estadoActual && `Estado: ${data.producto.estadoActual}`,
      ].filter(Boolean),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl text-negro mb-1">
            🌳 El Árbol de {userName || "tu Marca"}
          </h1>
          <p className="text-muted text-sm">
            Tu marca personal en una sola vista. Haz click en cualquier sección para editarla.
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="text-xs px-4 py-2 bg-naranja text-white rounded-xl hover:bg-naranja-hover transition-colors disabled:opacity-50 font-medium flex-shrink-0"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      {/* Tree visual — vertical layout */}
      <div className="space-y-3">
        {sections.map((section, idx) => {
          const isExpanded = expandedSection === idx;
          const isEmpty = section.summary === "Sin completar";

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all ${
                isEmpty
                  ? "border-borde/40 bg-white/50 opacity-60"
                  : isExpanded
                  ? "border-naranja/40 bg-white shadow-card"
                  : "border-borde/60 bg-white hover:border-naranja/30 hover:shadow-card-hover"
              }`}
            >
              <button
                onClick={() => setExpandedSection(isExpanded ? null : idx)}
                className="w-full text-left px-5 py-4 flex items-center gap-4"
              >
                <span className="text-2xl flex-shrink-0">{section.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-base text-negro">{section.title}</h3>
                    {isEmpty && (
                      <span className="text-[10px] bg-borde/30 text-muted px-2 py-0.5 rounded-full">Pendiente</span>
                    )}
                  </div>
                  <p className="text-sm text-negro/60 truncate mt-0.5">{section.summary}</p>
                </div>
                <svg
                  className={`w-4 h-4 text-muted flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-borde/30">
                  <div className="mt-4 space-y-2">
                    {section.highlights.map((h, hi) => (
                      <p key={hi} className="text-sm text-negro/70 leading-relaxed">
                        {h}
                      </p>
                    ))}
                    {section.highlights.length === 0 && (
                      <p className="text-sm text-muted italic">Aún no has completado esta sección.</p>
                    )}
                  </div>
                  <button
                    onClick={() => onEditSection(idx)}
                    className="mt-4 text-xs text-naranja font-medium hover:underline"
                  >
                    Editar sección →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary strip */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted">
          {sections.filter((s) => s.summary !== "Sin completar").length} de {sections.length} secciones completadas
        </p>
      </div>
    </div>
  );
}
