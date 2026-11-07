import Link from "next/link";
import { Badge, Card, ProgressBar, SectionTitle } from "@/components/ui";
import VocabReview from "@/components/VocabReview";
import {
  learner,
  primaryMaterial,
  supplementaryMaterials,
  recentActivity,
  highlights,
  stats,
} from "@/lib/mock-data";

export default function Home() {
  return (
    <div className="space-y-10">
      {/* 欢迎 + 主行动 */}
      <section className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
        <div>
          <p className="text-[0.81rem] text-ink-soft">下午好，{learner.name}</p>
          <h1 className="text-[1.38rem] font-medium text-ink mt-1">
            今天是本周第 2 次训练日
          </h1>
          <p className="text-[0.81rem] text-ink-soft mt-2 max-w-md leading-relaxed">
            本周主题「{learner.weeklyTopic}」· Session A 进行到一半，
            继续完成它，然后就能解锁 Session B 的讨论练习。
          </p>
        </div>
        <Link
          href="/studio/session-a"
          className="shrink-0 inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-sage text-cream text-[0.94rem] font-medium hover:bg-sage-deep transition-colors"
        >
          开始今天的训练 →
        </Link>
      </section>

      {/* 本周主题 + 进度 */}
      <section className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <SectionTitle
            title={`本周主题 · ${learner.weeklyTopic}`}
            sub={`${learner.weeklyTopicEn} · ${learner.topicCategory} · ${learner.difficulty}`}
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
          <SectionTitle title="本周完成度" />
          <div className="text-[2rem] font-medium text-ink leading-none">
            {learner.weekProgress}
            <span className="text-[0.88rem] text-ink-soft">%</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={learner.weekProgress} />
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-[0.81rem]">
              <span className="text-ink-soft">Session A · 听述训练</span>
              <Badge tone="clay">{learner.sessionAStatus}</Badge>
            </div>
            <div className="flex items-center justify-between text-[0.81rem]">
              <span className="text-ink-soft">Session B · 讨论应用</span>
              <Badge tone="gray">{learner.sessionBStatus}</Badge>
            </div>
          </div>
        </Card>
      </section>

      {/* 推荐材料 */}
      <section>
        <SectionTitle
          title="推荐学习材料"
          sub="根据你的水平、兴趣与本周主题推荐"
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

      {/* 词汇复习 · 艾宾浩斯 + 闪卡 */}
      <VocabReview />

      {/* 最近动态 + 进步亮点 + 累计数据 */}
      <section className="grid md:grid-cols-3 gap-4">
        <Card>
          <SectionTitle title="最近学习动态" />
          <ul className="space-y-4">
            {recentActivity.map((a) => (
              <li key={a.text} className="text-[0.81rem]">
                <div className="flex items-center justify-between">
                  <span className="text-[0.69rem] text-ink-soft">{a.date}</span>
                  <Badge tone="gray">{a.tag}</Badge>
                </div>
                <p className="mt-1 leading-relaxed">{a.text}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <SectionTitle title="个人进步亮点" />
          <ul className="space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex gap-2.5 text-[0.81rem] leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-clay shrink-0" />
                {h}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <SectionTitle title="累计学习" />
          <div className="grid grid-cols-2 gap-4">
            {[
              { n: stats.sessions, l: "完成课次" },
              { n: `${stats.speakingMin}′`, l: "口语时长" },
              { n: `${stats.listeningMin}′`, l: "听力时长" },
              { n: stats.vocab, l: "收藏词汇" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-[1.5rem] font-medium text-ink leading-none">
                  {s.n}
                </div>
                <div className="text-[0.75rem] text-ink-soft mt-1">{s.l}</div>
              </div>
            ))}
          </div>
          <p className="text-[0.69rem] text-ink-soft/70 mt-5">
            全部指标由系统记录；能力评分为 AI 评估，非客观测量。
          </p>
        </Card>
      </section>
    </div>
  );
}
