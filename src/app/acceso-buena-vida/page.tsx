"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      setLoading(false);

      if (error) {
        if (error.message.includes("already registered")) {
          setError("Este email ya está registrado. Prueba a iniciar sesión.");
        } else if (error.message.includes("password")) {
          setError("La contraseña debe tener al menos 6 caracteres.");
        } else {
          setError("Hubo un error al crear la cuenta. Inténtalo de nuevo.");
        }
      } else {
        setSuccess("¡Cuenta creada! Revisa tu email para confirmar tu registro.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        if (error.message.includes("Invalid login")) {
          setError("Email o contraseña incorrectos.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Confirma tu email antes de iniciar sesión. Revisa tu bandeja.");
        } else {
          setError("Error al iniciar sesión. Inténtalo de nuevo.");
        }
      } else {
        window.location.href = "/dashboard";
      }
    }
  };

  return (
    <div className="min-h-screen bg-crema flex flex-col">
      {/* Nav */}
      <nav className="flex items-center px-6 sm:px-10 py-5 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-2xl">🎓</span>
          <span className="font-heading text-xl text-negro">El Sistema de Buena Vida</span>
        </Link>
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 -mt-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-card border border-borde/40 p-8 sm:p-10">
            {!success ? (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-heading text-3xl text-negro mb-2">
                    {isSignUp ? "Crea tu cuenta" : "Entra al Sistema"}
                  </h1>
                  <p className="text-muted text-sm">
                    {isSignUp
                      ? "Regístrate para empezar a crear contenido con propósito."
                      : "Inicia sesión con tu email y contraseña."}
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <label className="block text-sm font-semibold text-negro mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 border border-borde rounded-xl bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-naranja transition-colors"
                  />

                  <label className="block text-sm font-semibold text-negro mb-1.5 mt-4">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignUp ? "Mínimo 6 caracteres" : "Tu contraseña"}
                    className="w-full px-4 py-3 border border-borde rounded-xl bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-naranja transition-colors"
                  />

                  {error && (
                    <p className="text-danger text-sm mt-3">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-5 bg-naranja text-white font-semibold py-3 rounded-xl hover:bg-naranja-hover transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="loader-sm" /> {isSignUp ? "Creando cuenta..." : "Entrando..."}
                      </span>
                    ) : (
                      isSignUp ? "Crear cuenta →" : "Iniciar sesión →"
                    )}
                  </button>
                </form>

                <div className="text-center mt-5">
                  <button
                    onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                    className="text-sm text-muted hover:text-naranja transition-colors"
                  >
                    {isSignUp
                      ? "¿Ya tienes cuenta? Inicia sesión"
                      : "¿No tienes cuenta? Regístrate"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-naranja/10 flex items-center justify-center text-3xl mx-auto mb-4">✉️</div>
                <h2 className="font-heading text-2xl text-negro mb-2">
                  ¡Revisa tu email!
                </h2>
                <p className="text-muted text-sm leading-relaxed">
                  Hemos enviado un enlace de confirmación a{" "}
                  <strong className="text-negro">{email}</strong>. Haz click en
                  él para activar tu cuenta.
                </p>
                <button
                  onClick={() => { setSuccess(""); setEmail(""); setPassword(""); setIsSignUp(false); }}
                  className="mt-6 text-sm text-naranja font-medium hover:underline"
                >
                  ← Ir a iniciar sesión
                </button>
              </div>
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
