// 智能推荐引擎
// 根据用户水平（profile.level）和兴趣（profile.interests）对素材打分排序。
// 已学过的素材降权，优先推荐既匹配水平、又命中兴趣的素材。

import {
  curriculum,
  LEVEL_RANK,
  type CurriculumItem,
  type InterestId,
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
