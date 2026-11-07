"use client";

// 登录状态管理：邮箱登录 + 会话监听
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getSupabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    sb.auth.getUser().then(
      ({ data }: { data: { user: User | null } }) => {
        setUser(data.user ?? null);
        setLoading(false);
      }
    );

    const { data: listener } = sb.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const sb = getSupabase();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  }

  async function signUp(email: string, password: string) {
    const sb = getSupabase();
    const { error } = await sb.auth.signUp({ email, password });
    return { error: error?.message };
  }

  async function signOut() {
    const sb = getSupabase();
    await sb.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 必须在 AuthProvider 内使用");
  return ctx;
}
