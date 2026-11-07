"use client";

import { useEffect, useRef, useState } from "react";
import { videoTranscript } from "@/lib/mock-data";
import SelectionCollector from "@/components/SelectionCollector";

const RATES = [0.5, 0.75, 1, 1.25, 1.5];
const TOTAL_SECONDS = 138; // 对应 11:24 → 用 2:18 简化演示，映射到真实 11:24

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export default function VideoPlayer() {
  const [rate, setRate] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0); // 秒
  const contentRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  // 模拟播放推进
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= TOTAL_SECONDS) {
          setPlaying(false);
          return TOTAL_SECONDS;
        }
        return next;
      });
    }, 1000 / rate);
    return () => clearInterval(t);
  }, [playing, rate]);

  function togglePlay() {
    if (elapsed >= TOTAL_SECONDS) setElapsed(0);
    setPlaying((p) => !p);
  }

  function seek(p: number) {
    setElapsed((p / 100) * TOTAL_SECONDS);
  }

  function replay() {
    setElapsed(0);
    setPlaying(true);
  }

  // 当前播放到的段落索引：最后一个 start <= elapsed 的段
  const activeIdx = videoTranscript.reduce((acc, seg, i) => {
    return seg.start <= elapsed ? i : acc;
  }, 0);

  // 高亮段滚动到可视区
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeIdx]);

  return (
    <div className="rounded-2xl border border-line overflow-hidden bg-parchment">
      <div className="grid md:grid-cols-2">
        {/* 左侧：视频画面 + 控制条 */}
        <div className="border-b md:border-b-0 md:border-r border-line">
          <div className="aspect-video flex flex-col items-center justify-center text-center px-8 relative">
            <div className="w-16 h-16 rounded-full bg-sage-soft flex items-center justify-center mb-3">
              <span className="text-[1.5rem]">🎬</span>
            </div>
            <p className="text-[0.95rem] font-medium text-ink">视频播放区</p>
            <p className="text-[0.78rem] text-ink-soft mt-2 max-w-xs leading-relaxed">
              接入视频源适配器后加载真实播放器。右侧为同步文稿，播放到哪一段会高亮。
            </p>
            {playing && (
              <span className="absolute top-3 right-3 flex items-center gap-1.5 text-[0.72rem] text-sage-deep">
                <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
                播放中 · {rate}×
              </span>
            )}
          </div>

          <div className="px-4 pb-4 bg-white/60">
            <div className="flex items-center gap-2">
              <span className="text-[0.75rem] text-ink-soft tabular-nums w-10">
                {fmt(elapsed)}
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={(elapsed / TOTAL_SECONDS) * 100}
                onChange={(e) => seek(Number(e.target.value))}
                className="flex-1 h-1.5 accent-sage cursor-pointer"
              />
              <span className="text-[0.75rem] text-ink-soft tabular-nums w-10 text-right">
                {fmt(TOTAL_SECONDS)}
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="px-4 py-1.5 rounded-full bg-sage text-cream text-[0.8rem] font-medium hover:bg-sage-deep transition-colors"
                >
                  {playing ? "⏸ 暂停" : "▶ 播放"}
                </button>
                <button
                  onClick={replay}
                  className="px-3 py-1.5 rounded-full bg-parchment text-[0.8rem] text-ink hover:bg-sage-soft"
                >
                  ↺ 重播
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[0.75rem] text-ink-soft mr-1">倍速</span>
                {RATES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRate(r)}
                    className={`px-2.5 py-1 rounded-full text-[0.75rem] transition-colors ${
                      rate === r
                        ? "bg-clay text-cream font-medium"
                        : "bg-parchment text-ink-soft hover:bg-clay-soft"
                    }`}
                  >
                    {r}×
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：同步文稿 */}
        <div className="bg-white/70">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-line">
            <span className="text-[0.78rem] font-medium text-ink">📜 同步文稿</span>
            <span className="text-[0.72rem] text-ink-soft">
              划选单词或短语可收藏
            </span>
          </div>
          <div
            ref={contentRef}
            className="h-[320px] md:h-[340px] overflow-y-auto px-4 py-3 space-y-2.5"
          >
            {videoTranscript.map((seg, i) => {
              const active = i === activeIdx;
              return (
                <div
                  key={seg.start}
                  ref={active ? activeRef : undefined}
                  className={`rounded-lg px-3 py-2 transition-colors ${
                    active
                      ? "bg-sage-soft/70 border border-sage/40"
                      : "border border-transparent"
                  }`}
                >
                  <span
                    className={`text-[0.7rem] tabular-nums mr-2 ${
                      active ? "text-sage-deep font-medium" : "text-ink-soft/60"
                    }`}
                  >
                    {fmt(seg.start)}
                  </span>
                  <span
                    className={`text-[0.85rem] leading-relaxed ${
                      active ? "text-ink font-medium" : "text-ink-soft"
                    }`}
                  >
                    {seg.en}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 划词收藏弹层（限定在本组件内） */}
      <SelectionCollector containerRef={contentRef} />
    </div>
  );
}
