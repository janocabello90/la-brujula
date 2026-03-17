export default function Home() {
  const SKOOL_URL = "https://www.skool.com/una-buena-vida-comunidad-2471";

  return (
    <div className="min-h-screen bg-crema overflow-hidden">
      {/* ─── Nav ─────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🎓</span>
          <span className="font-heading text-xl font-semibold text-negro tracking-tight">
            El Sistema de Buena Vida
          </span>
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

      {/* ─── Hero: El gancho emocional ──────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 sm:px-10 pt-10 sm:pt-20 pb-16 sm:pb-24">
        <div className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-naranja/[0.06] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <p className="inline-block text-xs font-bold text-naranja uppercase tracking-widest bg-naranja/[0.08] px-3 py-1.5 rounded-full mb-6">
            Acceso exclusivo para miembros
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] text-negro leading-[1.1] mb-6">
            La mayoría construye su marca personal al revés.
          </h1>
          <p className="text-base sm:text-lg text-negro/70 leading-relaxed mb-4 max-w-2xl mx-auto">
            Empiezan por la estrategia, por el contenido, por lo que &ldquo;funciona en redes&rdquo;. Y luego se preguntan por qué no conectan, por qué no venden, por qué no sienten que eso que publican tenga algo que ver con lo que son.
          </p>
          <p className="text-base sm:text-lg text-negro/70 leading-relaxed mb-8 max-w-2xl mx-auto">
            El Sistema de Buena Vida existe para construirla desde abajo. Desde quien eres de verdad. Con método, herramientas y una comunidad de personas que piensan como tú.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
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
              href="#el-problema"
              className="inline-flex items-center gap-2 border-2 border-borde text-negro font-semibold px-7 py-3.5 rounded-xl hover:border-negro/30 transition-colors text-sm"
            >
              Quiero entenderlo
            </a>
          </div>
        </div>
      </section>

      {/* ─── Vídeo de Jano ─────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 sm:px-10 pb-16 sm:pb-24">
        <div className="relative rounded-2xl overflow-hidden bg-negro aspect-video border border-white/10">
          <iframe
            src="https://www.youtube.com/embed/HTqT6Kf7ufI?rel=0&modestbranding=1"
            title="Jano Cabello — Por qué existe El Sistema de Buena Vida"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </section>

      {/* ─── El problema ───────────────────────────────── */}
      <section id="el-problema" className="bg-negro py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <p className="text-naranja text-xs font-bold uppercase tracking-widest mb-6">El problema</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-white leading-snug mb-8">
            Las redes te dicen qué publicar.<br />
            Nadie te pregunta quién eres.
          </h2>
          <div className="space-y-5 text-white/60 text-base leading-relaxed">
            <p>
              Hay miles de herramientas de contenido, calendarios editoriales, plantillas de &ldquo;copy que convierte&rdquo; y cursos de &ldquo;cómo crecer en LinkedIn&rdquo;. Y aun así, la mayoría de profesionales con cosas valiosas que decir siguen sintiéndose invisibles. O peor: visibles pero incoherentes.
            </p>
            <p>
              El problema no es que te falte una herramienta. Es que estás empezando la pirámide por arriba.
            </p>
            <p className="text-white/80 font-medium">
              Primero defines quién eres. Después, qué comunicas. Y al final — solo al final — cómo lo haces.
            </p>
            <p>
              Si inviertes ese orden, acabas publicando contenido que no te representa, atrayendo a personas que no te interesan y vendiendo algo que no te llena. Eso no es marca personal. Es un escaparate vacío.
            </p>
          </div>
        </div>
      </section>

      {/* ─── La solución: el método ─────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className="grid md:grid-cols-5 gap-10 items-center">
          <div className="md:col-span-3">
            <p className="text-naranja text-xs font-bold uppercase tracking-widest mb-4">La metodología</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-negro mb-6 leading-snug">
              La Pirámide de la<br />Marca Personal
            </h2>
            <div className="space-y-4 text-muted text-sm leading-relaxed">
              <p>
                Llevo 13 años ayudando a profesionales a construir su marca personal. Y lo primero que aprendí es que la mayoría tiene los pisos cambiados.
              </p>
              <p>
                La Pirámide se construye de abajo arriba. Primero excavas en tu historia, en tus creencias, en lo que no se ve pero sostiene todo. Luego subes a los valores, al propósito, a lo que defiendes y lo que no cruzas. Después viene el mercado, la propuesta de valor, el para quién. La estrategia llega en tercer lugar — no en primero. Y los resultados son la consecuencia lógica de haber hecho todo lo anterior con honestidad.
              </p>
              <p>
                Esto no es teoría. Es el método que he probado con cientos de profesionales. Y ahora existe un sistema digital completo para hacerlo tú, a tu ritmo, con herramientas que se conectan entre sí.
              </p>
            </div>
          </div>
          {/* iPad mockup con captura de La Pirámide */}
          <div className="md:col-span-2 flex items-center justify-center">
            <div className="relative w-full max-w-[320px]">
              {/* iPad frame */}
              <div className="bg-[#1a1a1a] rounded-[24px] p-3 shadow-2xl">
                {/* Camera notch */}
                <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#2a2a2a] border border-[#333]" />
                {/* Screen */}
                <div className="rounded-[16px] overflow-hidden bg-white">
                  <img
                    src="/cap-piramide.png"
                    alt="La Pirámide de la Marca Personal — herramienta interactiva"
                    className="w-full block"
                  />
                </div>
              </div>
              {/* Subtle reflection */}
              <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Quote de Jano ─────────────────────────────── */}
      <section className="bg-white border-y border-borde/40">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-14 sm:py-20 text-center">
          <p className="font-heading text-2xl sm:text-3xl text-negro/90 italic leading-snug mb-5">
            &ldquo;Las herramientas sin método son ruido. El método sin herramientas es filosofía que no aterriza. Necesitas las dos cosas.&rdquo;
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-[1px] bg-naranja/50" />
            <p className="text-naranja text-sm font-semibold">Jano Cabello</p>
            <div className="w-8 h-[1px] bg-naranja/50" />
          </div>
        </div>
      </section>

      {/* ─── Las herramientas del Sistema ────────────────── */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-bold text-naranja uppercase tracking-widest mb-3">El sistema</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-negro mb-3">
            Un ecosistema que conecta quién eres<br className="hidden sm:block" /> con lo que comunicas
          </h2>
          <p className="text-muted text-sm mt-3 max-w-2xl mx-auto">
            No son herramientas sueltas. Lo que trabajas en una alimenta a las demás. Cada pieza encaja con las otras porque tu marca personal es un sistema, no piezas sueltas.
          </p>
        </div>

        {/* Las 3 herramientas principales */}
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          {[
            {
              icon: "🔺",
              title: "La Pirámide",
              subtitle: "quién eres",
              desc: "Construye tu identidad desde la base. Historia, valores, propósito, propuesta de valor, estrategia. Cada nivel descansa sobre el anterior. Si los cimientos fallan, todo lo demás se tambalea.",
              tag: "Disponible",
            },
            {
              icon: "🌳",
              title: "El Árbol",
              subtitle: "tu marca visible",
              desc: "9 secciones que van de la semilla al cofre. Define quién eres, qué ofreces y cómo te comunicas. La IA analiza tu coherencia y te dice dónde están las grietas.",
              tag: "Disponible",
            },
            {
              icon: "🧭",
              title: "La Brújula",
              subtitle: "qué comunicas",
              desc: "De la estrategia a la acción. Genera contenido alineado con tu marca, planifica tu semana y publica con intención. Nada genérico — todo parte de tus datos reales.",
              tag: "Disponible",
            },
          ].map((tool) => (
            <div
              key={tool.title}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-borde/40 hover:border-naranja/30 hover:shadow-card transition-all group relative"
            >
              <span
                className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-naranja/15 text-naranja"
              >
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
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🔺</span>
          <div className="w-8 h-0.5 bg-naranja/30" />
          <span className="text-2xl">🌳</span>
          <div className="w-8 h-0.5 bg-naranja/30" />
          <span className="text-2xl">🧭</span>
        </div>
        <p className="text-center text-xs text-muted/60">Datos sincronizados entre herramientas</p>

        {/* Carrusel de capturas */}
        <div className="mt-14 -mx-6 sm:-mx-10">
          <div
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth px-6 sm:px-10 pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          >
            {[
              { src: "/cap1.png", alt: "La Pirámide — construye tu identidad desde la base" },
              { src: "/cap2.png", alt: "El Árbol — define tu marca visible en 9 secciones" },
              { src: "/cap3.png", alt: "La Brújula — genera contenido alineado con tu marca" },
              { src: "/cap4.png", alt: "Las Rutas — tu hoja de ruta personalizada con IA" },
            ].map((cap) => (
              <div
                key={cap.src}
                className="flex-shrink-0 w-[80%] sm:w-[45%] lg:w-[40%] snap-center"
              >
                <div className="bg-[#1a1a1a] rounded-[20px] p-2.5 shadow-xl">
                  <div className="rounded-[12px] overflow-hidden bg-white">
                    <img src={cap.src} alt={cap.alt} className="w-full block" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? "bg-naranja" : "bg-negro/15"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Y además... ───────────────────────────────── */}
      <section className="bg-white border-y border-borde/60">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-naranja uppercase tracking-widest mb-3">Y además</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-negro">
              Herramientas que te acompañan en cada paso
            </h2>
          </div>

          <div className="space-y-6">
            {/* Las Rutas + El Espejo */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-crema rounded-2xl p-7 sm:p-9 border border-borde/40">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-naranja/10 flex items-center justify-center text-xl">🗺️</span>
                  <h3 className="font-heading text-xl text-negro">Las Rutas</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-naranja/15 text-naranja">Nuevo</span>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  Cuando terminas El Árbol, la IA diagnostica tu marca y te asigna un camino personalizado. Cada módulo genera una estrategia basada en TUS datos: tus grietas, tus fortalezas, tus herramientas. No es un curso genérico — es tu hoja de ruta.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">4 rutas personalizadas</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Estrategia con IA</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Tareas concretas</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-negro to-negro/95 rounded-2xl p-7 sm:p-9">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-naranja/20 flex items-center justify-center text-xl">🪞</span>
                  <h3 className="font-heading text-xl text-white">El Espejo</h3>
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-4">
                  Las 22 piezas clave de tu marca en una sola vista. Propósito, valores, tono, arquetipos, audiencia, posicionamiento... Lo que está relleno aparece. Lo que falta te dice exactamente qué ejercicio completar.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/[0.08] text-white/70">22 campos de identidad</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/[0.08] text-white/70">Tu marca de un vistazo</span>
                </div>
              </div>
            </div>

            {/* Maestro + Planificador */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-crema rounded-2xl p-7 sm:p-9 border border-borde/40">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-naranja/10 flex items-center justify-center text-xl">🎯</span>
                  <h3 className="font-heading text-xl text-negro">El Maestro</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  Tu director creativo con IA. Dile tu objetivo, tu nivel de energía y el canal — te devuelve un brief completo: titulares, gancho de apertura, pistas creativas y la estrategia detrás. No texto genérico. Chispas alineadas con tu marca real.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Titulares</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Pistas creativas</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Gancho + CTA</span>
                </div>
              </div>

              <div className="bg-crema rounded-2xl p-7 sm:p-9 border border-borde/40">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-naranja/10 flex items-center justify-center text-xl">📅</span>
                  <h3 className="font-heading text-xl text-negro">El Planificador</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  De la idea a la acción. Arrastra piezas entre días, cambia entre vista semanal, mensual o lista. Cada pieza con su pilar, formato y canal. Sincroniza con Google Calendar.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Drag & drop</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">3 vistas</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-negro/[0.06] text-negro">Google Calendar</span>
                </div>
              </div>
            </div>

            {/* Ideas + Piezas */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-crema rounded-2xl p-6 border border-borde/40">
                <span className="text-2xl block mb-3">💡</span>
                <h4 className="font-heading text-lg text-negro mb-2">Banco de Ideas</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Captura ideas al vuelo, enriquécelas con IA y conviértelas en piezas de contenido listas para producir. Tu semillero creativo siempre abierto.
                </p>
              </div>
              <div className="bg-crema rounded-2xl p-6 border border-borde/40">
                <span className="text-2xl block mb-3">📝</span>
                <h4 className="font-heading text-lg text-negro mb-2">Piezas Guardadas</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Tu biblioteca de contenido. Todo lo que generas queda organizado y listo para publicar cuando tú decidas. De idea a publicación, sin perder nada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonios ───────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-naranja uppercase tracking-widest mb-3">Lo que dicen</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-negro">
            Personas reales, resultados reales
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              text: "Jano motiva y aporta estructura, lenguaje y reflexión para transformar tu expertise en un modelo con market fit y propósito.",
              name: "Miky Armengol",
              role: "Estratega digital",
            },
            {
              text: "Necesitas tiempo, reflexión y estar realmente dispuesta a decirte la verdad. Es una inversión con una recompensa profundamente transformadora.",
              name: "Ana Millán Maraña",
              role: "Comunicación corporativa y YouTube",
            },
            {
              text: "Jano me ha enseñado que la marca personal es mucho más que publicaciones en redes. Es conocerse a uno mismo y trazar un plan para dejar una buena huella en todo aquel que se cruce contigo.",
              name: "David Valero",
              role: "CEO y cofundador de Senda Impulsa",
            },
            {
              text: "Trabajar con Jano te obliga a ordenar lo que ya sabes de ti mismo. Su metodología convierte el caos interior en una narrativa que el mercado entiende y valora.",
              name: "Andrés Malo",
              role: "Emprendedor y estratega creativo",
            },
          ].map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 sm:p-7 border border-borde/40">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-naranja text-sm">★</span>
                ))}
              </div>
              <p className="text-sm text-negro/70 leading-relaxed mb-5 italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <p className="text-sm font-semibold text-negro">{t.name}</p>
                <p className="text-xs text-muted">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Quién soy ──────────────────────────────────── */}
      <section className="bg-white border-y border-borde/60">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
          <div className="grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-3">
              <p className="text-xs font-bold text-naranja uppercase tracking-widest mb-4">Quién hay detrás</p>
              <h2 className="font-heading text-3xl sm:text-4xl text-negro mb-6">
                Marca personal para una buena vida
              </h2>
              <div className="space-y-4 text-sm text-muted leading-relaxed">
                <p>
                  Soy Jano Cabello. Llevo 13 años trabajando con profesionales que quieren construir una marca personal con fundamento — no un escaparate bonito que se cae cuando lo tocas.
                </p>
                <p>
                  He creado La Pirámide de la Marca Personal, he dado talleres, he mentorizado a cientos de personas y he escrito más de 500 newsletters. Todo eso me ha llevado a una conclusión que puede sonar obvia pero que casi nadie aplica: la marca personal no es marketing. Es autoconocimiento.
                </p>
                <p>
                  El Sistema de Buena Vida es la materialización de todo lo que he aprendido en estos años. No es otro curso. Es un ecosistema de herramientas digitales conectadas entre sí, una comunidad de personas que piensan como tú, y un método probado para construir tu marca desde la base.
                </p>
                <p className="text-negro font-medium">
                  Sin fórmulas mágicas. Sin promesas de resultados rápidos. Con trabajo real, claridad y la convicción de que tu marca personal es el vehículo para vivir una buena vida.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
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
            <div className="md:col-span-2 flex items-center justify-center">
              <img
                src="/gorilayyo3.png"
                alt="Jano Cabello"
                className="w-full max-w-sm rounded-2xl"
                style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.1))" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing ────────────────────────────────────── */}
      <section id="que-incluye" className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-naranja uppercase tracking-widest mb-3">Tu membresía</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-negro">
            Todo lo que necesitas. Nada que te sobre.
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl border-2 border-naranja/30 shadow-card p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-naranja/[0.06] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 pb-8 border-b border-borde/40">
                <div>
                  <h3 className="font-heading text-2xl sm:text-3xl text-negro mb-1">Comunidad Buena Vida</h3>
                  <p className="text-sm text-muted">Método + herramientas + comunidad + acompañamiento</p>
                </div>
                <div className="flex items-baseline gap-1 flex-shrink-0">
                  <span className="font-heading text-4xl sm:text-5xl text-naranja">39$</span>
                  <span className="text-muted text-sm">/mes</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mb-8">
                {[
                  { icon: "🔺", text: "La Pirámide — autoconocimiento estructurado en 5 niveles" },
                  { icon: "🌳", text: "El Árbol — tu marca personal en 9 secciones con análisis IA" },
                  { icon: "🧭", text: "La Brújula — generación de contenido estratégico con IA" },
                  { icon: "🗺️", text: "Las Rutas — estrategia personalizada según tu perfil" },
                  { icon: "🪞", text: "El Espejo — 22 campos de identidad en una sola vista" },
                  { icon: "🎯", text: "El Maestro — director creativo con inteligencia artificial" },
                  { icon: "📅", text: "Planificador con drag & drop y Google Calendar" },
                  { icon: "💡", text: "Banco de ideas con enriquecimiento por IA" },
                  { icon: "🎓", text: "Formación continua con lecciones semanales en vídeo" },
                  { icon: "👥", text: "Comunidad activa de profesionales con tu misma visión" },
                  { icon: "📞", text: "Sesiones en directo con Jano y preguntas abiertas" },
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

      {/* ─── CTA final ───────────────────────────────────── */}
      <section className="bg-negro">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-16 sm:py-24 text-center">
          <p className="text-naranja text-xs font-bold uppercase tracking-widest mb-6">39$/mes · Cancela cuando quieras</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-white mb-5 leading-snug">
            Tu marca personal no es<br />
            tu escaparate en redes.
          </h2>
          <p className="text-white/50 text-base mb-3 max-w-lg mx-auto">
            Es el vehículo para vivir una buena vida.
          </p>
          <p className="text-white/35 text-sm mb-8 max-w-lg mx-auto">
            Y ahora existe un sistema completo para construirla con método, herramientas y gente que piensa como tú.
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
