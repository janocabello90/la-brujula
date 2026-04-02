"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Checkin {
  dia: number;
  likes: number;
  comentarios: number;
  desbloqueador: string | null;
  created_at: string;
}

interface Participant {
  id: string;
  nombre: string;
  instagram_username: string;
  objetivo: string | null;
  created_at: string;
}

export default function RetoPanelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="text-center">
          <div className="loader mx-auto" />
          <p className="text-sm text-muted mt-3">Cargando tu panel...</p>
        </div>
      </div>
    }>
      <RetoPanelContent />
    </Suspense>
  );
}

function RetoPanelContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check-in form
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [likes, setLikes] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [desbloqueador, setDesbloqueador] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/reto?action=participant&token=${token}`);
      if (!res.ok) {
        setError("Token no válido. ¿Seguro que te registraste?");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setParticipant(data.participant);
      setCheckins(data.checkins || []);
      setCurrentDay(data.currentDay);
      setLoading(false);
    } catch {
      setError("Error de conexión.");
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // When data loads, auto-select current day if not checked in
  useEffect(() => {
    if (!loading && participant) {
      const todayCheckin = checkins.find((c) => c.dia === currentDay);
      if (!todayCheckin) {
        setSelectedDay(currentDay);
      }
    }
  }, [loading, participant, checkins, currentDay]);

  // When selecting a day, load its data
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

  const handleCheckin = async () => {
    if (!token || !selectedDay) return;
    setSaving(true);

    try {
      const res = await fetch("/api/reto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checkin",
          token,
          dia: selectedDay,
          likes,
          comentarios,
          desbloqueador,
        }),
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchData(); // Refresh data
      }
    } catch {
      alert("Error de conexión. Inténtalo de nuevo.");
    }

    setSaving(false);
  };

  // Stats
  const totalDias = checkins.length;
  const totalLikes = checkins.reduce((s, c) => s + (c.likes || 0), 0);
  const totalComentarios = checkins.reduce((s, c) => s + (c.comentarios || 0), 0);
  const totalEngagement = totalLikes + totalComentarios;

  // Streak
  let racha = 0;
  for (let d = 1; d <= 15; d++) {
    if (checkins.some((c) => c.dia === d)) {
      racha = d;
    } else {
      break;
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🦍</div>
          <h1 className="font-heading text-2xl text-negro mb-2">Panel del Reto</h1>
          <p className="text-muted text-sm mb-4">Necesitas tu enlace personal para acceder aquí.</p>
          <Link href="/reto" className="text-sm text-denim font-medium hover:text-denim-dark transition-colors">
            ← Ir a registrarme
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="text-center">
          <div className="loader mx-auto" />
          <p className="text-sm text-muted mt-3">Cargando tu panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <h1 className="font-heading text-2xl text-negro mb-2">Algo ha fallado</h1>
          <p className="text-muted text-sm mb-4">{error}</p>
          <Link href="/reto" className="text-sm text-denim font-medium hover:text-denim-dark transition-colors">
            ← Volver al reto
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crema">
      {/* Nav */}
      <nav className="border-b border-borde/40 bg-white/60 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/reto" className="flex items-center gap-2 text-sm font-heading text-negro hover:text-denim transition-colors">
            ← Reto 15 días
          </Link>
          <Link href="/reto" className="text-xs text-denim font-medium hover:text-denim-dark transition-colors">
            Ver ranking
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl text-negro mb-1">
            Hola, {participant?.nombre?.split(" ")[0]} 🦍
          </h1>
          <p className="text-sm text-muted">
            @{participant?.instagram_username} · Día {currentDay} de 15
          </p>
          {participant?.objetivo && (
            <div className="mt-3 bg-amarillo/10 border border-amarillo/25 rounded-xl px-4 py-3">
              <p className="text-xs text-muted font-medium mb-0.5">Tu objetivo</p>
              <p className="text-sm text-negro">{participant.objetivo}</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-xl border border-borde/40 p-3 text-center">
            <div className="font-heading text-2xl text-negro">{totalDias}</div>
            <div className="text-[10px] text-muted">días</div>
          </div>
          <div className="bg-white rounded-xl border border-borde/40 p-3 text-center">
            <div className="font-heading text-2xl text-negro flex items-center justify-center gap-1">
              🔥 {racha}
            </div>
            <div className="text-[10px] text-muted">racha</div>
          </div>
          <div className="bg-white rounded-xl border border-borde/40 p-3 text-center">
            <div className="font-heading text-2xl text-denim">{totalEngagement}</div>
            <div className="text-[10px] text-muted">engagement</div>
          </div>
          <div className="bg-white rounded-xl border border-borde/40 p-3 text-center">
            <div className="font-heading text-2xl text-negro">{Math.round((totalDias / 15) * 100)}%</div>
            <div className="text-[10px] text-muted">completado</div>
          </div>
        </div>

        {/* 15-Day Grid */}
        <div className="mb-8">
          <h2 className="text-[10px] font-bold text-denim/40 uppercase tracking-[0.12em] mb-3">
            Tus 15 días
          </h2>
          <div className="grid grid-cols-5 sm:grid-cols-15 gap-2">
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
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-sm font-heading transition-all border-2 ${
                    isSelected
                      ? "border-denim bg-denim/10 text-denim ring-2 ring-denim/20"
                      : isDone
                      ? "border-success/30 bg-success/10 text-success"
                      : isToday
                      ? "border-amarillo bg-amarillo/10 text-negro animate-pulse"
                      : isMissed
                      ? "border-danger/20 bg-danger/5 text-danger/60"
                      : "border-borde/30 bg-white text-muted/40 cursor-not-allowed"
                  }`}
                >
                  <span className="text-base">{isDone ? "✓" : day}</span>
                  {isDone && (
                    <span className="text-[8px] font-normal">
                      {(checkin.likes || 0) + (checkin.comentarios || 0)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-[10px] text-muted">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-success/30" /> Publicado</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amarillo/40" /> Hoy</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-danger/20" /> Faltó</span>
          </div>
        </div>

        {/* Check-in Form */}
        {selectedDay && (
          <div className="bg-white rounded-2xl border border-borde/40 p-6 shadow-card mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-lg text-negro">
                {checkins.find((c) => c.dia === selectedDay)
                  ? `Editar día ${selectedDay}`
                  : selectedDay === currentDay
                  ? "¡Check-in de hoy!"
                  : `Check-in día ${selectedDay}`
                }
              </h2>
              {selectedDay === currentDay && !checkins.find((c) => c.dia === selectedDay) && (
                <span className="text-xs bg-amarillo/20 text-negro px-2.5 py-1 rounded-full font-medium">
                  Hoy es tu día
                </span>
              )}
            </div>

            {/* Engagement inputs */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-negro mb-1.5">
                  Likes ❤️
                </label>
                <input
                  type="number"
                  min="0"
                  value={likes}
                  onChange={(e) => setLikes(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-borde rounded-xl bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-denim transition-colors text-sm text-center font-heading text-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-negro mb-1.5">
                  Comentarios 💬
                </label>
                <input
                  type="number"
                  min="0"
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-borde rounded-xl bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-denim transition-colors text-sm text-center font-heading text-lg"
                />
              </div>
            </div>

            {/* Desbloqueador */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-negro mb-1.5">
                ¿Has desbloqueado algo hoy? 💎 <span className="font-normal text-muted">(opcional — cuenta para el 3er premio)</span>
              </label>
              <textarea
                value={desbloqueador}
                onChange={(e) => setDesbloqueador(e.target.value)}
                placeholder="¿Qué has sentido? ¿Qué ha cambiado? ¿Qué has descubierto de ti al publicar hoy?"
                rows={3}
                className="w-full px-4 py-3 border border-borde rounded-xl bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-denim transition-colors text-sm resize-none"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleCheckin}
              disabled={saving}
              className={`w-full font-semibold py-3.5 rounded-xl transition-all shadow-button text-sm ${
                saved
                  ? "bg-success text-white"
                  : "bg-denim text-white hover:bg-denim-dark disabled:opacity-50"
              }`}
            >
              {saving
                ? "Guardando..."
                : saved
                ? "✓ ¡Guardado!"
                : checkins.find((c) => c.dia === selectedDay)
                ? "Actualizar check-in"
                : "¡Hoy he publicado! 🔥"
              }
            </button>
          </div>
        )}

        {/* Desbloqueadores history */}
        {checkins.some((c) => c.desbloqueador) && (
          <div className="mb-8">
            <h2 className="text-[10px] font-bold text-denim/40 uppercase tracking-[0.12em] mb-3">
              Tus desbloqueos
            </h2>
            <div className="space-y-2">
              {checkins
                .filter((c) => c.desbloqueador)
                .map((c) => (
                  <div key={c.dia} className="bg-white rounded-xl border border-borde/40 p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-heading text-denim">Día {c.dia}</span>
                      <span className="text-xs">💎</span>
                    </div>
                    <p className="text-sm text-negro/80 leading-relaxed">{c.desbloqueador}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Share link */}
        <div className="text-center border-t border-borde/30 pt-6">
          <p className="text-xs text-muted mb-2">Tu enlace personal (guárdalo):</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/reto/panel?token=${token}`);
              alert("¡Enlace copiado!");
            }}
            className="text-xs text-denim font-mono bg-denim/[0.04] px-4 py-2 rounded-lg hover:bg-denim/[0.08] transition-colors"
          >
            {typeof window !== "undefined" ? `${window.location.origin}/reto/panel?token=${token}` : "..."} 📋
          </button>
        </div>
      </div>
    </div>
  );
}
