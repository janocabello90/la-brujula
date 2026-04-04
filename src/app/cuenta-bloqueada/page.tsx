"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function BlockedContent() {
  const params = useSearchParams();
  const reason = params.get("reason");

  const isExpired = reason === "expired";

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 font-body">
      <div className="surface-card signature-shadow rounded-2xl p-8 sm:p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl gradient-denim flex items-center justify-center mx-auto mb-5">
          <span className="material-symbols-outlined text-3xl text-white">
            {isExpired ? "schedule" : "lock"}
          </span>
        </div>

        <h1 className="font-headline text-2xl text-on-surface mb-3">
          {isExpired ? "Tu acceso ha expirado" : "Acceso pausado"}
        </h1>

        <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
          {isExpired
            ? "Tu periodo de acceso al Sistema ha terminado. Si quieres seguir utilizando las herramientas, contacta con Jano para renovar."
            : "Tu cuenta ha sido pausada temporalmente. Si crees que es un error, contacta con Jano."}
        </p>

        <div className="space-y-3">
          <a
            href="mailto:janocabellom@gmail.com?subject=Acceso%20al%20Sistema%20de%20Buena%20Vida"
            className="flex items-center justify-center gap-2 w-full gradient-denim text-white font-semibold py-3 rounded-xl shadow-button hover:shadow-button-hover transition-all text-sm"
          >
            <span className="material-symbols-outlined text-lg">mail</span>
            Contactar con Jano
          </a>

          <a
            href="https://www.skool.com/una-buena-vida-comunidad-2471"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full surface-low text-on-surface font-medium py-3 rounded-xl hover:bg-surface-container transition-all text-sm"
          >
            <span className="material-symbols-outlined text-lg">groups</span>
            Ir a la comunidad
          </a>

          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="flex items-center justify-center gap-2 w-full text-on-surface-variant hover:text-error py-2 rounded-xl transition-all text-sm"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Cerrar sesión
          </button>
        </div>
      </div>

      <p className="text-outline text-xs mt-6">
        El Sistema de Buena Vida · <Link href="/" className="text-primary hover:underline">Volver al inicio</Link>
      </p>
    </div>
  );
}

export default function CuentaBloqueadaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="loader" />
      </div>
    }>
      <BlockedContent />
    </Suspense>
  );
}
