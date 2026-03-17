"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

/* ─── Data ──────────────────────────────────────────── */
const QUESTIONS = [
  {
    level: "Historia",
    number: 1,
    question:
      'Si alguien te pregunta "¿por qué haces lo que haces?" — ¿qué pasa?',
    options: [
      {
        letter: "A",
        text: "Tengo una respuesta clara que conecta mi historia personal con mi trabajo. Sé de dónde vengo y cómo eso define lo que ofrezco.",
        points: 2,
      },
      {
        letter: "B",
        text: "Tengo una idea general, pero me cuesta articularlo de forma concreta. Sé que hay algo ahí pero no lo he trabajado.",
        points: 1,
      },
      {
        letter: "C",
        text: "No lo tengo claro. Hago lo que hago porque se me da bien o porque surgió, pero no he conectado los puntos.",
        points: 0,
      },
    ],
  },
  {
    level: "Valores y propósito",
    number: 2,
    question:
      "¿Podrías decirme ahora mismo 3 valores no negociables de tu marca y una línea roja que nunca cruzarías?",
    options: [
      {
        letter: "A",
        text: "Sí. Los tengo definidos y los uso para tomar decisiones de negocio. Son mi filtro.",
        points: 2,
      },
      {
        letter: "B",
        text: "Tengo una idea intuitiva de mis valores, pero no los he escrito ni los uso conscientemente.",
        points: 1,
      },
      {
        letter: "C",
        text: "Si me preguntas, te diría cosas genéricas como 'honestidad' o 'calidad'. No tengo nada concreto ni propio.",
        points: 0,
      },
    ],
  },
  {
    level: "Mercado",
    number: 3,
    question:
      "¿A quién ayudas exactamente, qué problema concreto les resuelves y por qué deberían elegirte a ti?",
    options: [
      {
        letter: "A",
        text: "Lo tengo claro y definido. Sé quién es mi cliente ideal, qué dolor tiene y qué me hace diferente.",
        points: 2,
      },
      {
        letter: "B",
        text: "Tengo una idea general de mi público, pero mi propuesta de valor es difusa. Me cuesta explicar por qué yo.",
        points: 1,
      },
      {
        letter: "C",
        text: "Ayudo 'a todo el mundo' o no tengo claro qué problema resuelvo. Sé que soy bueno en lo mío pero no sé cómo comunicarlo.",
        points: 0,
      },
    ],
  },
  {
    level: "Estrategia",
    number: 4,
    question:
      "¿Tienes un plan de comunicación que responde a una estrategia coherente con tu identidad y tu mercado?",
    options: [
      {
        letter: "A",
        text: "Sí. Sé qué publico, por qué, para quién y con qué objetivo. Mi contenido tiene un plan detrás.",
        points: 2,
      },
      {
        letter: "B",
        text: "Publico contenido más o menos regularmente, pero sin un plan claro. A veces funciona, a veces no sé por qué.",
        points: 1,
      },
      {
        letter: "C",
        text: "No tengo estrategia. Publico cuando me acuerdo o cuando veo qué hacen otros. Improviso.",
        points: 0,
      },
    ],
  },
  {
    level: "Resultados",
    number: 5,
    question:
      "¿Tu marca personal atrae a las personas correctas y te permite vivir como quieres?",
    options: [
      {
        letter: "A",
        text: "Sí. Atraigo al tipo de cliente/proyecto que quiero. Mi marca trabaja para mí, no al revés.",
        points: 2,
      },
      {
        letter: "B",
        text: "A veces atraigo a las personas correctas, pero no de forma consistente. Depende demasiado de mi esfuerzo diario.",
        points: 1,
      },
      {
        letter: "C",
        text: "No. Siento que grito al vacío, o atraigo a personas que no encajan. Mi marca no me representa ni me genera oportunidades.",
        points: 0,
      },
    ],
  },
];

const RESULTS = [
  {
    min: 0,
    max: 3,
    title: "Tu base está sin definir.",
    subtitle: "Necesitas excavar antes de comunicar.",
    description:
      "No es que tu estrategia sea mala — es que no tiene sobre qué sostenerse. Estás intentando construir la pirámide desde el tejado. Antes de pensar en contenido, en redes o en visibilidad, necesitas hacer el trabajo de debajo: entender tu historia, definir tus valores y saber a quién te diriges.",
    action:
      "Tu siguiente paso: para. Deja de publicar por publicar. Dedica tiempo a responder con honestidad las preguntas de los niveles 1 y 2. El Sistema de Buena Vida tiene herramientas específicas para esto.",
    color: "text-red-500",
    bg: "bg-red-500",
  },
  {
    min: 4,
    max: 6,
    title: "Tienes las piezas pero no el sistema.",
    subtitle: "Sabes cosas pero no las has conectado.",
    description:
      "Probablemente tienes una idea intuitiva de quién eres y a quién ayudas, pero no lo has aterrizado. Tu marca funciona a ratos porque a ratos te sale bien, pero no de forma predecible. Lo que te falta no es más información — es método.",
    action:
      "Tu siguiente paso: trabaja la conexión entre niveles. Que tus valores definan tu mercado, y tu mercado defina tu estrategia. No al revés. Las herramientas del Sistema están diseñadas exactamente para esto.",
    color: "text-naranja",
    bg: "bg-naranja",
  },
  {
    min: 7,
    max: 10,
    title: "Buen punto de partida.",
    subtitle: "Ahora toca afinar y sistematizar.",
    description:
      "Tienes claridad en la mayoría de niveles. Eso es más de lo que tiene el 90% de profesionales. Pero 'tener una idea clara' y 'tener un sistema que funcione' son cosas distintas. El siguiente salto es pasar de la intuición a la estructura.",
    action:
      "Tu siguiente paso: sistematiza lo que ya sabes. Pon por escrito tu propuesta de valor, define tu plan de contenido y revisa si tus resultados son coherentes con tu base. El Sistema te da las herramientas para hacerlo.",
    color: "text-green-500",
    bg: "bg-green-500",
  },
];

const SKOOL_URL = "https://www.skool.com/una-buena-vida-comunidad-2471";

/* ─── Component ─────────────────────────────────────── */
function DiagnosticoQuiz() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0); // 0-4 = questions, 5 = email, 6 = result
  const [answers, setAnswers] = useState<number[]>([]);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const totalScore = answers.reduce((a, b) => a + b, 0);
  const result = RESULTS.find((r) => totalScore >= r.min && totalScore <= r.max)!;
  const progress = Math.round(((step > 5 ? 5 : step) / 5) * 100);

  const handleAnswer = (points: number) => {
    if (animating) return;
    setAnimating(true);
    const newAnswers = [...answers, points];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (step < 4) {
        setStep(step + 1);
      } else {
        // If we already have email from landing, skip to result
        if (email) {
          setStep(6);
          // Send to Loop in background
          fetch("/api/lead-magnet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              score: newAnswers.reduce((a, b) => a + b, 0),
              answers: newAnswers,
            }),
          }).catch(() => {});
        } else {
          setStep(5);
        }
      }
      setAnimating(false);
    }, 400);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    try {
      await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, score: totalScore, answers }),
      });
    } catch {
      // Continue even if API fails
    }
    setSending(false);
    setStep(6);
  };

  return (
    <div className="min-h-screen bg-crema">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-5 max-w-4xl mx-auto">
        <a href="/" className="flex items-center gap-2.5">
          <span className="text-2xl">🎓</span>
          <span className="font-heading text-xl font-semibold text-negro tracking-tight">
            El Sistema de Buena Vida
          </span>
        </a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-10 sm:py-16">
        {/* Progress bar */}
        {step < 6 && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-naranja uppercase tracking-widest">
                {step < 5 ? `Pregunta ${step + 1} de 5` : "Último paso"}
              </span>
              <span className="text-xs text-muted">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-negro/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-naranja rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Questions (step 0-4) */}
        {step >= 0 && step <= 4 && (
          <div
            className={`transition-all duration-300 ${animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
          >
            <div className="mb-2">
              <span className="text-naranja text-[11px] font-bold uppercase tracking-widest">
                {QUESTIONS[step].level}
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl text-negro leading-snug mb-8">
              {QUESTIONS[step].question}
            </h2>
            <div className="space-y-3">
              {QUESTIONS[step].options.map((opt) => (
                <button
                  key={opt.letter}
                  onClick={() => handleAnswer(opt.points)}
                  className="w-full text-left bg-white rounded-xl border border-borde/40 p-5 hover:border-naranja/40 hover:shadow-card transition-all group"
                >
                  <div className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-negro/[0.04] group-hover:bg-naranja/10 flex items-center justify-center text-sm font-bold text-negro/40 group-hover:text-naranja transition-colors">
                      {opt.letter}
                    </span>
                    <p className="text-sm text-negro/80 leading-relaxed pt-1">
                      {opt.text}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Email step (step 5) */}
        {step === 5 && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-naranja/10 flex items-center justify-center text-3xl mx-auto mb-6">
              🔺
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl text-negro mb-3">
              Tu diagnóstico está listo.
            </h2>
            <p className="text-muted text-base mb-8 max-w-md mx-auto">
              Deja tu email para ver tu resultado completo y recibir una guía
              con los pasos concretos para desbloquear tu marca.
            </p>
            <form
              onSubmit={handleEmailSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 px-4 py-3 rounded-xl border border-borde/60 bg-white text-negro text-sm focus:outline-none focus:border-naranja focus:ring-2 focus:ring-naranja/20 transition-all"
              />
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center gap-2 bg-naranja text-white font-semibold px-6 py-3 rounded-xl hover:bg-naranja-hover transition-colors text-sm disabled:opacity-60"
              >
                {sending ? "Enviando..." : "Ver mi resultado"}
              </button>
            </form>
            <p className="text-xs text-muted/60">
              <span className="text-naranja/60">✓</span> Sin spam · Te envío el
              diagnóstico completo en PDF
            </p>
          </div>
        )}

        {/* Result (step 6) */}
        {step === 6 && result && (
          <div>
            {/* Score circle */}
            <div className="text-center mb-10">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="rgba(0,0,0,0.06)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(totalScore / 10) * 327} 327`}
                    className={result.color}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading text-3xl text-negro">
                    {totalScore}
                  </span>
                  <span className="text-xs text-muted">/10</span>
                </div>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl text-negro mb-2">
                {result.title}
              </h2>
              <p className="text-muted text-base italic">{result.subtitle}</p>
            </div>

            {/* Level breakdown */}
            <div className="bg-white rounded-2xl border border-borde/40 p-6 sm:p-8 mb-6">
              <p className="text-[11px] font-bold text-negro/40 uppercase tracking-widest mb-5">
                Tu puntuación por nivel
              </p>
              <div className="space-y-4">
                {QUESTIONS.map((q, i) => (
                  <div key={q.level}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium text-negro">
                        {q.level}
                      </span>
                      <span className="text-xs text-muted">
                        {answers[i]}/2
                      </span>
                    </div>
                    <div className="w-full h-2 bg-negro/[0.06] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${answers[i] === 2 ? "bg-green-400" : answers[i] === 1 ? "bg-naranja" : "bg-red-400"}`}
                        style={{ width: `${(answers[i] / 2) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interpretation */}
            <div className="bg-white rounded-2xl border border-borde/40 p-6 sm:p-8 mb-6">
              <p className="text-sm text-negro/70 leading-relaxed mb-5">
                {result.description}
              </p>
              <div className="bg-crema rounded-xl p-5 border border-borde/30">
                <p className="text-sm text-negro font-medium leading-relaxed">
                  {result.action}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-negro rounded-2xl p-8 sm:p-10 text-center">
              <h3 className="font-heading text-xl sm:text-2xl text-white mb-3">
                ¿Quieres construirla bien?
              </h3>
              <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
                El Sistema de Buena Vida es una comunidad donde trabajas tu
                marca personal de abajo arriba. Con método, herramientas y
                personas que piensan como tú.
              </p>
              <a
                href={SKOOL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-naranja text-white font-semibold px-8 py-4 rounded-xl hover:bg-naranja-hover transition-colors text-sm"
              >
                Unirme a la comunidad — 39$/mes
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
              <p className="text-white/30 text-xs mt-4">
                Sin permanencia · Cancela cuando quieras
              </p>
            </div>

            {/* Restart */}
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setStep(0);
                  setAnswers([]);
                }}
                className="text-sm text-muted hover:text-negro transition-colors"
              >
                Repetir el diagnóstico
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-borde/30 py-6 mt-10">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted/60">
            Jano Cabello ·{" "}
            <a
              href="https://janocabello.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-naranja/60 hover:text-naranja"
            >
              janocabello.com
            </a>
          </p>
          <p className="text-xs text-muted/40 italic">
            &ldquo;Tu marca personal no es tu escaparate en redes — es el
            vehículo para vivir una buena vida.&rdquo;
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function DiagnosticoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-crema flex items-center justify-center">
          <div className="animate-pulse text-muted">Cargando diagnóstico...</div>
        </div>
      }
    >
      <DiagnosticoQuiz />
    </Suspense>
  );
}
