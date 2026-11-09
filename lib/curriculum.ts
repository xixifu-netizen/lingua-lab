// Lingua Lab 内置素材库
// 统一管理"音频素材（可自动高亮）"与"视频素材（嵌入播放）"两类学习材料。
//
// 音频素材：用 <audio> 元素播放，能拿到真实播放进度 → 文稿逐句自动高亮（核心体验）。
// 视频素材：用官方 iframe 嵌入（TED / YouTube / B站），视频真实播放，
//           但嵌入播放器读不到进度 → 文稿手动点击定位（受平台限制的次优方案）。

export type MaterialKind = "audio" | "embed";

export type EmbedProvider = "ted" | "youtube" | "bilibili";

/** 文稿分段：每句带起止秒数，供播放器高亮与划词收藏 */
export interface TranscriptSegment {
  start: number; // 秒
  end?: number; // 秒（可选，用于更精确的区间高亮）
  en: string;
  zh?: string; // 中文译文（可选）
}

export interface CurriculumItem {
  id: string;
  kind: MaterialKind;
  /** 音频直链（kind === "audio" 时必填） */
  audioUrl?: string;
  /** 嵌入源（kind === "embed" 时必填） */
  provider?: EmbedProvider;
  /** 嵌入用的资源 id：TED slug / YouTube videoId / B站 BV号 */
  embedId?: string;
  title: string;
  titleZh: string;
  speaker: string;
  source: string; // 展示用来源名
  duration: string; // 展示用时长文本
  durationSec: number; // 总时长（秒），用于进度条
  difficulty: "初级" | "中级" | "中高级" | "高级";
  description: string;
  tags: string[];
  transcript: TranscriptSegment[];
  /** 核心好词（供收藏） */
  keyVocab?: { expression: string; meaning: string }[];
}

/**
 * 生成嵌入 iframe 地址
 */
export function embedUrlOf(item: CurriculumItem): string {
  if (item.provider === "ted") {
    return `https://embed.ted.com/talks/${item.embedId}`;
  }
  if (item.provider === "youtube") {
    return `https://www.youtube.com/embed/${item.embedId}`;
  }
  if (item.provider === "bilibili") {
    return `https://player.bilibili.com/player.html?bvid=${item.embedId}&high_quality=1`;
  }
  return "";
}

// ============================================================
// 内置素材库
// ============================================================

export const curriculum: CurriculumItem[] = [
  {
    id: "audio-habits",
    kind: "audio",
    audioUrl:
      "https://download.ted.com/talks/wendy_suzuki_the_brain_changing_benefits_of_exercise_2017g.mp3",
    title: "Why Habits Stick — and How to Change Them",
    titleZh: "为什么习惯会固化，以及如何改变它们",
    speaker: "示例教材 · 习惯主题",
    source: "内置听力音频",
    duration: "2:18",
    durationSec: 138,
    difficulty: "中级",
    description:
      "一段关于习惯科学的精听材料，讲解习惯回路（提示→行为→奖励）与改变习惯的实用建议。语速适中，适合精听、跟读与复述。",
    tags: ["习惯", "心理", "精听"],
    transcript: [
      { start: 0, en: "Good morning everyone. Today I want to talk about why habits stick — and more importantly, how we can change them.", zh: "大家早上好。今天我想聊聊为什么习惯会固化——以及更重要的是，我们该如何改变它们。" },
      { start: 12, en: "Here's the thing: much of our daily behavior runs on autopilot.", zh: "关键在于：我们日常行为中的很大一部分都在自动运行。" },
      { start: 21, en: "You don't decide to brush your teeth, or to check your phone the moment you wake up. It just happens.", zh: "你并不需要决定要不要刷牙，也不会在醒来那一刻刻意决定看手机。它就那么发生了。" },
      { start: 31, en: "Scientists call this the habit loop: a cue triggers a routine, and the routine delivers a reward.", zh: "科学家称之为习惯回路：一个提示触发一个行为，行为带来一个奖励。" },
      { start: 42, en: "The cue could be a time of day, a place, or even an emotion. The reward is what keeps the loop spinning.", zh: "提示可能是某个时间、某个地点，甚至某种情绪。奖励则是让这个回路持续运转的动力。" },
      { start: 53, en: "Now here's the uncomfortable truth: when motivation fades, we fall back on old routines.", zh: "这里有个让人不舒服的事实：当动力消退时，我们会退回旧的行为模式。" },
      { start: 64, en: "That's why willpower alone means fighting an uphill battle. You can't rely on it forever.", zh: "这就是为什么单靠意志力意味着要打一场艰难的仗。你无法永远依赖它。" },
      { start: 74, en: "But small wins help you build momentum. Skip the huge goal — start ridiculously small.", zh: "但微小的胜利能帮你积累势头。别设定宏大的目标——从微小到可笑的一步开始。" },
      { start: 84, en: "As a rule of thumb, make the new habit so tiny it feels almost silly.", zh: "一条经验法则是：把新习惯设得足够小，小到几乎有点可笑。" },
      { start: 93, en: "And here's my favorite idea: design your environment.", zh: "而我最喜欢的观点是：主动设计你的环境。" },
      { start: 100, en: "If you want to read more, leave a book on your desk. If you want to snack less, put the fruit where you can see it.", zh: "想多读书，就把书放在桌上。想少吃零食，就把水果放在看得见的地方。" },
      { start: 110, en: "Make the good choice the easy choice, and the bad one slightly harder.", zh: "让好的选择成为容易的选择，让坏的选择稍微难一点。" },
      { start: 118, en: "Remember — skipping one workout is a slippery slope, but one good day can be the start of something too.", zh: "记住——跳过一次锻炼是滑坡的开始，但一个好日子同样能成为某件事的开端。" },
      { start: 128, en: "So start small, design your surroundings, and let the loop work for you instead of against you.", zh: "所以，从小处着手，设计你的环境，让这个回路为你所用，而不是与你作对。" },
    ],
    keyVocab: [
      { expression: "run on autopilot", meaning: "（行为）自动化地进行，不假思索" },
      { expression: "fall back on", meaning: "转而依靠，退而求其次地使用" },
      { expression: "build momentum", meaning: "积累势头，形成惯性" },
      { expression: "rule of thumb", meaning: "经验法则，实用的粗浅准则" },
      { expression: "a slippery slope", meaning: "滑坡的开端，一发不可收拾的第一步" },
      { expression: "fight an uphill battle", meaning: "打一场艰难的仗，逆势而行" },
    ],
  },
  {
    id: "embed-procrastination",
    kind: "embed",
    provider: "ted",
    embedId: "tim_urban_inside_the_mind_of_a_master_procrastinator",
    title: "Inside the Mind of a Master Procrastinator",
    titleZh: "拖延症患者的大脑里到底在想什么",
    speaker: "Tim Urban",
    source: "TED · 官方嵌入",
    duration: "14:03",
    durationSec: 843,
    difficulty: "中级",
    description:
      "TED 最受欢迎的演讲之一。Tim Urban 用幽默的漫画讲解拖延症大脑里的「即时满足猴」与「恐慌怪兽」，语速适中、表达地道。视频真实播放，文稿可点击定位。",
    tags: ["拖延症", "TED", "幽默"],
    transcript: [
      { start: 0, en: "So in college, I was a government major, which means I had to write a lot of papers.", zh: "大学时我主修政府管理，这意味着我要写很多论文。" },
      { start: 11, en: "Now, when a normal student writes a paper, they might spread the work out a little like this.", zh: "一个正常学生写论文时，会把工作像这样稍微摊开一点。" },
      { start: 25, en: "You get started maybe a little slowly, but you get enough done in the first week.", zh: "你开始得也许有点慢，但第一周就能完成不少。" },
      { start: 34, en: "And I would want to do that. That would be the plan.", zh: "而我也想像这样。这本该是我的计划。" },
      { start: 50, en: "But then came my 90-page senior thesis, a paper you're supposed to spend a year on.", zh: "但随后迎来了我 90 页的毕业论文，一篇本该花一年去写的论文。" },
      { start: 82, en: "I wrote 90 pages over 72 hours, pulling not one but two all-nighters.", zh: "我用 72 小时写了 90 页，熬了不是一个而是两个通宵。" },
      { start: 102, en: "And they say, 'It's the best one we've ever seen.'", zh: "然后他们说：「这是我们见过最好的论文。」" },
      { start: 137, en: "It was a very, very bad thesis.", zh: "其实那是一篇非常非常糟糕的论文。" },
      { start: 155, en: "Anyway, today I'm a writer-blogger guy. I write the blog Wait But Why.", zh: "总之，如今我是个写博客的家伙。我写 Wait But Why 这个博客。" },
      { start: 185, en: "Both brains have a Rational Decision-Maker in them, but the procrastinator's brain also has an Instant Gratification Monkey.", zh: "两种大脑里都有一个「理性决策者」，但拖延者的大脑里还多了一只「即时满足猴」。" },
      { start: 245, en: "He lives entirely in the present moment. He has no memory of the past, no knowledge of the future.", zh: "它完全活在当下。它不记得过去，也不了解未来。" },
      { start: 275, en: "And he only cares about two things: easy and fun.", zh: "它只在乎两件事：轻松和好玩。" },
      { start: 320, en: "I call it the Dark Playground.", zh: "我把它称为「黑暗游乐场」。" },
      { start: 385, en: "Turns out the procrastinator has a guardian angel, someone called the Panic Monster.", zh: "原来拖延者有一个守护天使，叫作「恐慌怪兽」。" },
      { start: 440, en: "He's the only thing the Monkey is terrified of.", zh: "它是唯一能让那只猴子感到恐惧的东西。" },
    ],
    keyVocab: [
      { expression: "spread the work out", meaning: "把工作摊开来做，分散安排" },
      { expression: "pull an all-nighter", meaning: "熬通宵" },
      { expression: "take the wheel", meaning: "掌握方向盘，掌控局面" },
      { expression: "a guardian angel", meaning: "守护天使" },
    ],
  },
  {
    id: "embed-grit",
    kind: "embed",
    provider: "youtube",
    embedId: "H14bBuluwB8",
    title: "Grit: The Power of Passion and Perseverance",
    titleZh: "坚毅：热情与坚持的力量",
    speaker: "Angela Lee Duckworth",
    source: "TED · YouTube 嵌入",
    duration: "6:12",
    durationSec: 372,
    difficulty: "中级",
    description:
      "心理学家 Angela Duckworth 的经典 TED 演讲，提出「坚毅（grit）」比天赋更能预测成功。短小精悍，适合反复精听。",
    tags: ["坚毅", "成长", "TED"],
    transcript: [
      { start: 0, en: "When I was 27 years old, I left a very demanding job in management consulting.", zh: "27 岁时，我辞去了一份要求很高的管理咨询工作。" },
      { start: 18, en: "I went to teach seventh graders math in the New York City public schools.", zh: "我去纽约市的公立学校教七年级数学。" },
      { start: 34, en: "What struck me was that IQ was not the only difference between my best and my worst students.", zh: "让我震惊的是，成绩最好和最差的学生之间，差距并不仅仅是智商。" },
      { start: 58, en: "Some of my strongest performers did not have stratospheric IQ scores.", zh: "我的一些最优秀的学生，智商并不出众。" },
      { start: 72, en: "I came to the conclusion that what we need in education is a much better understanding of students and learning from a motivational perspective.", zh: "我得出结论：教育需要从动机的角度，更好地理解学生与学习。" },
      { start: 95, en: "In all those very different contexts, one characteristic emerged as a significant predictor of success. And it wasn't social intelligence. It wasn't good looks, physical health, and it wasn't IQ. It was grit.", zh: "在所有这些截然不同的情境里，有一个特质脱颖而出，成为成功的重要预测指标。不是社交智力，不是长相、健康，也不是智商。是坚毅。" },
      { start: 150, en: "Grit is passion and perseverance for very long-term goals.", zh: "坚毅是对长期目标的热情与坚持。" },
      { start: 185, en: "Grit is living life like it's a marathon, not a sprint.", zh: "坚毅是把人生当成马拉松，而不是短跑。" },
      { start: 240, en: "We need to be gritty about getting our kids grittier.", zh: "我们需要以坚毅的态度，让孩子们变得更坚毅。" },
      { start: 280, en: "So far, the best idea I've heard about building grit in kids is something called 'growth mindset.'", zh: "到目前为止，我听过培养孩子坚毅最好的办法，叫「成长型思维」。" },
    ],
    keyVocab: [
      { expression: "stratospheric", meaning: "极高的，极好的（原指平流层的）" },
      { expression: "a significant predictor of", meaning: "……的重要预测指标" },
      { expression: "a marathon, not a sprint", meaning: "马拉松而非短跑，比喻长期坚持" },
      { expression: "growth mindset", meaning: "成长型思维" },
    ],
  },
];

export const defaultMaterial = curriculum[0];
