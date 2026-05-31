import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Book from "@/models/Book";
import Writing from "@/models/Writing";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import BookActions from "@/components/library/BookActions";
import BookReadingView from "@/components/library/BookReadingView";

export async function generateMetadata({ params }) {
  await connectDB();
  const book = await Book.findById(params.id).lean();
  return { title: book ? `${book.title} | 한-글` : "책 | 한-글" };
}

export default async function BookDetailPage({ params }) {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();
  const book = await Book.findById(params.id).lean();
  if (!book) notFound();
  if (String(book.userId) !== session.user.id) redirect("/library");

  // writingIds 순서를 유지하며 글 로드
  const writingDocs = await Writing.find({ _id: { $in: book.writingIds } })
    .select("_id title category charCount content createdAt")
    .lean();

  // writingIds 배열 순서대로 정렬
  const writingMap = Object.fromEntries(writingDocs.map((w) => [String(w._id), w]));
  const orderedWritings = book.writingIds
    .map((id) => writingMap[String(id)])
    .filter(Boolean);

  // 책에 추가 가능한 글
  const bookWritingIds = new Set(book.writingIds.map(String));
  const allWritings = await Writing.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .select("_id title category charCount createdAt")
    .lean();
  const addableWritings = allWritings.filter((w) => !bookWritingIds.has(String(w._id)));

  const serializeWriting = (w) => ({
    _id: String(w._id),
    title: w.title ?? "",
    category: w.category,
    charCount: w.charCount ?? 0,
    content: w.content ?? "",
    createdAt: w.createdAt?.toISOString(),
  });

  const serializedBook = {
    _id: String(book._id),
    title: book.title,
    description: book.description ?? "",
    status: book.status,
    visibility: book.visibility ?? "private",
    writingIds: book.writingIds.map(String),
    completedAt: book.completedAt?.toISOString() ?? null,
    createdAt: book.createdAt?.toISOString(),
  };

  const serializedWritings = orderedWritings.map(serializeWriting);
  const serializedAddable = addableWritings.map((w) => ({
    _id: String(w._id),
    title: w.title ?? "",
    category: w.category,
    charCount: w.charCount ?? 0,
    createdAt: w.createdAt?.toISOString(),
  }));

  const isCompleted = book.status === "completed";

  return (
    <div className="flex flex-col min-h-screen bg-hanji">
      <Header />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-5 pb-24">
        {/* 뒤로가기 */}
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 text-sm text-ink-light hover:text-ink mb-4 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          도서함
        </Link>

        {isCompleted ? (
          /* ── 완성된 책: 읽기 모드 ── */
          <>
            <BookReadingView book={serializedBook} writings={serializedWritings} />
            <div className="mt-4">
              <BookActions
                book={serializedBook}
                addableWritings={serializedAddable}
                writingsInBook={serializedWritings}
              />
            </div>
          </>
        ) : (
          /* ── 작성 중인 책: 편집 모드 ── */
          <>
            {/* 책 헤더 */}
            <div className="p-5 bg-white rounded-2xl border border-border mb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-ink">{serializedBook.title}</h1>
                  {serializedBook.description && (
                    <p className="text-sm text-ink-light mt-1">{serializedBook.description}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-baek text-ink-light">
                  작성 중
                </span>
              </div>
              <p className="text-xs text-ink-light mt-3">
                {serializedWritings.length}편 수록
              </p>
            </div>

            {/* 액션 (글 추가·순서·완성·삭제) */}
            <BookActions
              book={serializedBook}
              addableWritings={serializedAddable}
              writingsInBook={serializedWritings}
            />

            {/* 수록 글 목록 (읽기 전용) */}
            {serializedWritings.length > 0 && (
              <div className="mt-5">
                <h2 className="text-xs font-bold text-ink-light uppercase tracking-widest mb-3">
                  수록된 글 미리보기
                </h2>
                <div className="bg-white rounded-2xl border border-border overflow-hidden">
                  {serializedWritings.map((w, i) => (
                    <Link
                      key={w._id}
                      href={`/write/${w._id}`}
                      className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-baek transition-colors"
                    >
                      <span className="text-xs text-ink-light w-4 tabular-nums shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink truncate">{w.title || "제목 없음"}</p>
                        <p className="text-xs text-ink-light">{w.charCount}자</p>
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-ink-light">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
