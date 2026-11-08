"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { videoTranscript } from "@/lib/mock-data";
import SelectionCollector from "@/components/SelectionCollector";

const RATES = [0.5, 0.75, 1, 1.25, 1.5];
const SEG_COUNT = videoTranscript.length;
const TOTAL_SECONDS = 138; // 文稿时间轴总长（示例教材）

type SourceKind = "url" | "file" | "youtube" | "bilibili";
type VideoSource = { kind: SourceKind; value: string } | null;

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function parseSource(raw: string): { kind: SourceKind; value: string } | null {
  const v = raw.trim();
  if (!v) return null;
  if (/youtu\.be\/|youtube\.com/i.test(v)) {
    const id =
      v.match(/youtu\.be\/([^?&/\s]+)/)?.[1] ||
      v.match(/[?&]v=([^?&/\s]+)/)?.[1] ||
      v.match(/youtube\.com\/embed\/([^?&/\s]+)/)?.[1];
    return id ? { kind: "youtube", value: id } : null;
  }
  if (/bilibili\.com|b23\.tv/i.test(v)) {
    const bv = v.match(/(BV[0-9A-Za-z]{10,})/)?.[1];
    return bv ? { kind: "bilibili", value: bv } : null;
  }
  return { kind: "url", value: v };
}

export default function VideoPlayer() {
  const [rate, setRate] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0); // 视频模式：真实播放秒数
  const [duration, setDuration] = useState(0);
  const [readIdx, setReadIdx] = useState(0); // 朗读模式：当前段
  const [source, setSource] = useState<VideoSource>(null);
  const [inputUrl, setInputUrl] = useState("");
  const [showSourcePanel, setShowSourcePanel] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const rateRef = useRef(rate);
  const playingRef = useRef(playing);
  const readIdxRef = useRef(readIdx);
  const speechGenRef = useRef(0); // 朗读队列代号，用来作废过期的异步队列

  rateRef.current = rate;
  playingRef.current = playing;
  readIdxRef.current = readIdx;

  const isEmbed = source?.kind === "youtube" || source?.kind === "bilibili";
  const hasVideo = source != null;

  // ---------- 朗读模式：浏览器语音逐段朗读英文文稿 ----------
  const queueSpeech = useCallback((fromIdx: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    const gen = ++speechGenRef.current;
    synth.cancel();
    // cancel 后立即 speak 在部分 Chrome 上会失效，稍作延迟更稳
    window.setTimeout(() => {
      if (gen !== speechGenRef.current || !playingRef.current) return;
      const voices = synth.getVoices();
      const enVoice = voices.find((v) => /^en([-_]|$)/i.test(v.lang));
      videoTranscript.slice(fromIdx).forEach((seg, offset) => {
        const idx = fromIdx + offset;
        const u = new SpeechSynthesisUtterance(seg.en);
        u.lang = "en-US";
        u.rate = rateRef.current;
        u.pitch = 1;
        if (enVoice) u.voice = enVoice;
        u.onstart = () => {
          if (gen !== speechGenRef.current || !playingRef.current) return;
          setReadIdx(idx);
        };
        if (idx === SEG_COUNT - 1) {
          u.onend = () => {
            if (gen === speechGenRef.current && playingRef.current) setPlaying(false);
          };
        }
        synth.speak(u);
      });
    }, 60);
  }, []);

  const stopSpeech = useCallback(() => {
    speechGenRef.current++; // 作废尚未执行的异步队列
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // 卸载时清理语音与本地文件 URL
  useEffect(() => {
    return () => {
      stopSpeech();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [stopSpeech]);

  // 倍速变化时：视频直接改 playbackRate；朗读则重建当前段起的队列
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = rate;
  }, [rate]);

  useEffect(() => {
    // 改倍速时，若正在朗读则按新语速从当前段重建队列
    if ((!hasVideo || isEmbed) && playing) queueSpeech(readIdxRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate]);

  function togglePlay() {
    if (hasVideo && !isEmbed && videoRef.current) {
      const v = videoRef.current;
      if (v.paused) {
        void v.play();
        playingRef.current = true;
        setPlaying(true);
      } else {
        v.pause();
        playingRef.current = false;
        setPlaying(false);
      }
      return;
    }
    if (isEmbed) {
      // 嵌入视频由 iframe 自带控制条，这里只切换文稿朗读
      if (playing) {
        stopSpeech();
        playingRef.current = false;
        setPlaying(false);
      } else {
        playingRef.current = true;
        setPlaying(true);
        queueSpeech(readIdxRef.current);
      }
      return;
    }
    // 朗读模式
    if (playing) {
      stopSpeech();
      playingRef.current = false;
      setPlaying(false);
    } else {
      const from = readIdx >= SEG_COUNT - 1 ? 0 : readIdx;
      setReadIdx(from);
      playingRef.current = true;
      setPlaying(true);
      queueSpeech(from);
    }
  }

  function replay() {
    if (hasVideo && !isEmbed && videoRef.current) {
      videoRef.current.currentTime = 0;
      void videoRef.current.play();
      setElapsed(0);
      playingRef.current = true;
      setPlaying(true);
      return;
    }
    stopSpeech();
    setElapsed(0);
    setReadIdx(0);
    playingRef.current = true;
    setPlaying(true);
    queueSpeech(0);
  }

  function seek(p: number) {
    if (hasVideo && !isEmbed && videoRef.current && duration > 0) {
      videoRef.current.currentTime = (p / 100) * duration;
      setElapsed((p / 100) * duration);
      return;
    }
    const idx = Math.min(SEG_COUNT - 1, Math.round((p / 100) * (SEG_COUNT - 1)));
    jumpToSegment(idx);
  }

  function jumpToSegment(idx: number) {
    setReadIdx(idx);
    if (hasVideo && !isEmbed && videoRef.current && duration > 0) {
      const t = (videoTranscript[idx].start / TOTAL_SECONDS) * duration;
      videoRef.current.currentTime = t;
      setElapsed(t);
      return;
    }
    if (playing) {
      stopSpeech();
      queueSpeech(idx);
    }
  }

  // ---------- 视频源 ----------
  function releaseObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  function applySource(next: VideoSource) {
    stopSpeech();
    setPlaying(false);
    setElapsed(0);
    setReadIdx(0);
    setDuration(0);
    setSource(next);
    setSourceError(null);
  }

  function loadUrl() {
    const parsed = parseSource(inputUrl);
    if (!parsed) {
      setSourceError("没识别出可用链接，请粘贴 .mp4/.webm 直链，或 YouTube / B 站视频网址。");
      return;
    }
    releaseObjectUrl(); // 链接源不需要旧的本地文件 URL
    applySource(parsed);
    setShowSourcePanel(false);
  }

  function loadFile(file: File | undefined) {
    if (!file) return;
    releaseObjectUrl(); // 先释放上一个本地文件
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    applySource({ kind: "file", value: url });
    setShowSourcePanel(false);
    setSourceError(null);
  }

  function removeSource() {
    releaseObjectUrl();
    applySource(null);
    setInputUrl("");
  }

  // 文稿高亮：
  // - 直链/本地视频：把真实播放进度按比例映射到示例文稿时间轴，全程同步
  // - 朗读/嵌入视频：按当前朗读段索引
  const mappedTime =
    hasVideo && !isEmbed && duration > 0
      ? (elapsed / duration) * TOTAL_SECONDS
      : elapsed;
  const activeIdx =
    hasVideo && !isEmbed
      ? videoTranscript.reduce((acc, seg, i) => (seg.start <= mappedTime ? i : acc), 0)
      : readIdx;

  useEffect(() => {
    if (!playing && activeIdx === 0) return;
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIdx, playing]);

  const progress = hasVideo
    ? duration > 0
      ? (elapsed / duration) * 100
      : 0
    : (readIdx / (SEG_COUNT - 1)) * 100;

  const embedUrl =
    source?.kind === "youtube"
      ? `https://www.youtube.com/embed/${source.value}`
      : source?.kind === "bilibili"
        ? `https://player.bilibili.com/player.html?bvid=${source.value}&high_quality=1`
        : "";

  return (
    <div className="rounded-2xl border border-line overflow-hidden bg-parchment">
      <div className="flex items-center justify-between px-4 py-2 border-b border-line bg-white/60">
        <span className="text-[0.75rem] font-medium text-ink">
          {hasVideo ? (isEmbed ? "🎬 嵌入视频" : "🎬 真实视频播放") : "🔊 AI 朗读文稿"}
        </span>
        <button
          onClick={() => setShowSourcePanel((s) => !s)}
          className="text-[0.72rem] text-sage-deep hover:underline"
        >
          {showSourcePanel ? "收起设置" : hasVideo ? "更换视频源" : "添加我自己的视频"}
        </button>
      </div>

      {showSourcePanel && (
        <div className="px-4 py-3 bg-white/70 border-b border-line space-y-2">
          <p className="text-[0.72rem] text-ink-soft leading-relaxed">
            粘贴视频直链（.mp4 / .webm）或 YouTube / B 站网址，也可以上传电脑里的视频文件。
            直链与本地文件支持文稿随播放进度自动高亮；嵌入视频请用 iframe 自带控制条。
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadUrl()}
              placeholder="https://.../lesson.mp4 或视频网页地址"
              className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg border border-line bg-white text-[0.75rem] text-ink outline-none focus:border-sage"
            />
            <button
              onClick={loadUrl}
              className="px-4 py-1.5 rounded-lg bg-sage text-cream text-[0.75rem] font-medium hover:bg-sage-deep"
            >
              加载
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-1.5 rounded-lg border border-line text-[0.75rem] text-ink hover:bg-sage-soft"
            >
              上传本地视频
            </button>
            {hasVideo && (
              <button
                onClick={removeSource}
                className="px-3 py-1.5 rounded-lg text-[0.75rem] text-clay-deep hover:bg-clay-soft"
              >
                移除
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => loadFile(e.target.files?.[0])}
          />
          {sourceError && (
            <p className="text-[0.72rem] text-clay-deep">{sourceError}</p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2">
        {/* 左侧：画面 / 朗读字幕 + 控制条 */}
        <div className="border-b md:border-b-0 md:border-r border-line">
          <div className="aspect-video bg-ink/90 relative flex items-center justify-center overflow-hidden">
            {source?.kind === "url" || source?.kind === "file" ? (
              <video
                ref={videoRef}
                src={source.value}
                className="w-full h-full object-contain"
                playsInline
                onLoadedMetadata={(e) => {
                  const d = e.currentTarget.duration;
                  if (Number.isFinite(d)) setDuration(d);
                  e.currentTarget.playbackRate = rateRef.current;
                }}
                onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                onError={() =>
                  setSourceError("视频加载失败：链接可能已失效，或该地址不允许跨域播放。")
                }
              />
            ) : isEmbed ? (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                title="学习视频"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-8">
                <div className="w-14 h-14 rounded-full bg-sage-soft/30 flex items-center justify-center mb-3">
                  <span className="text-[1.35rem]">{playing ? "🔊" : "🎧"}</span>
                </div>
                <p className="text-[0.7rem] text-cream/60 mb-2">
                  英文文稿朗读 · 第 {readIdx + 1} / {SEG_COUNT} 段
                </p>
                <p className="text-[0.92rem] leading-relaxed text-cream font-medium max-w-md">
                  {videoTranscript[readIdx].en}
                </p>
                <p className="text-[0.7rem] text-cream/50 mt-3 leading-relaxed">
                  用浏览器语音朗读示例文稿，点播放即可听；也可在右上角换成你自己的视频。
                </p>
              </div>
            )}
            {playing && !isEmbed && (
              <span className="absolute top-3 right-3 flex items-center gap-1.5 text-[0.7rem] text-cream/80">
                <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
                {rate}×
              </span>
            )}
          </div>

          <div className="px-4 pb-4 pt-3 bg-white/60">
            <div className="flex items-center gap-2">
              <span className="text-[0.72rem] text-ink-soft tabular-nums w-10">
                {hasVideo && !isEmbed ? fmt(elapsed) : `第${readIdx + 1}段`}
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => seek(Number(e.target.value))}
                className="flex-1 h-1.5 accent-sage cursor-pointer"
              />
              <span className="text-[0.72rem] text-ink-soft tabular-nums w-10 text-right">
                {hasVideo && !isEmbed && duration > 0 ? fmt(duration) : fmt(TOTAL_SECONDS)}
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
                <span className="text-[0.72rem] text-ink-soft mr-1">倍速</span>
                {RATES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRate(r)}
                    className={`px-2.5 py-1 rounded-full text-[0.72rem] transition-colors ${
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
            <span className="text-[0.7rem] text-ink-soft">
              点段落跳转 · 划选可收藏
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
                  onClick={() => jumpToSegment(i)}
                  className={`rounded-lg px-3 py-2 transition-colors cursor-pointer ${
                    active
                      ? "bg-sage-soft/70 border border-sage/40"
                      : "border border-transparent hover:bg-parchment"
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

      {isEmbed && (
        <p className="px-4 py-2 text-[0.7rem] text-ink-soft border-t border-line bg-white/60">
          嵌入视频由站点自带控制条播放，浏览器无法读取其播放进度，文稿可点击段落手动定位；
          若需要自动同步，请改用 .mp4 直链或上传本地视频文件。
        </p>
      )}
      {sourceError && !showSourcePanel && (
        <p className="px-4 py-2 text-[0.7rem] text-clay-deep border-t border-line bg-white/60">
          {sourceError}
        </p>
      )}
      <p className="px-4 py-2 text-[0.69rem] text-ink-soft/70 border-t border-line bg-white/50">
        文稿为示例教材（习惯主题）。换成你自己的视频后，可点右侧段落手动校准进度。
        {hasVideo && !isEmbed && ` 当前视频时长 ${fmt(duration)}，文稿时间轴 ${fmt(TOTAL_SECONDS)}。`}
      </p>

      <SelectionCollector containerRef={contentRef} />
    </div>
  );
}
