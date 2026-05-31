function getIntensity(chars) {
  if (chars === 0) return 0;
  if (chars < 100) return 1;
  if (chars < 200) return 2;
  if (chars < 300) return 3;
  return 4;
}

const INTENSITY_CLASS = [
  "bg-border",
  "bg-cheong/30",
  "bg-cheong/50",
  "bg-cheong/75",
  "bg-cheong",
];

function formatDay(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function ActivityHeatmap({ data }) {
  // 최근 30일 — 7칸씩 행으로 나눠 달력 형태
  const maxChars = Math.max(...data.map((d) => d.chars), 1);

  return (
    <div className="p-4 bg-white rounded-2xl border border-border">
      <p className="text-xs font-bold text-ink-light uppercase tracking-widest mb-3">
        최근 30일 활동
      </p>

      {/* 히트맵 그리드 */}
      <div className="grid grid-cols-10 gap-1.5">
        {data.map(({ date, chars }) => {
          const intensity = getIntensity(chars);
          return (
            <div
              key={date}
              title={`${formatDay(date)}: ${chars.toLocaleString()}자`}
              className={`aspect-square rounded-sm ${INTENSITY_CLASS[intensity]}`}
            />
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px] text-ink-light">적음</span>
        {INTENSITY_CLASS.map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
        ))}
        <span className="text-[10px] text-ink-light">많음</span>
      </div>
    </div>
  );
}
