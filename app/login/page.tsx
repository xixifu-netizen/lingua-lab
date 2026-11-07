"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  async function submit() {
    if (!email.trim() || !password.trim()) {
      setError("请输入邮箱和密码");
      return;
    }
    setBusy(true);
    setError(null);
    setHint(null);

    if (mode === "signin") {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setError(error);
        setBusy(false);
        return;
      }
      router.push("/");
    } else {
      const { error } = await signUp(email.trim(), password);
      if (error) {
        setError(error);
        setBusy(false);
        return;
      }
      setHint("注册成功！若开启了邮箱验证，请到邮箱点击确认链接后再登录。");
      setMode("signin");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-sage items-center justify-center text-cream text-2xl font-medium shadow-[0_4px_16px_rgba(135,155,130,0.35)]">
            LL
          </div>
          <h1 className="mt-4 text-[1.4rem] font-medium text-ink">
            {mode === "signin" ? "欢迎回来" : "创建你的学习空间"}
          </h1>
          <p className="mt-1 text-[0.85rem] text-ink-soft">
            登录后，你的词汇、录音与学习记录都会安全保存
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white/70 shadow-[0_2px_12px_rgba(52,59,53,0.05)] p-6">
          <div className="flex rounded-lg bg-parchment p-1 mb-5">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setHint(null);
                }}
                className={`flex-1 py-2 rounded-md text-[0.85rem] transition-colors ${
                  mode === m
                    ? "bg-white text-ink font-medium shadow-sm"
                    : "text-ink-soft"
                }`}
              >
                {m === "signin" ? "登录" : "注册"}
              </button>
            ))}
          </div>

          <label className="block text-[0.8rem] text-ink-soft mb-1.5">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-line bg-white/80 px-3.5 py-2.5 text-[0.9rem] focus:outline-none focus:border-sage mb-4"
          />

          <label className="block text-[0.8rem] text-ink-soft mb-1.5">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="至少 6 位"
            className="w-full rounded-lg border border-line bg-white/80 px-3.5 py-2.5 text-[0.9rem] focus:outline-none focus:border-sage mb-5"
          />

          {error && (
            <p className="mb-4 text-[0.8rem] text-clay-deep bg-clay-soft rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {hint && (
            <p className="mb-4 text-[0.8rem] text-sage-deep bg-sage-soft rounded-lg px-3 py-2">
              {hint}
            </p>
          )}

          <button
            onClick={submit}
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-sage text-cream text-[0.9rem] font-medium hover:bg-sage-deep transition-colors disabled:opacity-60"
          >
            {busy ? "请稍候…" : mode === "signin" ? "登录" : "注册并开始"}
          </button>
        </div>

        <p className="mt-4 text-center text-[0.75rem] text-ink-soft">
          你的数据属于你自己，可随时在「词汇与记录」中删除
        </p>
      </div>
    </div>
  );
}
