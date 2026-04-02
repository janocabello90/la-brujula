"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RankingEntry {
  id: string;
  nombre: string;
  instagram: string;
  objetivo: string | null;
  diasPublicados: number;
  racha: number;
  totalLikes: number;
  totalComentarios: number;
  totalEngagement: number;
  desbloqueadores: { dia: number; texto: string }[];
}

interface RankingData {
  ranking: RankingEntry[];
  currentDay: number;
  totalParticipantes: number;
}

export default function RetoPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"info" | "ranking">("info");
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(false);

  // Registration form
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState("");

  const fetchRanking = useCallback(async () => {
    try {
      const res = await fetch("/api/reto?action=ranking");
      const data = await res.json();
      setRankingData(data);
    } catch (e) {
      console.error("Error fetching ranking:", e);
    }
  }, []);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setRegError("");

    try {
      const res = await fetch("/api/reto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          nombre,
          email,
          instagram_username: instagram,
          objetivo,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setRegError(data.error);
        setRegistering(false);
        return;
      }

      // Redirect to personal panel
      router.push(`/reto/panel?token=${data.token}`);
    } catch {
      setRegError("Error de conexión. Inténtalo de nuevo.");
      setRegistering(false);
    }
  };

  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
  };

  return (
    <div className="min-h-screen bg-crema">
      {/* Nav */}
      <nav className="border-b border-borde/40 bg-white/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-heading text-negro hover:text-denim transition-colors">
            <span>🦍</span> Sistema Buena Vida
          </Link>
          <div className="text-xs font-bold text-denim uppercase tracking-widest">Reto 15 días</div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-4xl mx-auto px-6 pt-10 sm:pt-16 pb-8 text-center">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amarillo/[0.08] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-denim/[0.06] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative">
          <div className="inline-block text-6xl mb-4">🦍</div>
          <h1 className="font-heading text-4xl sm:text-5xl text-negro mb-3 leading-tight">
            15 Días. 15 Publicaciones.<br />
            <span className="text-denim">1 Resultado.</span>
          </h1>
          <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-2">
            Un reto para dejar de pensar y empezar a publicar. Con objetivos claros, accountability de la comunidad y premios para los que se lo curren.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
            <div className="bg-white rounded-xl border border-borde/40 px-4 py-2.5">
              <span className="font-heading text-denim">🏆</span> 3 premios de mentoría (150€)
            </div>
            <div className="bg-white rounded-xl border border-borde/40 px-4 py-2.5">
              <span className="font-heading text-denim">📊</span> Ranking público en tiempo real
            </div>
            <div className="bg-white rounded-xl border border-borde/40 px-4 py-2.5">
              <span className="font-heading text-denim">🔥</span> {rankingData?.totalParticipantes || "..."} participantes
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <div className="flex gap-1 bg-white rounded-xl border border-borde/40 p-1 max-w-sm mx-auto">
          <button
            onClick={() => setTab("info")}
            className={`flex-1 text-sm font-medium py-2.5 rounded-lg transition-all ${
              tab === "info"
                ? "bg-denim text-white shadow-button"
                : "text-muted hover:text-negro"
            }`}
          >
            Apuntarme
          </button>
          <button
            onClick={() => { setTab("ranking"); fetchRanking(); }}
            className={`flex-1 text-sm font-medium py-2.5 rounded-lg transition-all ${
              tab === "ranking"
                ? "bg-denim text-white shadow-button"
                : "text-muted hover:text-negro"
            }`}
          >
            Ranking
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* ===== INFO + REGISTRATION TAB ===== */}
        {tab === "info" && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Rules */}
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl text-negro mb-4">Las reglas</h2>
                <div className="space-y-3">
                  {[
                    { num: "1", text: "Publica 1 pieza de contenido al día durante 15 días en Instagram" },
                    { num: "2", text: "Cada día haces check-in aquí: confirmas que has publicado y metes tus likes + comentarios" },
                    { num: "3", text: "Si algo se desbloquea dentro de ti, lo escribes. Eso cuenta para el 3er premio" },
                  ].map((rule) => (
                    <div key={rule.num} className="flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-full bg-denim/10 text-denim font-heading text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                        {rule.num}
                      </div>
                      <p className="text-sm text-negro/80 leading-relaxed">{rule.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-heading text-lg text-negro mb-3">Los premios</h3>
                <div className="space-y-2">
                  {[
                    { emoji: "🔥", title: "Constancia", desc: "15 de 15 publicaciones — la racha perfecta" },
                    { emoji: "📊", title: "Engagement", desc: "Mayor suma de likes + comentarios en 15 días" },
                    { emoji: "💎", title: "Desbloqueo", desc: "La reflexión más transformadora — elegida por Jano" },
                  ].map((prize) => (
                    <div key={prize.title} className="bg-white rounded-xl border border-borde/40 p-4 flex items-start gap-3">
                      <span className="text-xl">{prize.emoji}</span>
                      <div>
                        <p className="font-heading text-sm text-negro">{prize.title}</p>
                        <p className="text-xs text-muted mt-0.5">{prize.desc}</p>
                        <p className="text-xs text-amarillo-hover font-semibold mt-1">1 sesión de mentoría (150€)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amarillo/10 border border-amarillo/25 rounded-xl p-4">
                <p className="text-sm text-negro leading-relaxed">
                  <span className="font-heading">No necesitas cuenta en el Sistema.</span> Solo tu nombre, email e Instagram. En 30 segundos estás dentro.
                </p>
              </div>
            </div>

            {/* Right: Registration Form */}
            <div>
              <div className="bg-white rounded-2xl border border-borde/40 p-6 sm:p-8 shadow-card">
                <h2 className="font-heading text-xl text-negro mb-1">Únete al reto</h2>
                <p className="text-xs text-muted mb-6">Rellena tus datos y empieza a competir.</p>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-negro mb-1.5">Tu nombre</label>
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="¿Cómo te llamas?"
                      className="w-full px-4 py-3 border border-borde rounded-xl bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-denim transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-negro mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 border border-borde rounded-xl bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-denim transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-negro mb-1.5">Usuario de Instagram</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-light text-sm">@</span>
                      <input
                        type="text"
                        required
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))}
                        placeholder="tu_usuario"
                        className="w-full pl-9 pr-4 py-3 border border-borde rounded-xl bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-denim transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-negro mb-1.5">
                      Tu objetivo para estos 15 días <span className="text-muted font-normal">(opcional)</span>
                    </label>
                    <textarea
                      value={objetivo}
                      onChange={(e) => setObjetivo(e.target.value)}
                      placeholder="¿Qué quieres conseguir? ej: Romper el miedo a publicar, conseguir 100 seguidores nuevos..."
                      rows={3}
                      className="w-full px-4 py-3 border border-borde rounded-xl bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-denim transition-colors text-sm resize-none"
                    />
                  </div>

                  {regError && (
                    <p className="text-danger text-sm">{regError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={registering}
                    className="w-full bg-denim text-white font-semibold py-3.5 rounded-xl hover:bg-denim-dark transition-colors disabled:opacity-50 shadow-button text-sm"
                  >
                    {registering ? "Registrando..." : "Unirme al reto →"}
                  </button>
                </form>

                <p className="text-[10px] text-muted/60 text-center mt-4">
                  Si ya te registraste, introduce el mismo email y te redirigimos a tu panel.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== RANKING TAB ===== */}
        {tab === "ranking" && (
          <div>
            {/* Day counter */}
            {rankingData && (
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 bg-white rounded-2xl border border-borde/40 px-6 py-3 shadow-card">
                  <span className="text-2xl">📅</span>
                  <div className="text-left">
                    <p className="font-heading text-lg text-negro">Día {rankingData.currentDay} de 15</p>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: 15 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full transition-all ${
                            i < rankingData.currentDay ? "bg-denim" : "bg-borde/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ranking cards */}
            {!rankingData ? (
              <div className="text-center py-12">
                <div className="loader mx-auto" />
                <p className="text-sm text-muted mt-3">Cargando ranking...</p>
              </div>
            ) : rankingData.ranking.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🦍</div>
                <p className="text-muted">Aún no hay participantes. ¡Sé el primero!</p>
                <button
                  onClick={() => setTab("info")}
                  className="mt-4 text-sm text-denim font-medium hover:text-denim-dark transition-colors"
                >
                  Apuntarme →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Header row */}
                <div className="hidden sm:grid grid-cols-12 gap-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Participante</div>
                  <div className="col-span-2 text-center">Racha</div>
                  <div className="col-span-2 text-center">Días</div>
                  <div className="col-span-3 text-center">Engagement</div>
                </div>

                {rankingData.ranking.map((entry, i) => (
                  <div
                    key={entry.id}
                    className={`bg-white rounded-xl border p-4 transition-all ${
                      i === 0
                        ? "border-amarillo/40 shadow-glow"
                        : i < 3
                        ? "border-denim/20"
                        : "border-borde/40"
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-3 items-center">
                      {/* Position */}
                      <div className="col-span-2 sm:col-span-1">
                        <span className={`font-heading text-lg ${i < 3 ? "text-xl" : "text-muted"}`}>
                          {getMedal(i)}
                        </span>
                      </div>

                      {/* Name + IG */}
                      <div className="col-span-10 sm:col-span-4">
                        <p className="font-heading text-sm text-negro truncate">{entry.nombre}</p>
                        <a
                          href={`https://instagram.com/${entry.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-denim hover:text-denim-dark transition-colors"
                        >
                          @{entry.instagram}
                        </a>
                      </div>

                      {/* Streak */}
                      <div className="col-span-4 sm:col-span-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs">🔥</span>
                          <span className={`font-heading text-lg ${entry.racha >= 15 ? "text-amarillo-hover" : "text-negro"}`}>
                            {entry.racha}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted sm:hidden">racha</p>
                      </div>

                      {/* Days */}
                      <div className="col-span-4 sm:col-span-2 text-center">
                        <span className="font-heading text-lg text-negro">{entry.diasPublicados}</span>
                        <span className="text-xs text-muted">/15</span>
                        <p className="text-[10px] text-muted sm:hidden">días</p>
                      </div>

                      {/* Engagement */}
                      <div className="col-span-4 sm:col-span-3 text-center">
                        <span className={`font-heading text-lg ${i === 0 ? "text-denim" : "text-negro"}`}>
                          {entry.totalEngagement.toLocaleString()}
                        </span>
                        <p className="text-[10px] text-muted">
                          {entry.totalLikes}❤️ {entry.totalComentarios}💬
                        </p>
                      </div>
                    </div>

                    {/* Day dots - mobile */}
                    <div className="flex gap-0.5 mt-3 sm:mt-2">
                      {Array.from({ length: 15 }, (_, d) => {
                        const hasCheckin = entry.diasPublicados > 0; // simplified - would need per-day data
                        return (
                          <div
                            key={d}
                            className={`flex-1 h-1.5 rounded-full ${
                              d < entry.diasPublicados ? "bg-denim" : d < (rankingData?.currentDay || 0) ? "bg-danger/30" : "bg-borde/30"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
