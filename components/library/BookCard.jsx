import Link from "next/link";

export default function BookCard({ book }) {
  const writingCount = book.writingIds?.length ?? 0;
  const isCompleted = book.status === "completed";

  return (
    <Link
      href={`/library/books/${book._id}`}
      className="flex flex-col justify-between p-4 bg-white rounded-2xl border border-border hover:border-hwang active:opacity-75 transition-all min-h-[120px]"
    >
      <div>
        <p className="text-sm font-bold text-ink line-clamp-2">{book.title}</p>
        {book.description && (
          <p className="text-xs text-ink-light mt-1 line-clamp-1">{book.description}</p>
        )}
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-ink-light">{writingCount}편</span>
        {isCompleted ? (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-hwang-light text-hwang">
            완성
          </span>
        ) : (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-baek text-ink-light">
            작성 중
          </span>
        )}
      </div>
    </Link>
  );
}
