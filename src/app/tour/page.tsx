'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import Link from 'next/link';

export default function TourPage() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const handleStartPiramide = async () => {
    if (!userId) return;

    setIsLoading(true);
    const supabase = createClient();

    try {
      await supabase
        .from('profiles')
        .update({ tour_completed: true })
        .eq('id', userId);

      router.push('/piramide');
    } catch (error) {
      console.error('Error updating tour status:', error);
      setIsLoading(false);
    }
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const nextStep = () => {
    if (step < 6) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const pyramidLevels = ['Historia', 'Valores', 'Mercado', 'Estrategia', 'Resultados'];
  const freeTools = [
    { icon: '🪞', name: 'El Espejo', desc: 'Tu marca de un vistazo.' },
    { icon: '🎙️', name: 'El Entrevistador', desc: 'Tu podcast privado. Practica tu relato y descubre tus mejores frases.' },
    { icon: '🎯', name: 'El Maestro', desc: 'Tu director creativo con IA. Genera ideas, titulares y estrategias.' },
    { icon: '📅', name: 'El Planificador', desc: 'Organiza tu contenido por semanas.' },
    { icon: '💡', name: 'Ideas', desc: 'Tu banco de ideas siempre abierto.' },
    { icon: '📝', name: 'Piezas', desc: 'Tu biblioteca de contenido.' },
  ];

  return (
    <div className="min-h-screen bg-crema">
      {/* Navigation */}
      <nav className="border-b border-borde/40 bg-white/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-heading text-negro hover:text-denim transition-colors">
            <span>🦍</span> Sistema Buena Vida
          </Link>
          <div className="text-xs text-muted font-medium">
            {step + 1} de 7
          </div>
        </div>
      </nav>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 pt-8 pb-12">
        {[0, 1, 2, 3, 4, 5, 6].map((dot) => (
          <button
            key={dot}
            onClick={() => setStep(dot)}
            className={`h-2 rounded-full transition-all ${
              dot === step ? 'bg-denim w-8' : dot < step ? 'bg-denim/40 w-2.5' : 'bg-borde w-2.5 hover:bg-denim/20'
            }`}
            aria-label={`Step ${dot + 1}`}
          />
        ))}
      </div>

      {/* Content Area */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        {/* Step 1: Welcome */}
        {step === 0 && (
          <div className="animate-fadeIn space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-heading text-negro">
                Bienvenido al Sistema 🦍
              </h1>
              <div className="space-y-4 text-lg text-negro">
                <p>
                  Este no es un curso. Es un sistema que te guía paso a paso para construir tu marca personal desde la base.
                </p>
                <p className="text-muted">
                  Vamos a enseñarte cómo funciona en 2 minutos.
                </p>
              </div>
            </div>
            <button
              onClick={nextStep}
              className="bg-denim text-white px-7 py-3.5 rounded-xl font-heading hover:bg-denim-dark transition-colors inline-flex items-center gap-2 shadow-button"
            >
              Empezar →
            </button>
          </div>
        )}

        {/* Step 2: La Pirámide */}
        {step === 1 && (
          <div className="animate-fadeIn space-y-8">
            <div className="space-y-6">
              <div className="text-5xl mb-4">🔺</div>
              <h2 className="text-3xl md:text-4xl font-heading text-negro">
                Fase 1 — La Pirámide
              </h2>
              <p className="text-sm text-denim font-heading uppercase tracking-wide">
                (quién eres)
              </p>
              <div className="space-y-4 text-lg text-negro">
                <p>
                  Todo empieza aquí. La Pirámide te guía por 5 niveles: tu historia, tus valores, tu mercado, tu estrategia y tus resultados.
                </p>
                <p className="text-muted">
                  Sin esta base, todo lo demás se tambalea. Por eso es lo primero que vas a hacer.
                </p>
              </div>
            </div>

            {/* Pyramid Visualization */}
            <div className="space-y-3 my-10">
              {pyramidLevels.map((level, idx) => {
                const width = 100 - (idx * 15);
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      style={{ width: `${width}%` }}
                      className="bg-denim/10 border-2 border-denim/30 text-negro text-center py-3 rounded-lg font-heading text-sm transition-all hover:bg-denim/15 hover:border-denim/50"
                    >
                      {level}
                    </div>
                  </div>
                );
              })}
            </div>

            <NavButtons onPrev={prevStep} onNext={nextStep} />
          </div>
        )}

        {/* Step 3: El Árbol */}
        {step === 2 && (
          <div className="animate-fadeIn space-y-8">
            <div className="space-y-6">
              <div className="text-5xl mb-4">🌳</div>
              <h2 className="text-3xl md:text-4xl font-heading text-negro">
                Fase 2 — El Árbol
              </h2>
              <p className="text-sm text-denim font-heading uppercase tracking-wide">
                (tu marca visible)
              </p>
              <div className="space-y-4 text-lg text-negro">
                <p>
                  Cuando termines la Pirámide, pasas al Árbol. 9 secciones que definen quién eres, qué ofreces y cómo te comunicas.
                </p>
                <p className="text-muted">
                  Al completarlo, una IA analiza la coherencia de tu marca y te dice dónde están las grietas.
                </p>
              </div>
            </div>

            <LockedBanner text="La Pirámide" />
            <NavButtons onPrev={prevStep} onNext={nextStep} />
          </div>
        )}

        {/* Step 4: Las Rutas */}
        {step === 3 && (
          <div className="animate-fadeIn space-y-8">
            <div className="space-y-6">
              <div className="text-5xl mb-4">🗺️</div>
              <h2 className="text-3xl md:text-4xl font-heading text-negro">
                Fase 3 — Las Rutas
              </h2>
              <p className="text-sm text-denim font-heading uppercase tracking-wide">
                (tu estrategia)
              </p>
              <div className="space-y-4 text-lg text-negro">
                <p>
                  Con tu marca diagnosticada, Las Rutas te asignan un camino personalizado según tu perfil.
                </p>
                <p className="text-muted">
                  No es un plan genérico. Es tu hoja de ruta basada en tus fortalezas y tus grietas, con estrategias generadas por IA.
                </p>
              </div>
            </div>

            <LockedBanner text="El Árbol" />
            <NavButtons onPrev={prevStep} onNext={nextStep} />
          </div>
        )}

        {/* Step 5: La Brújula */}
        {step === 4 && (
          <div className="animate-fadeIn space-y-8">
            <div className="space-y-6">
              <div className="text-5xl mb-4">🧭</div>
              <h2 className="text-3xl md:text-4xl font-heading text-negro">
                Fase 4 — La Brújula
              </h2>
              <p className="text-sm text-denim font-heading uppercase tracking-wide">
                (tu contenido)
              </p>
              <div className="space-y-4 text-lg text-negro">
                <p>
                  Con tu identidad clara, tu marca diagnosticada y tu estrategia definida, llega el momento de crear contenido.
                </p>
                <p className="text-muted">
                  La Brújula es tu sistema de contenido: defines tu briefing, tus buyer persona, tus pilares y tu estrategia de canales. Todo alineado con lo que ya has trabajado.
                </p>
              </div>
            </div>

            <LockedBanner text="Las Rutas" />
            <NavButtons onPrev={prevStep} onNext={nextStep} />
          </div>
        )}

        {/* Step 6: Herramientas libres */}
        {step === 5 && (
          <div className="animate-fadeIn space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-heading text-negro">
                Herramientas libres
              </h2>
              <p className="text-lg text-negro">
                Además del recorrido principal, tienes herramientas que puedes usar en cualquier momento:
              </p>
            </div>

            {/* Tools Grid */}
            <div className="space-y-3">
              {freeTools.map((tool, idx) => (
                <div key={idx} className="border-l-3 border-l-4 border-denim/40 bg-white rounded-xl pl-5 pr-4 py-4 hover:border-denim transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{tool.icon}</span>
                    <div>
                      <p className="font-heading text-negro text-base">{tool.name}</p>
                      <p className="text-muted text-sm mt-0.5">{tool.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* API Key Section */}
            <div className="bg-amarillo/10 border border-amarillo/25 rounded-2xl p-6 space-y-3 my-8">
              <p className="text-negro text-sm leading-relaxed">
                <span className="font-heading block mb-2">Para que el Maestro y otras herramientas con IA funcionen</span>
                necesitarás una <span className="font-heading text-denim">API Key de Anthropic</span>. Es como la llave que activa la inteligencia del sistema.
              </p>
              <p className="text-muted text-sm leading-relaxed">
                La configuras en <span className="font-heading text-negro">Ajustes → API Key</span>. Si no la tienes, te explicamos cómo conseguirla allí.
              </p>
            </div>

            {/* Tools Note */}
            <div className="bg-denim/[0.04] rounded-xl p-4 text-sm text-muted italic">
              Estas herramientas funcionan mejor cuando has completado las fases anteriores — pero puedes explorarlas cuando quieras.
            </div>

            <NavButtons onPrev={prevStep} onNext={nextStep} />
          </div>
        )}

        {/* Step 7: Ready to Start */}
        {step === 6 && (
          <div className="animate-fadeIn space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-heading text-negro">
                ¿Listo para empezar? 🦍
              </h2>
              <div className="space-y-4 text-lg text-negro">
                <p>
                  Tu marca personal se construye de abajo arriba. Siempre.
                </p>
                <p className="text-muted">
                  Empieza por La Pirámide. El resto vendrá cuando estés preparado.
                </p>
              </div>
            </div>

            {/* Process Summary */}
            <div className="my-12 space-y-3">
              {[
                { icon: '🔺', offset: '' },
                { icon: '🌳', offset: 'ml-8' },
                { icon: '🗺️', offset: 'ml-16' },
                { icon: '🧭', offset: 'ml-24' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 ${item.offset}`}>
                  <div className="text-3xl">{item.icon}</div>
                  {i < 3 && <div className="flex-1 h-1 bg-gradient-to-r from-denim/40 to-denim/10 rounded-full" />}
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="space-y-4">
              <button
                onClick={handleStartPiramide}
                disabled={isLoading}
                className="w-full bg-denim text-white px-6 py-4 rounded-xl font-heading hover:bg-denim-dark transition-colors disabled:opacity-50 text-lg shadow-button"
              >
                {isLoading ? 'Iniciando...' : 'Empezar con La Pirámide →'}
              </button>
              <button
                onClick={goToDashboard}
                className="w-full text-denim hover:text-denim-dark font-heading transition-colors text-sm py-2"
              >
                Ir al Panel
              </button>
            </div>

            {/* Back Button */}
            <div className="mt-8">
              <button
                onClick={prevStep}
                className="text-denim hover:text-denim-dark font-heading transition-colors"
              >
                ← Atrás
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function NavButtons({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onPrev}
        className="text-denim hover:text-denim-dark font-heading transition-colors"
      >
        ← Atrás
      </button>
      <button
        onClick={onNext}
        className="bg-denim text-white px-7 py-3 rounded-xl font-heading hover:bg-denim-dark transition-colors ml-auto shadow-button"
      >
        Siguiente →
      </button>
    </div>
  );
}

function LockedBanner({ text }: { text: string }) {
  return (
    <div className="bg-denim/[0.05] border-2 border-denim/15 rounded-2xl p-8 text-center space-y-3">
      <div className="text-3xl">🔒</div>
      <p className="text-negro font-heading">Se desbloquea al completar</p>
      <p className="text-denim font-heading">{text}</p>
    </div>
  );
}
