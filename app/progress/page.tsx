import { Badge, Card, SectionTitle } from "@/components/ui";
import { trends, stats, recordings } from "@/lib/mock-data";

function Sparkline({ values }: { values: number[] }) {
  const w = 220;
  const h = 48;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (w - 8) + 4;
      const y = h - 6 - ((v - min) / span) * (h - 14);
      return `${x},${y}`;
    })
    .join(" ");
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
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * (w - 8) + 4;
        const y = h - 6 - ((v - min) / span) * (h - 14);
        return <circle key={i} cx={x} cy={y} r="2" fill="#BD896F" />;
      })}
    </svg>
  );
}

export default function ProgressPage() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-[1.38rem] font-medium text-ink">学习进度</h1>
        <p className="text-[0.81rem] text-ink-soft mt-1">
          趋势数据来自历次 AI 评估（标注为 AI 评估，非客观测量）
        </p>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { n: stats.sessions, l: "完成课次" },
          { n: `${stats.speakingMin}′`, l: "口语时长" },
          { n: `${stats.listeningMin}′`, l: "听力时长" },
          { n: stats.vocab, l: "收藏词汇" },
          { n: `${stats.conversationMin}′`, l: "对话时长" },
        ].map((s) => (
          <Card key={s.l} className="p-4">
            <div className="text-[1.5rem] font-medium text-ink leading-none">
              {s.n}
            </div>
            <div className="text-[0.75rem] text-ink-soft mt-1.5">{s.l}</div>
          </Card>
        ))}
      </section>

      <section>
        <SectionTitle
          title="能力趋势 · 近 8 周"
          sub="AI 评估 · 仅供自我参照"
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trends.series.map((s) => (
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
                <span>{trends.weeks[0]}</span>
                <span>{trends.weeks[trends.weeks.length - 1]}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <Card>
          <SectionTitle title="历史录音" sub="支持回放与两次尝试对比" />
          <ul className="space-y-4">
            {recordings.map((r) => (
              <li key={r.id} className="rounded-xl border border-line bg-white/80 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[0.81rem] font-medium text-ink">{r.topic}</h3>
                  <span className="text-[0.69rem] text-ink-soft">{r.date}</span>
                </div>
                <ul className="mt-2.5 space-y-1.5">
                  {r.attempts.map((a) => (
                    <li
                      key={a.label}
                      className="flex items-center justify-between text-[0.75rem] text-ink-soft"
                    >
                      <span>{a.label}</span>
                      <span className="text-ink">{a.score}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-3 text-[0.75rem] text-sage-deep underline underline-offset-2 hover:text-sage">
                  回放录音（接入存储后可用）
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <SectionTitle title="本周学习周报" sub="10月20日 – 10月26日 · 演示数据" />
          <div className="space-y-3 text-[0.81rem] leading-relaxed text-ink-soft">
            <p>
              本周完成 2 次课次，口语练习 38 分钟，听力 26 分钟。两次尝试对比显示：
              语法准确性平均提升 <span className="text-sage-deep font-medium">+12</span>，
              说明「先反馈后重录」的闭环对你有效。
            </p>
            <p>
              高频错误方面，三单 -s 的出现次数从每周 6 次降至 3 次；但「句式单一」问题仍在，
              已在 Session B 中安排 which / so that 结构练习。
            </p>
            <p>
              下周建议：挑战一档更高难度的材料（中级偏难），并把复述时长目标提到 2 分钟。
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>坚持训练 · 第 6 周</Badge>
            <Badge tone="clay">三单错误 -41%</Badge>
            <Badge>词汇 +12</Badge>
          </div>
        </Card>
      </section>
    </div>
  );
}
