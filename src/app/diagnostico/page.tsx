"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

/* ─── Types ──────────────────────────────────────── */
interface Question {
  level: string;
  levelKey: string;
  number: number;
  question: string;
  options: { letter: string; text: string; points: number }[];
}

interface Profile {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  color: string;
  bgGradient: string;
  cardBg: string;
}

interface LevelFeedback {
  strong: string;
  medium: string;
  weak: string;
  skoolAction: string;
  skoolIcon: string;
}

/* ─── Questions ──────────────────────────────────── */
const QUESTIONS: Question[] = [
  {
    level: "Historia",
    levelKey: "historia",
    number: 1,
    question: 'Si alguien te pregunta "¿por qué haces lo que haces?" — ¿qué pasa?',
    options: [
      { letter: "A", text: "Tengo una respuesta clara que conecta mi historia personal con mi trabajo. Sé de dónde vengo y cómo eso define lo que ofrezco.", points: 2 },
      { letter: "B", text: "Tengo una idea general, pero me cuesta articularlo de forma concreta. Sé que hay algo ahí pero no lo he trabajado.", points: 1 },
      { letter: "C", text: "No lo tengo claro. Hago lo que hago porque se me da bien o porque surgió, pero no he conectado los puntos.", points: 0 },
    ],
  },
  {
    level: "Valores y propósito",
    levelKey: "valores",
    number: 2,
    question: "¿Podrías decirme ahora mismo 3 valores no negociables de tu marca y una línea roja que nunca cruzarías?",
    options: [
      { letter: "A", text: "Sí. Los tengo definidos y los uso para tomar decisiones de negocio. Son mi filtro.", points: 2 },
      { letter: "B", text: "Tengo una idea intuitiva de mis valores, pero no los he escrito ni los uso conscientemente.", points: 1 },
      { letter: "C", text: 'Si me preguntas, te diría cosas genéricas como "honestidad" o "calidad". No tengo nada concreto ni propio.', points: 0 },
    ],
  },
  {
    level: "Mercado",
    levelKey: "mercado",
    number: 3,
    question: "¿A quién ayudas exactamente, qué problema concreto les resuelves y por qué deberían elegirte a ti?",
    options: [
      { letter: "A", text: "Lo tengo claro y definido. Sé quién es mi cliente ideal, qué dolor tiene y qué me hace diferente.", points: 2 },
      { letter: "B", text: "Tengo una idea general de mi público, pero mi propuesta de valor es difusa. Me cuesta explicar por qué yo.", points: 1 },
      { letter: "C", text: 'Ayudo "a todo el mundo" o no tengo claro qué problema resuelvo. Sé que soy bueno en lo mío pero no sé cómo comunicarlo.', points: 0 },
    ],
  },
  {
    level: "Estrategia",
    levelKey: "estrategia",
    number: 4,
    question: "¿Tienes un plan de comunicación que responde a una estrategia coherente con tu identidad y tu mercado?",
    options: [
      { letter: "A", text: "Sí. Sé qué publico, por qué, para quién y con qué objetivo. Mi contenido tiene un plan detrás.", points: 2 },
      { letter: "B", text: "Publico contenido más o menos regularmente, pero sin un plan claro. A veces funciona, a veces no sé por qué.", points: 1 },
      { letter: "C", text: "No tengo estrategia. Publico cuando me acuerdo o cuando veo qué hacen otros. Improviso.", points: 0 },
    ],
  },
  {
    level: "Resultados",
    levelKey: "resultados",
    number: 5,
    question: "¿Tu marca personal atrae a las personas correctas y te permite vivir como quieres?",
    options: [
      { letter: "A", text: "Sí. Atraigo al tipo de cliente/proyecto que quiero. Mi marca trabaja para mí, no al revés.", points: 2 },
      { letter: "B", text: "A veces atraigo a las personas correctas, pero no de forma consistente. Depende demasiado de mi esfuerzo diario.", points: 1 },
      { letter: "C", text: "No. Siento que grito al vacío, o atraigo a personas que no encajan. Mi marca no me representa ni me genera oportunidades.", points: 0 },
    ],
  },
];

/* ─── Profiles (based on answer patterns) ────────── */
const PROFILES: Record<string, Profile> = {
  invisible: {
    id: "invisible",
    name: "El Invisible con Potencial",
    emoji: "👻",
    tagline: "Tienes algo valioso, pero nadie lo sabe todavía.",
    description: "Tu marca personal todavía no existe como sistema. Tienes talento y experiencia, pero no has hecho el trabajo de definir quién eres, a quién ayudas y por qué tú. Estás construyendo en el aire.",
    color: "#EF4444",
    bgGradient: "from-red-500/20 to-orange-500/10",
    cardBg: "#FEF2F2",
  },
  todoterreno: {
    id: "todoterreno",
    name: "El Todoterreno sin Brújula",
    emoji: "🧭",
    tagline: "Haces muchas cosas bien, pero sin dirección.",
    description: "Tienes piezas sueltas: algo de claridad aquí, algo de estrategia allá. Pero no están conectadas. Publicas porque sabes que hay que publicar, pero sin un sistema detrás. El resultado: esfuerzo desproporcionado para los resultados que consigues.",
    color: "#F59E0B",
    bgGradient: "from-amber-500/20 to-yellow-500/10",
    cardBg: "#FFFBEB",
  },
  fachada: {
    id: "fachada",
    name: "El que Publica sin Cimientos",
    emoji: "🏗️",
    tagline: "Mucha visibilidad, poca profundidad.",
    description: "Tienes presencia y tal vez hasta métricas decentes. Pero si rascas debajo, los cimientos están flojos: no tienes claro tu porqué, tus valores son genéricos o tu mercado está difuso. Tu marca es una fachada — bonita, pero sin estructura.",
    color: "#8B5CF6",
    bgGradient: "from-violet-500/20 to-purple-500/10",
    cardBg: "#F5F3FF",
  },
  casi: {
    id: "casi",
    name: "El que Casi lo Tiene",
    emoji: "🔑",
    tagline: "Estás cerca. Te falta el sistema.",
    description: "Tienes claridad en casi todo. Sabes quién eres, a quién ayudas y tienes algo de estrategia. Lo que te falta es sistematizar: pasar de la intuición a un método que funcione sin que tú estés empujando cada día.",
    color: "#3B82F6",
    bgGradient: "from-blue-500/20 to-cyan-500/10",
    cardBg: "#EFF6FF",
  },
  coherente: {
    id: "coherente",
    name: "El Profesional Coherente",
    emoji: "⚡",
    tagline: "Buena base. Ahora toca escalar.",
    description: "Tu marca tiene fundamentos sólidos. Tienes historia, valores, mercado y algo de estrategia. El siguiente nivel es optimizar, medir y crear un sistema que crezca solo. Estás en la posición perfecta para dar el salto.",
    color: "#10B981",
    bgGradient: "from-emerald-500/20 to-green-500/10",
    cardBg: "#ECFDF5",
  },
};

/* ─── Per-level feedback with Skool actions ──────── */
const LEVEL_FEEDBACK: Record<string, LevelFeedback> = {
  historia: {
    strong: "Tu historia está clara y conectada con tu trabajo. Eso es más de lo que tiene el 90% de profesionales.",
    medium: "Tienes una intuición de tu historia, pero no la has aterrizado. Cuando la definas, todo lo demás cobra sentido.",
    weak: "Sin una historia que conecte tu pasado con tu presente, tu marca es intercambiable. Es lo primero que hay que trabajar.",
    skoolAction: "En los Cafés de los Miércoles trabajamos exactamente esto: conectar tu historia con tu marca. Es lo primero que hacemos con cada miembro nuevo.",
    skoolIcon: "☕",
  },
  valores: {
    strong: "Tus valores son filtro de decisión, no decoración. Eso te da coherencia y la gente lo nota.",
    medium: "Sabes lo que importa pero no lo has formalizado. Los valores sin definir se diluyen cuando llega la presión.",
    weak: "Valores genéricos = marca genérica. Si no tienes líneas rojas claras, tu marca dice sí a todo y no significa nada.",
    skoolAction: "La Pirámide de la Marca Personal del Sistema te guía paso a paso para definir valores que sean tu brújula real, no palabras bonitas en una bio.",
    skoolIcon: "🔺",
  },
  mercado: {
    strong: "Sabes a quién ayudas y por qué tú. Eso es una ventaja competitiva enorme.",
    medium: "Tienes una idea, pero \"más o menos\" no vende. Necesitas definir tu mercado con bisturí, no con brocha.",
    weak: "\"Ayudo a todo el mundo\" = no ayudas a nadie en concreto. Definir tu mercado es la decisión más rentable que puedes tomar.",
    skoolAction: "El Árbol de Contenidos del Sistema te ayuda a mapear tu audiencia, tus pilares y tus ángulos. Es la herramienta que más usan los miembros para encontrar su foco.",
    skoolIcon: "🌳",
  },
  estrategia: {
    strong: "Tienes un plan. Eso te pone por delante del 95% de profesionales que improvisan.",
    medium: "Publicas, pero sin sistema. A veces funciona, a veces no sabes por qué. Eso tiene arreglo.",
    weak: "Sin estrategia, tu contenido es ruido. Da igual lo bueno que seas si nadie lo ve con un plan detrás.",
    skoolAction: "El Maestro IA genera tu plan de contenido personalizado basándose en tu marca. Solo tienes que decirle cómo estás hoy y él te dice qué crear.",
    skoolIcon: "🤖",
  },
  resultados: {
    strong: "Tu marca atrae a las personas correctas. Ahora toca escalar lo que funciona.",
    medium: "A ratos funciona, a ratos no. La inconsistencia es síntoma de que el sistema no está cerrado.",
    weak: "Si tu marca no genera oportunidades, no es un problema de talento — es un problema de sistema.",
    skoolAction: "Cada miembro recibe feedback directo de Jano sobre su estrategia en las formaciones en vivo. No estás solo en esto — tienes acompañamiento real.",
    skoolIcon: "🎯",
  },
};

/* ─── Profile detection logic ────────────────────── */
function detectProfile(answers: number[]): Profile {
  const total = answers.reduce((a, b) => a + b, 0);
  const weakCount = answers.filter((a) => a === 0).length;
  const strongCount = answers.filter((a) => a === 2).length;

  // Foundation levels (historia + valores)
  const foundationScore = (answers[0] || 0) + (answers[1] || 0);
  // External levels (estrategia + resultados)
  const externalScore = (answers[3] || 0) + (answers[4] || 0);

  if (total <= 3) return PROFILES.invisible;
  if (total >= 8) return PROFILES.coherente;
  if (foundationScore <= 1 && externalScore >= 2) return PROFILES.fachada;
  if (total >= 6) return PROFILES.casi;
  return PROFILES.todoterreno;
}

/* ─── Skool URL ──────────────────────────────────── */
const SKOOL_URL = "https://www.skool.com/una-buena-vida-comunidad-2471";

/* ─── Icon Component ─────────────────────────────── */
const Icon = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

/* ─── Share Card Component ───────────────────────── */
function ShareCard({
  profile,
  answers,
  totalScore,
}: {
  profile: Profile;
  answers: number[];
  totalScore: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 1080;
    const h = 1920;
    canvas.width = w;
    canvas.height = h;

    // Background
    ctx.fillStyle = "#1b1c1a";
    ctx.fillRect(0, 0, w, h);

    // Subtle texture pattern
    ctx.fillStyle = "rgba(255,255,255,0.015)";
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 80 + 20, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top section — brand
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "500 28px 'DM Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("EL SISTEMA DE BUENA VIDA", w / 2, 140);

    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = "500 20px 'DM Sans', sans-serif";
    ctx.fillText("DIAGNÓSTICO DE MARCA PERSONAL", w / 2, 180);

    // Profile emoji — large
    ctx.font = "160px serif";
    ctx.textAlign = "center";
    ctx.fillText(profile.emoji, w / 2, 420);

    // Profile name
    ctx.fillStyle = profile.color;
    ctx.font = "bold 56px 'DM Sans', sans-serif";
    ctx.textAlign = "center";
    const nameLines = wrapText(ctx, profile.name, w - 160);
    nameLines.forEach((line, i) => {
      ctx.fillText(line, w / 2, 540 + i * 70);
    });

    // Tagline
    const taglineY = 540 + nameLines.length * 70 + 30;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "italic 32px 'DM Sans', sans-serif";
    ctx.fillText(profile.tagline, w / 2, taglineY);

    // Score circle
    const scoreY = taglineY + 120;
    ctx.beginPath();
    ctx.arc(w / 2, scoreY, 80, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fill();
    ctx.strokeStyle = profile.color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(w / 2, scoreY, 80, -Math.PI / 2, -Math.PI / 2 + (totalScore / 10) * Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 64px 'DM Sans', sans-serif";
    ctx.fillText(`${totalScore}`, w / 2, scoreY + 20);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "500 24px 'DM Sans', sans-serif";
    ctx.fillText("/10", w / 2, scoreY + 55);

    // Level bars
    const barY = scoreY + 150;
    const levels = ["Historia", "Valores", "Mercado", "Estrategia", "Resultados"];
    const barWidth = w - 200;
    const barHeight = 16;
    const barGap = 70;

    levels.forEach((level, i) => {
      const y = barY + i * barGap;
      const score = answers[i] || 0;
      const pct = score / 2;

      // Label
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "500 24px 'DM Sans', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(level, 100, y - 10);

      ctx.textAlign = "right";
      ctx.fillText(`${score}/2`, w - 100, y - 10);

      // Bar bg
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.roundRect(100, y + 2, barWidth, barHeight, 8);
      ctx.fill();

      // Bar fill
      const colors = ["#EF4444", "#F59E0B", "#10B981"];
      ctx.fillStyle = colors[score] || colors[0];
      if (pct > 0) {
        ctx.beginPath();
        ctx.roundRect(100, y + 2, barWidth * pct, barHeight, 8);
        ctx.fill();
      }
    });

    // Bottom CTA
    const bottomY = h - 200;

    // Divider line
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, bottomY);
    ctx.lineTo(w - 100, bottomY);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,206,75,0.9)";
    ctx.font = "bold 30px 'DM Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Haz tu diagnóstico gratuito", w / 2, bottomY + 60);

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "500 26px 'DM Sans', sans-serif";
    ctx.fillText("sistema.janocabello.com/diagnostico", w / 2, bottomY + 105);

    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = "500 20px 'DM Sans', sans-serif";
    ctx.fillText("@janocabello", w / 2, bottomY + 150);

    // Generate blob URL
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setShareUrl(url);
      }
    }, "image/png");
  }, [profile, answers, totalScore]);

  useEffect(() => {
    generateCard();
  }, [generateCard]);

  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + " " + words[i];
      if (ctx.measureText(testLine).width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  const handleShare = async () => {
    if (!shareUrl) return;

    const blob = await fetch(shareUrl).then((r) => r.blob());
    const file = new File([blob], "mi-diagnostico-marca-personal.png", { type: "image/png" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: "Mi Diagnóstico de Marca Personal",
          text: `Soy "${profile.name}" — ${profile.tagline}`,
          files: [file],
        });
        return;
      } catch {
        // Fallback to download
      }
    }

    // Fallback: download
    const a = document.createElement("a");
    a.href = shareUrl;
    a.download = "mi-diagnostico-marca-personal.png";
    a.click();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://sistema.janocabello.com/diagnostico");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  };

  return (
    <div className="mb-6">
      <canvas ref={canvasRef} className="hidden" />

      {shareUrl && (
        <div className="rounded-2xl overflow-hidden mb-4 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shareUrl}
            alt="Tu diagnóstico de marca personal"
            className="w-full"
          />
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all"
          style={{ background: profile.color, color: "#fff" }}
        >
          <Icon name="share" className="text-lg" />
          Compartir en Stories
        </button>
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-surface-container-low rounded-2xl text-on-surface-variant text-sm font-medium hover:bg-surface-container-high transition-colors"
        >
          <Icon name={copied ? "check" : "link"} className="text-lg" />
          {copied ? "Copiado" : "Link"}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────── */
function DiagnosticoQuiz() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0); // 0-4 = questions, 5 = email, 6 = result
  const [answers, setAnswers] = useState<number[]>([]);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const totalScore = answers.reduce((a, b) => a + b, 0);
  const profile = detectProfile(answers);
  const progress = Math.round(((step > 5 ? 5 : step) / 5) * 100);

  const handleAnswer = (points: number, letter: string) => {
    if (animating) return;
    setSelectedOption(letter);
    setAnimating(true);
    const newAnswers = [...answers, points];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (step < 4) {
        setStep(step + 1);
      } else {
        if (email) {
          setStep(6);
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
      setSelectedOption(null);
      setAnimating(false);
    }, 500);
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

  // Scroll to result when it loads
  useEffect(() => {
    if (step === 6 && resultRef.current) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav — minimal on mobile */}
      <nav className="flex items-center justify-between px-5 sm:px-10 py-4 max-w-3xl mx-auto">
        <a href="https://janocabello.com" className="flex items-center gap-2.5" target="_blank" rel="noopener noreferrer">
          <span className="font-headline text-base sm:text-lg font-bold text-on-surface tracking-tight">
            Jano Cabello
          </span>
        </a>
        {step < 6 && (
          <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
            Diagnóstico gratuito
          </span>
        )}
      </nav>

      <div className="max-w-2xl mx-auto px-5 sm:px-10 pb-16">
        {/* ─── Landing / Intro (step -1 equivalent, shown before first question) ─── */}

        {/* Progress bar */}
        {step >= 0 && step < 6 && (
          <div className="mb-8 sm:mb-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                {step < 5 ? `Pregunta ${step + 1} de 5` : "Último paso"}
              </span>
              <span className="text-[10px] text-on-surface-variant font-medium">{progress}%</span>
            </div>
            <div className="w-full h-1 bg-on-surface/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #244267, #ffce4b)",
                }}
              />
            </div>
          </div>
        )}

        {/* ─── Questions (step 0-4) ─── */}
        {step >= 0 && step <= 4 && (
          <div className={`transition-all duration-300 ${animating ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}`}>
            <div className="mb-1.5">
              <span className="text-primary text-[10px] font-bold uppercase tracking-widest">
                Nivel {QUESTIONS[step].number}: {QUESTIONS[step].level}
              </span>
            </div>
            <h2 className="font-headline text-xl sm:text-2xl text-on-surface leading-snug mb-6 sm:mb-8">
              {QUESTIONS[step].question}
            </h2>
            <div className="space-y-3">
              {QUESTIONS[step].options.map((opt) => (
                <button
                  key={opt.letter}
                  onClick={() => handleAnswer(opt.points, opt.letter)}
                  disabled={animating}
                  className={`w-full text-left rounded-2xl p-4 sm:p-5 transition-all active:scale-[0.98] ${
                    selectedOption === opt.letter
                      ? "bg-primary/10 ring-2 ring-primary/30"
                      : "bg-surface-container-low hover:bg-surface-container-high"
                  }`}
                >
                  <div className="flex gap-3 sm:gap-4">
                    <span
                      className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold transition-colors ${
                        selectedOption === opt.letter
                          ? "bg-primary text-white"
                          : "bg-on-surface/[0.04] text-on-surface/40"
                      }`}
                    >
                      {opt.letter}
                    </span>
                    <p className="text-sm text-on-surface/80 leading-relaxed pt-0.5">{opt.text}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Email step (step 5) ─── */}
        {step === 5 && (
          <div className="text-center py-6">
            <div className="text-5xl mb-5">🔺</div>
            <h2 className="font-headline text-xl sm:text-2xl text-on-surface mb-2">
              Tu diagnóstico está listo.
            </h2>
            <p className="text-on-surface-variant text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              Deja tu email para ver tu perfil de marca personal, con recomendaciones concretas y un plan de acción.
            </p>
            <form onSubmit={handleEmailSubmit} className="max-w-sm mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3.5 rounded-2xl bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all mb-3 text-center"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3.5 rounded-2xl gradient-denim text-white font-semibold text-sm hover:shadow-card-hover transition-all disabled:opacity-60"
              >
                {sending ? "Analizando..." : "Ver mi diagnóstico →"}
              </button>
              <p className="text-[11px] text-on-surface-variant/50 mt-3">
                Solo tu email · Sin spam · Recibirás tu diagnóstico ampliado
              </p>
            </form>
          </div>
        )}

        {/* ─── Result (step 6) ─── */}
        {step === 6 && profile && (
          <div ref={resultRef}>
            {/* Profile Header */}
            <div className={`rounded-3xl bg-gradient-to-br ${profile.bgGradient} p-6 sm:p-8 mb-6 text-center`}>
              <div className="text-5xl sm:text-6xl mb-4">{profile.emoji}</div>
              <h2 className="font-headline text-2xl sm:text-3xl text-on-surface mb-1.5" style={{ color: profile.color }}>
                {profile.name}
              </h2>
              <p className="text-on-surface-variant text-sm italic mb-5">{profile.tagline}</p>

              {/* Score ring */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="7" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={profile.color} strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={`${(totalScore / 10) * 327} 327`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-headline text-2xl text-on-surface">{totalScore}</span>
                  <span className="text-[10px] text-on-surface-variant">/10</span>
                </div>
              </div>

              <p className="text-sm text-on-surface/70 leading-relaxed max-w-md mx-auto">
                {profile.description}
              </p>
            </div>

            {/* Share Card */}
            <ShareCard profile={profile} answers={answers} totalScore={totalScore} />

            {/* Per-Level Breakdown */}
            <div className="mb-6">
              <h3 className="font-headline text-lg text-on-surface mb-4">Tu marca nivel a nivel</h3>
              <div className="space-y-3">
                {QUESTIONS.map((q, i) => {
                  const score = answers[i] || 0;
                  const feedback = LEVEL_FEEDBACK[q.levelKey];
                  const feedbackText = score === 2 ? feedback.strong : score === 1 ? feedback.medium : feedback.weak;
                  const barColors = ["bg-red-400", "bg-amber-400", "bg-emerald-400"];
                  const statusLabels = ["Necesita trabajo", "En progreso", "Bien definido"];
                  const statusColors = ["text-red-500", "text-amber-600", "text-emerald-600"];

                  return (
                    <div key={q.levelKey} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
                      {/* Level header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{feedback.skoolIcon}</span>
                          <span className="font-headline text-sm text-on-surface">{q.level}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${statusColors[score]}`}>
                          {statusLabels[score]}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-on-surface/[0.06] rounded-full overflow-hidden mb-3">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${barColors[score]}`}
                          style={{ width: `${(score / 2) * 100}%` }}
                        />
                      </div>

                      {/* Feedback */}
                      <p className="text-sm text-on-surface/70 leading-relaxed mb-3">{feedbackText}</p>

                      {/* Skool recommendation (only show for weak/medium) */}
                      {score < 2 && (
                        <div className="bg-gradient-to-r from-primary/[0.04] to-transparent rounded-xl p-3 border-l-2 border-primary/30">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                            Dentro de la comunidad
                          </p>
                          <p className="text-xs text-on-surface/70 leading-relaxed">
                            {feedback.skoolAction}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* What you get inside */}
            <div className="bg-on-surface rounded-3xl p-6 sm:p-8 mb-6">
              <h3 className="font-headline text-lg text-white mb-1">
                Lo que encontrarás dentro
              </h3>
              <p className="text-white/40 text-xs mb-6">
                Todo lo que necesitas para construir tu marca con método
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: "☕",
                    title: "Cafés de los Miércoles",
                    desc: "Sesiones en vivo donde trabajamos tu marca conmigo y con la comunidad. Preguntas, feedback directo, casos reales.",
                  },
                  {
                    icon: "🔺",
                    title: "La Pirámide de la Marca Personal",
                    desc: "Herramienta interactiva para construir los 5 niveles de tu marca: desde tu historia hasta tus resultados.",
                  },
                  {
                    icon: "🌳",
                    title: "El Árbol de Contenidos",
                    desc: "Mapea tus pilares, subtemas y ángulos. Define de qué hablas, para quién y con qué estilo.",
                  },
                  {
                    icon: "🤖",
                    title: "El Maestro IA",
                    desc: "Tu director creativo personal. Le dices cómo estás y él te dice qué crear hoy con plan y estrategia.",
                  },
                  {
                    icon: "🎯",
                    title: "Feedback de Jano",
                    desc: "Formaciones en vivo, revisión de tu estrategia y acompañamiento real. No estás solo.",
                  },
                  {
                    icon: "📚",
                    title: "Formaciones y Masterclasses",
                    desc: "Contenido exclusivo sobre marca personal, estrategia de contenido, captación y posicionamiento.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</div>
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-0.5">{item.title}</h4>
                      <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-3xl p-6 sm:p-8 text-center mb-6" style={{ background: `linear-gradient(135deg, ${profile.color}15, ${profile.color}05)` }}>
              <h3 className="font-headline text-xl text-on-surface mb-2">
                ¿Quieres dejar de ser <span style={{ color: profile.color }}>{profile.name.replace("El ", "el ").replace("La ", "la ")}</span>?
              </h3>
              <p className="text-on-surface-variant text-sm mb-6 max-w-md mx-auto leading-relaxed">
                El Sistema de Buena Vida es la comunidad donde profesionales como tú construyen su marca personal con método, herramientas y acompañamiento real. Sin postureo. Sin atajos.
              </p>
              <a
                href={SKOOL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-sm hover:shadow-lg transition-all"
                style={{ background: profile.color }}
              >
                Unirme a la comunidad — 39$/mes
                <Icon name="arrow_forward" className="text-lg" />
              </a>
              <p className="text-on-surface-variant/50 text-[11px] mt-3">
                Sin permanencia · Cancela cuando quieras · Acceso inmediato
              </p>
            </div>

            {/* Social proof placeholder */}
            <div className="bg-surface-container-low rounded-2xl p-5 mb-6 text-center">
              <p className="text-on-surface-variant text-xs italic leading-relaxed">
                &ldquo;Ojalá hubiera tenido estas herramientas cuando empecé. Te ahorran años de ir dando palos de ciego.&rdquo;
              </p>
              <p className="text-on-surface text-xs font-semibold mt-2">— Miembro de la comunidad</p>
            </div>

            {/* Restart */}
            <div className="text-center">
              <button
                onClick={() => {
                  setStep(0);
                  setAnswers([]);
                  setEmail("");
                }}
                className="text-xs text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"
              >
                Repetir el diagnóstico
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-on-surface/[0.06] py-5 mt-6">
        <div className="max-w-3xl mx-auto px-5 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-on-surface-variant/50">
            Jano Cabello ·{" "}
            <a href="https://janocabello.com" target="_blank" rel="noopener noreferrer" className="text-primary/50 hover:text-primary">
              janocabello.com
            </a>
          </p>
          <p className="text-[11px] text-on-surface-variant/30 italic">
            Marca personal para una buena vida
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
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="animate-pulse text-on-surface-variant text-sm">Cargando diagnóstico...</div>
        </div>
      }
    >
      <DiagnosticoQuiz />
    </Suspense>
  );
}
