"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type View = "login" | "signup" | "reset" | "magic" | "email-sent";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("login");
  const [emailSentMessage, setEmailSentMessage] = useState("");

  const switchView = (v: View) => { setView(v); setError(""); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.includes("Invalid login")) setError("Email o contraseña incorrectos.");
      else if (error.message.includes("Email not confirmed")) setError("Confirma tu email antes de iniciar sesión. Revisa tu bandeja.");
      else setError("Error al iniciar sesión. Inténtalo de nuevo.");
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      if (error.message.includes("already registered")) setError("Este email ya está registrado. Prueba a iniciar sesión.");
      else if (error.message.includes("password")) setError("La contraseña debe tener al menos 6 caracteres.");
      else setError("Hubo un error al crear la cuenta. Inténtalo de nuevo.");
    } else {
      setEmailSentMessage("¡Cuenta creada! Revisa tu email para confirmar tu registro.");
      setView("email-sent");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Introduce tu email."); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/actualizar-contrasena`,
    });
    setLoading(false);
    if (error) {
      setError("Error al enviar el email. Inténtalo de nuevo.");
    } else {
      setEmailSentMessage("Hemos enviado un enlace para restablecer tu contraseña.");
      setView("email-sent");
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Introduce tu email."); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setError("Error al enviar el enlace. Inténtalo de nuevo.");
    } else {
      setEmailSentMessage("Te hemos enviado un enlace mágico. Haz clic en él para entrar sin contraseña.");
      setView("email-sent");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <nav className="flex items-center px-6 sm:px-10 py-5 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/gorilla-logo.png" alt="" className="w-7 h-7 rounded-lg bg-primary-container object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="font-headline text-xl font-bold text-on-surface">Sistema de Buena Vida</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 -mt-10">
        <div className="w-full max-w-md">
          <div className="surface-card rounded-2xl signature-shadow p-8 sm:p-10">

            {/* ── Email sent confirmation ── */}
            {view === "email-sent" && (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-naranja/10 flex items-center justify-center text-3xl mx-auto mb-4">✉️</div>
                <h2 className="font-heading text-2xl text-negro mb-2">Revisa tu email</h2>
                <p className="text-muted text-sm leading-relaxed">
                  {emailSentMessage} Enviado a <strong className="text-negro">{email}</strong>.
                </p>
                <button
                  onClick={() => { switchView("login"); setEmail(""); setPassword(""); }}
                  className="mt-6 text-sm text-naranja font-medium hover:underline"
                >
                  ← Volver al inicio de sesión
                </button>
              </div>
            )}

            {/* ── Login ── */}
            {view === "login" && (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-heading text-3xl text-negro mb-2">Entra al Sistema</h1>
                  <p className="text-muted text-sm">Inicia sesión con tu email y contraseña.</p>
                </div>

                <form onSubmit={handleLogin}>
                  <label className="block text-sm font-semibold text-negro mb-1.5">Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full px-4 py-3 border-none rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" />

                  <label className="block text-sm font-semibold text-negro mb-1.5 mt-4">Contraseña</label>
                  <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tu contraseña" className="w-full px-4 py-3 border-none rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" />

                  {error && <p className="text-danger text-sm mt-3">{error}</p>}

                  <button type="submit" disabled={loading} className="w-full mt-5 gradient-denim text-white font-semibold py-3 rounded-xl shadow-button hover:shadow-button-hover transition-all disabled:opacity-50">
                    {loading ? "Entrando..." : "Iniciar sesión →"}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-borde/40" />
                  <span className="text-xs text-muted">o</span>
                  <div className="flex-1 h-px bg-borde/40" />
                </div>

                {/* Magic Link */}
                <button
                  onClick={() => switchView("magic")}
                  className="w-full bg-surface-container-low text-on-surface font-medium py-3 rounded-xl hover:bg-surface-container transition-all text-sm flex items-center justify-center gap-2"
                >
                  <span>✨</span> Entrar con enlace mágico
                </button>

                <div className="flex flex-col items-center gap-2 mt-5">
                  <button onClick={() => switchView("reset")} className="text-xs text-muted/70 hover:text-naranja transition-colors">
                    ¿Olvidaste tu contraseña?
                  </button>
                  <button onClick={() => switchView("signup")} className="text-sm text-muted hover:text-naranja transition-colors">
                    ¿No tienes cuenta? Regístrate
                  </button>
                </div>
              </>
            )}

            {/* ── Sign Up ── */}
            {view === "signup" && (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-heading text-3xl text-negro mb-2">Crea tu cuenta</h1>
                  <p className="text-muted text-sm">Regístrate para empezar a crear contenido con propósito.</p>
                </div>

                <form onSubmit={handleSignUp}>
                  <label className="block text-sm font-semibold text-negro mb-1.5">Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full px-4 py-3 border-none rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" />

                  <label className="block text-sm font-semibold text-negro mb-1.5 mt-4">Contraseña</label>
                  <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full px-4 py-3 border-none rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" />

                  {error && <p className="text-danger text-sm mt-3">{error}</p>}

                  <button type="submit" disabled={loading} className="w-full mt-5 gradient-denim text-white font-semibold py-3 rounded-xl shadow-button hover:shadow-button-hover transition-all disabled:opacity-50">
                    {loading ? "Creando cuenta..." : "Crear cuenta →"}
                  </button>
                </form>

                <div className="text-center mt-5">
                  <button onClick={() => switchView("login")} className="text-sm text-muted hover:text-naranja transition-colors">
                    ¿Ya tienes cuenta? Inicia sesión
                  </button>
                </div>
              </>
            )}

            {/* ── Reset Password ── */}
            {view === "reset" && (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-heading text-3xl text-negro mb-2">Restablecer contraseña</h1>
                  <p className="text-muted text-sm">Introduce tu email y te enviaremos un enlace para cambiarla.</p>
                </div>

                <form onSubmit={handleResetPassword}>
                  <label className="block text-sm font-semibold text-negro mb-1.5">Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full px-4 py-3 border-none rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" />

                  {error && <p className="text-danger text-sm mt-3">{error}</p>}

                  <button type="submit" disabled={loading} className="w-full mt-5 gradient-denim text-white font-semibold py-3 rounded-xl shadow-button hover:shadow-button-hover transition-all disabled:opacity-50">
                    {loading ? "Enviando..." : "Enviar enlace →"}
                  </button>
                </form>

                <div className="text-center mt-5">
                  <button onClick={() => switchView("login")} className="text-sm text-muted hover:text-naranja transition-colors">
                    ← Volver al inicio de sesión
                  </button>
                </div>
              </>
            )}

            {/* ── Magic Link ── */}
            {view === "magic" && (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-heading text-3xl text-negro mb-2">Enlace mágico</h1>
                  <p className="text-muted text-sm">Te enviaremos un enlace a tu email. Haz clic y entras. Sin contraseña.</p>
                </div>

                <form onSubmit={handleMagicLink}>
                  <label className="block text-sm font-semibold text-negro mb-1.5">Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full px-4 py-3 border-none rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" />

                  {error && <p className="text-danger text-sm mt-3">{error}</p>}

                  <button type="submit" disabled={loading} className="w-full mt-5 gradient-denim text-white font-semibold py-3 rounded-xl shadow-button hover:shadow-button-hover transition-all disabled:opacity-50">
                    {loading ? "Enviando..." : "Enviar enlace mágico →"}
                  </button>
                </form>

                <div className="text-center mt-5">
                  <button onClick={() => switchView("login")} className="text-sm text-muted hover:text-naranja transition-colors">
                    ← Volver al inicio de sesión
                  </button>
                </div>
              </>
            )}

          </div>
          <p className="text-center text-xs text-muted-light mt-5">
            Un proyecto de{" "}
            <a href="https://janocabello.com" target="_blank" rel="noopener noreferrer" className="text-naranja/70 hover:text-naranja">
              Jano Cabello
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
