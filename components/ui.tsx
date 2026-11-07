import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/75 border border-line rounded-2xl p-6 shadow-[0_2px_12px_rgba(52,59,53,0.05)] ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-[0.94rem] font-medium text-ink">{title}</h2>
        {sub && <p className="text-[0.75rem] text-ink-soft mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children,
  tone = "sage",
}: {
  children: ReactNode;
  tone?: "sage" | "clay" | "gray";
}) {
  const tones = {
    sage: "bg-sage-soft text-sage-deep",
    clay: "bg-clay-soft text-clay-deep",
    gray: "bg-parchment text-ink-soft",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[0.72rem] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function DemoNote({ text = "演示数据" }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.69rem] bg-parchment text-clay-deep border border-line">
      <span className="w-1.5 h-1.5 rounded-full bg-clay inline-block" />
      {text}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-parchment overflow-hidden">
      <div
        className="h-full rounded-full bg-sage transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-[0.75rem] text-ink-soft">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-parchment overflow-hidden">
        <div
          className={`h-full rounded-full ${value >= 70 ? "bg-sage" : "bg-clay"}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-right text-[0.75rem] font-medium text-ink">
        {value}
      </span>
    </div>
  );
}
