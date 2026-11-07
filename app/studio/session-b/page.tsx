"use client";

import { useState } from "react";
import Link from "next/link";
import AudioRecorder from "@/components/AudioRecorder";
import { Badge, Card, DemoNote, SectionTitle } from "@/components/ui";
import {
  learner,
  savedVocab,
  shadowingSentences,
  discussionTopics,
  shadowingPrompts,
  sessionBSummary,
} from "@/lib/mock-data";
import { chat, summarize, type ChatMessage, type SummaryResult } from "@/lib/ai";

const STEPS = ["复习巩固", "跟读练习", "AI 语音对话", "独立总结", "课堂总结"];

export default function SessionBPage() {
  const [step, setStep] = useState(0);
  const [practiced, setPracticed] = useState<number[]>([]);
  const [topicId, setTopicId] = useState("habits");

  const topic =
    discussionTopics.find((t) => t.id === topicId) ?? discussionTopics[0];

  const [messages, setMessages] = useState<
    { role: "coach" | "user"; text: string }[]
  >([
    {
      role: "coach",
      text: `Hi Sylvia! Let's talk about "${topic.titleEn}". ${topic.questions[0]}`,
    },
  ]);
  const [input, setInput] = useState("");
  const [turn, setTurn] = useState(1);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiChat, setAiChat] = useState(false);
  const [aiSummary, setAiSummary] = useState<SummaryResult | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  function selectTopic(id: string) {
    setTopicId(id);
    const t = discussionTopics.find((x) => x.id === id) ?? discussionTopics[0];
    setMessages([
      {
        role: "coach",
        text: `Hi Sylvia! Let's talk about "${t.titleEn}". ${t.questions[0]}`,
      },
    ]);
    setTurn(1);
    setAiChat(false);
  }

  // 真实 AI 对话
  async function send() {
    if (!input.trim() || aiThinking) return;
    const userText = input.trim();
    const nextTurn = turn + 1;
    setInput("");
    setAiChat(true);
    setAiThinking(true);

    // 构造给 DeepSeek 的对话历史
    const history: ChatMessage[] = messages.map((m) => ({
      role: m.role === "coach" ? "assistant" : "user",
      content: m.text,
    }));
    history.push({ role: "user", content: userText });

    const res = await chat(history, topic.titleEn);

    if (res.ok) {
      setMessages((m) => [
        ...m,
        { role: "user", text: userText },
        { role: "coach", text: res.data.reply },
      ]);
    } else {
      // 回退到轮换问题
      const reply =
        nextTurn <= topic.questions.length
          ? topic.questions[turn - 1]
          : "Nice reasoning. Let's wrap up here — you handled the follow-ups well. In the next step, try to summarize our discussion on your own.";
      setMessages((m) => [
        ...m,
        { role: "user", text: userText },
        { role: "coach", text: reply },
      ]);
    }
    setAiThinking(false);
    setTurn(nextTurn);
  }

  // 真实课堂总结
  async function runSummary() {
    setSummaryLoading(true);
    setSummaryError(null);
    const conversation = messages
      .map((m) => `${m.role === "coach" ? "Coach" : "Sylvia"}: ${m.text}`)
      .join("\n");
    const res = await summarize(conversation);
    setSummaryLoading(false);
    if (res.ok) {
      setAiSummary(res.data);
    } else {
      setSummaryError(res.error);
    }
  }

  function speak(text: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.92;
      window.speechSynthesis.speak(u);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-[1.25rem] font-medium text-ink">
              Session B · 讨论应用
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

      {/* 话题选择器（贯穿整节课） */}
      <div className="rounded-2xl border border-sage/40 bg-sage-soft/40 p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-[0.85rem] font-medium text-ink">
            讨论话题 · 可自由切换
          </p>
          <Badge>当前：{topic.title}</Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {discussionTopics.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTopic(t.id)}
              className={`px-3.5 py-1.5 rounded-full text-[0.78rem] transition-colors ${
                topicId === t.id
                  ? "bg-sage text-cream font-medium"
                  : "bg-white/70 text-ink-soft hover:bg-sage-soft border border-line"
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-[0.75rem] text-ink-soft">{topic.intro}</p>
      </div>

      {/* 第 1 步：复习 */}
      {step === 0 && (
        <Card>
          <SectionTitle
            title="第 1 步 · 复习巩固"
            sub="快速回顾 Session A 的词汇"
          />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-[0.85rem] font-medium text-ink mb-3">
                本周已收藏表达
              </h3>
              <ul className="space-y-2.5">
                {savedVocab.map((v) => (
                  <li key={v.id} className="text-[0.85rem]">
                    <span className="font-medium text-ink">{v.expression}</span>
                    <span className="text-ink-soft ml-2">{v.meaning}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[0.85rem] font-medium text-ink mb-3">
                本次讨论话题 · 相关资料
              </h3>
              <ul className="space-y-2.5">
                {topic.materials.map((m) => (
                  <li
                    key={m.title}
                    className="rounded-xl border border-line bg-white/80 p-3"
                  >
                    <p className="text-[0.82rem] font-medium text-ink">
                      {m.title}
                    </p>
                    <p className="text-[0.75rem] text-ink-soft mt-0.5">
                      {m.source} · {m.duration} · {m.note}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[0.72rem] text-ink-soft/70">
                演示数据：接入资料检索后，将根据话题自动搜索高质量视频与文章。
              </p>
            </div>
          </div>
          <button
            onClick={() => setStep(1)}
            className="mt-5 px-6 py-2.5 rounded-lg bg-sage text-cream text-[0.81rem] font-medium hover:bg-sage-deep transition-colors"
          >
            进入跟读练习 →
          </button>
        </Card>
      )}

      {/* 第 2 步：跟读 */}
      {step === 1 && (
        <Card>
          <SectionTitle
            title="第 2 步 · 跟读练习"
            sub="逐句播放原声并模仿，注意语调和重音"
          />
          <div className="space-y-3">
            {shadowingSentences.map((s, i) => {
              const done = practiced.includes(i);
              return (
                <div
                  key={s.en}
                  className={`rounded-xl border p-4 transition-colors ${
                    done ? "border-sage bg-sage-soft/30" : "border-line bg-white/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-[0.9rem] text-ink leading-relaxed">{s.en}</p>
                      <p className="text-[0.78rem] text-ink-soft mt-1">{s.zh}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => speak(s.en)}
                        className="px-3 py-1.5 rounded-lg bg-parchment text-[0.78rem] text-ink hover:bg-sage-soft"
                      >
                        🔊 播放原声 {s.start}
                      </button>
                      <button
                        onClick={() =>
                          setPracticed((p) =>
                            done ? p.filter((x) => x !== i) : [...p, i]
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg text-[0.78rem] ${
                          done
                            ? "bg-sage text-cream"
                            : "border border-line text-ink-soft hover:bg-parchment"
                        }`}
                      >
                        {done ? "✓ 已练习" : "标记完成"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex gap-3 items-center">
            <button
              onClick={() => setStep(2)}
              disabled={practiced.length < 3}
              className="px-6 py-2.5 rounded-lg bg-sage text-cream text-[0.81rem] font-medium hover:bg-sage-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              进入 AI 语音对话 →
            </button>
            <span className="text-[0.78rem] text-ink-soft">
              已完成 {practiced.length}/6 句
              {practiced.length < 3 && "（至少 3 句后可继续）"}
            </span>
          </div>
        </Card>
      )}

      {/* 第 3 步：AI 对话 */}
      {step === 2 && (
        <Card>
          <SectionTitle
            title="第 3 步 · AI 语音对话"
            sub="围绕所选话题讨论 · 一次一个问题，鼓励展开观点"
            action={
              aiChat ? (
                <Badge tone="sage">DeepSeek 真实对话</Badge>
              ) : (
                <DemoNote text="尚未开始 · 发送后接入真实 AI" />
              )
            }
          />
          <div className="rounded-xl border border-line bg-white/80 p-4 h-80 overflow-y-auto space-y-3.5">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                <div
                  className={`inline-block max-w-[82%] px-3.5 py-2.5 rounded-xl text-[0.85rem] leading-relaxed ${
                    m.role === "user"
                      ? "bg-sage text-cream text-left"
                      : "bg-parchment text-ink"
                  }`}
                >
                  <div>{m.text}</div>
                  {m.role === "coach" && (
                    <button
                      onClick={() => speak(m.text)}
                      className="mt-1.5 text-[0.72rem] text-sage-deep underline underline-offset-2 hover:text-sage"
                    >
                      🔊 播放 AI 语音
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="用英语输入你的回答…（AI 会用语音朗读，帮助你练听力）"
              className="flex-1 rounded-lg border border-line bg-white/80 px-3.5 py-2.5 text-[0.85rem] focus:outline-none focus:border-sage"
            />
            <button
              onClick={send}
              disabled={aiThinking}
              className="px-5 py-2.5 rounded-lg bg-sage text-cream text-[0.85rem] font-medium hover:bg-sage-deep disabled:opacity-50"
            >
              {aiThinking ? "思考中…" : "发送"}
            </button>
          </div>
          {aiThinking && (
            <p className="mt-2 text-[0.72rem] text-sage-deep flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
              AI 教练正在思考并组织追问…
            </p>
          )}
          <p className="mt-2.5 text-[0.72rem] text-ink-soft">
            对话约定：默认全英文；每条 AI 回复都带「播放 AI 语音」按钮帮助练听力；
            卡壳时可输入「用中文解释一下」获取简短中文提示；教练不会逐句纠错。
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-lg bg-sage text-cream text-[0.81rem] font-medium hover:bg-sage-deep transition-colors"
            >
              结束对话，进入独立总结 →
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

      {/* 第 4 步：独立总结 */}
      {step === 3 && (
        <Card>
          <SectionTitle
            title="第 4 步 · 独立总结"
            sub="脱离辅助，用英语独立说 1–3 分钟：今天讨论了什么 + 你的立场"
          />
          <div className="rounded-2xl bg-butter/60 border border-clay/30 p-4">
            <p className="text-[0.8rem] font-medium text-clay-deep mb-2">
              💡 提示词 · 好词好句助记（回忆不起来时再看）
            </p>
            <ul className="space-y-1.5 text-[0.82rem] text-ink leading-relaxed">
              {shadowingPrompts.map((p) => (
                <li key={p}>· {p}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4 rounded-xl bg-parchment border border-line p-4 text-[0.85rem] text-ink-soft leading-relaxed">
            尝试用上：run on autopilot / fall back on / build momentum 中的至少 2 个；
            并刻意练习用 which 或 so that 连接两个观点。
          </div>
          <div className="mt-4">
            <AudioRecorder label="开始录制总结" />
          </div>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => {
                setStep(4);
                runSummary();
              }}
              className="px-6 py-2.5 rounded-lg bg-sage text-cream text-[0.81rem] font-medium hover:bg-sage-deep transition-colors"
            >
              完成，生成课堂总结 →
            </button>
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-lg text-[0.81rem] text-ink-soft hover:bg-parchment"
            >
              返回上一步
            </button>
          </div>
        </Card>
      )}

      {/* 第 5 步：课堂总结 */}
      {step === 4 && (
        <Card>
          <SectionTitle
            title="第 5 步 · 课堂总结"
            action={
              aiSummary ? (
                <Badge tone="sage">DeepSeek 真实生成</Badge>
              ) : summaryLoading ? (
                <Badge tone="clay">生成中…</Badge>
              ) : (
                <DemoNote text="示例报告 · 非真实 AI 生成" />
              )
            }
          />
          {summaryError && (
            <p className="mb-4 text-[0.75rem] text-clay-deep bg-clay-soft rounded-lg px-3 py-2">
              生成失败：{summaryError}。已展示示例报告。
            </p>
          )}
          {summaryLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-6 h-6 rounded-full border-2 border-sage border-t-transparent animate-spin" />
              <p className="mt-4 text-[0.81rem] text-ink-soft">
                正在生成课堂总结，约需 10–20 秒…
              </p>
            </div>
          ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-white/80 p-4">
              <h3 className="text-[0.85rem] font-medium text-ink">对话摘要</h3>
              <p className="text-[0.85rem] text-ink-soft mt-2 leading-relaxed">
                {aiSummary?.conversation ?? sessionBSummary.conversation}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-sage bg-sage-soft/30 p-4">
                <h3 className="text-[0.85rem] font-medium text-sage-deep">
                  新学到的表达
                </h3>
                <ul className="mt-2 space-y-1.5 text-[0.8rem] text-ink">
                  {(aiSummary?.newExpressions ?? sessionBSummary.newExpressions).map((e) => (
                    <li key={e}>· {e}</li>
                  ))}
                </ul>
                <h3 className="text-[0.85rem] font-medium text-sage-deep mt-4">
                  进步之处
                </h3>
                <ul className="mt-2 space-y-1.5 text-[0.8rem] text-ink">
                  {(aiSummary?.improvements ?? sessionBSummary.improvements).map((e) => (
                    <li key={e}>· {e}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-clay/40 bg-clay-soft/40 p-4">
                <h3 className="text-[0.85rem] font-medium text-clay-deep">
                  重复出现的错误
                </h3>
                <ul className="mt-2 space-y-1.5 text-[0.8rem] text-ink">
                  {(aiSummary?.repeatedMistakes ?? sessionBSummary.repeatedMistakes).map((e) => (
                    <li key={e}>· {e}</li>
                  ))}
                </ul>
                <h3 className="text-[0.85rem] font-medium text-clay-deep mt-4">
                  下次课重点
                </h3>
                <p className="mt-2 text-[0.8rem] text-ink leading-relaxed">
                  {aiSummary?.nextFocus ?? sessionBSummary.nextFocus}
                </p>
              </div>
            </div>
          </div>
          )}
          <div className="mt-5 flex gap-3">
            <Link
              href="/"
              className="px-6 py-2.5 rounded-lg bg-sage text-cream text-[0.81rem] font-medium hover:bg-sage-deep transition-colors"
            >
              完成本周训练 · 返回首页 →
            </Link>
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
