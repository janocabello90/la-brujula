"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "./client";
import type { BrujulaState } from "../types";
import { DEFAULT_STATE } from "../constants";
import type { User } from "@supabase/supabase-js";

const supabase = createClient();

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function useBrujulaData(userId: string | undefined) {
  const [state, setState] = useState<BrujulaState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      // Load brujula data
      const { data: brujulaData } = await supabase
        .from("brujula_data")
        .select("*")
        .eq("user_id", userId)
        .single();

      // Load API key from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("api_key")
        .eq("id", userId)
        .single();

      if (brujulaData) {
        setState({
          briefing: brujulaData.briefing || DEFAULT_STATE.briefing,
          buyer: brujulaData.buyer || DEFAULT_STATE.buyer,
          empathy: brujulaData.empathy || DEFAULT_STATE.empathy,
          insight: brujulaData.insight || DEFAULT_STATE.insight,
          tree: brujulaData.tree || DEFAULT_STATE.tree,
          channels: brujulaData.channels || DEFAULT_STATE.channels,
          history: [],
          apiKey: profile?.api_key || "",
        });
      } else if (profile?.api_key) {
        setState((prev) => ({ ...prev, apiKey: profile.api_key }));
      }

      // Load history
      const { data: historyData } = await supabase
        .from("suggestion_history")
        .select("suggestion")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (historyData) {
        setState((prev) => ({
          ...prev,
          history: historyData.map((h) => h.suggestion),
        }));
      }

      setLoading(false);
    };

    load();
  }, [userId]);

  // Save brujula data
  const saveBrujulaData = useCallback(
    async (partial: Partial<BrujulaState>) => {
      if (!userId) return;

      const newState = { ...state, ...partial };
      setState(newState);

      const payload = {
        user_id: userId,
        briefing: newState.briefing,
        buyer: newState.buyer,
        empathy: newState.empathy,
        insight: newState.insight,
        tree: newState.tree,
        channels: newState.channels,
        updated_at: new Date().toISOString(),
      };

      // Upsert
      await supabase.from("brujula_data").upsert(payload, {
        onConflict: "user_id",
      });
    },
    [userId, state]
  );

  // Save API key
  const saveApiKey = useCallback(
    async (apiKey: string) => {
      if (!userId) return;
      setState((prev) => ({ ...prev, apiKey }));
      await supabase
        .from("profiles")
        .update({ api_key: apiKey })
        .eq("id", userId);
    },
    [userId]
  );

  return { state, setState, loading, saveBrujulaData, saveApiKey };
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/";
}
