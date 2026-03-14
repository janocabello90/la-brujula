import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-crema">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧭</span>
          <span className="font-heading text-xl font-semibold text-negro">La Brújula</span>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium text-naranja hover:text-naranja-hover transition-colors"
        >
          Entrar
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
        <p className="text-sm font-medium text-naranja tracking-wide uppercase mb-4">
          Tu repositorio de conocimiento estratégico
        </p>
        <h1 className="font-heading text-5xl md:text-6xl text-negro mb-6 leading-tight">
          La Brújula<br />de Contenido
        </h1>
        <p className="text-lg text-muted max-w-xl mx-auto mb-10 leading-relaxed">
          No te dice qué escribir. Te dice hacia dónde apuntar. Construye tu
          mapa de contenido estratégico y deja que la IA te sugiera la pieza
          perfecta para cada momento.
        </p>
        <Link
          href="/login"
          className="inline-block bg-naranja text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-naranja-hover transition-colors text-base"
        >
          Crear mi Brújula →
        </Link>
      </section>

      {/* Qué es */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-card rounded-card shadow-card p-8 md:p-12">
          <h2 className="font-heading text-3xl text-negro mb-4 text-center">
            ¿Qué es La Brújula?
          </h2>
          <p className="text-muted text-center max-w-2xl mx-auto leading-relaxed">
            Una herramienta que te ayuda a mapear tu conocimiento, entender a tu
            audiencia y generar ideas de contenido alineadas con tu marca
            personal. Todo en un flujo guiado que combina estrategia con
            inteligencia artificial.
          </p>
        </div>
      </section>

      {/* 3 pasos */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="font-heading text-3xl text-negro mb-10 text-center">
          Cómo funciona
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              num: "01",
              title: "Configura tu Brújula",
              desc: "Completa 6 pasos estratégicos: desde tu propuesta de valor hasta tu árbol de contenidos. Solo se hace una vez.",
            },
            {
              num: "02",
              title: "Consulta tu Mapa",
              desc: "Ve tu Minority Report completo: pilares, subtemas, ángulos. Todo tu conocimiento estratégico en una vista.",
            },
            {
              num: "03",
              title: "Activa el Maestro",
              desc: "Dile cómo te sientes hoy, qué quieres lograr y en qué canal. La IA te sugiere la pieza perfecta.",
            },
          ].map((step) => (
            <div
              key={step.num}
              className="bg-card rounded-card shadow-card p-6"
            >
              <span className="text-naranja font-bold text-sm">{step.num}</span>
              <h3 className="font-heading text-xl text-negro mt-2 mb-2">
                {step.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <h2 className="font-heading text-3xl text-negro mb-4">
          ¿Listo para dejar de improvisar?
        </h2>
        <p className="text-muted mb-8">
          Crea tu brújula en 15 minutos. Úsala cada vez que te sientes a crear.
        </p>
        <Link
          href="/login"
          className="inline-block bg-negro text-white font-semibold px-8 py-3.5 rounded-lg hover:opacity-90 transition-opacity text-base"
        >
          Empezar gratis →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-borde py-8 text-center text-sm text-muted-light">
        <p>
          La Brújula de Contenido · Un proyecto de{" "}
          <a
            href="https://janocabello.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-naranja hover:underline"
          >
            Jano Cabello
          </a>
        </p>
      </footer>
    </div>
  );
}
