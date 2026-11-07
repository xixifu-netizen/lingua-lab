"use client";

// 收藏词汇全局状态：登录后读写 Supabase，未登录时用 localStorage 兜底
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  fetchVocab,
  addVocab as dbAdd,
  updateVocab as dbUpdate,
  removeVocab as dbRemove,
  type DbVocab,
} from "@/lib/db";

export interface CollectedVocab {
  id: string;
  expression: string;
  meaning?: string;
  example?: string;
  sourceSentence?: string;
  context?: string;
  source: "core" | "selection";
  box?: number;
  due_at?: string;
}

interface VocabStoreValue {
  items: CollectedVocab[];
  loading: boolean;
  add: (v: CollectedVocab) => void;
  remove: (id: string) => void;
  update: (expression: string, patch: Partial<CollectedVocab>) => void;
  has: (id: string) => boolean;
  keyOf: (text: string) => string;
}

const VocabContext = createContext<VocabStoreValue | null>(null);

const STORAGE_KEY = "ll-collected-vocab";

export function keyOf(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function loadLocal(): CollectedVocab[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CollectedVocab[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocal(items: CollectedVocab[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // 忽略
  }
}

function dbToCollected(db: DbVocab): CollectedVocab {
  return {
    id: db.id,
    expression: db.expression,
    meaning: db.meaning,
    example: db.example,
    sourceSentence: db.source_sentence,
    context: db.context,
    source: db.source,
    box: db.box,
    due_at: db.due_at,
  };
}

export function VocabProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CollectedVocab[]>([]);
  const [loading, setLoading] = useState(true);

  // 登录态变化时加载数据
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) {
        setItems(loadLocal());
        setLoading(false);
        return;
      }
      try {
        const rows = await fetchVocab();
        if (!cancelled) {
          setItems(rows.map(dbToCollected));
        }
      } catch {
        // 数据库未建表或未登录时静默降级
        if (!cancelled) setItems(loadLocal());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  function add(v: CollectedVocab) {
    // 去重（用临时 id 或 expression 判断）
    const already = items.some(
      (x) =>
        x.id === v.id || keyOf(x.expression) === keyOf(v.expression)
    );
    if (already) return;

    const tempId = v.id || `tmp-${keyOf(v.expression)}-${Date.now()}`;
    const withId = { ...v, id: tempId };
    setItems((prev) => [...prev, withId]);

    // 持久化
    if (user) {
      dbAdd({
        expression: v.expression,
        meaning: v.meaning,
        source_sentence: v.sourceSentence,
        example: v.example,
        context: v.context,
        source: v.source,
      })
        .then((row) => {
          // 用数据库返回的真实 id 回填，替换临时 id
          setItems((prev) =>
            prev.map((x) =>
              x.id === tempId ? dbToCollected(row) : x
            )
          );
        })
        .catch(() => {});
    } else {
      saveLocal([...items, withId]);
    }
  }

  function remove(id: string) {
    const target = items.find((x) => x.id === id);
    setItems((prev) => prev.filter((x) => x.id !== id));
    if (user && target && !target.id.startsWith("tmp-")) {
      dbRemove(id).catch(() => {});
    } else {
      saveLocal(items.filter((x) => x.id !== id));
    }
  }

  function update(expression: string, patch: Partial<CollectedVocab>) {
    setItems((prev) =>
      prev.map((x) =>
        keyOf(x.expression) === keyOf(expression) ? { ...x, ...patch } : x
      )
    );
    if (user) {
      const target = items.find(
        (x) => keyOf(x.expression) === keyOf(expression)
      );
      if (target && !target.id.startsWith("tmp-")) {
        dbUpdate(target.id, {
          meaning: patch.meaning,
          example: patch.example,
          source_sentence: patch.sourceSentence,
          context: patch.context,
        }).catch(() => {});
      }
    } else {
      const next = items.map((x) =>
        keyOf(x.expression) === keyOf(expression) ? { ...x, ...patch } : x
      );
      saveLocal(next);
    }
  }

  function has(id: string) {
    return items.some((x) => x.id === id);
  }

  return (
    <VocabContext.Provider
      value={{ items, loading, add, remove, update, has, keyOf }}
    >
      {children}
    </VocabContext.Provider>
  );
}

export function useVocabStore() {
  const ctx = useContext(VocabContext);
  if (!ctx) throw new Error("useVocabStore 必须在 VocabProvider 内使用");
  return ctx;
}
