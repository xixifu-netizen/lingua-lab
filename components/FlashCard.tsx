"use client";

import { useState } from "react";

interface FlashCardData {
  id: string | number;
  expression: string;
  meaning: string;
  example: string;
}

export default function FlashCard({ card }: { card: FlashCardData }) {
  const [flipped, setFlipped] = useState(false);

  function speak(text: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.92;
      window.speechSynthesis.speak(u);
    }
  }

  return (
    <div
      className="relative w-full h-52 cursor-pointer select-none"
      onClick={() => setFlipped((f) => !f)}
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* 正面：英文表达 */}
        <div
          className="absolute inset-0 rounded-2xl border border-sage/40 bg-white flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-[1.1rem] font-medium text-ink text-center leading-snug">
            {card.expression}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              speak(card.expression);
            }}
            className="mt-4 text-[0.75rem] text-sage-deep underline underline-offset-2"
          >
            🔊 听发音
          </button>
          <p className="mt-3 text-[0.72rem] text-ink-soft">点击翻面查看释义</p>
        </div>
        {/* 背面：中文释义 + 例句 */}
        <div
          className="absolute inset-0 rounded-2xl border border-clay/40 bg-clay-soft/40 flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-[1rem] font-medium text-clay-deep text-center">
            {card.meaning}
          </p>
          <p className="mt-3 text-[0.8rem] text-ink-soft text-center leading-relaxed italic">
            {card.example}
          </p>
          <p className="mt-3 text-[0.72rem] text-ink-soft/70">点击翻回正面</p>
        </div>
      </div>
    </div>
  );
}
