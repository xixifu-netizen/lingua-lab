"use client";

import Link from "next/link";
import { Badge, Card, SectionTitle } from "@/components/ui";
import { useVocabStore } from "@/components/VocabStore";
import { useAuth } from "@/components/AuthProvider";
import { useLearningData, formatTime } from "@/lib/use-learning-data";

function Sparkline({ values }: { values: number[] }) {
  const w = 220;
  const h = 48;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const xOf = (i: number) =>
    values.length === 1 ? w / 2 : (i / (values.length - 1)) * (w - 8) + 4;
  const yOf = (v: number) => h - 6 - ((v - min) / span) * (h - 14);
  const pts = values.map((v, i) => `${xOf(i)},${yOf(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <polyline
        points={pts}
        fill="none"
        stroke="#879B82"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {values.map((v, i) => (
        <circle key={i} cx={xOf(i)} cy={yOf(v)} r="2" fill="#BD896F" />
      ))}
    </svg>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line p-8 text-center text-[0.81rem] text-ink-soft leading-relaxed">
      {text}
      <div className="mt-3">
        <Link
          href="/studio/session-a"
          className="text-[0.78rem] text-sage-deep underline underline-offset-2"
        >
          去完成一次训练 →
        </Link>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const { user } = useAuth();
  const { items } = useVocabStore();
  const { sessions, recordings, progress, loading } = useLearningData();

  const countA = sessions.filter((s) => s.mode === "A").length;
  const countB = sessions.filter((s) => s.mode === "B").length;

  // 按维度聚合真实 AI 评估分数
  const groups = new Map<string, number[]>();
  progress.forEach((p) => {
    groups.set(p.metric, [...(groups.get(p.metric) ?? []), p.value]);
  });
  const series = Array.from(groups.entries()).map(([label, values]) => ({
    label,
    values,
  }));

  const latestScore = recordings.find((r) => r.score != null)?.score;
  const hasAny = sessions.length + recordings.length + progress.length + items.length > 0;

  const cards = [
    { n: sessions.length, l: "完成课次" },
    { n: countA, l: "听述训练 A" },
    { n: countB, l: "讨论应用 B" },
    { n: recordings.length, l: "口语录音" },
    { n: items.length, l: "收藏词汇" },
  ];

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-[1.38rem] font-medium text-ink">学习进度</h1>
        <p className="text-[0.81rem] text-ink-soft mt-1">
          仅显示你自己账号产生的真实记录 · 能力分数为 AI 评估，非客观测量
        </p>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((s) => (
          <Card key={s.l} className="p-4">
            <div className="text-[1.5rem] font-medium text-ink leading-none">
              {loading ? "—" : s.n}
            </div>
            <div className="text-[0.75rem] text-ink-soft mt-1.5">{s.l}</div>
          </Card>
        ))}
      </section>

      <section>
        <SectionTitle
          title="能力趋势"
          sub="按历次 AI 评估自动绘制 · 每完成一次评估新增一个点"
        />
        {series.length === 0 ? (
          <EmptyState text="还没有 AI 评估数据。完成一次口语复述并获取 AI 反馈后，这里会出现你的能力趋势。" />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {series.map((s) => (
              <Card key={s.label} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[0.81rem] font-medium text-ink">
                    {s.label}
                  </span>
                  <span className="text-[0.81rem] text-sage-deep font-medium">
                    {s.values[s.values.length - 1]}
                  </span>
                </div>
                <div className="mt-2">
                  <Sparkline values={s.values} />
                </div>
                <div className="flex justify-between text-[0.62rem] text-ink-soft/70 mt-1">
                  <span>{s.values.length} 次评估</span>
                  <span>最新 {s.values[s.values.length - 1]}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <Card>
          <SectionTitle title="历史录音" sub="你的真实口语复述记录" />
          {recordings.length === 0 ? (
            <EmptyState text="还没有录音记录。在 Session A 第 3 步录制复述并获取 AI 反馈后，这里会显示你的转写与评分。" />
          ) : (
            <ul className="space-y-3">
              {recordings.slice(0, 10).map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-line bg-white/80 p-4"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-[0.81rem] font-medium text-ink">
                      第 {r.attempt ?? 1} 次尝试
                    </h3>
                    <div className="flex items-center gap-2">
                      {r.score != null && <Badge tone="sage">AI {r.score} 分</Badge>}
                      <span className="text-[0.69rem] text-ink-soft">
                        {formatTime(r.created_at)}
                      </span>
                    </div>
                  </div>
                  {r.transcript && (
                    <p className="mt-2 text-[0.75rem] text-ink-soft leading-relaxed">
                      {r.transcript.slice(0, 160)}
                      {r.transcript.length > 160 ? "…" : ""}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[0.69rem] text-ink-soft/70 leading-relaxed">
            音频文件回放功能尚未开放；当前保存转写文本与 AI 评分。
          </p>
        </Card>

        <Card>
          <SectionTitle title="学习概览" sub="依据真实记录自动汇总" />
          {!hasAny ? (
            <EmptyState text="还没有学习数据。完成一次训练、或收藏一个词汇后，这里会生成你的学习概览。" />
          ) : (
            <div className="space-y-3 text-[0.81rem] leading-relaxed text-ink-soft">
              <p>
                已完成 <span className="text-ink font-medium">{sessions.length}</span> 次课次
                （听述 {countA} 次 · 讨论 {countB} 次），累计{" "}
                <span className="text-ink font-medium">{recordings.length}</span> 段口语录音。
              </p>
              <p>
                收藏词汇 <span className="text-ink font-medium">{items.length}</span> 个，
                AI 评估记录 <span className="text-ink font-medium">{progress.length}</span> 项。
                {latestScore != null && (
                  <>
                    最近一次综合评分为{" "}
                    <span className="text-sage-deep font-medium">{latestScore}</span> 分。
                  </>
                )}
              </p>
              <p className="text-[0.72rem] text-ink-soft/70">
                {user
                  ? "所有数据保存在你的云端账号，其他用户无法访问。"
                  : "当前未登录，仅显示本机浏览器的收藏；登录后可同步训练记录。"}
              </p>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
