import Link from "next/link";

export default function QuickActionCard({ href, label, description, colorClass, icon }) {
  return (
    <Link
      href={href}
      className={`flex flex-col gap-1.5 p-4 rounded-2xl border border-border bg-white active:opacity-75 transition-opacity ${colorClass}`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-bold text-ink">{label}</span>
      <span className="text-xs text-ink-light leading-snug">{description}</span>
    </Link>
  );
}
