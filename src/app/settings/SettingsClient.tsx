"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
  email: string;
  currentApiKey: string;
}

export default function SettingsClient({ userId, email, currentApiKey }: Props) {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveKey = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ api_key: apiKey }).eq("id", userId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <div className="max-w-xl mx-auto">
        <h1 className="font-heading text-3xl text-negro mb-6">Ajustes</h1>

        {/* Account */}
        <div className="bg-white rounded-2xl border border-borde/60 p-6 mb-4">
          <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Cuenta</h2>
          <div className="text-sm">
            <span className="text-negro font-medium">{email}</span>
          </div>
        </div>

        {/* API Key */}
        <div className="bg-white rounded-2xl border border-borde/60 p-6 mb-4">
          <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-1">API Key de Anthropic</h2>
          <p className="text-xs text-muted mb-4">
            Necesaria para que el Maestro funcione. Consíguela en{" "}
            <a
              href="https://console.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-naranja hover:underline"
            >
              console.anthropic.com
            </a>
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full px-4 py-3 border border-borde rounded-xl bg-crema text-negro placeholder:text-muted-light focus:outline-none focus:border-naranja transition-colors font-mono text-sm mb-3"
          />
          <button
            onClick={saveKey}
            disabled={saving}
            className={`text-sm font-semibold px-5 py-2.5 rounded-xl transition-all ${
              saved
                ? "bg-success/10 text-success border border-success/30"
                : "bg-naranja text-white hover:bg-naranja-hover"
            } disabled:opacity-50`}
          >
            {saving ? "Guardando..." : saved ? "✓ Guardada" : "Guardar API Key"}
          </button>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-danger/20 p-6">
          <h2 className="text-xs font-bold text-danger uppercase tracking-wider mb-2">Zona de peligro</h2>
          <p className="text-xs text-muted mb-4">
            Resetear eliminará todos tus datos de La Brújula. Esta acción no se puede deshacer.
          </p>
          <button
            onClick={async () => {
              if (!confirm("¿Estás seguro? Se borrarán todos tus datos de La Brújula.")) return;
              const supabase = createClient();
              await supabase.from("brujula_data").delete().eq("user_id", userId);
              await supabase.from("suggestion_history").delete().eq("user_id", userId);
              await supabase.from("profiles").update({ onboarding_completed: false, api_key: null }).eq("id", userId);
              window.location.href = "/onboarding";
            }}
            className="text-sm text-danger font-medium border border-danger/30 px-4 py-2.5 rounded-xl hover:bg-danger/5 transition-colors"
          >
            Resetear mi Brújula
          </button>
        </div>
      </div>
    </AppShell>
  );
}
