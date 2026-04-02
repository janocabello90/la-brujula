"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/AppShell";

interface Checkin {
  dia: number;
  likes: number;
  comentarios: number;
  desbloqueador: string | null;
  created_at: string;
}

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

interface Props {
  userName: string;
  isRegistered: boolean;
  initialInstagram: string;
  initialObjetivo: string;
}

export default function RetoClient({ userName, isRegistered: initialRegistered, initialInstagram, initialObjetivo }: Props) {
  const [tab, setTab] = useState<"panel" | "ranking">(initialRegistered ? "panel" : "ranking");
  const [isRegistered, setIsRegistered] = useState(initialRegistered);

  // Join form
  const [instagram, setInstagram] = useState(initialInstagram);
  const [objetivo, setObjetivo] = useState(initialObjetivo);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Panel data
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [loadingPanel, setLoadingPanel] = useState(true);

  // Check-in form
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [likes, setLikes] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [desbloqueador, setDesbloqueador] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Ranking
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [totalParticipantes, setTotalParticipantes] = useState(0);
  const [loadingRanking, setLoadingRanking] = useState(false);

  const fetchMyData = useCallback(async () => {
    try {
      const res = await fetch("/api/reto?action=me");
      const data = await res.json();
      if (data.registered) {
        setIsRegistered(true);
        setCheckins(data.checkins || []);
        setCurrentDay(data.currentDay);
        setInstagram(data.participant?.instagram_username || "");
        setObjetivo(data.participant?.objetivo || "");
      } else {
        setCurrentDay(data.currentDay);
      }
    } catch (e) {
      console.error("Error fetching my data:", e);
    }
    setLoadingPanel(false);
  }, []);

  const fetchRanking = useCallback(async () => {
    setLoadingRanking(true);
    try {
      const res = await fetch("/api/reto?action=ranking");
      const data = await res.json();
      setRanking(data.ranking || []);
      setTotalParticipantes(data.totalParticipantes || 0);
      setCurrentDay(data.currentDay);
    } catch (e) {
      console.error("Error fetching ranking:", e);
    }
    setLoadingRanking(false);
  }, []);

  useEffect(() => {
    fetchMyData();
    fetchRanking();
  }, [fetchMyData, fetchRanking]);

  // Auto-select current day
  useEffect(() => {
    if (isRegistered && !loadingPanel) {
      const todayDone = checkins.find((c) => c.dia === currentDay);
      if (!todayDone) setSelectedDay(currentDay);
    }
  }, [isRegistered, loadingPanel, checkins, currentDay]);

  // Load existing checkin data when selecting a day
  useEffect(() => {
    if (selectedDay) {
      const existing = checkins.find((c) => c.dia === selectedDay);
      if (existing) {
        setLikes(String(existing.likes || ""));
        setComentarios(String(existing.comentarios || ""));
        setDesbloqueador(existing.desbloqueador || "");
      } else {
        setLikes("");
        setComentarios("");
        setDesbloqueador("");
      }
      setSaved(false);
    }
  }, [selectedDay, checkins]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instagram.trim()) { setJoinError("Introduce tu usuario de Instagram"); return; }
    setJoining(true);
    setJoinError("");

    try {
      const res = await fetch("/api/reto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", instagram_username: instagram, objetivo }),
      });
      const data = await res.json();
      if (data.error) { setJoinError(data.error); setJoining(false); return; }

      setIsRegistered(true);
      setTab("panel");
      await fetchMyData();
      await fetchRanking();
    } catch {
      setJoinError("Error de conexión.");
    }
    setJoining(false);
  };

  const handleCheckin = async () => {
    if (!selectedDay) return;
    setSaving(true);

    try {
      const res = await fetch("/api/reto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkin", dia: selectedDay, likes, comentarios, desbloqueador }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchMyData();
        await fetchRanking();
      }
    } catch { alert("Error de conexión."); }
    setSaving(false);
  };

  // Stats
  const totalDias = checkins.length;
  const totalLikes = checkins.reduce((s, c) => s + (c.likes || 0), 0);
  const totalComentarios = checkins.reduce((s, c) => s + (c.comentarios || 0), 0);
  const totalEngagement = totalLikes + totalComentarios;
  let racha = 0;
  for (let d = 1; d <= 15; d++) {
    if (checkins.some((c) => c.dia === d)) racha = d; else break;
  }

  const getMedal = (i: number) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-heading text-2xl sm:text-3xl text-negro">Reto 15 Días 🔥</h1>
            <span className="text-xs bg-amarillo/20 text-negro px-2.5 py-1 rounded-full font-heading">
              Día {currentDay}/15
            </span>
          </div>
          <p className="text-sm text-muted">15 publicaciones. 15 días. 1 resultado.</p>
        </div>

        {/* Tabs */}
        {isRegistered && (
          <div className="flex gap-1 bg-white rounded-xl border border-borde/40 p-1 mb-6 max-w-xs">
            <button
              onClick={() => setTab("panel")}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${
                tab === "panel" ? "bg-denim text-white shadow-button" : "text-muted hover:text-negro"
              }`}
            >
              Mi Panel
            </button>
            <button
              onClick={() => { setTab("ranking"); fetchRanking(); }}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${
                tab === "ranking" ? "bg-denim text-white shadow-button" : "text-muted hover:text-negro"
              }`}
            >
              Ranking
            </button>
          </div>
        )}

        {/* ===== NOT REGISTERED: JOIN FORM + RANKING ===== */}
        {!isRegistered && (
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            {/* Join form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl border border-borde/40 p-6 shadow-card">
                <h2 className="font-heading text-lg text-negro mb-1">Apuntarme al reto</h2>
                <p className="text-xs text-muted mb-5">Tu nombre ({userName}) y email ya los tenemos.</p>

                <form onSubmit={handleJoin} className="space-y-4">
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
                      Tu objetivo <span className="font-normal text-muted">(opcional)</span>
                    </label>
                    <textarea
                      value={objetivo}
                      onChange={(e) => setObjetivo(e.target.value)}
                      placeholder="¿Qué quieres conseguir en estos 15 días?"
                      rows={3}
                      className="w-full px-4 py-3 border border-borde rounded-xl bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-denim transition-colors text-sm resize-none"
                    />
                  </div>
                  {joinError && <p className="text-danger text-sm">{joinError}</p>}
                  <button type="submit" disabled={joining} className="w-full bg-denim text-white font-semibold py-3 rounded-xl hover:bg-denim-dark transition-colors disabled:opacity-50 shadow-button text-sm">
                    {joining ? "Apuntando..." : "¡Me apunto! 🔥"}
                  </button>
                </form>
              </div>

              {/* Prizes */}
              <div className="mt-5 space-y-2">
                {[
                  { emoji: "🔥", title: "Constancia", desc: "15/15 publicaciones" },
                  { emoji: "📊", title: "Engagement", desc: "Mayor likes + comentarios" },
                  { emoji: "💎", title: "Desbloqueo", desc: "Mejor reflexión (elegida por Jano)" },
                ].map((p) => (
                  <div key={p.title} className="bg-white rounded-xl border border-borde/40 p-3 flex items-center gap-3">
                    <span className="text-lg">{p.emoji}</span>
                    <div>
                      <p className="text-xs font-heading text-negro">{p.title}</p>
                      <p className="text-[10px] text-muted">{p.desc} → <span className="text-amarillo-hover font-semibold">1 mentoría (150€)</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ranking preview */}
            <div className="md:col-span-3">
              <RankingView ranking={ranking} currentDay={currentDay} loading={loadingRanking} totalParticipantes={totalParticipantes} getMedal={getMedal} />
            </div>
          </div>
        )}

        {/* ===== REGISTERED: PANEL TAB ===== */}
        {isRegistered && tab === "panel" && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <StatBox label="días" value={totalDias} />
              <StatBox label="racha" value={racha} icon="🔥" />
              <StatBox label="engagement" value={totalEngagement} highlight />
              <StatBox label="completado" value={`${Math.round((totalDias / 15) * 100)}%`} />
            </div>

            {/* Objective */}
            {objetivo && (
              <div className="bg-amarillo/10 border border-amarillo/25 rounded-xl px-4 py-3 mb-6">
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-0.5">Tu objetivo</p>
                <p className="text-sm text-negro">{objetivo}</p>
              </div>
            )}

            {/* 15-Day Grid */}
            <div className="mb-6">
              <p className="text-[10px] font-bold text-denim/40 uppercase tracking-[0.12em] mb-2">Tus 15 días</p>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 15 }, (_, i) => {
                  const day = i + 1;
                  const checkin = checkins.find((c) => c.dia === day);
                  const isToday = day === currentDay;
                  const isFuture = day > currentDay;
                  const isSelected = selectedDay === day;
                  const isDone = !!checkin;
                  const isMissed = !isDone && day < currentDay;

                  return (
                    <button
                      key={day}
                      onClick={() => !isFuture && setSelectedDay(day)}
                      disabled={isFuture}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 font-heading transition-all border-2 ${
                        isSelected
                          ? "border-denim bg-denim/10 text-denim ring-2 ring-denim/20"
                          : isDone
                          ? "border-success/30 bg-success/[0.07] text-success"
                          : isToday
                          ? "border-amarillo bg-amarillo/10 text-negro"
                          : isMissed
                          ? "border-danger/20 bg-danger/[0.04] text-danger/50"
                          : "border-borde/20 bg-white text-muted/30 cursor-not-allowed"
                      }`}
                    >
                      <span className="text-sm">{isDone ? "✓" : day}</span>
                      {isDone && (
                        <span className="text-[8px] font-normal text-muted">
                          {(checkin.likes || 0) + (checkin.comentarios || 0)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-2 text-[10px] text-muted">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-success/40" /> Publicado</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amarillo/50" /> Hoy</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-danger/30" /> Faltó</span>
              </div>
            </div>

            {/* Check-in Form */}
            {selectedDay && (
              <div className="bg-white rounded-2xl border border-borde/40 p-6 shadow-card mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-lg text-negro">
                    {checkins.find((c) => c.dia === selectedDay)
                      ? `Editar día ${selectedDay}`
                      : selectedDay === currentDay
                      ? "Check-in de hoy"
                      : `Check-in día ${selectedDay}`}
                  </h2>
                  {selectedDay === currentDay && !checkins.find((c) => c.dia === selectedDay) && (
                    <span className="text-xs bg-amarillo/20 text-negro px-2.5 py-1 rounded-full font-medium">Hoy</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-negro mb-1.5">Likes ❤️</label>
                    <input
                      type="number" min="0" value={likes}
                      onChange={(e) => setLikes(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 border border-borde rounded-xl bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-denim transition-colors text-center font-heading text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-negro mb-1.5">Comentarios 💬</label>
                    <input
                      type="number" min="0" value={comentarios}
                      onChange={(e) => setComentarios(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 border border-borde rounded-xl bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-denim transition-colors text-center font-heading text-lg"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-semibold text-negro mb-1.5">
                    ¿Has desbloqueado algo hoy? 💎 <span className="font-normal text-muted">(opcional — 3er premio)</span>
                  </label>
                  <textarea
                    value={desbloqueador}
                    onChange={(e) => setDesbloqueador(e.target.value)}
                    placeholder="¿Qué ha cambiado en ti? ¿Qué has descubierto al publicar hoy?"
                    rows={3}
                    className="w-full px-4 py-3 border border-borde rounded-xl bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-denim transition-colors text-sm resize-none"
                  />
                </div>

                <button
                  onClick={handleCheckin}
                  disabled={saving}
                  className={`w-full font-semibold py-3.5 rounded-xl transition-all shadow-button text-sm ${
                    saved
                      ? "bg-success text-white"
                      : "bg-denim text-white hover:bg-denim-dark disabled:opacity-50"
                  }`}
                >
                  {saving ? "Guardando..." : saved ? "✓ ¡Guardado!" : checkins.find((c) => c.dia === selectedDay) ? "Actualizar" : "¡Hoy he publicado! 🔥"}
                </button>
              </div>
            )}

            {/* Desbloqueadores */}
            {checkins.some((c) => c.desbloqueador) && (
              <div className="mb-6">
                <p className="text-[10px] font-bold text-denim/40 uppercase tracking-[0.12em] mb-2">Tus desbloqueos</p>
                <div className="space-y-2">
                  {checkins.filter((c) => c.desbloqueador).map((c) => (
                    <div key={c.dia} className="bg-white rounded-xl border border-borde/40 p-4">
                      <span className="text-xs font-heading text-denim">Día {c.dia} 💎</span>
                      <p className="text-sm text-negro/80 leading-relaxed mt-1">{c.desbloqueador}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== REGISTERED: RANKING TAB ===== */}
        {isRegistered && tab === "ranking" && (
          <RankingView ranking={ranking} currentDay={currentDay} loading={loadingRanking} totalParticipantes={totalParticipantes} getMedal={getMedal} />
        )}
      </div>
    </AppShell>
  );
}

// --- Helper Components ---

function StatBox({ label, value, icon, highlight }: { label: string; value: number | string; icon?: string; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-borde/40 p-3 text-center">
      <div className={`font-heading text-xl sm:text-2xl flex items-center justify-center gap-1 ${highlight ? "text-denim" : "text-negro"}`}>
        {icon && <span className="text-sm">{icon}</span>}
        {value}
      </div>
      <div className="text-[10px] text-muted">{label}</div>
    </div>
  );
}

function RankingView({ ranking, currentDay, loading, totalParticipantes, getMedal }: {
  ranking: RankingEntry[];
  currentDay: number;
  loading: boolean;
  totalParticipantes: number;
  getMedal: (i: number) => string;
}) {
  return (
    <div>
      {/* Day progress */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-lg">📅</span>
        <div className="flex-1">
          <div className="flex gap-0.5">
            {Array.from({ length: 15 }, (_, i) => (
              <div key={i} className={`flex-1 h-2 rounded-full ${i < currentDay ? "bg-denim" : "bg-borde/30"}`} />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted">Día {currentDay}/15</span>
            <span className="text-[10px] text-muted">{totalParticipantes} participantes</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="loader mx-auto" />
          <p className="text-sm text-muted mt-3">Cargando ranking...</p>
        </div>
      ) : ranking.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-borde/40">
          <div className="text-4xl mb-3">🦍</div>
          <p className="text-muted text-sm">Aún no hay participantes. ¡Sé el primero!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ranking.map((entry, i) => (
            <div
              key={entry.id}
              className={`bg-white rounded-xl border p-4 transition-all ${
                i === 0 ? "border-amarillo/40 shadow-glow" : i < 3 ? "border-denim/15" : "border-borde/40"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Medal */}
                <span className={`font-heading text-lg w-8 text-center ${i < 3 ? "" : "text-muted"}`}>
                  {getMedal(i)}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-sm text-negro truncate">{entry.nombre}</p>
                  <a href={`https://instagram.com/${entry.instagram}`} target="_blank" rel="noopener noreferrer" className="text-xs text-denim hover:text-denim-dark">
                    @{entry.instagram}
                  </a>
                </div>

                {/* Streak */}
                <div className="text-center px-2">
                  <div className="flex items-center gap-0.5">
                    <span className="text-xs">🔥</span>
                    <span className={`font-heading text-lg ${entry.racha >= 15 ? "text-amarillo-hover" : "text-negro"}`}>{entry.racha}</span>
                  </div>
                  <p className="text-[9px] text-muted">racha</p>
                </div>

                {/* Days */}
                <div className="text-center px-2 hidden sm:block">
                  <span className="font-heading text-lg text-negro">{entry.diasPublicados}</span>
                  <span className="text-xs text-muted">/15</span>
                  <p className="text-[9px] text-muted">días</p>
                </div>

                {/* Engagement */}
                <div className="text-center px-2">
                  <span className={`font-heading text-lg ${i === 0 ? "text-denim" : "text-negro"}`}>
                    {entry.totalEngagement.toLocaleString()}
                  </span>
                  <p className="text-[9px] text-muted">
                    {entry.totalLikes}❤️ {entry.totalComentarios}💬
                  </p>
                </div>
              </div>

              {/* Day dots */}
              <div className="flex gap-0.5 mt-2">
                {Array.from({ length: 15 }, (_, d) => (
                  <div
                    key={d}
                    className={`flex-1 h-1 rounded-full ${
                      d < entry.diasPublicados ? "bg-denim" : d < currentDay ? "bg-danger/20" : "bg-borde/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
