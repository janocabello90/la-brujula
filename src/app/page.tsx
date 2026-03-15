import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-crema overflow-hidden">
      {/* ─── Nav ─────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🧭</span>
          <span className="font-heading text-xl font-semibold text-negro tracking-tight">La Brújula</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://janocabello.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted hover:text-negro transition-colors hidden sm:block"
          >
            janocabello.com
          </a>
          <Link
            href="/login"
            className="text-sm font-semibold text-white bg-negro px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Entrar
          </Link>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 sm:px-10 pt-12 sm:pt-20 pb-16 sm:pb-28">
        {/* Decorative accent */}
        <div className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-naranja/[0.06] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-naranja/[0.04] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left: copy */}
          <div>
            <p className="inline-block text-xs font-bold text-naranja uppercase tracking-widest bg-naranja/[0.08] px-3 py-1.5 rounded-full mb-6">
              Por Jano Cabello
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-negro leading-[1.1] mb-6">
              La Brújula<br />
              <span className="text-naranja">de Contenido</span>
            </h1>
            <p className="text-base sm:text-lg text-muted leading-relaxed mb-4 max-w-lg">
              No te dice qué escribir. Te dice hacia dónde apuntar.
            </p>
            <p className="text-sm text-muted/80 leading-relaxed mb-8 max-w-lg">
              Construye tu mapa estratégico de contenido, descubre qué pieza crear en cada momento y planifica tu semana con inteligencia artificial. Todo basado en tu marca personal real — no en fórmulas genéricas.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-naranja text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-naranja-hover transition-colors text-sm"
              >
                Crear mi Brújula
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center gap-2 border-2 border-borde text-negro font-semibold px-7 py-3.5 rounded-xl hover:border-negro/30 transition-colors text-sm"
              >
                Cómo funciona
              </a>
            </div>
            {/* Mobile hero image */}
            <div className="mt-8 md:hidden flex justify-center">
              <picture>
                <source srcSet="/gorila-brujula.webp" type="image/webp" />
                <img
                  src="/gorila-brujula.png"
                  alt="El gorila con la brújula de contenido"
                  className="w-64 sm:w-72 rounded-xl"
                  style={{ filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.1))" }}
                />
              </picture>
            </div>
          </div>

          {/* Right: hero image */}
          <div className="relative hidden md:flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-naranja/[0.06] to-transparent rounded-3xl pointer-events-none" />
            <picture>
              <source srcSet="/gorila-brujula.webp" type="image/webp" />
              <img
                src="/gorila-brujula.png"
                alt="El gorila con la brújula de contenido"
                className="relative w-full max-w-md rounded-2xl"
                style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.1))" }}
              />
            </picture>
          </div>
        </div>
      </section>

      {/* ─── Quote / Filosofía ───────────────────────────── */}
      <section className="bg-negro py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 text-center">
          <p className="font-heading text-2xl sm:text-3xl text-white/90 italic leading-snug mb-4">
            &ldquo;No te dice qué pensar. Te ayuda a pensar mejor sobre lo que ya sabes.&rdquo;
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-[1px] bg-naranja/50" />
            <p className="text-naranja text-sm font-semibold">Jano Cabello</p>
            <div className="w-8 h-[1px] bg-naranja/50" />
          </div>
          <p className="text-white/40 text-xs mt-2">Consultor de marca personal · 13 años de experiencia</p>
        </div>
      </section>

      {/* ─── Cómo funciona ───────────────────────────────── */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-bold text-naranja uppercase tracking-widest mb-3">El proceso</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-negro">
            De la estrategia a la acción en 4 pasos
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              num: "01",
              icon: "🧭",
              title: "Configura tu Brújula",
              desc: "6 pasos estratégicos: desde tu propuesta de valor hasta tu árbol de contenidos. Se hace una vez.",
              accent: "bg-naranja/[0.06]",
            },
            {
              num: "02",
              icon: "🗺️",
              title: "Tu Minority Report",
              desc: "Ve todo tu conocimiento estratégico en una sola vista. Pilares, subtemas, ángulos, audiencia.",
              accent: "bg-naranja/[0.04]",
            },
            {
              num: "03",
              icon: "🎯",
              title: "Activa el Maestro",
              desc: "Dile cómo estás hoy y qué quieres lograr. La IA te da titulares, ganchos y pistas creativas.",
              accent: "bg-naranja/[0.06]",
            },
            {
              num: "04",
              icon: "📅",
              title: "Planifica y publica",
              desc: "Arrastra las piezas a tu calendario semanal. Sincroniza con Google Calendar y a crear.",
              accent: "bg-naranja/[0.04]",
            },
          ].map((step) => (
            <div
              key={step.num}
              className={`${step.accent} rounded-2xl p-6 sm:p-7 border border-borde/40 hover:border-naranja/30 transition-colors group`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{step.icon}</span>
                <span className="text-naranja/40 font-heading text-3xl font-bold group-hover:text-naranja/60 transition-colors">{step.num}</span>
              </div>
              <h3 className="font-heading text-xl text-negro mb-2">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Herramientas (detalle) ──────────────────────── */}
      <section className="bg-white border-y border-borde/60">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-bold text-naranja uppercase tracking-widest mb-3">Las herramientas</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-negro">
              Todo lo que necesitas para crear con estrategia
            </h2>
          </div>

          <div className="space-y-6">
            {/* Maestro */}
            <div className="grid md:grid-cols-5 gap-6 items-center">
              <div className="md:col-span-3 bg-crema rounded-2xl p-7 sm:p-9 border border-borde/40">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-naranja/10 flex items-center justify-center text-xl">🎯</span>
                  <h3 className="font-heading text-2xl text-negro">El Maestro</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  Tu director creativo personal con IA. Le dices tu objetivo, tu nivel de energía y el canal, y te devuelve un brief creativo completo: 3 ideas de titular, gancho de apertura, pistas creativas y estrategia detrás. No texto corrido — chispas para tu creatividad.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Titulares listos para usar</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Pistas creativas</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Gancho + CTA</span>
                </div>
              </div>
              <div className="md:col-span-2 bg-negro rounded-2xl p-6 text-center">
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-3">Mientras piensa...</p>
                <p className="text-white text-sm italic leading-relaxed mb-2">
                  &ldquo;La mejor forma de predecir el futuro es creándolo.&rdquo;
                </p>
                <p className="text-naranja text-xs font-semibold">— Peter Drucker</p>
                <p className="text-white/30 text-[10px] mt-3">Frases célebres rotando en cada carga</p>
              </div>
            </div>

            {/* Planificador */}
            <div className="grid md:grid-cols-5 gap-6 items-center">
              <div className="md:col-span-2 bg-naranja/[0.06] rounded-2xl p-6 sm:p-7 border border-naranja/10 order-2 md:order-1">
                <p className="text-[10px] font-bold text-naranja uppercase tracking-widest mb-4">3 vistas</p>
                <div className="space-y-2.5">
                  {[
                    { icon: "📋", label: "Semanal", desc: "Kanban con drag & drop" },
                    { icon: "📅", label: "Mensual", desc: "Calendario visual" },
                    { icon: "📝", label: "Lista", desc: "Vista cronológica" },
                  ].map((v) => (
                    <div key={v.label} className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 border border-borde/40">
                      <span>{v.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-negro">{v.label}</p>
                        <p className="text-[11px] text-muted">{v.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-3 bg-crema rounded-2xl p-7 sm:p-9 border border-borde/40 order-1 md:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-naranja/10 flex items-center justify-center text-xl">📅</span>
                  <h3 className="font-heading text-2xl text-negro">Planificador</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  Pasa de la idea a la acción. Arrastra las piezas entre días, cambia entre vista semanal, mensual o lista. Cada pieza muestra pilar, formato y canal con código de color. Un clic y se sincroniza con Google Calendar.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Drag & drop</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Google Calendar</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Responsive</span>
                </div>
              </div>
            </div>

            {/* Minority Report */}
            <div className="grid md:grid-cols-5 gap-6 items-center">
              <div className="md:col-span-3 bg-negro rounded-2xl p-7 sm:p-9 overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-naranja/20 flex items-center justify-center text-xl">🗺️</span>
                  <h3 className="font-heading text-2xl text-white">Minority Report</h3>
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-5">
                  Tu mapa estratégico completo: briefing, buyer persona, mapa de empatía, insight, árbol de contenidos y canales. Todo lo que necesitas en una vista. Exporta a Excel profesional con un clic.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/[0.08] text-white/70">Buyer persona</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/[0.08] text-white/70">Insight estratégico</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/[0.08] text-white/70">Árbol de contenidos</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/[0.08] text-white/70">Export Excel</span>
                </div>
              </div>
              <div className="md:col-span-2 flex items-center justify-center">
                <picture>
                  <source srcSet="/minority-report.webp" type="image/webp" />
                  <img
                    src="/minority-report.png"
                    alt="El gorila visualizando datos estratégicos — Minority Report"
                    className="w-full max-w-xs rounded-2xl"
                    style={{ filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.12))" }}
                  />
                </picture>
              </div>
            </div>

            {/* Basado en tu marca real */}
            <div className="bg-crema rounded-2xl p-7 sm:p-9 border border-borde/40">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-naranja/10 flex items-center justify-center text-xl">🧠</span>
                <h3 className="font-heading text-2xl text-negro">Basado en tu marca real</h3>
              </div>
              <p className="text-sm text-muted leading-relaxed max-w-2xl">
                Nada genérico. La Brújula parte de tu propuesta de valor, tu audiencia concreta y tus pilares de contenido. La IA genera sugerencias alineadas con quien eres — no con lo que está de moda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Quién hay detrás ────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className="grid md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-3">
            <p className="text-xs font-bold text-naranja uppercase tracking-widest mb-3">Quién hay detrás</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-negro mb-5">
              Marca personal para una buena vida
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-4">
              La Brújula nace de La Pirámide de la Marca Personal, la metodología que llevo 13 años construyendo. No es otra herramienta de IA que te dice qué publicar mirando tendencias. Es una extensión de un proceso real de autoconocimiento aplicado a la estrategia de contenidos.
            </p>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Si ya has pasado por la Pirámide o estás en la comunidad, La Brújula te da estructura para pasar de la estrategia a la acción. Si no me conoces, bienvenido — aquí no hay fórmulas mágicas. Hay trabajo, claridad y una brújula que apunta hacia donde tú ya sabes que tienes que ir.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://janocabello.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-naranja hover:text-naranja-hover transition-colors"
              >
                janocabello.com
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <span className="text-borde">·</span>
              <span className="text-sm text-muted">Comunidad Skool</span>
              <span className="text-borde">·</span>
              <span className="text-sm text-muted">Newsletter &ldquo;Buena Vida&rdquo;</span>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="bg-negro rounded-2xl p-7 sm:p-8">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">La Pirámide</p>
              <div className="space-y-2">
                {[
                  { level: "4", label: "Resultados", w: "w-[40%]" },
                  { level: "3", label: "Estrategia y canales", w: "w-[55%]" },
                  { level: "2", label: "Mercado y propuesta de valor", w: "w-[70%]" },
                  { level: "1", label: "Valores, propósito y visión", w: "w-[85%]" },
                  { level: "▼", label: "Historia y creencias", w: "w-full" },
                ].map((item) => (
                  <div key={item.level} className={`${item.w} mx-auto`}>
                    <div className="bg-white/[0.08] border border-white/[0.1] rounded-lg px-3 py-2 text-center hover:bg-naranja/20 hover:border-naranja/30 transition-colors">
                      <p className="text-white/80 text-[11px] font-medium">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-[10px] text-center mt-4">La Pirámide de la Marca Personal</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA final ───────────────────────────────────── */}
      <section className="bg-negro">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-16 sm:py-24 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl text-white mb-4 leading-snug">
            Deja de improvisar.<br />
            <span className="text-naranja">Empieza a apuntar.</span>
          </h2>
          <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
            Configura tu Brújula en 15 minutos. Úsala cada vez que te sientes a crear.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-naranja text-white font-semibold px-8 py-4 rounded-xl hover:bg-naranja-hover transition-colors text-base"
          >
            Crear mi Brújula gratis
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="bg-negro border-t border-white/[0.06] py-8">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧭</span>
            <span className="font-heading text-sm text-white/60">La Brújula de Contenido</span>
          </div>
          <p className="text-white/30 text-xs">
            Un proyecto de{" "}
            <a
              href="https://janocabello.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-naranja/70 hover:text-naranja transition-colors"
            >
              Jano Cabello
            </a>
            {" · "}Marca personal para una buena vida
          </p>
        </div>
      </footer>
    </div>
  );
}
