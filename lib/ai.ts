// 客户端 AI 适配层：统一封装对 /api/ai 的调用
// 每个函数返回 { ok, data } 或 { ok:false, error }，页面据此决定是否回退到演示数据。

export interface VocabExtractItem {
  expression: string;
  meaning: string;
  sourceSentence: string;
  example: string;
  context: string;
}

export interface EvaluateScore {
  label: string;
  value: number;
}

export interface EvaluateIssue {
  title: string;
  detail: string;
  example: string;
  fix: string;
}

export interface EvaluateResult {
  scores: EvaluateScore[];
  topIssues: EvaluateIssue[];
  corrected: string;
  improved: string;
  expressions: string[];
  suggestions: string[];
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface SummaryResult {
  conversation: string;
  newExpressions: string[];
  repeatedMistakes: string[];
  improvements: string[];
  nextFocus: string;
}

export interface DefineResult {
  meaning: string;
  example: string;
  sourceSentence?: string;
  context: string;
}

async function post<T>(
  action: string,
  body: Record<string, unknown>
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...body }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error || `HTTP ${res.status}` };
    }
    return { ok: true, data: json.data as T };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "网络错误",
    };
  }
}

export function extractVocab(transcript: string) {
  return post<{ items: VocabExtractItem[] }>("extract_vocab", { transcript });
}

export function evaluateSpeech(transcript: string, topic?: string) {
  return post<EvaluateResult>("evaluate", { transcript, topic });
}

export function chat(messages: ChatMessage[], topic?: string) {
  return post<{ reply: string }>("chat", { messages, topic });
}

export function summarize(conversation: string) {
  return post<SummaryResult>("summarize", { conversation });
}

export function defineVocab(expression: string, context?: string) {
  return post<DefineResult>("define_vocab", { expression, context });
}
