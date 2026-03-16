"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError("Hubo un error enviando el enlace. Inténtalo de nuevo.");
    } else {
      setSent(true);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError("Error al conectar con Google. Inténtalo de nuevo.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-crema flex flex-col">
      {/* Nav */}
      <nav className="flex items-center px-6 sm:px-10 py-5 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-2xl">🧭</span>
          <span className="font-heading text-xl text-negro">La Brújula</span>
        </Link>
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 -mt-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-card border border-borde/40 p-8 sm:p-10">
            {!sent ? (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-heading text-3xl text-negro mb-2">
                    Entra a tu Brújula
                  </h1>
                  <p className="text-muted text-sm">
                    Conecta con Google o recibe un enlace mágico por email.
                  </p>
                </div>

                {/* Google button */}
                <button
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 border border-borde rounded-xl py-3 px-4 text-sm font-medium text-negro hover:bg-crema transition-colors disabled:opacity-50 mb-5"
                >
                  {googleLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="loader-sm" /> Conectando...
                    </span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continuar con Google
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-borde" />
                  <span className="text-xs text-muted">o con email</span>
                  <div className="flex-1 h-px bg-borde" />
                </div>

                {/* Magic link form */}
                <form onSubmit={handleMagicLink}>
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

                  {error && (
                    <p className="text-danger text-sm mt-2">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-naranja text-white font-semibold py-3 rounded-xl hover:bg-naranja-hover transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="loader-sm" /> Enviando...
                      </span>
                    ) : (
                      "Enviar enlace mágico →"
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-naranja/10 flex items-center justify-center text-3xl mx-auto mb-4">✉️</div>
                <h2 className="font-heading text-2xl text-negro mb-2">
                  ¡Revisa tu email!
                </h2>
                <p className="text-muted text-sm leading-relaxed">
                  Te hemos enviado un enlace mágico a{" "}
                  <strong className="text-negro">{email}</strong>. Haz click en
                  él para entrar.
                </p>
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="mt-6 text-sm text-naranja font-medium hover:underline"
                >
                  ← Usar otro email
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
