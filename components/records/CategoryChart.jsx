const CATEGORY_COLOR = {
  daily: "bg-cheong",
  thought: "bg-heuk",
  practical: "bg-jeok",
  creative: "bg-hwang",
};

export default function CategoryChart({ categories }) {
  const maxCount = Math.max(...categories.map((c) => c.count), 1);

  return (
    <div className="p-4 bg-white rounded-2xl border border-border">
      <p className="text-xs font-bold text-ink-light uppercase tracking-widest mb-4">
        분야별 기록
      </p>

      <div className="flex flex-col gap-3">
        {categories.map((cat) => {
          const pct = Math.round((cat.count / maxCount) * 100);
          const barColor = CATEGORY_COLOR[cat.category] ?? "bg-cheong";

          return (
            <div key={cat.category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-ink font-medium">{cat.label}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-ink">{cat.count}</span>
                  <span className="text-xs text-ink-light ml-1">편</span>
                  <span className="text-xs text-ink-light ml-2">
                    {cat.totalChars.toLocaleString()}자
                  </span>
                </div>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
