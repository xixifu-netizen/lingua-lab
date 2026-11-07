// Lingua Lab 演示数据
// 注意：本文件所有内容均为视觉演示用的 mock 数据，
// 视频链接为占位符，接入推荐服务后替换为真实可验证链接。

export interface VocabItem {
  id: number;
  expression: string;
  meaning: string;
  sourceSentence: string;
  example: string;
  context: string;
  saved?: boolean;
}

export interface Material {
  id: number;
  title: string;
  titleZh: string;
  source: string;
  duration: string;
  difficulty: string;
  description: string;
  objective: string;
  urlNote: string;
}

export interface Mistake {
  id: number;
  category: string;
  description: string;
  count: number;
  example: string;
  correction: string;
}

export interface Feedback {
  transcript: string;
  corrected: string;
  improved: string;
  scores: { label: string; value: number }[];
  topIssues: { title: string; detail: string; example: string; fix: string }[];
  expressions: string[];
  suggestions: string[];
}

export const learner = {
  name: "Sylvia",
  level: "中级（B1+）",
  week: 12,
  weeklyTopic: "习惯的心理学",
  weeklyTopicEn: "The Psychology of Habits",
  topicIntro:
    "为什么我们明知该早起，却还是忍不住刷手机？本周通过一段关于习惯科学的演讲，学习如何描述行为模式，并讨论「如何培养一个好习惯」。",
  topicCategory: "心理与行为",
  difficulty: "中级 · 渐进提升中",
  objectives: [
    "能听懂习惯科学类演讲的主旨与关键论据",
    "掌握 6 个描述行为模式的地道表达",
    "能就「习惯养成」话题连续表达 2 分钟以上",
  ],
  sessionAStatus: "进行中 · 第 3 步",
  sessionBStatus: "未开始",
  weekProgress: 45,
};

export const primaryMaterial: Material = {
  id: 1,
  title: "Why Habits Stick — and How to Change Them",
  titleZh: "为什么习惯会固化，以及如何改变它们",
  source: "TED 演讲（演示数据）",
  duration: "11:24",
  difficulty: "中级偏易",
  description:
    "演讲者结合行为科学研究，解释习惯形成的回路（提示→行为→奖励），并给出改变习惯的可操作建议。语速适中，适合精听与复述。",
  objective: "练习抓取主旨与关键论据，学习描述行为模式的表达",
  urlNote: "视频链接将在接入推荐服务后提供，当前为占位演示",
};

export const supplementaryMaterials: Material[] = [
  {
    id: 2,
    title: "The Science of Building Good Habits",
    titleZh: "培养好习惯的科学",
    source: "BBC Ideas（演示数据）",
    duration: "4:58",
    difficulty: "中级偏易",
    description: "3 分钟科普短片，语速慢、画面辅助多，适合热身。",
    objective: "泛听热身，激活本周主题词汇",
    urlNote: "视频链接将在接入推荐服务后提供，当前为占位演示",
  },
  {
    id: 3,
    title: "Atomic Habits: Tiny Changes, Remarkable Results",
    titleZh: "《原子习惯》作者访谈",
    source: "播客访谈（演示数据）",
    duration: "18:07",
    difficulty: "中级偏难",
    description: "对话节奏快、口语化表达多，适合作为本周挑战材料。",
    objective: "挑战更快的语速与口语化表达",
    urlNote: "视频链接将在接入推荐服务后提供，当前为占位演示",
  },
];

// 视频分段文稿：每段带 start（秒）与英文原文，供播放器高亮与划词收藏使用
export interface TranscriptSegment {
  start: number; // 秒
  en: string;
}

export const videoTranscript: TranscriptSegment[] = [
  { start: 0, en: "Good morning everyone. Today I want to talk about why habits stick — and more importantly, how we can change them." },
  { start: 12, en: "Here's the thing: much of our daily behavior runs on autopilot." },
  { start: 21, en: "You don't decide to brush your teeth, or to check your phone the moment you wake up. It just happens." },
  { start: 31, en: "Scientists call this the habit loop: a cue triggers a routine, and the routine delivers a reward." },
  { start: 42, en: "The cue could be a time of day, a place, or even an emotion. The reward is what keeps the loop spinning." },
  { start: 53, en: "Now here's the uncomfortable truth: when motivation fades, we fall back on old routines." },
  { start: 64, en: "That's why willpower alone means fighting an uphill battle. You can't rely on it forever." },
  { start: 74, en: "But small wins help you build momentum. Skip the huge goal — start ridiculously small." },
  { start: 84, en: "As a rule of thumb, make the new habit so tiny it feels almost silly." },
  { start: 93, en: "And here's my favorite idea: design your environment." },
  { start: 100, en: "If you want to read more, leave a book on your desk. If you want to snack less, put the fruit where you can see it." },
  { start: 110, en: "Make the good choice the easy choice, and the bad one slightly harder." },
  { start: 118, en: "Remember — skipping one workout is a slippery slope, but one good day can be the start of something too." },
  { start: 128, en: "So start small, design your surroundings, and let the loop work for you instead of against you." },
];

export const sessionAVocab: VocabItem[] = [
  {
    id: 1,
    expression: "run on autopilot",
    meaning: "（行为）自动化地进行，不假思索",
    sourceSentence: "Much of our daily behavior runs on autopilot.",
    example: "I used to check my phone on autopilot the moment I woke up.",
    context: "描述无意识的日常行为模式",
    saved: true,
  },
  {
    id: 2,
    expression: "fall back on",
    meaning: "转而依靠，退而求其次地使用",
    sourceSentence: "When motivation fades, we fall back on old routines.",
    example: "When inspiration runs dry, I fall back on my reading list.",
    context: "谈论动力不足时的替代方案",
  },
  {
    id: 3,
    expression: "a slippery slope",
    meaning: "滑坡的开端，一发不可收拾的第一步",
    sourceSentence: "Skipping one workout is a slippery slope.",
    example: "One small lie can be a slippery slope to bigger ones.",
    context: "描述坏习惯如何逐步恶化",
  },
  {
    id: 4,
    expression: "build momentum",
    meaning: "积累势头，形成惯性",
    sourceSentence: "Small wins help you build momentum.",
    example: "Writing 200 words a day helped me build momentum for the thesis.",
    context: "谈论如何启动并维持新习惯",
    saved: true,
  },
  {
    id: 5,
    expression: "rule of thumb",
    meaning: "经验法则，实用的粗浅准则",
    sourceSentence: "As a rule of thumb, make the new habit ridiculously small.",
    example: "As a rule of thumb, never shop for groceries when hungry.",
    context: "给出实用建议时的铺垫",
  },
  {
    id: 6,
    expression: "fight an uphill battle",
    meaning: "打一场艰难的仗，逆势而行",
    sourceSentence: "Willpower alone means fighting an uphill battle.",
    example: "Learning alone without feedback is an uphill battle.",
    context: "描述做某事阻力很大",
  },
];

export const feedbackA1: Feedback = {
  transcript:
    "The video talk about why habit is important. The speaker say we are running in autopilot most of day. She give a example about she every morning drink coffee. If we want change a habit, we should start small, like make a small rule. She mention the environment is very important, if you want read more, you should put book on your desk.",
  corrected:
    "The video talks about why habits are important. The speaker says we run on autopilot for most of the day. She gives the example of drinking coffee every morning. If we want to change a habit, we should start small — for example, with a simple rule. She mentions that environment matters a lot: if you want to read more, you should put a book on your desk.",
  improved:
    "The talk explains why habits shape our lives far more than we realize. According to the speaker, most of our daily behavior runs on autopilot — she illustrates this with her own morning coffee routine. Her main advice is to start ridiculously small rather than rely on willpower, and to design your environment so the good choice becomes the easy one: leave a book on your desk, and you're far more likely to pick it up.",
  scores: [
    { label: "语法准确性", value: 62 },
    { label: "词汇与搭配", value: 70 },
    { label: "表达自然度", value: 58 },
    { label: "流利与连贯", value: 65 },
    { label: "信息组织", value: 68 },
  ],
  topIssues: [
    {
      title: "第三人称单数 consistently 缺失",
      detail:
        "talk / say / give / mention 均未加 -s。这是目前最影响听者印象的语法问题，属于中级学习者的典型高频错误，需要刻意练习。",
      example: "The speaker say → The speaker says",
      fix: "复述时刻意放慢 0.5 倍速，每句主语是第三人称单数时先在心里点一个「s」。",
    },
    {
      title: "冠词与语序：give a example、she every morning drink coffee",
      detail:
        "example 以元音开头应使用 an；时间状语 every morning 应放在动词前。这类小错误密集出现会显著降低表达的专业感。",
      example: "give a example → give an example",
      fix: "把「时间状语 + 动词」作为一个语块整体练习：I drink coffee every morning.",
    },
    {
      title: "句式单一，缺少连接词",
      detail:
        "全段由简单短句直接拼接（…we should… She mention… if you want…），没有使用 which / so that / instead 等连接手段，听起来像句子清单而非连贯的段落。",
      example: "She mention the environment is very important, if you want… → She points out that environment matters: if you want to read more, put a book where you can see it.",
      fix: "练习用 1 个观点 + 1 个具体例子 + 1 个 so that 结果的固定结构组织每段复述。",
    },
  ],
  expressions: [
    "run on autopilot — 不假思索地自动进行",
    "start ridiculously small — 从微小到可笑的一步开始",
    "design your environment — 主动设计你的环境",
    "willpower alone won't cut it — 只靠意志力行不通",
    "make the good choice the easy choice — 让好的选择成为容易的选择",
  ],
  suggestions: [
    "下次复述前，先写下 3 个关键词（autopilot / start small / environment），用它们作为句间路标，减少简单句的平铺直叙。",
    "本周跟读练习时重点模仿演讲者的「观点 + 例证」节奏（参考 Session B 第 2 步）。",
    "把「三单 -s」做成个人检查清单，录音回放时只盯这一个点听一遍。",
  ],
};

export const feedbackA2: Feedback = {
  transcript:
    "The talk is about why habits are so important. The speaker says most of our behavior runs on autopilot, and she gives an example of her morning coffee. She suggests we should start small and design our environment, so that good habits become easier.",
  corrected:
    "The talk is about why habits matter so much. The speaker says most of our behavior runs on autopilot, and she gives the example of her morning coffee. She suggests starting small and designing our environment so that good habits become the easier choice.",
  improved: "（已相当自然，建议向更高级的版本靠拢）",
  scores: [
    { label: "语法准确性", value: 78 },
    { label: "词汇与搭配", value: 76 },
    { label: "表达自然度", value: 72 },
    { label: "流利与连贯", value: 74 },
    { label: "信息组织", value: 75 },
  ],
  topIssues: [
    {
      title: "进步明显：三单 -s 基本到位",
      detail: "says / gives 均正确，仅在语速加快处遗漏一次。保持现有的刻意放慢策略。",
      example: "The speaker says… ✓",
      fix: "继续用回放自查法巩固即可。",
    },
    {
      title: "举例细节略少，信息不够饱满",
      detail:
        "第二次复述为追求流利牺牲了细节（如 the cue-routine-reward loop 未提及）。流利与信息完整需要兼顾。",
      example: "补充：…she explains the loop of cue, routine and reward.",
      fix: "下次尝试「3 个关键词 + 1 个具体细节」的结构。",
    },
    {
      title: "so that 结构首次使用，值得巩固",
      detail: "第二次尝试自然使用了 so that，说明 Session A 反馈已被吸收。",
      example: "…so that good habits become easier.",
      fix: "把 so that / which means 纳入个人表达库，有意识在讨论中使用。",
    },
  ],
  expressions: [
    "habits matter more than we realize",
    "the cue-routine-reward loop",
    "she suggests starting small",
    "design our environment",
    "the easier choice",
  ],
  suggestions: [
    "两次尝试对比：流利度 +9，语法 +16。下一次训练尝试在保持流利的同时多说 15 秒细节。",
  ],
};

export const mistakes: Mistake[] = [
  {
    id: 1,
    category: "语法 · 三单",
    description: "第三人称单数动词漏加 -s",
    count: 23,
    example: "She say → She says",
    correction: "复述自查清单第 1 条",
  },
  {
    id: 2,
    category: "搭配 · 介词",
    description: "动词与介词搭配错误",
    count: 15,
    example: "depend in → depend on",
    correction: "已安排介词搭配专项练习",
  },
  {
    id: 3,
    category: "词汇 · 重复",
    description: "过度使用 very / important / good",
    count: 18,
    example: "very important → crucial / essential",
    correction: "本周目标：用 2 个替换词",
  },
  {
    id: 4,
    category: "流利 · 填充词",
    description: "口语中 um / you know 密度偏高",
    count: 11,
    example: "um, I think um…",
    correction: "用 2 秒停顿替代填充词",
  },
  {
    id: 5,
    category: "句式 · 单一",
    description: "连续使用简单句，缺少从句连接",
    count: 14,
    example: "…and… and… so…",
    correction: "练习 which / so that 结构",
  },
];

export const trends = {
  weeks: ["W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"],
  series: [
    { label: "口语流利度", values: [58, 60, 61, 64, 63, 67, 69, 71] },
    { label: "语法准确性", values: [55, 57, 60, 59, 62, 63, 64, 70] },
    { label: "词汇多样性", values: [60, 61, 63, 62, 65, 66, 68, 69] },
    { label: "表达自然度", values: [52, 54, 55, 57, 58, 60, 62, 65] },
    { label: "听力理解", values: [62, 63, 65, 66, 68, 70, 71, 73] },
  ],
};

export const stats = {
  sessions: 23,
  speakingMin: 186,
  listeningMin: 142,
  vocab: 87,
  conversationMin: 74,
};

export const recentActivity = [
  { date: "10月29日", text: "完成 Session B：习惯养成讨论（对话 12 分钟）", tag: "会话" },
  { date: "10月26日", text: "Session A 二次尝试：语法 +16 分，流利度 +9 分", tag: "听述" },
  { date: "10月22日", text: "收藏词汇 3 个：build momentum、run on autopilot…", tag: "词汇" },
  { date: "10月19日", text: "完成 Session A：人工智能与未来工作（反馈已生成）", tag: "听述" },
];

export const highlights = [
  "连续 6 周完成双课次训练",
  "三单 -s 错误率较上月下降 41%",
  "主动使用本周新表达 5 次（目标 3 次）",
  "平均单次复述时长从 48 秒提升至 1 分 22 秒",
];

export const shadowingSentences = [
  {
    en: "Much of our daily behavior runs on autopilot.",
    zh: "我们日常行为中的大部分都在自动运行。",
    start: "00:42",
  },
  {
    en: "When motivation fades, we fall back on old routines.",
    zh: "当动力消退时，我们会退回到旧的习惯。",
    start: "01:37",
  },
  {
    en: "Skipping one workout is a slippery slope.",
    zh: "跳过一次锻炼就是滑坡的开始。",
    start: "03:05",
  },
  {
    en: "Small wins help you build momentum.",
    zh: "微小的胜利能帮你积累势头。",
    start: "05:18",
  },
  {
    en: "Willpower alone means fighting an uphill battle.",
    zh: "只靠意志力意味着要打一场艰难的仗。",
    start: "07:44",
  },
  {
    en: "Make the good choice the easy choice.",
    zh: "让好的选择成为容易的选择。",
    start: "09:56",
  },
];

export const discussionQuestions = [
  "What's one habit you tried to build but failed? Why do you think it didn't stick?",
  "Do you agree that environment matters more than willpower? Give an example from your own life.",
  "Some people say it takes 21 days to form a habit; others say 66. Does the number really matter?",
  "If you could redesign your morning routine to make one good habit effortless, what would you change?",
];

export const sessionBSummary = {
  conversation:
    "围绕「习惯养成的关键到底是意志力还是环境设计」展开。你以通勤听播客为例支持环境设计论，并补充了 small wins 的概念；被追问后承认在压力大时仍会 fall back on 旧习惯，能正确使用本周目标词汇。",
  newExpressions: [
    "It boils down to… — 归根结底是…",
    "That's easier said than done. — 说起来容易做起来难",
    "strike a balance — 取得平衡",
  ],
  repeatedMistakes: ["复述时仍遗漏 1 次三单 -s", "习惯用 very 强调，应替换为 really / incredibly"],
  improvements: ["首次主动使用 fall back on 且语境正确", "观点被挑战后能给出反例，论证能力有提升"],
  nextFocus: "下次课重点：用 which 从句扩展观点；语速稳定性（快段落不失控）。",
};

export const recordings = [
  {
    id: 1,
    topic: "习惯的心理学 · Session A",
    date: "10月26日",
    time: "20:14",
    attempts: [
      { label: "第一次 · 1分38秒", score: "综合 64（AI 评估）" },
      { label: "第二次 · 1分51秒", score: "综合 75（AI 评估）" },
    ],
  },
  {
    id: 2,
    topic: "人工智能与未来工作 · Session A",
    date: "10月19日",
    time: "19:42",
    attempts: [
      { label: "第一次 · 1分12秒", score: "综合 61（AI 评估）" },
      { label: "第二次 · 1分34秒", score: "综合 70（AI 评估）" },
    ],
  },
  {
    id: 3,
    topic: "远程办公的利与弊 · Session B",
    date: "10月15日",
    time: "20:03",
    attempts: [{ label: "独立总结 · 2分05秒", score: "综合 72（AI 评估）" }],
  },
];

export const activityTimeline = [
  {
    time: "今天 20:14",
    title: "完成 Session A · 习惯的心理学",
    detail: "二次尝试语法 +16 分，流利度 +9 分",
    tag: "听述",
  },
  {
    time: "10月26日 20:14",
    title: "录制第二次复述",
    detail: "时长 1分51秒 · 综合 75（AI 评估）",
    tag: "听述",
  },
  {
    time: "10月26日 19:58",
    title: "录制第一次复述",
    detail: "时长 1分38秒 · 综合 64（AI 评估）",
    tag: "听述",
  },
  {
    time: "10月22日 21:05",
    title: "收藏词汇 3 个",
    detail: "build momentum、run on autopilot、rule of thumb",
    tag: "词汇",
  },
  {
    time: "10月19日 19:42",
    title: "完成 Session A · 人工智能与未来工作",
    detail: "反馈已生成 · 已收藏 4 个表达",
    tag: "听述",
  },
  {
    time: "10月15日 20:03",
    title: "完成 Session B · 远程办公的利与弊",
    detail: "对话 12 分钟 · 独立总结 2分05秒",
    tag: "会话",
  },
];

export const savedVocab: VocabItem[] = sessionAVocab.filter((v) => v.saved);

export interface DiscussionTopic {
  id: string;
  title: string;
  titleEn: string;
  intro: string;
  questions: string[];
  materials: { title: string; source: string; duration: string; note: string }[];
}

export const discussionTopics: DiscussionTopic[] = [
  {
    id: "habits",
    title: "习惯的心理学",
    titleEn: "The Psychology of Habits",
    intro: "讨论习惯养成的关键，是意志力还是环境设计？",
    questions: discussionQuestions,
    materials: [
      { title: "Why Habits Stick — and How to Change Them", source: "TED", duration: "11:24", note: "本周主材料" },
      { title: "The Science of Building Good Habits", source: "BBC Ideas", duration: "4:58", note: "热身短片" },
    ],
  },
  {
    id: "ai",
    title: "人工智能与未来工作",
    titleEn: "AI and the Future of Work",
    intro: "AI 会取代工作，还是会创造新机会？聊聊你的判断。",
    questions: [
      "Which jobs do you think AI will change most in the next five years?",
      "Would you trust an AI to make important decisions for you? Why or why not?",
      "How should schools prepare students for a world with AI?",
    ],
    materials: [
      { title: "Will AI Take Your Job?", source: "DW Documentary", duration: "12:40", note: "推荐主材料" },
      { title: "How AI Actually Learns", source: "TED-Ed", duration: "5:03", note: "补充科普" },
    ],
  },
  {
    id: "remote",
    title: "远程办公的利与弊",
    titleEn: "The Pros and Cons of Remote Work",
    intro: "在家办公更自由，还是更孤独？分享你的真实体验。",
    questions: [
      "Has remote work made you more or less productive? Give a concrete example.",
      "What do we lose when we stop seeing colleagues face to face?",
      "If you could design your ideal work setup, what would it look like?",
    ],
    materials: [
      { title: "The Future of Work Is Hybrid", source: "BBC", duration: "9:18", note: "推荐主材料" },
      { title: "Loneliness in the Remote Office", source: "TED", duration: "8:05", note: "补充视角" },
    ],
  },
  {
    id: "climate",
    title: "气候变化与个人行动",
    titleEn: "Climate Change and Individual Action",
    intro: "个人的小行动，真的能改变气候问题吗？",
    questions: [
      "Do individual actions like recycling really matter, or is it just corporate PR?",
      "What's one change you'd be willing to make in your daily life for the environment?",
      "Should governments force people to live more sustainably?",
    ],
    materials: [
      { title: "Why Individual Action Still Counts", source: "TED", duration: "10:12", note: "推荐主材料" },
      { title: "The Carbon Footprint Myth", source: "DW", duration: "7:45", note: "反面视角" },
    ],
  },
];

export const shadowingPrompts: string[] = [
  "It boils down to… — 归根结底是…",
  "That's easier said than done. — 说起来容易做起来难",
  "strike a balance — 取得平衡",
  "run on autopilot — 不假思索地自动进行",
  "fall back on — 转而依靠",
  "build momentum — 积累势头",
];

// 艾宾浩斯记忆曲线：横轴为复习间隔（天），纵轴为记忆保持率（%）
export const ebbinghausCurve = [
  { label: "当天", retention: 100 },
  { label: "1天后", retention: 44 },
  { label: "2天后", retention: 36 },
  { label: "4天后", retention: 33 },
  { label: "7天后", retention: 28 },
  { label: "15天后", retention: 25 },
  { label: "30天后", retention: 21 },
];

// 待复习词汇（按艾宾浩斯复习节点推送）
export const reviewQueue = [
  {
    id: 1,
    expression: "run on autopilot",
    meaning: "（行为）自动化地进行，不假思索",
    due: "今天",
    box: 2,
    example: "I used to check my phone on autopilot the moment I woke up.",
  },
  {
    id: 2,
    expression: "build momentum",
    meaning: "积累势头，形成惯性",
    due: "今天",
    box: 2,
    example: "Writing 200 words a day helped me build momentum for the thesis.",
  },
  {
    id: 3,
    expression: "a slippery slope",
    meaning: "滑坡的开端，一发不可收拾的第一步",
    due: "今天",
    box: 1,
    example: "One small lie can be a slippery slope to bigger ones.",
  },
  {
    id: 4,
    expression: "fall back on",
    meaning: "转而依靠，退而求其次地使用",
    due: "明天",
    box: 3,
    example: "When inspiration runs dry, I fall back on my reading list.",
  },
  {
    id: 5,
    expression: "rule of thumb",
    meaning: "经验法则，实用的粗浅准则",
    due: "3天后",
    box: 3,
    example: "As a rule of thumb, never shop for groceries when hungry.",
  },
];

// 记忆曲线回顾统计（每周复习量）
export const memoryStats = {
  mastered: 41,
  reviewing: 23,
  new: 12,
  weeklyReview: [6, 9, 8, 12, 11, 14, 16],
};
