import Link from "next/link";

const CATEGORY_COLOR = {
  daily: "text-cheong bg-cheong-light",
  thought: "text-heuk bg-baek",
  practical: "text-jeok bg-jeok-light",
  creative: "text-hwang bg-hwang-light",
};

const CATEGORY_LABEL = {
  daily: "일상",
  thought: "생각",
  practical: "실용",
  creative: "창작",
};

function formatDate(dateStr) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

export default function WritingCard({ writing }) {
  const colorClass = CATEGORY_COLOR[writing.category] ?? "text-ink-light bg-baek";
  const label = CATEGORY_LABEL[writing.category] ?? writing.category;

  return (
    <Link
      href={`/write/${writing._id}`}
      className="block p-4 bg-white rounded-2xl border border-border hover:border-cheong active:opacity-75 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-ink truncate">
            {writing.title || "제목 없음"}
          </p>
          <p className="text-xs text-ink-light mt-0.5">
            {formatDate(writing.createdAt)} · {writing.charCount}자
          </p>
        </div>
        <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
          {label}
        </span>
      </div>
    </Link>
  );
}
