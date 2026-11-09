// 智能推荐引擎
// 根据用户水平（profile.level）和兴趣（profile.interests）对素材打分排序。
// 已学过的素材降权，优先推荐既匹配水平、又命中兴趣的素材。
//
// 「流动」机制：素材按板块（演讲/生活场景对话/其他）分组，每个板块维护
// 一个"当前展示列表"，练完一个会从未展示的池子里补入新的同类素材。

import {
  CATEGORIES,
  curriculum,
  LEVEL_RANK,
  VISIBLE_PER_CATEGORY,
  type CurriculumItem,
  type InterestId,
  type MaterialCategory,
} from "@/lib/curriculum";

export interface UserProfile {
  level?: string; // 如 "中级（B1+）"
  interests?: string[]; // 兴趣标签 id 数组
}

export interface RecommendOptions {
  profile?: UserProfile | null;
  /** 已学过的素材 id 列表（用于降权，避免重复） */
  completedIds?: string[];
  /** 是否已登录（未登录时按默认水平推荐） */
  isLoggedIn?: boolean;
}

/** 推荐结果：素材 + 分数 + 理由 */
export interface RecommendResult {
  item: CurriculumItem;
  score: number;
  reasons: string[];
}

/**
 * 核心推荐逻辑：难度匹配分 + 兴趣匹配分 - 已学过惩罚
 */
export function recommend(options: RecommendOptions = {}): RecommendResult[] {
  const { profile, completedIds = [], isLoggedIn = false } = options;

  const userRank = LEVEL_RANK[profile?.level ?? "中级（B1+）"] ?? 2;
  const interests = new Set<string>(profile?.interests ?? []);

  const results = curriculum.map((item) => {
    const itemRank = LEVEL_RANK[item.difficulty] ?? 2;

    // 难度匹配：与用户水平差距越小分越高；略高于水平的"挑战"素材给少量加分
    const diff = Math.abs(itemRank - userRank);
    let levelScore = 0;
    if (diff === 0) levelScore = 50;
    else if (diff === 1) levelScore = itemRank > userRank ? 28 : 24; // 稍难是挑战，稍易是巩固
    else levelScore = 8;

    // 兴趣匹配：命中兴趣标签，每个 +15
    const hitTags = item.tags.filter((t) => interests.has(t));
    const interestScore = hitTags.length * 15;

    // 已学过：降权（但不完全排除，用户可能想复习）
    const donePenalty = completedIds.includes(item.id) ? -60 : 0;

    const score = levelScore + interestScore + donePenalty;

    // 生成推荐理由
    const reasons: string[] = [];
    if (diff === 0) reasons.push("匹配当前水平");
    else if (diff === 1 && itemRank > userRank) reasons.push("略高于当前水平，适合挑战");
    else if (diff === 1) reasons.push("略低于当前水平，适合巩固");
    if (hitTags.length > 0) reasons.push(`命中兴趣「${hitTags.join("、")}」`);
    if (completedIds.includes(item.id)) reasons.push("已学过，可复习");

    return { item, score, reasons };
  });

  // 按分数降序；分数相同按难度接近优先
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const ar = LEVEL_RANK[a.item.difficulty] ?? 2;
    const br = LEVEL_RANK[b.item.difficulty] ?? 2;
    return Math.abs(ar - userRank) - Math.abs(br - userRank);
  });

  return results;
}

/**
 * 生成推荐排序后的素材列表（供播放器素材库直接渲染）
 */
export function recommendedCurriculum(options: RecommendOptions = {}): CurriculumItem[] {
  return recommend(options).map((r) => r.item);
}

/**
 * 获取某个素材的推荐理由（供 UI 展示）
 */
export function reasonFor(itemId: string, options: RecommendOptions = {}): string {
  const r = recommend(options).find((x) => x.item.id === itemId);
  return r?.reasons.join(" · ") ?? "";
}

/**
 * 按板块分组的展示列表。
 * 每个板块取排序后的前 N 个"未学过"的素材；若不足 N，则用已学过的补齐。
 * 这样练完一个，未展示的池内素材会自动顶上来 → 素材库"流动"起来。
 */
export function curriculumByCategory(
  options: RecommendOptions = {}
): { category: MaterialCategory; label: string; icon: string; desc: string; items: RecommendResult[] }[] {
  const ranked = recommend(options);
  const completed = new Set(options.completedIds ?? []);

  return CATEGORIES.map((cat) => {
    // 该板块内：先按推荐排序
    const catResults = ranked.filter((r) => r.item.category === cat.id);
    // 未学过优先
    const fresh = catResults.filter((r) => !completed.has(r.item.id));
    const done = catResults.filter((r) => completed.has(r.item.id));
    // 取前 VISIBLE_PER_CATEGORY 个：优先未学过，不足再补已学过
    const merged = [...fresh, ...done].slice(0, VISIBLE_PER_CATEGORY);

    return {
      category: cat.id,
      label: cat.label,
      icon: cat.icon,
      desc: cat.desc,
      items: merged,
    };
  });
}
