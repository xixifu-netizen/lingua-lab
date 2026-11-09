// Lingua Lab 内置素材库
// 统一管理"音频素材（可自动高亮）"与"视频素材（嵌入播放）"两类学习材料。
//
// 音频素材：用 <audio> 元素播放，能拿到真实播放进度 → 文稿逐句自动高亮（核心体验）。
// 视频素材：用官方 iframe 嵌入（TED / YouTube / B站），视频真实播放，
//           但嵌入播放器读不到进度 → 文稿手动点击定位（受平台限制的次优方案）。

export type MaterialKind = "audio" | "embed";

export type EmbedProvider = "ted" | "youtube" | "bilibili";

/** 难度等级（数值，供推荐引擎匹配用户水平） */
export type DifficultyLevel = "初级" | "中级" | "中高级" | "高级";

/** 水平→难度数值映射（用户 profile.level 与素材 difficulty 对齐） */
export const LEVEL_RANK: Record<string, number> = {
  初级: 1,
  "初级（A1/A2）": 1,
  中级: 2,
  "中级（B1+）": 2,
  中高级: 3,
  "中高级（B2）": 3,
  高级: 4,
  "高级（C1+）": 4,
};

/** 固定兴趣主题分类（供用户在账号里勾选，推荐引擎按标签匹配） */
export const INTEREST_CATEGORIES = [
  { id: "tech", label: "科技", en: "Technology" },
  { id: "psychology", label: "心理", en: "Psychology" },
  { id: "career", label: "职场", en: "Career" },
  { id: "health", label: "健康", en: "Health" },
  { id: "travel", label: "旅行", en: "Travel" },
  { id: "culture", label: "文化", en: "Culture" },
  { id: "environment", label: "环境", en: "Environment" },
  { id: "education", label: "教育", en: "Education" },
  { id: "business", label: "商业", en: "Business" },
  { id: "science", label: "科学", en: "Science" },
] as const;

export type InterestId = (typeof INTEREST_CATEGORIES)[number]["id"];

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
  difficulty: DifficultyLevel;
  description: string;
  /** 兴趣标签（对应 INTEREST_CATEGORIES 的 id） */
  tags: InterestId[];
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

/** 根据 tag id 取中文标签名 */
export function tagLabel(id: string): string {
  return INTEREST_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

// ============================================================
// 内置素材库
// ============================================================

export const curriculum: CurriculumItem[] = [
  // ---------- 音频（可自动高亮） ----------
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
    tags: ["psychology", "health"],
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

  // ---------- 视频嵌入（点击定位） ----------
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
    tags: ["psychology"],
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
    tags: ["education", "psychology"],
    transcript: [
      { start: 0, en: "When I was 27 years old, I left a very demanding job in management consulting.", zh: "27 岁时，我辞去了一份要求很高的管理咨询工作。" },
      { start: 18, en: "I went to teach seventh graders math in the New York City public schools.", zh: "我去纽约市的公立学校教七年级数学。" },
      { start: 34, en: "What struck me was that IQ was not the only difference between my best and my worst students.", zh: "让我震惊的是，成绩最好和最差的学生之间，差距并不仅仅是智商。" },
      { start: 58, en: "Some of my strongest performers did not have stratospheric IQ scores.", zh: "我的一些最优秀的学生，智商并不出众。" },
      { start: 72, en: "I came to the conclusion that what we need in education is a much better understanding of students and learning from a motivational perspective.", zh: "我得出结论：教育需要从动机的角度，更好地理解学生与学习。" },
      { start: 95, en: "In all those very different contexts, one characteristic emerged as a significant predictor of success. It was grit.", zh: "在所有这些截然不同的情境里，有一个特质脱颖而出，成为成功的重要预测指标。是坚毅。" },
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
  {
    id: "embed-growth-mindset",
    kind: "embed",
    provider: "ted",
    embedId: "carol_dweck_the_power_of_believing_that_you_can_improve",
    title: "The Power of Believing That You Can Improve",
    titleZh: "相信你能进步的力量",
    speaker: "Carol Dweck",
    source: "TED · 官方嵌入",
    duration: "10:24",
    durationSec: 624,
    difficulty: "中高级",
    description:
      "斯坦福心理学家 Carol Dweck 提出「成长型思维」概念，讲述 not yet（尚未）一词如何改变孩子的学习心态。学术词汇较丰富，适合中高级精听。",
    tags: ["education", "psychology"],
    transcript: [
      { start: 0, en: "The power of yet.", zh: "「尚未」的力量。" },
      { start: 10, en: "I heard about a high school in Chicago where students had to pass a certain number of courses to graduate.", zh: "我听说芝加哥有一所高中，学生必须通过一定数量的课程才能毕业。" },
      { start: 30, en: "And if they didn't pass a course, they got the grade 'Not Yet.'", zh: "如果他们没有通过某门课，成绩会标为「尚未通过」。" },
      { start: 45, en: "And I thought that was fantastic, because if you get a failing grade, you think, I'm nothing, I'm nowhere.", zh: "我觉得这太棒了，因为如果拿到不及格，你会想：我什么都不是，我一无是处。" },
      { start: 60, en: "But if you get the grade 'Not Yet,' you understand that you're on a learning curve.", zh: "但如果成绩是「尚未」，你就会明白自己正处在一条学习曲线上。" },
      { start: 80, en: "So let's talk about what we found when we looked at the mindsets of students.", zh: "那么，让我们谈谈研究学生思维模式时的发现。" },
      { start: 110, en: "Some students have a fixed mindset, and some have a growth mindset.", zh: "有些学生是固定型思维，有些是成长型思维。" },
      { start: 150, en: "Students with a growth mindset believe their abilities can be developed.", zh: "成长型思维的学生相信自己的能力可以发展。" },
    ],
    keyVocab: [
      { expression: "the power of yet", meaning: "「尚未」的力量（成长型思维的标志）" },
      { expression: "on a learning curve", meaning: "处在学习曲线上，正在进步中" },
      { expression: "a fixed mindset", meaning: "固定型思维" },
      { expression: "a growth mindset", meaning: "成长型思维" },
    ],
  },
  {
    id: "embed-vulnerability",
    kind: "embed",
    provider: "ted",
    embedId: "brene_brown_the_power_of_vulnerability",
    title: "The Power of Vulnerability",
    titleZh: "脆弱的力量",
    speaker: "Brené Brown",
    source: "TED · 官方嵌入",
    duration: "20:19",
    durationSec: 1219,
    difficulty: "高级",
    description:
      "全球观看量最高的 TED 演讲之一。Brené Brown 用讲故事的方式探讨脆弱、勇气与连接，语速快、情感丰富，适合高阶挑战。",
    tags: ["psychology", "culture"],
    transcript: [
      { start: 0, en: "So, I'll start with this: a couple years ago, an event planner called me because I was going to do a speaking event.", zh: "我先从这个说起：几年前，一位活动策划人打电话给我，因为我要去做一场演讲。" },
      { start: 20, en: "And she said, 'I'm really struggling with how to write about you on the little flyer.'", zh: "她说：「我实在不知道该怎么在小传单上介绍你。」" },
      { start: 40, en: "And I thought, 'Well, what's the struggle?'", zh: "我想：「有什么好纠结的？」" },
      { start: 55, en: "And she said, 'Well, I saw you speak, and I'm going to call you a researcher, but I'm afraid if I call you a researcher, no one will come.'", zh: "她说：「我看过你的演讲，想称你为研究者，但怕这么写没人会来。」" },
      { start: 80, en: "Okay. And I was like, 'Huh.'", zh: "好吧。我当时心想：「哦。」" },
      { start: 100, en: "And she said, 'But the thing I liked about your talk is you're a storyteller.'", zh: "她说：「但我喜欢你演讲的一点是，你是个讲故事的人。」" },
      { start: 130, en: "I'm a researcher, but I've come to this conclusion: stories are data with a soul.", zh: "我是个研究者，但我得出一个结论：故事是带着灵魂的数据。" },
      { start: 180, en: "And connection is why we're here.", zh: "而连接，是我们存在于此的原因。" },
      { start: 220, en: "My research turned into one thing: vulnerability is not weakness; it's our greatest measure of courage.", zh: "我的研究归结为一点：脆弱不是软弱，而是我们衡量勇气最伟大的标尺。" },
    ],
    keyVocab: [
      { expression: "stories are data with a soul", meaning: "故事是带着灵魂的数据" },
      { expression: "a measure of courage", meaning: "勇气的衡量标尺" },
      { expression: "connection", meaning: "连接，人际联结" },
    ],
  },
  {
    id: "embed-sinek",
    kind: "embed",
    provider: "youtube",
    embedId: "qp0HIF3SfI4",
    title: "How Great Leaders Inspire Action",
    titleZh: "伟大的领袖如何激励行动",
    speaker: "Simon Sinek",
    source: "TED · YouTube 嵌入",
    duration: "18:05",
    durationSec: 1085,
    difficulty: "中高级",
    description:
      "Simon Sinek 的经典演讲，提出「黄金圈」模型（Why-How-What），解释苹果、马丁·路德·金为何能激励人心。商业词汇丰富。",
    tags: ["business", "career"],
    transcript: [
      { start: 0, en: "How do you explain when things don't go as we assume?", zh: "当事与愿违时，你该如何解释？" },
      { start: 12, en: "How do you explain when others are able to achieve things that seem to defy all of the assumptions?", zh: "当别人达成了看似违背所有假设的成就，你又该如何解释？" },
      { start: 30, en: "As it turns out, there's a pattern. As it turns out, all the great and inspiring leaders and organizations think, act and communicate in the exact same way.", zh: "事实证明，是有规律的。所有伟大的、激励人心的领袖和组织，思考、行动、沟通的方式如出一辙。" },
      { start: 60, en: "And it's the complete opposite to everyone else. All I did was codify it.", zh: "而这与其他人截然相反。我做的只是把它整理成体系。" },
      { start: 85, en: "And it's probably the world's simplest idea. I call it the golden circle.", zh: "这大概是世上最简单的理念。我称之为「黄金圈」。" },
      { start: 110, en: "People don't buy what you do; they buy why you do it.", zh: "人们买的不是你的产品，而是你做这件事的「为什么」。" },
      { start: 150, en: "The goal is not to do business with everybody who needs what you have. The goal is to do business with people who believe what you believe.", zh: "目标不是和所有需要你产品的人做生意，而是和认同你信念的人做生意。" },
      { start: 200, en: "Martin Luther King gave the 'I have a dream' speech, not the 'I have a plan' speech.", zh: "马丁·路德·金发表的是「我有一个梦想」的演讲，而不是「我有一个计划」的演讲。" },
    ],
    keyVocab: [
      { expression: "the golden circle", meaning: "黄金圈（Why-How-What 模型）" },
      { expression: "defy all the assumptions", meaning: "违背所有假设" },
      { expression: "codify", meaning: "把……整理成体系、规范化" },
    ],
  },
  {
    id: "embed-ai-jobs",
    kind: "embed",
    provider: "ted",
    embedId: "andrew_ng_how_ai_could_empower_any_business",
    title: "How AI Could Empower Any Business",
    titleZh: "AI 如何赋能任何行业",
    speaker: "Andrew Ng",
    source: "TED · 官方嵌入",
    duration: "11:38",
    durationSec: 698,
    difficulty: "中高级",
    description:
      "AI 领域领军人物吴恩达讲解 AI 如何走出科技巨头、普惠各行各业。科技词汇与商业视角结合，适合关注 AI 的学习者。",
    tags: ["tech", "business"],
    transcript: [
      { start: 0, en: "When I think about the rise of AI, I'm reminded by the rise of literacy.", zh: "当我思考人工智能的崛起，我想到了读写能力的普及。" },
      { start: 18, en: "Hundreds of years ago, society figured out that we could build a civilization if everyone could read and write.", zh: "几百年前，社会意识到：如果人人都能读写，我们就能构建文明。" },
      { start: 40, en: "AI is today's electricity and today's literacy rolled into one.", zh: "AI 是今天的电力与今天的读写能力的结合体。" },
      { start: 70, en: "But today, AI is still largely in the hands of the big tech companies.", zh: "但今天，AI 很大程度上仍掌握在科技巨头手中。" },
      { start: 100, en: "I think the best way to democratize AI is to make it accessible to everyone, including small businesses and individuals.", zh: "我认为普及 AI 最好的方式，是让每个人都能用上它，包括小企业和个人。" },
      { start: 140, en: "Rather than needing deep technical knowledge, what most projects need is data and a clear business problem.", zh: "大多数项目需要的不是高深的技术知识，而是数据和清晰的业务问题。" },
    ],
    keyVocab: [
      { expression: "the rise of literacy", meaning: "读写能力的普及" },
      { expression: "democratize AI", meaning: "让 AI 普及化、普惠化" },
      { expression: "in the hands of", meaning: "掌握在……手中" },
    ],
  },
  {
    id: "embed-climate",
    kind: "embed",
    provider: "ted",
    embedId: "greta_thunberg_the_disarming_case_to_act_right_now_on_climate_change",
    title: "The Disarming Case to Act Right Now on Climate Change",
    titleZh: "现在就应对气候变化，这个理由不容置疑",
    speaker: "Greta Thunberg",
    source: "TED · 官方嵌入",
    duration: "11:05",
    durationSec: 665,
    difficulty: "中级",
    description:
      "气候活动家 Greta Thunberg 的 TED 演讲，语言简洁有力、重复修辞多，适合练习抓主旨与跟读。",
    tags: ["environment"],
    transcript: [
      { start: 0, en: "When I was about eight years old, I first heard about something called climate change.", zh: "大概八岁时，我第一次听说「气候变化」这个词。" },
      { start: 15, en: "It seemed too difficult to understand, so I couldn't let it go.", zh: "它似乎太难理解了，所以我无法把它放下。" },
      { start: 30, en: "The climate crisis has already been solved. We already have all the facts and solutions.", zh: "气候危机其实已经有解了。事实和解决方案我们都已经有了。" },
      { start: 50, en: "All we have to do is to wake up and change.", zh: "我们要做的，只是清醒过来并做出改变。" },
      { start: 70, en: "We cannot solve a crisis without treating it as a crisis.", zh: "如果不把它当作危机来对待，我们就无法解决这场危机。" },
    ],
    keyVocab: [
      { expression: "couldn't let it go", meaning: "无法放下、无法释怀" },
      { expression: "treat it as a crisis", meaning: "把它当作危机来对待" },
    ],
  },
  {
    id: "embed-sleep",
    kind: "embed",
    provider: "ted",
    embedId: "matt_walker_sleep_is_your_superpower",
    title: "Sleep Is Your Superpower",
    titleZh: "睡眠是你的超能力",
    speaker: "Matt Walker",
    source: "TED · 官方嵌入",
    duration: "19:16",
    durationSec: 1156,
    difficulty: "中高级",
    description:
      "睡眠科学家 Matt Walker 讲解睡眠对大脑、免疫、学习记忆的巨大影响。科普词汇扎实，适合健康主题精听。",
    tags: ["health", "science"],
    transcript: [
      { start: 0, en: "Thank you very much. Well, I would like to start with a test.", zh: "非常感谢。我想先从一个测试开始。" },
      { start: 12, en: "I'm going to read you a few sentences, and I want you to tell me if they're true or false.", zh: "我来读几个句子，请你判断对错。" },
      { start: 30, en: "The shorter your sleep, the shorter your life.", zh: "睡眠越短，寿命越短。" },
      { start: 50, en: "Sleep is not an optional lifestyle luxury. Sleep is a non-negotiable biological necessity.", zh: "睡眠不是可选的奢侈生活方式，而是不容妥协的生理必需。" },
      { start: 80, en: "And it is your life support system, and it is Mother Nature's best effort yet at immortality.", zh: "它是你的生命维持系统，是大自然迄今为「永生」所做的最好努力。" },
    ],
    keyVocab: [
      { expression: "non-negotiable", meaning: "不容妥协的" },
      { expression: "a biological necessity", meaning: "生理必需" },
      { expression: "life support system", meaning: "生命维持系统" },
    ],
  },
  {
    id: "embed-happiness",
    kind: "embed",
    provider: "ted",
    embedId: "robert_waldinger_what_makes_a_good_life_lessons_from_the_longest_study_on_happiness",
    title: "What Makes a Good Life?",
    titleZh: "什么样的人生才算幸福？",
    speaker: "Robert Waldinger",
    source: "TED · 官方嵌入",
    duration: "12:46",
    durationSec: 766,
    difficulty: "中级",
    description:
      "哈佛长达 75 年的幸福研究负责人分享结论：良好的人际关系是幸福与健康的关键。温暖治愈，适合精听与讨论。",
    tags: ["psychology", "health"],
    transcript: [
      { start: 0, en: "What keeps us healthy and happy as we go through life?", zh: "是什么让我们在一生中保持健康和幸福？" },
      { start: 12, en: "If you were going to invest now in your future best self, where would you put your time and your energy?", zh: "如果现在要为未来最好的自己投资，你会把时间和精力放在哪里？" },
      { start: 35, en: "We followed 724 men for 75 years, year after year, asking about their work, their home lives, and their health.", zh: "我们追踪了 724 个人长达 75 年，年复一年地询问他们的工作、家庭生活和健康。" },
      { start: 70, en: "The clearest message that we get from this 75-year study is this: good relationships keep us happier and healthier. Period.", zh: "这项 75 年研究传递的最清晰信息是：良好的人际关系让我们更快乐、更健康。就这么简单。" },
      { start: 110, en: "Loneliness kills. It's as powerful as smoking or alcoholism.", zh: "孤独会致命。它的威力堪比吸烟或酗酒。" },
    ],
    keyVocab: [
      { expression: "invest in your future self", meaning: "为未来的自己投资" },
      { expression: "period", meaning: "（口语）就这样，没什么可说的" },
      { expression: "loneliness kills", meaning: "孤独致命" },
    ],
  },
  {
    id: "embed-learning",
    kind: "embed",
    provider: "youtube",
    embedId: "JsC9ZHi79jo",
    title: "The First 20 Hours — How to Learn Anything",
    titleZh: "前 20 小时——如何快速学会任何技能",
    speaker: "Josh Kaufman",
    source: "TEDx · YouTube 嵌入",
    duration: "19:27",
    durationSec: 1167,
    difficulty: "中级",
    description:
      "畅销书作者 Josh Kaufman 分享「20 小时学会任何技能」的方法，语言清晰、条理分明，非常适合学习「学习方法」主题。",
    tags: ["education", "psychology"],
    transcript: [
      { start: 0, en: "Hi everyone. Two years ago, my life changed forever.", zh: "大家好。两年前，我的生活永远改变了。" },
      { start: 10, en: "My wife Kelsey and I welcomed our daughter Lela into the world.", zh: "我和妻子凯尔西迎来了我们的女儿莱拉。" },
      { start: 25, en: "So, I'm a huge fan of the 10,000 hour rule, but I realized something: 10,000 hours is a full-time job for five years.", zh: "我是「一万小时定律」的铁杆粉丝，但我意识到：一万小时相当于五年的全职工作。" },
      { start: 55, en: "What if you could learn a new skill in 20 hours? Not become an expert, but get good enough.", zh: "如果你能在 20 小时内学会一项新技能呢？不是成为专家，而是足够好。" },
      { start: 85, en: "The major barrier to skill acquisition isn't intellectual, it's emotional.", zh: "技能习得的主要障碍不是智力，而是情绪。" },
    ],
    keyVocab: [
      { expression: "the 10,000 hour rule", meaning: "一万小时定律" },
      { expression: "get good enough", meaning: "达到足够好的程度" },
      { expression: "skill acquisition", meaning: "技能习得" },
    ],
  },
  {
    id: "embed-ocean",
    kind: "embed",
    provider: "ted",
    embedId: "sylvia_earle_my_wish_protect_our_oceans",
    title: "My Wish: Protect Our Oceans",
    titleZh: "我的心愿：保护我们的海洋",
    speaker: "Sylvia Earle",
    source: "TED · 官方嵌入",
    duration: "18:12",
    durationSec: 1092,
    difficulty: "中高级",
    description:
      "海洋学家 Sylvia Earle 呼吁保护海洋生态，科学术语与环保热情交织，适合环境主题的精听与观点表达练习。",
    tags: ["environment", "science"],
    transcript: [
      { start: 0, en: "Fifty years ago, when I began exploring the ocean, no one imagined that we could do anything to harm the ocean.", zh: "五十年前，当我开始探索海洋时，没人能想象我们会伤害海洋。" },
      { start: 20, en: "We thought the ocean was too big to be damaged.", zh: "我们以为海洋大到不可能被破坏。" },
      { start: 40, en: "But now we know that the ocean is in serious trouble.", zh: "但如今我们知道，海洋正处于严重的困境。" },
      { start: 60, en: "No water, no life. No blue, no green.", zh: "没有水，就没有生命。没有蓝色，就没有绿色。" },
      { start: 90, en: "The ocean drives climate and weather, and it is the blue heart of the planet.", zh: "海洋驱动着气候与天气，它是这颗星球的蓝色心脏。" },
    ],
    keyVocab: [
      { expression: "the blue heart of the planet", meaning: "这颗星球的蓝色心脏" },
      { expression: "in serious trouble", meaning: "处于严重困境" },
    ],
  },
];

export const defaultMaterial = curriculum[0];
