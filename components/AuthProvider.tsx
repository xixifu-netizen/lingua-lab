"use client";

// 登录状态管理：邮箱登录 + 会话监听 + 用户档案（等级/兴趣）
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getSupabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export interface UserProfile {
  level?: string;
  interests?: string[];
}

interface AuthValue {
  user: User | null;
  loading: boolean;
  profile: UserProfile | null;
  /** 更新兴趣标签（写入 profiles.interests） */
  updateInterests: (interests: string[]) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("profiles")
      .select("level, interests")
      .eq("id", uid)
      .maybeSingle();
    if (!error && data) {
      setProfile({ level: data.level ?? "中级（B1+）", interests: data.interests ?? [] });
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    sb.auth.getUser().then(
      ({ data }: { data: { user: User | null } }) => {
        const u = data.user;
        setUser(u ?? null);
        if (u) loadProfile(u.id);
        setLoading(false);
      }
    );

    const { data: listener } = sb.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) loadProfile(u.id);
        else setProfile(null);
        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [loadProfile]);

  async function updateInterests(interests: string[]) {
    if (!user) return;
    const sb = getSupabase();
    const { error } = await sb
      .from("profiles")
      .update({ interests })
      .eq("id", user.id);
    if (error) throw error;
    setProfile((p) => ({ ...(p ?? {}), interests }));
  }

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
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, profile, updateInterests, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 必须在 AuthProvider 内使用");
  return ctx;
}
