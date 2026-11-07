import Link from "next/link";
import { Badge, Card, SectionTitle } from "@/components/ui";
import { learner, primaryMaterial, discussionQuestions } from "@/lib/mock-data";

const stepListA = [
  "视频聆听",
  "词汇提炼",
  "独立复述",
  "AI 学习反馈",
  "二次尝试对比",
];

const stepListB = [
  "复习巩固",
  "跟读练习",
  "AI 语音对话",
  "独立总结",
  "课堂总结",
];

export default function StudioPage() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-[1.38rem] font-medium text-ink">训练中心</h1>
        <p className="text-[0.81rem] text-ink-soft mt-1">
          本周主题「{learner.weeklyTopic}」· {learner.weeklyTopicEn} ·
          建议每次课 40–45 分钟
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        {/* Session A */}
        <Card className="border-sage">
          <div className="flex items-center justify-between">
            <Badge>进行中 · 第 3 步</Badge>
            <span className="text-[0.75rem] text-ink-soft">40–45 分钟</span>
          </div>
          <h2 className="text-[1.06rem] font-medium text-ink mt-3">
            Session A · 听述训练
          </h2>
          <p className="text-[0.75rem] text-ink-soft mt-0.5">
            Listen → Understand → Retell → Feedback
          </p>
          <ol className="mt-4 space-y-2">
            {stepListA.map((s, i) => (
              <li key={s} className="flex items-center gap-3 text-[0.81rem]">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.69rem] ${
                    i < 2
                      ? "bg-sage text-cream"
                      : i === 2
                        ? "bg-clay text-cream"
                        : "bg-parchment text-ink-soft"
                  }`}
                >
                  {i < 2 ? "✓" : i + 1}
                </span>
                <span className={i === 2 ? "text-ink font-medium" : "text-ink-soft"}>
                  {s}
                  {i === 2 && <span className="text-clay-deep text-[0.69rem] ml-2">当前位置</span>}
                </span>
              </li>
            ))}
          </ol>
          <Link
            href="/studio/session-a"
            className="mt-5 inline-flex items-center px-6 py-2.5 rounded-lg bg-sage text-cream text-[0.81rem] font-medium hover:bg-sage-deep transition-colors"
          >
            继续 Session A →
          </Link>
        </Card>

        {/* Session B */}
        <Card>
          <div className="flex items-center justify-between">
            <Badge tone="gray">未开始</Badge>
            <span className="text-[0.75rem] text-ink-soft">40–45 分钟</span>
          </div>
          <h2 className="text-[1.06rem] font-medium text-ink mt-3">
            Session B · 讨论应用
          </h2>
          <p className="text-[0.75rem] text-ink-soft mt-0.5">
            Review → Shadowing → Discuss → Summarize
          </p>
          <ol className="mt-4 space-y-2">
            {stepListB.map((s, i) => (
              <li key={s} className="flex items-center gap-3 text-[0.81rem] text-ink-soft">
                <span className="w-5 h-5 rounded-full bg-parchment text-ink-soft flex items-center justify-center text-[0.69rem]">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
          <Link
            href="/studio/session-b"
            className="mt-5 inline-flex items-center px-6 py-2.5 rounded-lg border border-sage text-sage-deep text-[0.81rem] font-medium hover:bg-sage-soft transition-colors"
          >
            开始 Session B →
          </Link>
        </Card>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <Card>
          <SectionTitle title="本次课材料" sub="本周主材料 · 演示数据" />
          <h3 className="text-[0.88rem] font-medium text-ink">{primaryMaterial.title}</h3>
          <p className="text-[0.75rem] text-ink-soft mt-0.5">{primaryMaterial.titleZh}</p>
          <div className="flex items-center gap-2 mt-2 text-[0.75rem] text-ink-soft">
            <span>{primaryMaterial.source}</span>·<span>{primaryMaterial.duration}</span>·
            <span>{primaryMaterial.difficulty}</span>
          </div>
          <p className="text-[0.69rem] text-ink-soft/70 mt-3">{primaryMaterial.urlNote}</p>
        </Card>
        <Card>
          <SectionTitle title="Session B 讨论问题预览" />
          <ul className="space-y-2.5">
            {discussionQuestions.slice(0, 3).map((q, i) => (
              <li key={q} className="text-[0.81rem] text-ink-soft leading-relaxed">
                <span className="text-sage-deep font-medium mr-2">Q{i + 1}</span>
                {q}
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
