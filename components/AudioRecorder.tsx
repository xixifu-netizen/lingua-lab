"use client";

import { useEffect, useRef, useState } from "react";
import { createRecognizer, isSpeechSupported } from "@/lib/speech";

type Status = "idle" | "recording" | "recorded";

export default function AudioRecorder({
  label = "录制复述",
  onTranscript,
}: {
  label?: string;
  // 语音识别得到的最终文本（实时转写结果）
  onTranscript?: (text: string) => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [transcribing, setTranscribing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recognizerRef = useRef<ReturnType<typeof createRecognizer> | null>(null);
  const finalTextRef = useRef("");
  const interimRef = useRef("");

  useEffect(() => {
    if (typeof window !== "undefined" && !window.MediaRecorder) {
      setSupported(false);
    }
    if (!isSpeechSupported()) {
      setSpeechSupported(false);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      recognizerRef.current?.abort();
    };
  }, []);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType });
        setUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(blob);
        });
        stream.getTracks().forEach((t) => t.stop());
        setStatus("recorded");
      };
      rec.start();
      setSeconds(0);
      setStatus("recording");
      timerRef.current = window.setInterval(
        () => setSeconds((s) => s + 1),
        1000
      );

      // 同时启动语音识别（Web Speech API），实时转写
      if (isSpeechSupported()) {
        finalTextRef.current = "";
        interimRef.current = "";
        setTranscribing(true);
        const recog = createRecognizer("en-US", {
          onFinal: (text) => {
            finalTextRef.current += (finalTextRef.current ? " " : "") + text;
          },
          onInterim: (text) => {
            interimRef.current = text;
          },
          onEnd: () => {
            setTranscribing(false);
            // 识别结束后，把最终文本通过回调传出
            if (finalTextRef.current.trim() && onTranscript) {
              onTranscript(finalTextRef.current.trim());
            }
          },
          onError: (err) => {
            setTranscribing(false);
            if (err !== "no-speech" && err !== "aborted") {
              setError(`语音识别出错：${err}。可手动在下方输入转写文本。`);
            }
          },
        });
        recognizerRef.current = recog;
        recog.start();
      }
    } catch {
      setError("无法访问麦克风，请检查浏览器权限设置后重试。");
    }
  }

  function stop() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    recorderRef.current?.stop();
    recognizerRef.current?.stop();
  }

  function retake() {
    setUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    setSeconds(0);
    finalTextRef.current = "";
    interimRef.current = "";
    setStatus("idle");
  }

  if (!supported) {
    return (
      <div className="rounded-xl border border-line bg-parchment p-5 text-[0.81rem] text-ink-soft">
        当前浏览器不支持录音功能，请使用最新版 Chrome / Edge。
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-white/70 p-5">
      <div className="flex items-center gap-4 flex-wrap">
        {status !== "recording" ? (
          <button
            onClick={start}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sage text-cream text-[0.81rem] font-medium hover:bg-sage-deep transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cream inline-block" />
            {status === "recorded" ? "重新录制" : label}
          </button>
        ) : (
          <button
            onClick={stop}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-clay text-cream text-[0.81rem] font-medium hover:bg-clay-deep transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-cream inline-block animate-pulse" />
            停止录制
          </button>
        )}
        <span className="text-[0.81rem] text-ink-soft tabular-nums">
          {status === "recording" ? (
            <span className="text-clay-deep font-medium">{fmt(seconds)}</span>
          ) : status === "recorded" ? (
            <>已录制 {fmt(seconds)}</>
          ) : (
            "准备就绪"
          )}
        </span>
        {status === "recorded" && (
          <button
            onClick={retake}
            className="text-[0.75rem] text-ink-soft underline underline-offset-2 hover:text-ink"
          >
            清除重录
          </button>
        )}
      </div>
      {url && status === "recorded" && (
        <audio controls src={url} className="w-full mt-4 h-10" />
      )}
      {transcribing && (
        <p className="mt-2 text-[0.72rem] text-sage-deep flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
          正在实时转写你的语音…
        </p>
      )}
      {error && (
        <p className="mt-3 text-[0.75rem] text-clay-deep bg-clay-soft rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
