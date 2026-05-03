"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, type Profile } from "./supabase";

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega perfil do banco
  const loadProfile = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();
    setProfile(data ?? null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  // Inicializa sessão e escuta mudanças
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) loadProfile(session.user.id);
        else setProfile(null);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  // ── Ações ──────────────────────────────────────────────────────────────────

  async function signUp(email: string, password: string, name: string): Promise<string | null> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    if (data.user) {
      // Cria perfil
      await supabase.from("profiles").insert({
        id:          data.user.id,
        name:        name.trim(),
        xp:          0,
        grade_level: "3º ano",
      });
      await loadProfile(data.user.id);
    }
    return null;
  }

  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
