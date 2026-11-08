"use client";

// 统一读取真实学习数据：课次、录音、AI 评估分数
// 未登录时返回空数组（不显示任何演示数据）
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  fetchSessions,
  fetchRecordings,
  fetchProgress,
  type DbSession,
  type DbRecording,
  type DbProgress,
} from "@/lib/db";

export function useLearningData() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<DbSession[]>([]);
  const [recordings, setRecordings] = useState<DbRecording[]>([]);
  const [progress, setProgress] = useState<DbProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setSessions([]);
      setRecordings([]);
      setProgress([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [s, r, p] = await Promise.all([
        fetchSessions(),
        fetchRecordings(),
        fetchProgress(),
      ]);
      setSessions(s);
      setRecordings(r);
      setProgress(p);
    } catch {
      setSessions([]);
      setRecordings([]);
      setProgress([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  // 训练写入后自动刷新
  useEffect(() => {
    const onChanged = () => void load();
    window.addEventListener("ll-data-changed", onChanged);
    return () => window.removeEventListener("ll-data-changed", onChanged);
  }, [load]);

  return { sessions, recordings, progress, loading, refresh: load };
}

// 把 sessions / recordings 合并成一条按时间倒序的时间线
export interface TimelineEvent {
  id: string;
  time: string;
  tag: "听述" | "讨论" | "录音";
  title: string;
  detail: string;
}

export function buildTimeline(
  sessions: DbSession[],
  recordings: DbRecording[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [
    ...sessions.map((s) => ({
      id: "s-" + s.id,
      time: s.created_at,
      tag: (s.mode === "A" ? "听述" : "讨论") as "听述" | "讨论",
      title: s.mode === "A" ? "完成 Session A · 听述训练" : "完成 Session B · 讨论应用",
      detail: s.notes?.trim() ? "训练笔记：" + s.notes.trim().slice(0, 60) : "已完成全部训练步骤",
    })),
    ...recordings.map((r) => ({
      id: "r-" + r.id,
      time: r.created_at,
      tag: "录音" as const,
      title: r.score != null ? `口语复述 · AI 评估 ${r.score} 分` : "完成一次口语复述录音",
      detail: r.transcript?.trim()
        ? r.transcript.trim().slice(0, 60) + (r.transcript.length > 60 ? "…" : "")
        : "第 " + (r.attempt ?? 1) + " 次尝试",
    })),
  ];
  return events.sort((a, b) => b.time.localeCompare(a.time));
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}
