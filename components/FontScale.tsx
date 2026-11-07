"use client";

import { useEffect, useState } from "react";

const OPTIONS = [
  { key: "small", label: "小", scale: 1.0 },
  { key: "medium", label: "标准", scale: 1.1 },
  { key: "large", label: "大", scale: 1.25 },
  { key: "xlarge", label: "特大", scale: 1.4 },
];

export default function FontScale() {
  const [active, setActive] = useState("medium");

  useEffect(() => {
    const saved = localStorage.getItem("ll-font-scale");
    if (saved) setActive(saved);
  }, []);

  useEffect(() => {
    const opt = OPTIONS.find((o) => o.key === active) ?? OPTIONS[1];
    document.documentElement.style.setProperty("--font-scale", String(opt.scale));
    localStorage.setItem("ll-font-scale", active);
  }, [active]);

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[0.75rem] text-ink-soft">字号</span>
      <div className="flex items-center rounded-full bg-parchment p-0.5">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            onClick={() => setActive(o.key)}
            className={`px-2.5 py-1 rounded-full text-[0.75rem] transition-colors ${
              active === o.key
                ? "bg-sage text-cream font-medium"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
