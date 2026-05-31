"use client";

const MILESTONES = [100, 150, 200, 300];

export default function CharCounter({ charCount, goal = 100 }) {
  const progress = Math.min((charCount / goal) * 100, 100);
  const reached = MILESTONES.filter((m) => charCount >= m);
  const nextMilestone = MILESTONES.find((m) => charCount < m) ?? null;

  return (
    <div className="flex flex-col gap-1.5">
      {/* 프로그레스 바 */}
      <div className="h-1 w-full bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-cheong rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        {/* 마일스톤 배지 */}
        <div className="flex gap-1">
          {MILESTONES.map((m) => (
            <span
              key={m}
              className={`text-[10px] px-1.5 py-0.5 rounded-full border transition-colors ${
                charCount >= m
                  ? "bg-cheong border-cheong text-white"
                  : "border-border text-ink-light"
              }`}
            >
              {m}
            </span>
          ))}
        </div>

        {/* 글자 수 */}
        <span className="text-xs text-ink-light tabular-nums">
          <span className={charCount >= goal ? "text-cheong font-bold" : ""}>{charCount}</span>
          {nextMilestone && (
            <span className="ml-1 text-[10px]">/ {nextMilestone}</span>
          )}
        </span>
      </div>
    </div>
  );
}
