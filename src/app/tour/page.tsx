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
    <div className="min-h-screen bg-surface-base">
      {/* Navigation */}
      <nav className="surface-card signature-shadow bg-surface-card/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-headline text-on-surface hover:text-primary transition-colors">
            <span>🦍</span> Sistema Buena Vida
          </Link>
          <div className="text-xs text-on-surface-variant font-medium">
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
              dot === step ? 'gradient-denim w-8' : dot < step ? 'gradient-denim/40 w-2.5' : 'bg-surface-container-high w-2.5 hover:bg-primary/20'
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
              <h1 className="text-4xl md:text-5xl font-headline text-on-surface">
                Bienvenido al Sistema 🦍
              </h1>
              <div className="space-y-4 text-lg text-on-surface">
                <p>
                  Este no es un curso. Es un sistema que te guía paso a paso para construir tu marca personal desde la base.
                </p>
                <p className="text-on-surface-variant">
                  Vamos a enseñarte cómo funciona en 2 minutos.
                </p>
              </div>
            </div>
            <button
              onClick={nextStep}
              className="gradient-denim text-white px-7 py-3.5 rounded-2xl font-headline hover:opacity-90 transition-opacity inline-flex items-center gap-2 signature-shadow"
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
              <h2 className="text-3xl md:text-4xl font-headline text-on-surface">
                Fase 1 — La Pirámide
              </h2>
              <p className="text-sm text-primary font-headline uppercase tracking-wide">
                (quién eres)
              </p>
              <div className="space-y-4 text-lg text-on-surface">
                <p>
                  Todo empieza aquí. La Pirámide te guía por 5 niveles: tu historia, tus valores, tu mercado, tu estrategia y tus resultados.
                </p>
                <p className="text-on-surface-variant">
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
                      className="bg-primary/10 ghost-border text-on-surface text-center py-3 rounded-2xl font-headline text-sm transition-all hover:bg-primary/15"
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
              <h2 className="text-3xl md:text-4xl font-headline text-on-surface">
                Fase 2 — El Árbol
              </h2>
              <p className="text-sm text-primary font-headline uppercase tracking-wide">
                (tu marca visible)
              </p>
              <div className="space-y-4 text-lg text-on-surface">
                <p>
                  Cuando termines la Pirámide, pasas al Árbol. 9 secciones que definen quién eres, qué ofreces y cómo te comunicas.
                </p>
                <p className="text-on-surface-variant">
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
              <h2 className="text-3xl md:text-4xl font-headline text-on-surface">
                Fase 3 — Las Rutas
              </h2>
              <p className="text-sm text-primary font-headline uppercase tracking-wide">
                (tu estrategia)
              </p>
              <div className="space-y-4 text-lg text-on-surface">
                <p>
                  Con tu marca diagnosticada, Las Rutas te asignan un camino personalizado según tu perfil.
                </p>
                <p className="text-on-surface-variant">
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
              <h2 className="text-3xl md:text-4xl font-headline text-on-surface">
                Fase 4 — La Brújula
              </h2>
              <p className="text-sm text-primary font-headline uppercase tracking-wide">
                (tu contenido)
              </p>
              <div className="space-y-4 text-lg text-on-surface">
                <p>
                  Con tu identidad clara, tu marca diagnosticada y tu estrategia definida, llega el momento de crear contenido.
                </p>
                <p className="text-on-surface-variant">
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
              <h2 className="text-3xl md:text-4xl font-headline text-on-surface">
                Herramientas libres
              </h2>
              <p className="text-lg text-on-surface">
                Además del recorrido principal, tienes herramientas que puedes usar en cualquier momento:
              </p>
            </div>

            {/* Tools Grid */}
            <div className="space-y-3">
              {freeTools.map((tool, idx) => (
                <div key={idx} className="surface-card signature-shadow rounded-2xl pl-5 pr-4 py-4 hover:bg-surface-low transition-colors border-l-4 border-l-primary/30">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{tool.icon}</span>
                    <div>
                      <p className="font-headline text-on-surface text-base">{tool.name}</p>
                      <p className="text-on-surface-variant text-sm mt-0.5">{tool.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* API Key Section */}
            <div className="bg-secondary-container/20 rounded-2xl p-6 space-y-3 my-8 signature-shadow ghost-border">
              <p className="text-on-surface text-sm leading-relaxed">
                <span className="font-headline block mb-2">Para que el Maestro y otras herramientas con IA funcionen</span>
                necesitarás una <span className="font-headline text-primary">API Key de Anthropic</span>. Es como la llave que activa la inteligencia del sistema.
              </p>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                La configuras en <span className="font-headline text-on-surface">Ajustes → API Key</span>. Si no la tienes, te explicamos cómo conseguirla allí.
              </p>
            </div>

            {/* Tools Note */}
            <div className="bg-primary/[0.04] rounded-2xl p-4 text-sm text-on-surface-variant italic ghost-border">
              Estas herramientas funcionan mejor cuando has completado las fases anteriores — pero puedes explorarlas cuando quieras.
            </div>

            <NavButtons onPrev={prevStep} onNext={nextStep} />
          </div>
        )}

        {/* Step 7: Ready to Start */}
        {step === 6 && (
          <div className="animate-fadeIn space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-headline text-on-surface">
                ¿Listo para empezar? 🦍
              </h2>
              <div className="space-y-4 text-lg text-on-surface">
                <p>
                  Tu marca personal se construye de abajo arriba. Siempre.
                </p>
                <p className="text-on-surface-variant">
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
                  {i < 3 && <div className="flex-1 h-1 bg-gradient-to-r from-primary/40 to-primary/10 rounded-full" />}
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="space-y-4">
              <button
                onClick={handleStartPiramide}
                disabled={isLoading}
                className="w-full gradient-denim text-white px-6 py-4 rounded-2xl font-headline hover:opacity-90 transition-opacity disabled:opacity-50 text-lg signature-shadow"
              >
                {isLoading ? 'Iniciando...' : 'Empezar con La Pirámide →'}
              </button>
              <button
                onClick={goToDashboard}
                className="w-full text-primary hover:text-primary-container font-headline transition-colors text-sm py-2"
              >
                Ir al Panel
              </button>
            </div>

            {/* Back Button */}
            <div className="mt-8">
              <button
                onClick={prevStep}
                className="text-primary hover:text-primary-container font-headline transition-colors"
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
        className="text-primary hover:text-primary-container font-headline transition-colors"
      >
        ← Atrás
      </button>
      <button
        onClick={onNext}
        className="gradient-denim text-white px-7 py-3 rounded-2xl font-headline hover:opacity-90 transition-opacity ml-auto signature-shadow"
      >
        Siguiente →
      </button>
    </div>
  );
}

function LockedBanner({ text }: { text: string }) {
  return (
    <div className="bg-primary/[0.05] rounded-2xl p-8 text-center space-y-3 signature-shadow ghost-border">
      <div className="text-3xl">🔒</div>
      <p className="text-on-surface font-headline">Se desbloquea al completar</p>
      <p className="text-primary font-headline">{text}</p>
    </div>
  );
}
