export default function MonthlyTrend({ data }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="p-4 bg-white rounded-2xl border border-border">
      <p className="text-xs font-bold text-ink-light uppercase tracking-widest mb-4">
        월별 작성 추이
      </p>

      <div className="flex items-end gap-2 h-24">
        {data.map(({ label, count }) => {
          const heightPct = Math.round((count / maxCount) * 100);
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-ink-light tabular-nums">{count || ""}</span>
              <div className="w-full bg-border rounded-t-sm overflow-hidden flex items-end" style={{ height: "64px" }}>
                <div
                  className="w-full bg-cheong rounded-t-sm transition-all duration-500"
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="text-[10px] text-ink-light">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
