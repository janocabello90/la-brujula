"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
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
                    Te enviamos un enlace mágico a tu email. Sin contraseñas.
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

                  {error && (
                    <p className="text-danger text-sm mt-2">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-5 bg-naranja text-white font-semibold py-3 rounded-xl hover:bg-naranja-hover transition-colors disabled:opacity-50"
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
