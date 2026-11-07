import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Nav from "@/components/Nav";
import FontScale from "@/components/FontScale";
import { VocabProvider } from "@/components/VocabStore";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Lingua Lab · AI 英语听说训练工作室",
  description: "Listen. Think. Speak. Grow. 你的私人英语听说教练。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
        <VocabProvider>
        <header className="border-b border-line bg-cream/95 sticky top-0 z-10 backdrop-blur">
          <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-sage flex items-center justify-center text-cream text-[0.95rem] font-medium tracking-wide shadow-[0_2px_8px_rgba(135,155,130,0.35)]">
                LL
              </span>
              <span className="leading-tight">
                <span className="block text-[1rem] font-medium text-ink">
                  Lingua Lab
                </span>
                <span className="block text-[0.72rem] text-ink-soft">
                  Listen · Think · Speak · Grow
                </span>
              </span>
            </Link>
            <Nav />
            <FontScale />
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-line">
          <div className="mx-auto max-w-5xl px-6 py-5 text-[0.75rem] text-ink-soft flex flex-wrap gap-x-6 gap-y-1">
            <span>Lingua Lab · 个人学习空间</span>
            <span>AI 分析结果为 AI 评估，非客观测量</span>
          </div>
        </footer>
        </VocabProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
