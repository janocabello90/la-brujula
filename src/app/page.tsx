export default function Home() {
  const SKOOL_URL = "https://www.skool.com/buena-vida";

  return (
    <div className="min-h-screen bg-crema overflow-hidden">
      {/* ─── Nav ─────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🎓</span>
          <span className="font-heading text-xl font-semibold text-negro tracking-tight">El Sistema de Buena Vida</span>
        </div>
        <a
          href="https://janocabello.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted hover:text-negro transition-colors hidden sm:block"
        >
          janocabello.com
        </a>
      </nav>

      {/* ─── Hero ────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 sm:px-10 pt-10 sm:pt-20 pb-16 sm:pb-28">
        <div className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-naranja/[0.06] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-naranja/[0.04] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <p className="inline-block text-xs font-bold text-naranja uppercase tracking-widest bg-naranja/[0.08] px-3 py-1.5 rounded-full mb-6">
              Acceso exclusivo para miembros
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-negro leading-[1.1] mb-4">
              El Sistema de<br />
              <span className="text-naranja">Buena Vida</span>
            </h1>
            <p className="text-sm text-naranja/80 font-medium italic mb-6">
              Conocimiento y sistemas para seguir generando valor
            </p>
            <p className="text-base sm:text-lg text-muted leading-relaxed mb-4 max-w-lg">
              Tu marca personal no se construye con plantillas. Se construye con un sistema que conecta quién eres con lo que comunicas.
            </p>
            <p className="text-sm text-muted/80 leading-relaxed mb-8 max-w-lg">
              Tres herramientas conectadas entre sí — La Pirámide, El Árbol y La Brújula — cada una alimenta a las demás. Un método completo para construir, estructurar y ejecutar tu marca personal con estrategia.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={SKOOL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-naranja text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-naranja-hover transition-colors text-sm"
              >
                Unirme a la comunidad
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="#que-incluye"
                className="inline-flex items-center gap-2 border-2 border-borde text-negro font-semibold px-7 py-3.5 rounded-xl hover:border-negro/30 transition-colors text-sm"
              >
                Ver qué incluye
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

      {/* ─── Quote ───────────────────────────────────────── */}
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

      {/* ─── Las 3 herramientas ──────────────────────────── */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-bold text-naranja uppercase tracking-widest mb-3">El método</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-negro">
            Tres herramientas. Un mismo sistema.
          </h2>
          <p className="text-muted text-sm mt-3 max-w-xl mx-auto">
            Lo que trabajas en una, alimenta a las demás. Porque tu marca personal es un sistema, no piezas sueltas.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              icon: "🔺",
              title: "La Pirámide",
              subtitle: "estructura",
              desc: "Construye tu identidad de marca desde la base: valores, propósito, visión, propuesta de valor y posicionamiento. Los cimientos de todo lo demás.",
              tag: "Próximamente",
            },
            {
              icon: "🌳",
              title: "El Árbol",
              subtitle: "identidad",
              desc: "Tu marca personal en una sola vista. 9 secciones — desde la semilla (tu propósito) hasta el cofre (tus productos). Infografía visual, análisis con IA y sincronización directa con La Brújula.",
              tag: "Disponible",
            },
            {
              icon: "🧭",
              title: "La Brújula",
              subtitle: "contenido",
              desc: "De la estrategia a la acción. Genera ideas con IA, crea piezas de contenido alineadas con tu marca, planifica tu semana y publica con intención.",
              tag: "Disponible",
            },
          ].map((tool) => (
            <div
              key={tool.title}
              className="bg-naranja/[0.06] rounded-2xl p-6 sm:p-8 border border-borde/40 hover:border-naranja/30 transition-colors group relative"
            >
              <span className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                tool.tag === "Disponible" ? "bg-naranja/20 text-naranja" : "bg-negro/[0.06] text-muted"
              }`}>
                {tool.tag}
              </span>
              <span className="text-4xl block mb-4">{tool.icon}</span>
              <h3 className="font-heading text-2xl text-negro">
                {tool.title}
                <span className="text-naranja italic text-base ml-2 font-normal">{tool.subtitle}</span>
              </h3>
              <p className="text-sm text-muted leading-relaxed mt-3">{tool.desc}</p>
            </div>
          ))}
        </div>

        {/* Connection visual */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <span className="text-2xl">🔺</span>
          <div className="w-8 h-0.5 bg-naranja/30" />
          <span className="text-2xl">🌳</span>
          <div className="w-8 h-0.5 bg-naranja/30" />
          <span className="text-2xl">🧭</span>
        </div>
        <p className="text-center text-xs text-muted/60 mt-2">Datos sincronizados entre herramientas</p>
      </section>

      {/* ─── Todo lo que hay dentro ─────────────────────── */}
      <section className="bg-white border-y border-borde/60">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-bold text-naranja uppercase tracking-widest mb-3">Dentro del sistema</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-negro">
              Todo lo que necesitas. Nada que te sobre.
            </h2>
          </div>

          <div className="space-y-6">
            {/* El Árbol — detalle */}
            <div className="grid md:grid-cols-5 gap-6 items-center">
              <div className="md:col-span-3 bg-crema rounded-2xl p-7 sm:p-9 border border-borde/40">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl">🌳</span>
                  <h3 className="font-heading text-2xl text-negro">El Árbol</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  9 secciones que van de la semilla al cofre. Define quién eres (propósito, valores, identidad), qué ofreces (propuesta de valor, productos) y cómo te comunicas (tono, arquetipos, energía). Al terminar, la IA analiza tu marca y te devuelve un informe completo con fortalezas, alertas y siguientes pasos.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">9 secciones guiadas</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Infografía visual</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Análisis con IA</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Exportable a PDF</span>
                </div>
              </div>
              <div className="md:col-span-2 bg-naranja/[0.06] rounded-2xl p-6 sm:p-7 border border-naranja/10">
                <p className="text-[10px] font-bold text-naranja uppercase tracking-widest mb-4">Las 9 secciones</p>
                <div className="space-y-1.5">
                  {[
                    { icon: "🌱", label: "La Semilla", sub: "Propósito, visión, intención" },
                    { icon: "🌿", label: "Las Raíces", sub: "Valores, fortalezas, identidad" },
                    { icon: "🪵", label: "El Tronco", sub: "Tema principal, zona de genialidad" },
                    { icon: "🌲", label: "Las Ramas", sub: "Pasiones, hobbies, formatos" },
                    { icon: "☁️", label: "La Copa", sub: "Tono, arquetipos, energía" },
                    { icon: "🍎", label: "Los Frutos", sub: "Metas, impacto deseado" },
                    { icon: "🌍", label: "El Entorno", sub: "Audiencia, canales, posicionamiento" },
                    { icon: "⏳", label: "El Tiempo", sub: "Ritmo, hitos, buena vida" },
                    { icon: "📦", label: "El Cofre", sub: "Productos, precios, entrega" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2.5 bg-white rounded-lg px-3 py-2 border border-borde/30">
                      <span className="text-sm">{s.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-negro">{s.label}</p>
                        <p className="text-[10px] text-muted">{s.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* El Espejo */}
            <div className="bg-gradient-to-r from-negro to-negro/95 rounded-2xl p-7 sm:p-9 overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-naranja/20 flex items-center justify-center text-xl">🪞</span>
                <h3 className="font-heading text-2xl text-white">El Espejo</h3>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-5 max-w-2xl">
                Un dashboard de identidad con las 22 piezas clave de tu marca personal: propósito, visión, valores, tono, arquetipos, audiencia, posicionamiento... Todo en una vista. Lo que está relleno aparece; lo que falta, te dice exactamente qué ejercicio completar. Tu marca de un vistazo.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/[0.08] text-white/70">22 campos de identidad</span>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/[0.08] text-white/70">Datos del Árbol + Brújula</span>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/[0.08] text-white/70">Vista rápida de marca</span>
              </div>
            </div>

            {/* Maestro + Planificador */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Maestro */}
              <div className="bg-crema rounded-2xl p-7 sm:p-9 border border-borde/40">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-naranja/10 flex items-center justify-center text-xl">🎯</span>
                  <h3 className="font-heading text-xl text-negro">El Maestro</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  Tu director creativo con IA. Dile tu objetivo, tu nivel de energía y el canal, y te devuelve un brief completo: titulares, gancho de apertura, pistas creativas y la estrategia detrás. No texto genérico — chispas alineadas con tu marca.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Titulares</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Pistas creativas</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Gancho + CTA</span>
                </div>
              </div>

              {/* Planificador */}
              <div className="bg-crema rounded-2xl p-7 sm:p-9 border border-borde/40">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-naranja/10 flex items-center justify-center text-xl">📅</span>
                  <h3 className="font-heading text-xl text-negro">Planificador</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  Pasa de la idea a la acción. Arrastra piezas entre días, cambia entre vista semanal, mensual o lista. Cada pieza muestra pilar, formato y canal con código de color. Sincroniza con Google Calendar.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Drag & drop</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">3 vistas</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Google Calendar</span>
                </div>
              </div>
            </div>

            {/* Minority Report + Ideas + Piezas */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-crema rounded-2xl p-6 border border-borde/40">
                <span className="text-2xl block mb-3">🗺️</span>
                <h4 className="font-heading text-lg text-negro mb-2">Mi Mapa</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Tu estrategia completa: briefing, buyer persona, mapa de empatía, insight, árbol de contenidos y canales. Exportable a Excel.
                </p>
              </div>
              <div className="bg-crema rounded-2xl p-6 border border-borde/40">
                <span className="text-2xl block mb-3">💡</span>
                <h4 className="font-heading text-lg text-negro mb-2">Banco de Ideas</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Captura ideas al vuelo, enriquécelas con IA y conviértelas en piezas de contenido listas para producir. Tu semillero creativo.
                </p>
              </div>
              <div className="bg-crema rounded-2xl p-6 border border-borde/40">
                <span className="text-2xl block mb-3">📝</span>
                <h4 className="font-heading text-lg text-negro mb-2">Piezas Guardadas</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Tu biblioteca de contenido. Todo lo que generas, editas y guardas queda organizado y listo para publicar cuando tú decidas.
                </p>
              </div>
            </div>

            {/* Basado en tu marca */}
            <div className="bg-crema rounded-2xl p-7 sm:p-9 border border-borde/40">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-naranja/10 flex items-center justify-center text-xl">🧠</span>
                <h3 className="font-heading text-2xl text-negro">Basado en tu marca real</h3>
              </div>
              <p className="text-sm text-muted leading-relaxed max-w-2xl">
                Nada genérico. El Sistema parte de tu propuesta de valor, tu audiencia concreta y tus pilares de contenido. La IA genera sugerencias alineadas con quien eres — no con lo que está de moda. Lo que defines en El Árbol alimenta a La Brújula. Lo que trabajas en La Brújula aparece en El Espejo. Todo conectado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Qué incluye la comunidad ───────────────────── */}
      <section id="que-incluye" className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-bold text-naranja uppercase tracking-widest mb-3">Acceso exclusivo</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-negro mb-3">
            El Sistema es para miembros de la comunidad
          </h2>
          <p className="text-muted text-sm max-w-xl mx-auto">
            No se vende por separado. El Sistema de Buena Vida es parte de la comunidad de marca personal de Jano Cabello. Esto es lo que incluye tu membresía:
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Pricing card */}
          <div className="bg-white rounded-3xl border-2 border-naranja/30 shadow-card p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-naranja/[0.06] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 pb-8 border-b border-borde/40">
                <div>
                  <h3 className="font-heading text-2xl sm:text-3xl text-negro mb-1">Comunidad Buena Vida</h3>
                  <p className="text-sm text-muted">Todo lo que necesitas para construir tu marca personal con método</p>
                </div>
                <div className="flex items-baseline gap-1 flex-shrink-0">
                  <span className="font-heading text-4xl sm:text-5xl text-naranja">39$</span>
                  <span className="text-muted text-sm">/mes</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mb-8">
                {[
                  { icon: "🎓", text: "Formación continua con lecciones semanales en vídeo" },
                  { icon: "🔺", text: "La Pirámide de la Marca Personal — el método completo" },
                  { icon: "🌳", text: "El Árbol — identidad de marca en 9 secciones con IA" },
                  { icon: "🧭", text: "La Brújula — generación de contenido estratégico con IA" },
                  { icon: "🪞", text: "El Espejo — dashboard visual de tu identidad de marca" },
                  { icon: "📅", text: "Planificador con drag & drop y sincronización con Google Calendar" },
                  { icon: "🎯", text: "El Maestro — tu director creativo con inteligencia artificial" },
                  { icon: "💡", text: "Banco de ideas con enriquecimiento por IA" },
                  { icon: "🗺️", text: "Mapa estratégico: briefing, buyer persona, insight y árbol de contenidos" },
                  { icon: "👥", text: "Comunidad activa de profesionales construyendo su marca" },
                  { icon: "📞", text: "Sesiones en directo con Jano y acceso a preguntas" },
                  { icon: "📚", text: "Biblioteca de recursos, plantillas y frameworks" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                    <p className="text-sm text-negro/80 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <a
                  href={SKOOL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-naranja text-white font-semibold px-8 py-4 rounded-xl hover:bg-naranja-hover transition-colors text-base w-full sm:w-auto"
                >
                  Unirme a la comunidad
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <p className="text-xs text-muted">Cancela cuando quieras. Sin permanencia.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Quién hay detrás ────────────────────────────── */}
      <section className="bg-white border-y border-borde/60">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-3">
              <p className="text-xs font-bold text-naranja uppercase tracking-widest mb-3">Quién hay detrás</p>
              <h2 className="font-heading text-3xl sm:text-4xl text-negro mb-5">
                Marca personal para una buena vida
              </h2>
              <p className="text-sm text-muted leading-relaxed mb-4">
                El Sistema nace de La Pirámide de la Marca Personal, la metodología que llevo 13 años construyendo. No es otra herramienta de IA que te dice qué publicar mirando tendencias. Es una extensión de un proceso real de autoconocimiento aplicado a la estrategia de contenidos.
              </p>
              <p className="text-sm text-muted leading-relaxed mb-6">
                Si ya has pasado por la Pirámide o estás en la comunidad, El Sistema te da estructura para pasar de la estrategia a la acción. Si no me conoces, bienvenido — aquí no hay fórmulas mágicas. Hay trabajo, claridad y un sistema que conecta quien eres con lo que comunicas.
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
                <span className="text-sm text-muted">Newsletter &ldquo;Buena Vida&rdquo;</span>
                <span className="text-borde">·</span>
                <span className="text-sm text-muted">Podcast</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="bg-negro rounded-2xl p-7 sm:p-8">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">La Pirámide de la Marca Personal</p>
                <div className="space-y-2">
                  {[
                    { label: "Resultados", w: "w-[40%]" },
                    { label: "Estrategia y canales", w: "w-[55%]" },
                    { label: "Mercado y propuesta de valor", w: "w-[70%]" },
                    { label: "Valores, propósito y visión", w: "w-[85%]" },
                    { label: "Historia y creencias", w: "w-full" },
                  ].map((item) => (
                    <div key={item.label} className={`${item.w} mx-auto`}>
                      <div className="bg-white/[0.08] border border-white/[0.1] rounded-lg px-3 py-2 text-center hover:bg-naranja/20 hover:border-naranja/30 transition-colors">
                        <p className="text-white/80 text-[11px] font-medium">{item.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-white/30 text-[10px] text-center mt-4">La metodología que sostiene el sistema</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA final ───────────────────────────────────── */}
      <section className="bg-negro">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-16 sm:py-24 text-center">
          <p className="text-naranja text-xs font-bold uppercase tracking-widest mb-6">39$/mes · Cancela cuando quieras</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-white mb-4 leading-snug">
            Tu marca personal<br />
            <span className="text-naranja">merece un sistema.</span>
          </h2>
          <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
            El Árbol define quién eres. La Brújula te ayuda a comunicarlo. La Pirámide lo estructura todo. Únete a la comunidad y accede al sistema completo.
          </p>
          <a
            href={SKOOL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-naranja text-white font-semibold px-8 py-4 rounded-xl hover:bg-naranja-hover transition-colors text-base"
          >
            Unirme a la comunidad
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="bg-negro border-t border-white/[0.06] py-8">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎓</span>
            <span className="font-heading text-sm text-white/60">El Sistema de Buena Vida</span>
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
