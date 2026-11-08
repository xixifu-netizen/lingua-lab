"use client";

import Link from "next/link";
import { Badge, Card, ProgressBar, SectionTitle } from "@/components/ui";
import VocabReview from "@/components/VocabReview";
import { useVocabStore } from "@/components/VocabStore";
import { useAuth } from "@/components/AuthProvider";
import {
  useLearningData,
  buildTimeline,
  formatTime,
} from "@/lib/use-learning-data";
import {
  learner,
  primaryMaterial,
  supplementaryMaterials,
} from "@/lib/mock-data";

export default function Home() {
  const { user } = useAuth();
  const { items } = useVocabStore();
  const { sessions, recordings, progress, loading } = useLearningData();

  const displayName = user ? user.email?.split("@")[0] : "";
  const sessionCount = sessions.length;
  const recordingCount = recordings.length;
  const vocabCount = items.length;
  const evalCount = progress.length;
  const weeklyGoal = 2;
  const weekProgress = Math.min(
    100,
    Math.round((sessionCount / weeklyGoal) * 100)
  );
  const hasA = sessions.some((s) => s.mode === "A");
  const hasB = sessions.some((s) => s.mode === "B");
  const timeline = buildTimeline(sessions, recordings);
  const coreCount = items.filter((v) => v.source === "core").length;
  const selectionCount = items.filter((v) => v.source === "selection").length;

  return (
    <div className="space-y-10">
      {/* 欢迎 + 主行动 */}
      <section className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
        <div>
          <p className="text-[0.81rem] text-ink-soft">
            {displayName ? `欢迎回来，${displayName}` : "欢迎来到 Lingua Lab"}
          </p>
          <h1 className="text-[1.38rem] font-medium text-ink mt-1">
            开始今天的英语训练
          </h1>
          <p className="text-[0.81rem] text-ink-soft mt-2 max-w-md leading-relaxed">
            先完成 Session A 的听述复述，再进入 Session B 的 AI 讨论。
            {user
              ? "你的训练、录音与收藏都会保存到自己的账号里。"
              : "登录后，你的训练、录音与收藏才会保存到云端。"}
          </p>
        </div>
        <Link
          href="/studio/session-a"
          className="shrink-0 inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-sage text-cream text-[0.94rem] font-medium hover:bg-sage-deep transition-colors"
        >
          开始今天的训练 →
        </Link>
      </section>

      {/* 本周主题 + 我的真实进度 */}
      <section className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <SectionTitle
            title={`本周主题 · ${learner.weeklyTopic}`}
            sub={`${learner.weeklyTopicEn} · ${learner.topicCategory} · ${learner.difficulty} · 示例主题`}
          />
          <p className="text-[0.81rem] leading-relaxed text-ink-soft">
            {learner.topicIntro}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {learner.objectives.map((o) => (
              <Badge key={o}>{o}</Badge>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle title="我的训练进度" sub="依据你已完成课次统计" />
          <div className="text-[2rem] font-medium text-ink leading-none">
            {loading ? "—" : sessionCount}
            <span className="text-[0.88rem] text-ink-soft"> / {weeklyGoal} 次</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={weekProgress} />
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-[0.81rem]">
              <span className="text-ink-soft">Session A · 听述训练</span>
              <Badge tone={hasA ? "sage" : "gray"}>{hasA ? "已完成" : "未开始"}</Badge>
            </div>
            <div className="flex items-center justify-between text-[0.81rem]">
              <span className="text-ink-soft">Session B · 讨论应用</span>
              <Badge tone={hasB ? "sage" : "gray"}>{hasB ? "已完成" : "未开始"}</Badge>
            </div>
          </div>
        </Card>
      </section>

      {/* 示例教材 */}
      <section>
        <SectionTitle
          title="推荐学习材料"
          sub="示例教材 · 可替换为任意你正在学习的视频与文章"
        />
        <div className="grid md:grid-cols-3 gap-4">
          {[primaryMaterial, ...supplementaryMaterials].map((m, i) => (
            <Card key={m.id} className={i === 0 ? "border-sage" : ""}>
              {i === 0 && <Badge>本周主材料</Badge>}
              <h3 className="text-[0.88rem] font-medium text-ink mt-2 leading-snug">
                {m.title}
              </h3>
              <p className="text-[0.75rem] text-ink-soft mt-0.5">{m.titleZh}</p>
              <div className="flex items-center gap-2 mt-3 text-[0.75rem] text-ink-soft">
                <span>{m.source}</span>·<span>{m.duration}</span>·
                <span>{m.difficulty}</span>
              </div>
              <p className="text-[0.75rem] leading-relaxed text-ink-soft mt-3">
                {m.description}
              </p>
              <p className="text-[0.75rem] text-sage-deep mt-3">
                学习目标：{m.objective}
              </p>
              <p className="text-[0.69rem] text-ink-soft/70 mt-3">{m.urlNote}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 词汇复习 · 艾宾浩斯 + 闪卡（真实收藏数据） */}
      <VocabReview />

      {/* 真实动态 + 收藏构成 + 累计数据 */}
      <section className="grid md:grid-cols-3 gap-4">
        <Card>
          <SectionTitle title="最近学习动态" sub="你自己的训练记录" />
          {timeline.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line p-5 text-center text-[0.78rem] text-ink-soft leading-relaxed">
              还没有学习记录。
              <br />
              完成一次 Session A 后，这里会出现你的时间线。
            </div>
          ) : (
            <ul className="space-y-4">
              {timeline.slice(0, 4).map((a) => (
                <li key={a.id} className="text-[0.81rem]">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.69rem] text-ink-soft">
                      {formatTime(a.time)}
                    </span>
                    <Badge tone="gray">{a.tag}</Badge>
                  </div>
                  <p className="mt-1 leading-relaxed">{a.title}</p>
                  <p className="text-[0.72rem] text-ink-soft mt-0.5">{a.detail}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <SectionTitle title="我的收藏构成" sub="按来源统计" />
          {vocabCount === 0 ? (
            <div className="rounded-xl border border-dashed border-line p-5 text-center text-[0.78rem] text-ink-soft leading-relaxed">
              还没有收藏词汇。
              <br />
              在视频文稿里划选好词即可收藏。
            </div>
          ) : (
            <ul className="space-y-3 text-[0.81rem]">
              <li className="flex items-center justify-between">
                <span className="text-ink-soft">视频核心好词</span>
                <span className="font-medium text-ink">{coreCount}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-ink-soft">划词收藏</span>
                <span className="font-medium text-ink">{selectionCount}</span>
              </li>
              <li className="flex items-center justify-between border-t border-line pt-3">
                <span className="text-ink-soft">合计</span>
                <span className="font-medium text-sage-deep">{vocabCount}</span>
              </li>
            </ul>
          )}
          <p className="text-[0.69rem] text-ink-soft/70 mt-5 leading-relaxed">
            首页只显示你自己产生的真实数据；能力评分为 AI 评估，非客观测量。
          </p>
        </Card>
        <Card>
          <SectionTitle title="累计学习" sub="仅统计本人账号数据" />
          <div className="grid grid-cols-2 gap-4">
            {[
              { n: sessionCount, l: "完成课次" },
              { n: recordingCount, l: "口语录音" },
              { n: evalCount, l: "AI 评估项" },
              { n: vocabCount, l: "收藏词汇" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-[1.5rem] font-medium text-ink leading-none">
                  {s.n}
                </div>
                <div className="text-[0.75rem] text-ink-soft mt-1">{s.l}</div>
              </div>
            ))}
          </div>
          <p className="text-[0.69rem] text-ink-soft/70 mt-5 leading-relaxed">
            {user
              ? "数据保存在你的云端账号，按用户 ID 隔离。"
              : "未登录时收藏仅保存在本机浏览器；登录后自动使用云端数据。"}
          </p>
        </Card>
      </section>
    </div>
  );
}
