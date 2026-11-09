"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SelectionCollector from "@/components/SelectionCollector";
import {
  curriculum,
  embedUrlOf,
  tagLabel,
  INTEREST_CATEGORIES,
  type CurriculumItem,
  type TranscriptSegment,
} from "@/lib/curriculum";
import { recommend } from "@/lib/recommend";
import { useAuth } from "@/components/AuthProvider";

const RATES = [0.5, 0.75, 1, 1.25, 1.5];

type LocalSource =
  | { kind: "url" | "file"; value: string }
  | { kind: "youtube" | "bilibili"; value: string }
  | null;

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function parseSource(raw: string): LocalSource {
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
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [readIdx, setReadIdx] = useState(0);
  const [activeItem, setActiveItem] = useState<CurriculumItem | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [localSource, setLocalSource] = useState<LocalSource>(null);
  const [inputUrl, setInputUrl] = useState("");
  const [showSourcePanel, setShowSourcePanel] = useState(false);
  const [showInterests, setShowInterests] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const { user, profile, updateInterests } = useAuth();

  // 从 localStorage 读取已学过的素材（跨会话保留）
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ll-completed-materials");
      if (raw) setCompletedIds(JSON.parse(raw));
    } catch (e) {}
  }, []);

  // 推荐排序后的素材列表
  const recommendedList = useMemo(() => {
    return recommend({
      profile,
      completedIds,
      isLoggedIn: !!user,
    });
  }, [profile, completedIds, user]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const rateRef = useRef(rate);
  const playingRef = useRef(playing);
  const readIdxRef = useRef(readIdx);
  const speechGenRef = useRef(0);

  rateRef.current = rate;
  playingRef.current = playing;
  readIdxRef.current = readIdx;

  const transcript: TranscriptSegment[] =
    activeItem?.transcript ?? curriculum[0].transcript;
  const SEG_COUNT = transcript.length;
  const TOTAL_SECONDS =
    activeItem?.kind === "audio" || activeItem?.kind === "embed"
      ? activeItem.durationSec
      : curriculum[0].durationSec;

  const isLocalVideo = localSource?.kind === "url" || localSource?.kind === "file";
  const isLocalEmbed = localSource?.kind === "youtube" || localSource?.kind === "bilibili";
  const isBuiltinAudio = activeItem?.kind === "audio";
  const isBuiltinEmbed = activeItem?.kind === "embed";
  const hasReadableProgress = isBuiltinAudio || isLocalVideo;

  const queueSpeech = useCallback(
    (fromIdx: number) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      const synth = window.speechSynthesis;
      const gen = ++speechGenRef.current;
      synth.cancel();
      window.setTimeout(() => {
        if (gen !== speechGenRef.current || !playingRef.current) return;
        const voices = synth.getVoices();
        const enVoice = voices.find((v) => /^en([-_]|$)/i.test(v.lang));
        transcript.slice(fromIdx).forEach((seg, offset) => {
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
    },
    [transcript, SEG_COUNT]
  );

  const stopSpeech = useCallback(() => {
    speechGenRef.current++;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => {
    return () => {
      stopSpeech();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [stopSpeech]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
    if (videoRef.current) videoRef.current.playbackRate = rate;
  }, [rate]);

  function selectBuiltin(item: CurriculumItem) {
    stopSpeech();
    releaseObjectUrl();
    setLocalSource(null);
    setPlaying(false);
    setElapsed(0);
    setReadIdx(0);
    setDuration(0);
    setActiveItem(item);
    setSourceError(null);
    setShowLibrary(false);
    // 标记为已学过（用于推荐降权，避免重复推荐）
    markCompleted(item.id);
  }

  function markCompleted(id: string) {
    setCompletedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem("ll-completed-materials", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }

  function toggleInterest(id: string) {
    const cur = new Set(profile?.interests ?? []);
    if (cur.has(id)) cur.delete(id);
    else cur.add(id);
    void updateInterests(Array.from(cur));
  }

  function selectLocal(src: LocalSource) {
    stopSpeech();
    setActiveItem(null);
    setLocalSource(src);
    setPlaying(false);
    setElapsed(0);
    setReadIdx(0);
    setDuration(0);
    setSourceError(null);
  }

  function releaseObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  function loadUrl() {
    const parsed = parseSource(inputUrl);
    if (!parsed) {
      setSourceError("没识别出可用链接，请粘贴 .mp4/.webm 直链，或 YouTube / B 站视频网址。");
      return;
    }
    releaseObjectUrl();
    selectLocal(parsed);
    setShowSourcePanel(false);
  }

  function loadFile(file: File | undefined) {
    if (!file) return;
    releaseObjectUrl();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    selectLocal({ kind: "file", value: url });
    setShowSourcePanel(false);
  }

  function removeSource() {
    stopSpeech();
    releaseObjectUrl();
    setLocalSource(null);
    setActiveItem(null);
    setInputUrl("");
    setPlaying(false);
    setElapsed(0);
    setReadIdx(0);
    setDuration(0);
  }

  function togglePlay() {
    if (isLocalVideo && videoRef.current) {
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
    if (isBuiltinAudio && audioRef.current) {
      const a = audioRef.current;
      if (a.paused) {
        void a.play();
        playingRef.current = true;
        setPlaying(true);
      } else {
        a.pause();
        playingRef.current = false;
        setPlaying(false);
      }
      return;
    }
    if (isBuiltinEmbed || isLocalEmbed) {
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
    if (isLocalVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      void videoRef.current.play();
      setElapsed(0);
      setPlaying(true);
      return;
    }
    if (isBuiltinAudio && audioRef.current) {
      audioRef.current.currentTime = 0;
      void audioRef.current.play();
      setElapsed(0);
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
    if (hasReadableProgress && duration > 0) {
      const t = (p / 100) * duration;
      if (audioRef.current) {
        audioRef.current.currentTime = t;
        setElapsed(t);
      } else if (videoRef.current) {
        videoRef.current.currentTime = t;
        setElapsed(t);
      }
      return;
    }
    const idx = Math.min(SEG_COUNT - 1, Math.round((p / 100) * (SEG_COUNT - 1)));
    jumpToSegment(idx);
  }

  function jumpToSegment(idx: number) {
    setReadIdx(idx);
    if (hasReadableProgress && duration > 0) {
      const t = (transcript[idx].start / TOTAL_SECONDS) * duration;
      if (audioRef.current) {
        audioRef.current.currentTime = t;
        setElapsed(t);
      } else if (videoRef.current) {
        videoRef.current.currentTime = t;
        setElapsed(t);
      }
      return;
    }
    if (playing) {
      stopSpeech();
      queueSpeech(idx);
    }
  }

  const mappedTime =
    hasReadableProgress && duration > 0
      ? (elapsed / duration) * TOTAL_SECONDS
      : elapsed;
  const activeIdx = hasReadableProgress
    ? transcript.reduce((acc, seg, i) => (seg.start <= mappedTime ? i : acc), 0)
    : readIdx;

  useEffect(() => {
    if (!playing && activeIdx === 0) return;
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIdx, playing]);

  const progress = hasReadableProgress
    ? duration > 0
      ? (elapsed / duration) * 100
      : 0
    : (readIdx / Math.max(1, SEG_COUNT - 1)) * 100;

  function modeLabel() {
    if (isBuiltinAudio) return "🎧 内置音频 · 自动同步";
    if (isBuiltinEmbed) return "🎬 视频嵌入 · 点击定位";
    if (isLocalVideo) return "🎬 本地视频 · 自动同步";
    if (isLocalEmbed) return "🎬 嵌入视频 · 点击定位";
    return "🔊 AI 朗读文稿";
  }

  const localEmbedUrl =
    localSource?.kind === "youtube"
      ? `https://www.youtube.com/embed/${localSource.value}`
      : localSource?.kind === "bilibili"
        ? `https://player.bilibili.com/player.html?bvid=${localSource.value}&high_quality=1`
        : "";

  const builtinEmbedUrl = isBuiltinEmbed ? embedUrlOf(activeItem!) : "";

  return (
    <div className="rounded-2xl border border-line overflow-hidden bg-parchment">
      <div className="flex items-center justify-between px-4 py-2 border-b border-line bg-white/60">
        <span className="text-[0.75rem] font-medium text-ink">{modeLabel()}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLibrary((s) => !s)}
            className="text-[0.72rem] text-sage-deep hover:underline"
          >
            {showLibrary ? "收起素材库" : "🎬 选择素材"}
          </button>
          <button
            onClick={() => setShowSourcePanel((s) => !s)}
            className="text-[0.72rem] text-sage-deep hover:underline"
          >
            {showSourcePanel ? "收起设置" : "添加我的视频"}
          </button>
        </div>
      </div>

      {showLibrary && (
        <div className="px-4 py-3 bg-white/70 border-b border-line">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[0.72rem] text-ink-soft">
              {user
                ? profile?.interests?.length
                  ? "已按你的水平和兴趣智能排序"
                  : "已按你的水平排序（点右侧设置兴趣，推荐更精准）"
                : "登录后可按你的水平与兴趣智能推荐"}
            </p>
            <button
              onClick={() => setShowInterests((s) => !s)}
              className="text-[0.7rem] text-sage-deep hover:underline shrink-0"
            >
              {showInterests ? "收起" : "🎯 我的兴趣"}
            </button>
          </div>

          {showInterests && (
            <div className="mb-3 p-3 rounded-lg border border-sage/30 bg-sage-soft/20">
              <p className="text-[0.7rem] text-ink-soft mb-2">
                勾选你感兴趣的主题，推荐会优先匹配：
              </p>
              {user ? (
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_CATEGORIES.map((c) => {
                    const on = (profile?.interests ?? []).includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleInterest(c.id)}
                        className={`px-2.5 py-1 rounded-full text-[0.7rem] transition-colors ${
                          on
                            ? "bg-sage text-cream font-medium"
                            : "bg-parchment text-ink-soft hover:bg-sage-soft"
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[0.7rem] text-clay-deep">
                  请先登录，才能保存兴趣偏好。
                </p>
              )}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-2">
            {recommendedList.map(({ item, reasons, score }) => {
              const isActive = activeItem?.id === item.id;
              const isDone = completedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => selectBuiltin(item)}
                  className={`text-left rounded-lg border p-3 transition-colors ${
                    isActive
                      ? "border-sage bg-sage-soft/50"
                      : "border-line bg-white hover:border-sage/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[0.85rem]">{item.kind === "audio" ? "🎧" : "🎬"}</span>
                    <span className="text-[0.78rem] font-medium text-ink leading-snug flex-1">
                      {item.titleZh}
                    </span>
                    {isDone && (
                      <span className="text-[0.62rem] text-clay-deep border border-clay/40 rounded px-1.5 py-0.5">
                        已学
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[0.68rem] text-ink-soft">
                    {item.source} · {item.duration} · {item.difficulty}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded bg-parchment text-[0.62rem] text-ink-soft"
                      >
                        {tagLabel(t)}
                      </span>
                    ))}
                  </div>
                  {reasons.length > 0 && (
                    <div className="mt-1.5 text-[0.66rem] text-sage-deep leading-snug">
                      {reasons.join(" · ")}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
            {(localSource || activeItem) && (
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
          {sourceError && <p className="text-[0.72rem] text-clay-deep">{sourceError}</p>}
        </div>
      )}

      {activeItem && (
        <div className="px-4 py-2.5 border-b border-line bg-sage-soft/20 flex items-start gap-2">
          <div className="flex-1">
            <div className="text-[0.8rem] font-medium text-ink">{activeItem.title}</div>
            <div className="text-[0.7rem] text-ink-soft mt-0.5">{activeItem.description}</div>
          </div>
          <div className="flex flex-wrap gap-1 shrink-0">
            {activeItem.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-parchment text-[0.66rem] text-ink-soft">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2">
        <div className="border-b md:border-b-0 md:border-r border-line">
          <div className="aspect-video bg-ink/90 relative flex items-center justify-center overflow-hidden">
            {isBuiltinAudio && (
              <>
                <audio
                  ref={audioRef}
                  src={activeItem!.audioUrl}
                  preload="metadata"
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
                    setSourceError("音频加载失败：链接可能已失效。可改用右上角「AI 朗读」或选择其他素材。")
                  }
                />
                <div className="w-full h-full flex flex-col items-center justify-center text-center px-8">
                  <div className="w-14 h-14 rounded-full bg-sage-soft/30 flex items-center justify-center mb-3">
                    <span className="text-[1.35rem]">{playing ? "🔊" : "🎧"}</span>
                  </div>
                  <p className="text-[0.7rem] text-cream/60 mb-2">
                    第 {activeIdx + 1} / {SEG_COUNT} 段
                  </p>
                  <p className="text-[0.92rem] leading-relaxed text-cream font-medium max-w-md">
                    {transcript[activeIdx].en}
                  </p>
                  <p className="text-[0.72rem] text-cream/60 mt-2 leading-relaxed max-w-md">
                    {transcript[activeIdx].zh}
                  </p>
                </div>
              </>
            )}

            {isBuiltinEmbed && (
              <iframe
                src={builtinEmbedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                title={activeItem!.title}
              />
            )}

            {isLocalVideo && (
              <video
                ref={videoRef}
                src={localSource!.value}
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
            )}

            {isLocalEmbed && (
              <iframe
                src={localEmbedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                title="学习视频"
              />
            )}

            {!activeItem && !localSource && (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-8">
                <div className="w-14 h-14 rounded-full bg-sage-soft/30 flex items-center justify-center mb-3">
                  <span className="text-[1.35rem]">{playing ? "🔊" : "🎧"}</span>
                </div>
                <p className="text-[0.7rem] text-cream/60 mb-2">
                  英文文稿朗读 · 第 {readIdx + 1} / {SEG_COUNT} 段
                </p>
                <p className="text-[0.92rem] leading-relaxed text-cream font-medium max-w-md">
                  {transcript[readIdx].en}
                </p>
                <p className="text-[0.7rem] text-cream/50 mt-3 leading-relaxed">
                  点播放用浏览器语音朗读；或点上方「选择素材」挑一个内置音频/视频。
                </p>
              </div>
            )}

            {playing && !isBuiltinEmbed && !isLocalEmbed && (
              <span className="absolute top-3 right-3 flex items-center gap-1.5 text-[0.7rem] text-cream/80">
                <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
                {rate}×
              </span>
            )}
          </div>

          <div className="px-4 pb-4 pt-3 bg-white/60">
            <div className="flex items-center gap-2">
              <span className="text-[0.72rem] text-ink-soft tabular-nums w-10">
                {hasReadableProgress ? fmt(elapsed) : `第${activeIdx + 1}段`}
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
                {hasReadableProgress && duration > 0 ? fmt(duration) : fmt(TOTAL_SECONDS)}
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

        <div className="bg-white/70">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-line">
            <span className="text-[0.78rem] font-medium text-ink">📜 同步文稿</span>
            <span className="text-[0.7rem] text-ink-soft">点段落跳转 · 划选可收藏</span>
          </div>
          <div
            ref={contentRef}
            className="h-[320px] md:h-[340px] overflow-y-auto px-4 py-3 space-y-2.5"
          >
            {transcript.map((seg, i) => {
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
                  {seg.zh && (
                    <span
                      className={`block mt-0.5 pl-8 text-[0.76rem] leading-relaxed ${
                        active ? "text-ink-soft" : "text-ink-soft/50"
                      }`}
                    >
                      {seg.zh}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {(isBuiltinEmbed || isLocalEmbed) && (
        <p className="px-4 py-2 text-[0.7rem] text-ink-soft border-t border-line bg-white/60">
          嵌入视频由站点自带控制条播放，浏览器无法读取其播放进度，文稿可点击段落手动定位；
          若需要自动同步，请选择「🎧 音频素材」或上传本地视频文件。
        </p>
      )}
      {sourceError && !showSourcePanel && (
        <p className="px-4 py-2 text-[0.7rem] text-clay-deep border-t border-line bg-white/60">
          {sourceError}
        </p>
      )}
      <p className="px-4 py-2 text-[0.69rem] text-ink-soft/70 border-t border-line bg-white/50">
        文稿为内置示例教材。选择内置音频可自动高亮；选择视频可手动点击定位；也可右上角换成你自己的视频。
      </p>

      <SelectionCollector containerRef={contentRef} />
    </div>
  );
}
