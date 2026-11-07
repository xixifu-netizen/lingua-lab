import { NextRequest, NextResponse } from "next/server";

// DeepSeek（OpenAI 兼容）服务端适配层
// 密钥只在服务端读取，绝不暴露到客户端。未来切换供应商只需改这里。

const BASE_URL =
  process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

async function callDeepSeek(
  messages: ChatMessage[],
  opts: { temperature?: number; max_tokens?: number; json?: boolean } = {}
) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    throw new Error("NO_API_KEY");
  }

  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.max_tokens ?? 2048,
  };
  if (opts.json) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`UPSTREAM_ERROR:${res.status}:${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content as string | undefined;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { action } = payload as { action: string };

    if (!action) {
      return NextResponse.json({ ok: false, error: "缺少 action" }, { status: 400 });
    }

    switch (action) {
      case "extract_vocab": {
        const { transcript } = payload as { transcript: string };
        const sys =
          "你是一位英语学习教练，面向中级（B1+）学习者。请从给定的英文视频文稿中提炼 5–8 个最有用的地道表达（短语/搭配，而非单个生词）。严格输出 JSON，不要输出任何多余文字。";
        const user = `文稿：\n${transcript}\n\n请输出 JSON，格式为：\n{"items":[{"expression":"英文表达","meaning":"中文释义","sourceSentence":"文稿中的原句","example":"一个自然的新例句","context":"使用场景说明"}]}`;
        const raw = await callDeepSeek(
          [
            { role: "system", content: sys },
            { role: "user", content: user },
          ],
          { temperature: 0.5, json: true }
        );
        if (!raw) throw new Error("EMPTY_RESPONSE");
        const parsed = JSON.parse(raw);
        return NextResponse.json({ ok: true, data: parsed });
      }

      case "evaluate": {
        const { transcript, topic } = payload as {
          transcript: string;
          topic?: string;
        };
        const sys =
          "你是一位英语口语评估教练，面向中级（B1+）学习者。请基于学习者的口语转写文本，从六个维度打分（0–100），挑出最值得优先处理的 3 个问题，并给出纠错与进阶版本。用中文解释问题，但保留英文例句。严格输出 JSON，不要输出任何多余文字。";
        const user = `学习者口语转写：\n${transcript}\n${topic ? `话题：${topic}\n` : ""}请输出 JSON，格式为：\n{"scores":[{"label":"语法准确性","value":0},{"label":"词汇与搭配","value":0},{"label":"表达自然度","value":0},{"label":"流利与连贯","value":0},{"label":"信息组织","value":0},{"label":"发音与语调","value":0}],"topIssues":[{"title":"问题标题(中文)","detail":"解释(中文)","example":"原句→修正句","fix":"建议(中文)"}],"corrected":"纠错后的英文版本","improved":"更自然的进阶英文版本","expressions":["5个有用表达(英文) 带中文简释"],"suggestions":["个性化练习建议(中文)"]}`;
        const raw = await callDeepSeek(
          [
            { role: "system", content: sys },
            { role: "user", content: user },
          ],
          { temperature: 0.4, json: true }
        );
        if (!raw) throw new Error("EMPTY_RESPONSE");
        const parsed = JSON.parse(raw);
        return NextResponse.json({ ok: true, data: parsed });
      }

      case "chat": {
        const { messages, topic } = payload as {
          messages: ChatMessage[];
          topic?: string;
        };
        const sys = `你是一位 AI 英语口语教练，正与一名中级（B1+）英语学习者进行对话讨论。要求：
- 默认全程用英语；
- 一次只问一个问题，鼓励学习者展开观点；
- 根据学习者的实际回答提出追问，温和地挑战薄弱论点；
- 自然地引入有用表达，但不要逐句纠错；
- 学习者卡壳时，若对方用中文求助，用简短中文解释后立即回到英语；
- 语气自然，不要像教科书机器人。${topic ? `当前讨论话题：${topic}。` : ""}`;
        const raw = await callDeepSeek(
          [{ role: "system", content: sys }, ...messages],
          { temperature: 0.8 }
        );
        if (!raw) throw new Error("EMPTY_RESPONSE");
        return NextResponse.json({ ok: true, data: { reply: raw } });
      }

      case "summarize": {
        const { conversation } = payload as { conversation: string };
        const sys =
          "你是一位英语学习教练。请基于一段 AI 对话记录，生成课堂总结。用中文总结，但保留英文表达。严格输出 JSON。";
        const user = `对话记录：\n${conversation}\n\n请输出 JSON，格式为：\n{"conversation":"对话摘要(中文)","newExpressions":["新学到的表达(英文+中文简释)"],"repeatedMistakes":["重复出现的错误(中文)"],"improvements":["进步之处(中文)"],"nextFocus":"下次课重点(中文)"}`;
        const raw = await callDeepSeek(
          [
            { role: "system", content: sys },
            { role: "user", content: user },
          ],
          { temperature: 0.5, json: true }
        );
        if (!raw) throw new Error("EMPTY_RESPONSE");
        const parsed = JSON.parse(raw);
        return NextResponse.json({ ok: true, data: parsed });
      }

      case "define_vocab": {
        const { expression, context } = payload as {
          expression: string;
          context?: string;
        };
        const sys =
          "你是英语学习教练，面向中级学习者。请解释一个英文表达，用中文释义并给自然例句。严格输出 JSON。";
        const user = `表达：${expression}${context ? `\n上下文：${context}` : ""}\n请输出 JSON，格式为：\n{"meaning":"中文释义","example":"英文例句","sourceSentence":"可选：原句","context":"使用场景说明"}`;
        const raw = await callDeepSeek(
          [
            { role: "system", content: sys },
            { role: "user", content: user },
          ],
          { temperature: 0.4, json: true }
        );
        if (!raw) throw new Error("EMPTY_RESPONSE");
        const parsed = JSON.parse(raw);
        return NextResponse.json({ ok: true, data: parsed });
      }

      default:
        return NextResponse.json(
          { ok: false, error: `未知 action: ${action}` },
          { status: 400 }
        );
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNKNOWN";
    if (msg === "NO_API_KEY") {
      return NextResponse.json(
        { ok: false, error: "未配置 API Key" },
        { status: 503 }
      );
    }
    if (msg === "EMPTY_RESPONSE") {
      return NextResponse.json(
        { ok: false, error: "AI 返回为空" },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 }
    );
  }
}
