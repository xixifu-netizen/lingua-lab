"use client";

import { useState } from "react";
import { Badge, Card, SectionTitle, DemoNote } from "@/components/ui";
import { useVocabStore } from "@/components/VocabStore";
import { useAuth } from "@/components/AuthProvider";
import {
  recordings,
  activityTimeline,
  discussionQuestions,
} from "@/lib/mock-data";

export default function VocabularyPage() {
  const [tab, setTab] = useState<"vocab" | "records">("vocab");
  const { items, remove, loading } = useVocabStore();
  const { user } = useAuth();

  const tabs = [
    ["vocab", "词汇收藏"],
    ["records", "学习记录"],
  ] as const;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-[1.38rem] font-medium text-ink">词汇与记录</h1>
        <p className="text-[0.81rem] text-ink-soft mt-1">
          你的个人学习档案：收藏的表达、带时间戳的学习时间线
        </p>
      </section>

      <div className="flex gap-2">
        {tabs.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-[0.81rem] transition-colors ${
              tab === k
                ? "bg-sage text-cream font-medium"
                : "bg-parchment text-ink-soft hover:bg-sage-soft"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* 词汇收藏 */}
      {tab === "vocab" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[0.81rem] text-ink-soft">
              收藏词汇由「划词收藏」与「视频默认核心好词」两部分组成，统一进入首页的艾宾浩斯闪卡复习。
            </p>
            {user ? (
              <Badge>已保存到云端</Badge>
            ) : (
              <Badge tone="clay">未登录 · 仅保存在本机浏览器</Badge>
            )}
          </div>
          {loading ? (
            <div className="rounded-xl border border-dashed border-line p-8 text-center text-[0.81rem] text-ink-soft">
              正在加载你的词汇…
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line p-8 text-center text-[0.81rem] text-ink-soft">
              还没有收藏词汇。去 Session A 观看视频，划选好词好句即可收藏。
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {items.map((v) => {
                return (
                  <Card key={v.id} className="border-sage">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[0.9rem] font-medium text-ink">
                          {v.expression}
                        </h3>
                        <p className="text-[0.78rem] text-clay-deep mt-1">
                          {v.meaning ?? "（划词收藏，释义待补充）"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge tone={v.source === "core" ? "sage" : "clay"}>
                          {v.source === "core" ? "核心好词" : "划词收藏"}
                        </Badge>
                        <button
                          onClick={() => remove(v.id)}
                          className="text-[0.78rem] px-2.5 py-1 rounded-md bg-parchment text-ink-soft hover:bg-clay-soft transition-colors"
                        >
                          移除
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1.5 text-[0.78rem] leading-relaxed text-ink-soft">
                      {v.sourceSentence && (
                        <p>
                          <span className="text-sage-deep">原句 · </span>
                          {v.sourceSentence}
                        </p>
                      )}
                      {v.example && (
                        <p>
                          <span className="text-sage-deep">例句 · </span>
                          {v.example}
                        </p>
                      )}
                      {v.context && (
                        <p>
                          <span className="text-sage-deep">场景 · </span>
                          {v.context}
                        </p>
                      )}
                      {!v.example && !v.sourceSentence && !v.context && (
                        <p className="text-ink-soft/70">
                          （划词收藏，暂无更多信息。之后可补充释义与例句。）
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 学习记录 timeline */}
      {tab === "records" && (
        <div className="space-y-4">
          <Card>
            <SectionTitle
              title="学习时间线"
              sub="按时间顺序记录每一次训练、录音与收藏"
              action={<DemoNote text="以下为演示数据 · 接入训练记录后显示你的真实时间线" />}
            />
            <div className="relative">
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-line" />
              <ul className="space-y-5">
                {activityTimeline.map((a) => (
                  <li key={a.title + a.time} className="relative pl-6">
                    <span
                      className={`absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full border-2 border-cream ${
                        a.tag === "听述"
                          ? "bg-sage"
                          : a.tag === "词汇"
                            ? "bg-clay"
                            : "bg-ink-soft"
                      }`}
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[0.72rem] text-ink-soft tabular-nums">
                        {a.time}
                      </span>
                      <Badge tone={a.tag === "听述" ? "sage" : a.tag === "词汇" ? "clay" : "gray"}>
                        {a.tag}
                      </Badge>
                    </div>
                    <p className="text-[0.85rem] font-medium text-ink mt-1">
                      {a.title}
                    </p>
                    <p className="text-[0.78rem] text-ink-soft mt-0.5">
                      {a.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card>
            <SectionTitle
              title="历史录音"
              sub="可回放、可删除；删除操作仅影响你的个人数据"
              action={<DemoNote text="演示数据 · 接入录音上传后显示你的真实录音" />}
            />
            <ul className="space-y-3">
              {recordings.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-line bg-white/80 px-4 py-3 flex-wrap gap-2"
                >
                  <div>
                    <p className="text-[0.85rem] font-medium text-ink">{r.topic}</p>
                    <p className="text-[0.72rem] text-ink-soft mt-0.5">
                      {r.date} {r.time} · {r.attempts.length} 段录音
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="text-[0.78rem] text-sage-deep underline underline-offset-2">
                      查看反馈
                    </button>
                    <button className="text-[0.78rem] text-clay-deep underline underline-offset-2">
                      删除记录
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <SectionTitle title="隐私与数据" />
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 rounded-lg border border-sage text-sage-deep text-[0.78rem] hover:bg-sage-soft">
                导出我的学习数据（JSON）
              </button>
              <button className="px-4 py-2 rounded-lg border border-line text-ink-soft text-[0.78rem] hover:bg-parchment">
                清空对话历史
              </button>
              <button className="px-4 py-2 rounded-lg border border-clay/50 text-clay-deep text-[0.78rem] hover:bg-clay-soft">
                删除全部学习记录
              </button>
            </div>
            <p className="mt-3 text-[0.72rem] text-ink-soft leading-relaxed">
              数据隔离说明：所有学习记录按用户 ID 隔离存储，无公开主页、无社交动态、无排行榜。
              未来版本将支持邀请好友，届时数据仍默认私有。
            </p>
          </Card>

          <Card>
            <SectionTitle title="本周讨论问题库" sub="Session B 备选问题 · 可手动换题" />
            <ul className="space-y-2.5">
              {discussionQuestions.map((q, i) => (
                <li key={q} className="text-[0.81rem] text-ink-soft leading-relaxed">
                  <span className="text-sage-deep font-medium mr-2">Q{i + 1}</span>
                  {q}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
