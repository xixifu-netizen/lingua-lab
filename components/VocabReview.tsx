"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import FlashCard from "@/components/FlashCard";
import { useVocabStore } from "@/components/VocabStore";
import { ebbinghausCurve } from "@/lib/mock-data";

function EbbinghausChart() {
  const w = 320;
  const h = 150;
  const pad = 24;
  const maxY = 100;
  const pts = ebbinghausCurve
    .map((p, i) => {
      const x = pad + (i / (ebbinghausCurve.length - 1)) * (w - pad * 2);
      const y = h - pad - (p.retention / maxY) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <polyline
        points={pts}
        fill="none"
        stroke="#BD896F"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {ebbinghausCurve.map((p, i) => {
        const x = pad + (i / (ebbinghausCurve.length - 1)) * (w - pad * 2);
        const y = h - pad - (p.retention / maxY) * (h - pad * 2);
        return (
          <g key={p.label}>
            <circle cx={x} cy={y} r="2.5" fill="#879B82" />
            <text
              x={x}
              y={h - 6}
              textAnchor="middle"
              fontSize="9"
              fill="#6a7168"
            >
              {p.label}
            </text>
            <text
              x={x}
              y={y - 8}
              textAnchor="middle"
              fontSize="9"
              fill="#a37157"
            >
              {p.retention}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function VocabReview() {
  const { items } = useVocabStore();
  const [idx, setIdx] = useState(0);

  // 复习队列 = 收藏池里的全部词汇（划词收藏 + 核心好词）
  const queue = items;
  const current = queue.length > 0 ? queue[idx % queue.length] : null;

  // 记忆统计：根据真实收藏数据计算（box >= 4 视为已掌握，box 2-3 复习中，box 1 新词）
  const mastered = items.filter((v) => (v.box ?? 1) >= 4).length;
  const reviewing = items.filter((v) => (v.box ?? 1) >= 2 && (v.box ?? 1) <= 3).length;
  const fresh = items.filter((v) => (v.box ?? 1) <= 1).length;

  return (
    <section className="grid md:grid-cols-3 gap-4">
      {/* 记忆曲线 */}
      <div className="bg-white/70 border border-line rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[1rem] font-medium text-ink">记忆曲线</h2>
          <Badge>艾宾浩斯</Badge>
        </div>
        <p className="text-[0.75rem] text-ink-soft mt-1">
          遗忘在 1 天后最快，之后趋缓——所以要及时复习
        </p>
        <div className="mt-3">
          <EbbinghausChart />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-sage-soft/60 py-2.5">
            <div className="text-[1.1rem] font-medium text-sage-deep">
              {mastered}
            </div>
            <div className="text-[0.72rem] text-ink-soft">已掌握</div>
          </div>
          <div className="rounded-xl bg-clay-soft/60 py-2.5">
            <div className="text-[1.1rem] font-medium text-clay-deep">
              {reviewing}
            </div>
            <div className="text-[0.72rem] text-ink-soft">复习中</div>
          </div>
          <div className="rounded-xl bg-parchment py-2.5">
            <div className="text-[1.1rem] font-medium text-ink">
              {fresh}
            </div>
            <div className="text-[0.72rem] text-ink-soft">新词</div>
          </div>
        </div>
      </div>

      {/* 今日复习闪卡 */}
      <div className="md:col-span-2 bg-white/70 border border-line rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[1rem] font-medium text-ink">今日词汇复习</h2>
          <Badge tone="clay">{queue.length} 个待复习</Badge>
        </div>
        <p className="text-[0.75rem] text-ink-soft mt-1">
          收藏词汇（划词收藏 + 视频核心好词）统一进入闪卡 · 点击卡片翻面 · 记得的进入下一张
        </p>
        {current ? (
          <div className="mt-4 grid md:grid-cols-2 gap-4 items-center">
            <FlashCard
              key={current.id}
              card={{
                id: current.id,
                expression: current.expression,
                meaning: current.meaning ?? "（划词收藏，释义待补充）",
                example:
                  current.example ??
                  current.sourceSentence ??
                  "（暂无例句，可稍后在词汇页补充）",
              }}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[0.78rem] text-ink-soft">
                  第 {idx + 1} / {queue.length} 张
                </span>
                <Badge tone={current.source === "core" ? "sage" : "clay"}>
                  {current.source === "core" ? "核心好词" : "划词收藏"}
                </Badge>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                <button
                  onClick={() => setIdx((i) => i + 1)}
                  className="px-4 py-2 rounded-lg bg-sage text-cream text-[0.8rem] font-medium hover:bg-sage-deep transition-colors"
                >
                  记住了 ✓
                </button>
                <button
                  onClick={() => setIdx((i) => i + 1)}
                  className="px-4 py-2 rounded-lg border border-clay/50 text-clay-deep text-[0.8rem] hover:bg-clay-soft transition-colors"
                >
                  再想想
                </button>
              </div>
              <p className="mt-3 text-[0.72rem] text-ink-soft leading-relaxed">
                「记住了」会把这个词送进更久之后的复习节点；「再想想」则明天再次推送。
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-line p-6 text-center text-[0.81rem] text-ink-soft">
            收藏词汇为空。去 Session A 观看视频，划选好词好句即可收藏。
          </div>
        )}
      </div>
    </section>
  );
}
