"use client";

import type { Star } from "@/lib/types";

interface StarTooltipProps {
  star: Star;
  x: number;
  y: number;
}

export default function StarTooltip({ star, x, y }: StarTooltipProps) {
  const date = new Date(star.timestamp);
  const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;

  return (
    <div
      className="pointer-events-none absolute z-50 rounded-xl border border-white/10 bg-[#1a1a3a]/95 px-4 py-3 shadow-2xl backdrop-blur-sm"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -120%)",
        maxWidth: 260,
      }}
    >
      <div className="mb-1 flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: star.color }}
        />
        <span className="text-xs font-medium" style={{ color: star.color }}>
          {star.category}
        </span>
        <span className="ml-auto text-xs text-white/40">{formattedDate}</span>
      </div>
      {star.keywords.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {star.keywords.map((kw) => (
            <span
              key={kw}
              className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70"
            >
              #{kw}
            </span>
          ))}
        </div>
      )}
      <p className="line-clamp-2 text-xs leading-relaxed text-white/60">
        {star.caption || "캡션 없음"}
      </p>
      <div className="mt-1.5 flex items-center gap-1 text-xs text-white/40">
        <svg
          className="h-3 w-3"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span>{star.likesCount.toLocaleString()}</span>
      </div>
    </div>
  );
}
