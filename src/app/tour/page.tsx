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
    { icon: '🎯', name: 'El Maestro', desc: 'Tu director creativo con IA. Genera ideas, titulares y estrategias.' },
    { icon: '📅', name: 'El Planificador', desc: 'Organiza tu contenido por semanas.' },
    { icon: '💡', name: 'Ideas', desc: 'Tu banco de ideas siempre abierto.' },
    { icon: '📝', name: 'Piezas', desc: 'Tu biblioteca de contenido.' },
  ];

  return (
    <div className="min-h-screen bg-crema">
      {/* Navigation */}
      <nav className="border-b border-borde bg-crema">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm font-heading text-negro hover:text-naranja transition-colors">
            La Brújula
          </Link>
          <div className="text-xs text-muted">
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
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              dot === step ? 'bg-naranja w-8' : 'bg-borde hover:bg-naranja/30'
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
                Bienvenido al Sistema
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
              className="bg-naranja text-crema px-6 py-3 rounded-lg font-heading hover:bg-naranja/90 transition-colors inline-flex items-center gap-2"
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
              <p className="text-sm text-naranja font-heading uppercase tracking-wide">
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
                      className="bg-naranja/20 border-2 border-naranja text-negro text-center py-3 rounded-sm font-heading text-sm transition-all hover:bg-naranja/30"
                    >
                      {level}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="text-naranja hover:text-naranja/70 font-heading transition-colors"
              >
                ← Atrás
              </button>
              <button
                onClick={nextStep}
                className="bg-naranja text-crema px-6 py-3 rounded-lg font-heading hover:bg-naranja/90 transition-colors ml-auto"
              >
                Siguiente →
              </button>
            </div>
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
              <p className="text-sm text-naranja font-heading uppercase tracking-wide">
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

            {/* Locked State */}
            <div className="bg-naranja/10 border-2 border-naranja/30 rounded-lg p-8 text-center space-y-3">
              <div className="text-3xl">🔒</div>
              <p className="text-negro font-heading">Se desbloquea al completar</p>
              <p className="text-naranja font-heading">La Pirámide</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="text-naranja hover:text-naranja/70 font-heading transition-colors"
              >
                ← Atrás
              </button>
              <button
                onClick={nextStep}
                className="bg-naranja text-crema px-6 py-3 rounded-lg font-heading hover:bg-naranja/90 transition-colors ml-auto"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Las Rutas */}
        {step === 3 && (
          <div className="animate-fadeIn space-y-8">
            <div className="space-y-6">
              <div className="text-5xl mb-4">🗺️</div>
              <h2 className="text-3xl md:text-4xl font-heading text-negro">
                Fase 3 — Las Rutas
              </h2>
              <p className="text-sm text-naranja font-heading uppercase tracking-wide">
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

            {/* Locked State */}
            <div className="bg-naranja/10 border-2 border-naranja/30 rounded-lg p-8 text-center space-y-3">
              <div className="text-3xl">🔒</div>
              <p className="text-negro font-heading">Se desbloquea al completar</p>
              <p className="text-naranja font-heading">El Árbol</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="text-naranja hover:text-naranja/70 font-heading transition-colors"
              >
                ← Atrás
              </button>
              <button
                onClick={nextStep}
                className="bg-naranja text-crema px-6 py-3 rounded-lg font-heading hover:bg-naranja/90 transition-colors ml-auto"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: La Brújula */}
        {step === 4 && (
          <div className="animate-fadeIn space-y-8">
            <div className="space-y-6">
              <div className="text-5xl mb-4">🧭</div>
              <h2 className="text-3xl md:text-4xl font-heading text-negro">
                Fase 4 — La Brújula
              </h2>
              <p className="text-sm text-naranja font-heading uppercase tracking-wide">
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

            {/* Locked State */}
            <div className="bg-naranja/10 border-2 border-naranja/30 rounded-lg p-8 text-center space-y-3">
              <div className="text-3xl">🔒</div>
              <p className="text-negro font-heading">Se desbloquea al completar</p>
              <p className="text-naranja font-heading">Las Rutas</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="text-naranja hover:text-naranja/70 font-heading transition-colors"
              >
                ← Atrás
              </button>
              <button
                onClick={nextStep}
                className="bg-naranja text-crema px-6 py-3 rounded-lg font-heading hover:bg-naranja/90 transition-colors ml-auto"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Herramientas libres */}
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
            <div className="space-y-4">
              {freeTools.map((tool, idx) => (
                <div key={idx} className="border-l-4 border-naranja pl-4 py-2">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{tool.icon}</span>
                    <div>
                      <p className="font-heading text-negro text-lg">{tool.name}</p>
                      <p className="text-muted text-sm mt-1">{tool.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* API Key Section */}
            <div className="bg-naranja/5 border border-naranja/20 rounded-lg p-6 space-y-4 my-8">
              <p className="text-negro text-sm leading-relaxed">
                <span className="font-heading block mb-2">Para que el Maestro y otras herramientas con IA funcionen</span>
                necesitarás una <span className="font-heading text-naranja">API Key de Anthropic</span>. Es como la llave que activa la inteligencia del sistema.
              </p>
              <p className="text-muted text-sm leading-relaxed">
                La configuras en <span className="font-heading text-negro">Ajustes → API Key</span>. Si no la tienes, te explicamos cómo conseguirla allí.
              </p>
            </div>

            {/* Tools Note */}
            <div className="bg-borde/20 rounded-lg p-4 text-sm text-muted italic">
              Estas herramientas funcionan mejor cuando has completado las fases anteriores — pero puedes explorarlas cuando quieras.
            </div>

            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="text-naranja hover:text-naranja/70 font-heading transition-colors"
              >
                ← Atrás
              </button>
              <button
                onClick={nextStep}
                className="bg-naranja text-crema px-6 py-3 rounded-lg font-heading hover:bg-naranja/90 transition-colors ml-auto"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Ready to Start */}
        {step === 6 && (
          <div className="animate-fadeIn space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-heading text-negro">
                ¿Listo para empezar?
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
              <div className="flex items-center gap-3">
                <div className="text-3xl">🔺</div>
                <div className="flex-1 h-1 bg-naranja"></div>
              </div>
              <div className="flex items-center gap-3 ml-12">
                <div className="text-3xl">🌳</div>
                <div className="flex-1 h-1 bg-naranja"></div>
              </div>
              <div className="flex items-center gap-3 ml-12">
                <div className="text-3xl">🗺️</div>
                <div className="flex-1 h-1 bg-naranja"></div>
              </div>
              <div className="flex items-center gap-3 ml-12">
                <div className="text-3xl">🧭</div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-4">
              <button
                onClick={handleStartPiramide}
                disabled={isLoading}
                className="w-full bg-naranja text-crema px-6 py-4 rounded-lg font-heading hover:bg-naranja/90 transition-colors disabled:opacity-50 text-lg"
              >
                {isLoading ? 'Iniciando...' : 'Empezar con La Pirámide →'}
              </button>
              <button
                onClick={goToDashboard}
                className="w-full text-naranja hover:text-naranja/70 font-heading transition-colors text-sm py-2"
              >
                Ir al Panel
              </button>
            </div>

            {/* Back Button */}
            <div className="mt-8">
              <button
                onClick={prevStep}
                className="text-naranja hover:text-naranja/70 font-heading transition-colors"
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
