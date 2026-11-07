"use client";

// 浏览器 Web Speech API 语音识别封装（免费、无需 Key）
// 用于把口语录音实时转成文字，再交给 DeepSeek 做评估。
// 注意：Web Speech API 返回的是实时流式结果，非音频文件转写。

export interface SpeechRecognizerResult {
  finalText: string;
  interimText: string;
}

// SpeechRecognition 在部分 TS 环境中无类型声明，这里补一个宽松类型
type AnySpeechRecognition = any;

function getSR(): AnySpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSpeechSupported(): boolean {
  return getSR() != null;
}

export function createRecognizer(
  lang: string,
  handlers: {
    onFinal: (text: string) => void;
    onInterim: (text: string) => void;
    onEnd: () => void;
    onError: (err: string) => void;
  }
): {
  start: () => void;
  stop: () => void;
  abort: () => void;
} {
  const SR = getSR();
  if (!SR) {
    return {
      start: () => {},
      stop: () => {},
      abort: () => {},
    };
  }
  const rec = new SR();
  rec.lang = lang;
  rec.continuous = true;
  rec.interimResults = true;

  rec.onresult = (e: any) => {
    let interim = "";
    let final = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) final += t;
      else interim += t;
    }
    if (final) handlers.onFinal(final);
    if (interim) handlers.onInterim(interim);
  };
  rec.onerror = (e: any) => {
    handlers.onError(e.error || "recognition error");
  };
  rec.onend = () => handlers.onEnd();

  return {
    start: () => {
      try {
        rec.start();
      } catch {
        // 忽略重复 start
      }
    },
    stop: () => {
      try {
        rec.stop();
      } catch {
        // 忽略
      }
    },
    abort: () => {
      try {
        rec.abort();
      } catch {
        // 忽略
      }
    },
  };
}
