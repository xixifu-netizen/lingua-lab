// 数据访问层：封装所有 Supabase 表操作
// 供客户端组件调用，所有操作自动受 RLS 保护（只能读写本人数据）
"use client";

import { getSupabase } from "@/lib/supabase";

// ============ 类型定义 ============
export interface DbVocab {
  id: string;
  expression: string;
  meaning?: string;
  source_sentence?: string;
  example?: string;
  context?: string;
  source: "core" | "selection";
  box: number;
  due_at: string;
  last_reviewed?: string;
  review_count: number;
  created_at: string;
}

export interface DbSession {
  id: string;
  mode: "A" | "B";
  status: string;
  current_step: number;
  notes?: string;
  created_at: string;
}

export interface DbRecording {
  id: string;
  session_id?: string;
  attempt: number;
  duration_seconds?: number;
  audio_path?: string;
  transcript?: string;
  score?: number;
  created_at: string;
}

export interface DbProgress {
  id: string;
  metric: string;
  value: number;
  created_at: string;
}

// 数据变化通知：让首页/进度页在学习事件写入后自动刷新
export function notifyDataChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ll-data-changed"));
  }
}

// 关键：所有 INSERT 必须显式带上 user_id（表无默认值，RLS 也要求 auth.uid() = user_id）
async function currentUserId(): Promise<string> {
  const sb = getSupabase();
  const {
    data: { user },
    error,
  } = await sb.auth.getUser();
  if (error || !user) throw new Error("未登录，无法保存数据");
  return user.id;
}

// ============ 词汇收藏 ============
export async function fetchVocab(): Promise<DbVocab[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("vocabulary_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbVocab[]) ?? [];
}

export async function addVocab(v: {
  expression: string;
  meaning?: string;
  source_sentence?: string;
  example?: string;
  context?: string;
  source: "core" | "selection";
}) {
  const sb = getSupabase();
  const user_id = await currentUserId();
  const { data, error } = await sb
    .from("vocabulary_items")
    .insert({ ...v, user_id })
    .select()
    .single();
  if (error) throw error;
  notifyDataChanged();
  return data as DbVocab;
}

export async function updateVocab(id: string, patch: Partial<DbVocab>) {
  const sb = getSupabase();
  const { data, error } = await sb.from("vocabulary_items").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data as DbVocab;
}

export async function removeVocab(id: string) {
  const sb = getSupabase();
  const { error } = await sb.from("vocabulary_items").delete().eq("id", id);
  if (error) throw error;
  notifyDataChanged();
}

// 记录一次复习（艾宾浩斯：box 提升，计算下次复习时间）
export async function reviewVocab(id: string, remembered: boolean) {
  const sb = getSupabase();
  const { data: item } = await sb
    .from("vocabulary_items")
    .select("box, review_count")
    .eq("id", id)
    .single();
  if (!item) return;
  const newBox = remembered ? Math.min(5, item.box + 1) : Math.max(1, item.box - 1);
  const intervals = [0, 1, 2, 4, 7, 15];
  const days = intervals[newBox];
  const due = new Date();
  due.setDate(due.getDate() + days);
  await sb
    .from("vocabulary_items")
    .update({
      box: newBox,
      due_at: due.toISOString(),
      last_reviewed: new Date().toISOString(),
      review_count: (item.review_count ?? 0) + 1,
    })
    .eq("id", id);
  notifyDataChanged();
}

// ============ 学习记录 ============
export async function fetchSessions(): Promise<DbSession[]> {
  const sb = getSupabase();
  const { data, error } = await sb.from("sessions").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbSession[]) ?? [];
}

export async function addSession(
  mode: "A" | "B",
  opts?: { notes?: string; currentStep?: number }
) {
  const sb = getSupabase();
  const user_id = await currentUserId();
  const { data, error } = await sb
    .from("sessions")
    .insert({
      user_id,
      mode,
      status: "completed",
      current_step: opts?.currentStep ?? 5,
      notes: opts?.notes,
    })
    .select()
    .single();
  if (error) throw error;
  notifyDataChanged();
  return data as DbSession;
}

export async function fetchRecordings(): Promise<DbRecording[]> {
  const sb = getSupabase();
  const { data, error } = await sb.from("recordings").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbRecording[]) ?? [];
}

export async function addRecording(p: {
  attempt?: number;
  duration_seconds?: number;
  transcript?: string;
  score?: number;
}) {
  const sb = getSupabase();
  const user_id = await currentUserId();
  const { data, error } = await sb
    .from("recordings")
    .insert({ ...p, user_id })
    .select()
    .single();
  if (error) throw error;
  notifyDataChanged();
  return data as DbRecording;
}

// ============ 进度记录 ============
export async function fetchProgress(): Promise<DbProgress[]> {
  const sb = getSupabase();
  const { data, error } = await sb.from("progress_records").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data as DbProgress[]) ?? [];
}

export async function addProgressRows(rows: { metric: string; value: number }[]) {
  if (rows.length === 0) return;
  const sb = getSupabase();
  const user_id = await currentUserId();
  const { error } = await sb.from("progress_records").insert(
    rows.map((r) => ({ ...r, user_id, is_ai_assessment: true }))
  );
  if (error) throw error;
  notifyDataChanged();
}

export async function addProgress(metric: string, value: number) {
  return addProgressRows([{ metric, value }]);
}
