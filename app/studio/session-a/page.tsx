"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AudioRecorder from "@/components/AudioRecorder";
import { addSession, addRecording, addProgressRows } from "@/lib/db";
import VideoPlayer from "@/components/VideoPlayer";
import { useVocabStore, keyOf } from "@/components/VocabStore";
import { Badge, Card, DemoNote, ScoreBar, SectionTitle } from "@/components/ui";
import {
  learner,
  primaryMaterial,
  sessionAVocab,
  videoTranscript,
  feedbackA1,
} from "@/lib/mock-data";
import {
  extractVocab,
  evaluateSpeech,
  type VocabExtractItem,
  type EvaluateResult,
} from "@/lib/ai";

const STEPS = [
  "视频聆听",
  "词汇提炼",
  "独立复述",
  "AI 学习反馈",
  "二次尝试对比",
];

export default function SessionAPage() {
  const router = useRouter();
  const [finishing, setFinishing] = useState(false);
  const [step, setStep] = useState(0);
  const [subtitleMode, setSubtitleMode] = useState<"none" | "en">("none");
  const [notes, setNotes] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const { items, add, remove } = useVocabStore();

  // 真实 AI 状态
  const [vocabItems, setVocabItems] = useState<VocabExtractItem[] | null>(null);
  const [vocabLoading, setVocabLoading] = useState(false);
  const [vocabError, setVocabError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [aiFeedback, setAiFeedback] = useState<EvaluateResult | null>(null);
  const [feedbackSource, setFeedbackSource] = useState<"ai" | "demo">("demo");

  function runAnalysis() {
    setAnalyzing(true);
    setAnalyzed(false);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 1800);
  }

  // 用 DeepSeek 从文稿提炼真实词汇
  async function runExtractVocab() {
    setVocabLoading(true);
    setVocabError(null);
    const text = videoTranscript.map((s) => s.en).join(" ");
    const res = await extractVocab(text);
    setVocabLoading(false);
    if (res.ok) {
      setVocabItems(res.data.items);
    } else {
      setVocabError(res.error);
    }
  }

  // 用 DeepSeek 做真实口语评估
  async function runEvaluate() {
    if (!transcript.trim()) {
      setFeedbackSource("demo");
      runAnalysis();
      return;
    }
    setAnalyzing(true);
    setAnalyzed(false);
    const res = await evaluateSpeech(transcript, learner.weeklyTopic);
    setAnalyzing(false);
    if (res.ok) {
      setAiFeedback(res.data);
      setFeedbackSource("ai");
      setAnalyzed(true);
      // 把真实评估结果写进自己的账号（未登录时静默跳过）
      void (async () => {
        try {
          const scores = res.data.scores ?? [];
          const overall = scores.length
            ? Math.round(scores.reduce((a, s) => a + s.value, 0) / scores.length)
            : undefined;
          await addRecording({ transcript, score: overall, attempt: 1 });
          await addProgressRows(
            scores.map((s) => ({ metric: s.label, value: s.value }))
          );
        } catch {
          // 未登录 / 离线时不影响页面使用
        }
      })();
    } else {
      setFeedbackSource("demo");
      setAnalyzed(true);
    }
  }

  async function finishA() {
    setFinishing(true);
    try {
      await addSession("A", { notes: notes.trim() || undefined });
    } catch {
      // 未登录时不阻断跳转
    }
    router.push("/studio/session-b");
  }

  return (
    <div className="space-y-6">
      {/* 头部步骤条 */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-[1.25rem] font-medium text-ink">
              Session A · 听述训练
            </h1>
            <p className="text-[0.75rem] text-ink-soft mt-0.5">
              本周主题：{learner.weeklyTopic} · 预计 40–45 分钟
            </p>
          </div>
          <Link
            href="/studio"
            className="text-[0.75rem] text-ink-soft hover:text-ink underline underline-offset-2"
          >
            返回训练中心
          </Link>
        </div>
        <ol className="mt-4 flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1">
              <button
                onClick={() => i < 4 && setStep(i)}
                className={`w-full text-center text-[0.75rem] py-2 rounded-lg transition-colors ${
                  i === step
                    ? "bg-sage text-cream font-medium"
                    : i < step
                      ? "bg-sage-soft text-sage-deep"
                      : "bg-parchment text-ink-soft"
                }`}
              >
                {i + 1}. {s}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* 第 1 步：视频聆听 */}
      {step === 0 && (
        <Card>
          <SectionTitle
            title="第 1 步 · 视频聆听"
            sub={`${primaryMaterial.title} · ${primaryMaterial.duration} · ${primaryMaterial.difficulty}`}
            action={<DemoNote />}
          />
          <VideoPlayer />
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <span className="text-[0.75rem] text-ink-soft">字幕模式：</span>
            {(
              [
                ["none", "第一遍 · 无字幕"],
                ["en", "第二遍 · 英文字幕"],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setSubtitleMode(v)}
                className={`px-3 py-1.5 rounded-lg text-[0.75rem] transition-colors ${
                  subtitleMode === v
                    ? "bg-sage text-cream"
                    : "bg-parchment text-ink-soft hover:bg-sage-soft"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[0.81rem] leading-relaxed text-ink-soft">
            {subtitleMode === "none"
              ? "建议：第一遍不看字幕，抓住主旨与关键论据；听不懂的地方先记下时间戳，第二遍再核对。"
              : "第二遍对照英文字幕，确认第一遍没听懂的细节，留意说话人如何组织「观点 + 例子」。"}
          </p>
          <div className="mt-4">
            <label className="block text-[0.75rem] text-ink-soft mb-1.5">
              听中笔记（自动保存）
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="例如：02:15 cue-routine-reward 循环；07:40 环境设计的例子…"
              className="w-full rounded-lg border border-line bg-white/80 px-3 py-2.5 text-[0.81rem] placeholder:text-ink-soft/50 focus:outline-none focus:border-sage"
            />
          </div>
          <button
            onClick={() => setStep(1)}
            className="mt-5 px-6 py-2.5 rounded-lg bg-sage text-cream text-[0.81rem] font-medium hover:bg-sage-deep transition-colors"
          >
            完成聆听，进入词汇提炼 →
          </button>
        </Card>
      )}

      {/* 第 2 步：词汇提炼 */}
      {step === 1 && (
        <Card>
          <SectionTitle
            title="第 2 步 · 词汇提炼"
            sub={vocabItems ? "DeepSeek 从文稿中提炼的实用表达" : "AI 从材料中挑选 5–8 个实用表达"}
            action={vocabItems ? <Badge tone="sage">AI 真实提炼</Badge> : <DemoNote />}
          />
          <div className="mb-4 flex items-center gap-3 flex-wrap">
            <button
              onClick={runExtractVocab}
              disabled={vocabLoading}
              className="px-4 py-2 rounded-lg bg-clay text-cream text-[0.8rem] font-medium hover:bg-clay-deep transition-colors disabled:opacity-50"
            >
              {vocabLoading ? "提炼中…" : vocabItems ? "重新提炼" : "✨ 用 AI 从文稿提炼好词"}
            </button>
            <span className="text-[0.72rem] text-ink-soft">
              {vocabItems
                ? "点击收藏的词会进入首页的艾宾浩斯闪卡复习。"
                : "未点 AI 时展示默认核心好词；点击后由 DeepSeek 实时提炼。"}
            </span>
          </div>
          {vocabError && (
            <p className="mb-4 text-[0.75rem] text-clay-deep bg-clay-soft rounded-lg px-3 py-2">
              提炼失败：{vocabError}。已回退展示默认核心好词。
            </p>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            {(vocabItems
              ? vocabItems.map((v) => ({
                  expression: v.expression,
                  meaning: v.meaning,
                  sourceSentence: v.sourceSentence,
                  example: v.example,
                  context: v.context,
                }))
              : sessionAVocab.map((v) => ({
                  expression: v.expression,
                  meaning: v.meaning,
                  sourceSentence: v.sourceSentence,
                  example: v.example,
                  context: v.context,
                }))
            ).map((v, i) => {
              const saved = items.some(
                (x) => keyOf(x.expression) === keyOf(v.expression)
              );
              return (
                <div
                  key={i}
                  className="rounded-xl border border-line bg-white/80 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[0.88rem] font-medium text-ink">
                      {v.expression}
                    </h3>
                    <button
                      onClick={() => {
                        if (saved) {
                          const target = items.find(
                            (x) => keyOf(x.expression) === keyOf(v.expression)
                          );
                          if (target) remove(target.id);
                        } else {
                          add({
                            id: `core-${i}-${keyOf(v.expression)}`,
                            expression: v.expression,
                            meaning: v.meaning,
                            example: v.example,
                            sourceSentence: v.sourceSentence,
                            context: v.context,
                            source: "core",
                          });
                        }
                      }}
                      className={`text-[0.75rem] px-2.5 py-1 rounded-md transition-colors ${
                        saved
                          ? "bg-sage-soft text-sage-deep"
                          : "bg-parchment text-ink-soft hover:bg-sage-soft"
                      }`}
                    >
                      {saved ? "✓ 已收藏" : "收藏"}
                    </button>
                  </div>
                  <p className="text-[0.75rem] text-clay-deep mt-1">{v.meaning}</p>
                  <div className="mt-3 space-y-1.5 text-[0.75rem] leading-relaxed">
                    <p className="text-ink-soft">
                      <span className="text-sage-deep">原句 · </span>
                      {v.sourceSentence}
                    </p>
                    <p className="text-ink-soft">
                      <span className="text-sage-deep">例句 · </span>
                      {v.example}
                    </p>
                    <p className="text-ink-soft">
                      <span className="text-sage-deep">场景 · </span>
                      {v.context}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-lg bg-sage text-cream text-[0.81rem] font-medium hover:bg-sage-deep transition-colors"
            >
              进入独立复述 →
            </button>
            <button
              onClick={() => setStep(0)}
              className="px-4 py-2.5 rounded-lg text-[0.81rem] text-ink-soft hover:bg-parchment"
            >
              返回上一步
            </button>
          </div>
        </Card>
      )}

      {/* 第 3 步：独立复述 */}
      {step === 2 && (
        <Card>
          <SectionTitle
            title="第 3 步 · 独立复述"
            sub="合上字幕，用英语口头复述视频主旨与关键论据，建议 1–2 分钟"
          />
          <div className="rounded-2xl bg-butter/60 border border-clay/30 p-4">
            <p className="text-[0.8rem] font-medium text-clay-deep mb-1.5">
              📝 你的听中笔记
            </p>
            {notes.trim() ? (
              <p className="text-[0.85rem] text-ink leading-relaxed whitespace-pre-wrap">
                {notes}
              </p>
            ) : (
              <p className="text-[0.8rem] text-ink-soft">
                你还没有记录笔记。可以返回第 1 步补记，或直接凭印象开始复述。
              </p>
            )}
          </div>
          <div className="mt-4 rounded-2xl bg-parchment border border-line p-4 text-[0.85rem] text-ink-soft leading-relaxed">
            复述要点提示：主旨（习惯为何重要）→ 核心概念（autopilot 与习惯回路）→
            两条建议（start small / design your environment）→ 一个你印象最深的例子。
            卡壳时允许停顿，不用追求完美。
          </div>
          <div className="mt-4">
            <AudioRecorder
              label="开始录制复述"
              onTranscript={(t) => setTranscript(t)}
            />
          </div>
          {transcript && (
            <div className="mt-4 rounded-xl border border-sage/40 bg-sage-soft/30 p-4">
              <p className="text-[0.78rem] font-medium text-sage-deep mb-1.5">
                📝 语音转写（可编辑后用于 AI 评估）
              </p>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-line bg-white/80 px-3 py-2.5 text-[0.81rem] placeholder:text-ink-soft/50 focus:outline-none focus:border-sage"
              />
              <p className="mt-1.5 text-[0.72rem] text-ink-soft">
                浏览器语音识别实时转写，可手动修正。点「获取 AI 反馈」后交给 DeepSeek 评估。
              </p>
            </div>
          )}
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => {
                setStep(3);
                runEvaluate();
              }}
              className="px-6 py-2.5 rounded-lg bg-sage text-cream text-[0.81rem] font-medium hover:bg-sage-deep transition-colors"
            >
              完成，获取 AI 反馈 →
            </button>
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-lg text-[0.81rem] text-ink-soft hover:bg-parchment"
            >
              返回上一步
            </button>
          </div>
        </Card>
      )}

      {/* 第 4 步：AI 反馈 */}
      {step === 3 && (
        <Card>
          <SectionTitle
            title="第 4 步 · AI 学习反馈"
            action={
              feedbackSource === "ai" ? (
                <Badge tone="sage">DeepSeek 真实评估</Badge>
              ) : (
                <DemoNote text="示例反馈 · 非真实 AI 生成" />
              )
            }
          />
          {!analyzed && !analyzing && (
            <div className="text-center py-10">
              <p className="text-[0.81rem] text-ink-soft">
                准备好后点击生成反馈。若你已完成语音转写，系统会交给 DeepSeek
                从六个维度真实评估；否则展示示例反馈。
              </p>
              <button
                onClick={runEvaluate}
                className="mt-5 px-6 py-2.5 rounded-lg bg-sage text-cream text-[0.81rem] font-medium hover:bg-sage-deep transition-colors"
              >
                生成 AI 反馈
              </button>
            </div>
          )}
          {analyzing && (
            <div className="text-center py-12">
              <div className="inline-block w-6 h-6 rounded-full border-2 border-sage border-t-transparent animate-spin" />
              <p className="mt-4 text-[0.81rem] text-ink-soft">
                {feedbackSource === "ai"
                  ? "正在调用 DeepSeek 分析，约需 10–30 秒…"
                  : "正在转写并分析录音，约需 10–30 秒…"}
              </p>
            </div>
          )}
          {analyzed && (() => {
            // 数据源：真实 AI 评估或演示数据
            const fb = aiFeedback;
            const scores = fb?.scores ?? feedbackA1.scores;
            const topIssues = fb?.topIssues ?? feedbackA1.topIssues;
            const corrected = fb?.corrected ?? feedbackA1.corrected;
            const improved = fb?.improved ?? feedbackA1.improved;
            const expressions = fb?.expressions ?? feedbackA1.expressions;
            const suggestions = fb?.suggestions ?? feedbackA1.suggestions;
            return (
            <div className="space-y-8">
              <div>
                <h3 className="text-[0.88rem] font-medium text-ink mb-3">
                  六维评估 <span className="text-[0.69rem] text-ink-soft font-normal">（AI 评估，非客观测量）</span>
                </h3>
                <div className="space-y-2.5">
                  {scores.map((s) => (
                    <ScoreBar key={s.label} label={s.label} value={s.value} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[0.88rem] font-medium text-ink mb-3">
                  优先处理的 3 个问题
                </h3>
                <div className="space-y-3">
                  {topIssues.map((iss, i) => (
                    <div
                      key={iss.title}
                      className="rounded-xl border border-clay/40 bg-clay-soft/40 p-4"
                    >
                      <p className="text-[0.81rem] font-medium text-clay-deep">
                        {i + 1}. {iss.title}
                      </p>
                      <p className="text-[0.81rem] text-ink mt-1.5 leading-relaxed">
                        {iss.detail}
                      </p>
                      <p className="text-[0.75rem] text-ink-soft mt-2">
                        <span className="text-clay-deep">例：</span>
                        {iss.example}
                      </p>
                      <p className="text-[0.75rem] text-ink-soft mt-1">
                        <span className="text-sage-deep">建议：</span>
                        {iss.fix}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-line bg-white/80 p-4">
                  <Badge tone="gray">你的转写原文</Badge>
                  <p className="text-[0.75rem] text-ink-soft mt-2.5 leading-relaxed italic">
                    {transcript || feedbackA1.transcript}
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-white/80 p-4">
                  <Badge>纠错版本</Badge>
                  <p className="text-[0.75rem] text-ink mt-2.5 leading-relaxed">
                    {corrected}
                  </p>
                </div>
                <div className="rounded-xl border border-sage bg-sage-soft/30 p-4">
                  <Badge>更自然的进阶版本</Badge>
                  <p className="text-[0.75rem] text-ink mt-2.5 leading-relaxed">
                    {improved}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-line bg-white/80 p-4">
                  <h4 className="text-[0.81rem] font-medium text-ink">5 个有用表达</h4>
                  <ul className="mt-2.5 space-y-1.5 text-[0.75rem] text-ink-soft">
                    {expressions.map((e) => (
                      <li key={e}>· {e}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-line bg-white/80 p-4">
                  <h4 className="text-[0.81rem] font-medium text-ink">个性化练习建议</h4>
                  <ul className="mt-2.5 space-y-1.5 text-[0.75rem] text-ink-soft">
                    {suggestions.map((s) => (
                      <li key={s}>· {s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-lg bg-sage text-cream text-[0.81rem] font-medium hover:bg-sage-deep transition-colors"
                >
                  查看后进入二次尝试 →
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-lg text-[0.81rem] text-ink-soft hover:bg-parchment"
                >
                  返回重录
                </button>
              </div>
            </div>
            );
          })()}
        </Card>
      )}

      {/* 第 5 步：二次尝试对比 */}
      {step === 4 && (
        <Card>
          <SectionTitle
            title="第 5 步 · 二次尝试"
            sub="带着反馈再录一遍，系统会对比两次的进步与遗留问题"
            action={<Badge tone="gray">基于你的真实记录</Badge>}
          />

          {/* 笔记 + AI 反馈核心要点 */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl bg-butter/60 border border-clay/30 p-4">
              <p className="text-[0.8rem] font-medium text-clay-deep mb-1.5">
                📝 你的听中笔记
              </p>
              {notes.trim() ? (
                <p className="text-[0.85rem] text-ink leading-relaxed whitespace-pre-wrap">
                  {notes}
                </p>
              ) : (
                <p className="text-[0.8rem] text-ink-soft">
                  你还没有记录笔记。
                </p>
              )}
            </div>
            <div className="rounded-2xl bg-sage-soft/50 border border-sage/40 p-4">
              <p className="text-[0.8rem] font-medium text-sage-deep mb-1.5">
                ⭐ 上次反馈的核心要点（录音前再记一遍）
              </p>
              {(aiFeedback?.topIssues ?? []).length > 0 ? (
                <ul className="space-y-1.5 text-[0.8rem] text-ink leading-relaxed">
                  {(aiFeedback?.topIssues ?? []).map((iss, i) => (
                    <li key={iss.title}>
                      <span className="text-clay-deep font-medium">{i + 1}.</span>{" "}
                      {iss.title} —— <span className="text-ink-soft">{iss.fix}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[0.78rem] text-ink-soft leading-relaxed">
                  还没有真实 AI 反馈。可返回第 4 步生成，反馈要点会自动带到这里。
                </p>
              )}
            </div>
          </div>

          <AudioRecorder label="录制第二次尝试" />
          <div className="mt-6 rounded-xl border border-line overflow-hidden">
            <table className="w-full text-[0.75rem]">
              <thead>
                <tr className="bg-parchment text-ink-soft">
                  <th className="text-left px-4 py-2.5 font-normal">维度</th>
                  <th className="text-left px-4 py-2.5 font-normal">第一次</th>
                  <th className="text-left px-4 py-2.5 font-normal">第二次</th>
                  <th className="text-left px-4 py-2.5 font-normal">变化</th>
                </tr>
              </thead>
              <tbody className="text-ink">
                {(aiFeedback?.scores ?? []).length > 0 ? (
                  (aiFeedback?.scores ?? []).map((s) => (
                    <tr key={s.label} className="border-t border-line">
                      <td className="px-4 py-2.5">{s.label}</td>
                      <td className="px-4 py-2.5">{s.value}</td>
                      <td className="px-4 py-2.5 text-ink-soft">—</td>
                      <td className="px-4 py-2.5 text-ink-soft">—</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-line">
                    <td colSpan={4} className="px-4 py-4 text-center text-ink-soft">
                      尚无真实评估分数。完成一次 AI 反馈后，这里会显示你的六维评分。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-xl border border-sage bg-sage-soft/30 p-4">
            <h4 className="text-[0.81rem] font-medium text-sage-deep">
              本次反馈要点
            </h4>
            {(aiFeedback?.suggestions ?? []).length > 0 ? (
              <ul className="mt-2 space-y-1.5 text-[0.75rem] text-ink-soft">
                {(aiFeedback?.suggestions ?? []).map((s) => (
                  <li key={s}>· {s}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[0.75rem] text-ink-soft leading-relaxed">
                二次尝试的自动评分对比尚未开放。你可以先录制第二遍，系统会在后续版本支持对比。
              </p>
            )}
          </div>
          <div className="mt-5 flex gap-3">
            <button
              onClick={finishA}
              disabled={finishing}
              className="px-6 py-2.5 rounded-lg bg-sage text-cream text-[0.81rem] font-medium hover:bg-sage-deep transition-colors disabled:opacity-60"
            >
              {finishing ? "正在保存…" : "完成 Session A · 去 Session B →"}
            </button>
            <Link
              href="/progress"
              className="px-4 py-2.5 rounded-lg text-[0.81rem] text-ink-soft hover:bg-parchment"
            >
              查看学习进度
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
