export default function StatCard({ label, value, unit, sub, accent = false }) {
  return (
    <div className="flex flex-col gap-1 p-4 bg-white rounded-2xl border border-border">
      <p className="text-xs text-ink-light">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${accent ? "text-cheong" : "text-ink"}`}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-sm text-ink-light">{unit}</span>}
      </div>
      {sub && <p className="text-[11px] text-ink-light">{sub}</p>}
    </div>
  );
}
