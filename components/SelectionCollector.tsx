"use client";

import { useEffect, useRef, useState } from "react";
import { useVocabStore } from "@/components/VocabStore";
import { defineVocab } from "@/lib/ai";

interface SelectionCollectorProps {
  // 允许划词收藏的容器。默认整个文档，但通常只应在视频文稿区域启用。
  containerRef?: React.RefObject<HTMLElement | null>;
}

// 划词收藏弹层：鼠标划选英文短语后，在选区附近弹出「收藏」按钮，
// 点击后加入全局收藏池（与视频默认核心好词合并，共同进入闪卡复习）。
export default function SelectionCollector({
  containerRef,
}: SelectionCollectorProps) {
  const { add, update, keyOf } = useVocabStore();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [justAdded, setJustAdded] = useState(false);
  const [defining, setDefining] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onMouseUp(e: MouseEvent) {
      // 点击弹层本身不触发
      const target = e.target as HTMLElement;
      if (target.closest("[data-collector]")) return;

      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.toString().trim().length === 0) {
        setPos(null);
        setSelectedText("");
        return;
      }

      const text = sel.toString().trim();
      // 只对英文单词/短语开放划词收藏（含空格与撇号/连字符）
      if (!/^[A-Za-z][A-Za-z\s'’-]*$/.test(text)) {
        setPos(null);
        setSelectedText("");
        return;
      }

      // 容器限定：若指定了容器，且选区不在容器内，则忽略
      if (containerRef?.current && !containerRef.current.contains(e.target as Node)) {
        setPos(null);
        setSelectedText("");
        return;
      }

      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setSelectedText(text);
      setJustAdded(false);
      setPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      });
    }

    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, [containerRef]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function collect() {
    if (!selectedText || defining) return;
    setDefining(true);
    // 先立即收藏（占位），再异步调用 DeepSeek 补释义
    add({
      id: `sel-${keyOf(selectedText)}`,
      expression: selectedText,
      source: "selection",
    });
    const res = await defineVocab(selectedText);
    if (res.ok) {
      update(selectedText, {
        meaning: res.data.meaning,
        example: res.data.example,
        sourceSentence: res.data.sourceSentence,
        context: res.data.context,
      });
    }
    setDefining(false);
    setJustAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setPos(null);
      setSelectedText("");
      setJustAdded(false);
    }, 1200);
  }

  if (!pos || !selectedText) return null;

  return (
    <div
      data-collector
      className="fixed z-50 -translate-x-1/2 -translate-y-full"
      style={{ left: pos.x, top: pos.y }}
    >
      <div className="flex items-center gap-1.5 rounded-xl bg-ink text-cream px-2.5 py-1.5 shadow-lg">
        <span className="text-[0.78rem] text-cream/90 max-w-[16rem] truncate">
          “{selectedText}”
        </span>
        {justAdded ? (
          <span className="text-[0.78rem] text-sage-soft font-medium whitespace-nowrap">
            ✓ 已收藏
          </span>
        ) : defining ? (
          <span className="text-[0.78rem] text-sage-soft whitespace-nowrap">
            AI 补释义中…
          </span>
        ) : (
          <button
            onClick={collect}
            className="text-[0.78rem] font-medium text-sage-soft hover:text-white whitespace-nowrap"
          >
            ＋ 收藏
          </button>
        )}
      </div>
      <div className="mx-auto w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-ink" />
    </div>
  );
}
