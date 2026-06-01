import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Writing from "@/models/Writing";
import WritingEditor from "@/components/writing/WritingEditor";

export const metadata = {
  title: "글 수정 | 한-글",
};

export default async function WriteEditPage({ params }) {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();
  const writing = await Writing.findById(params.id).lean();

  if (!writing) notFound();
  if (String(writing.userId) !== session.user.id) redirect("/write");

  // ObjectId → string 직렬화
  const serialized = {
    _id: String(writing._id),
    title: writing.title ?? "",
    content: writing.content,
    category: writing.category,
    charCount: writing.charCount,
  };

  return (
    <div className="flex flex-col h-screen bg-hanji">
      <header className="w-full border-b border-border shrink-0">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
          <Link
            href="/library"
            className="flex items-center gap-1.5 text-sm text-ink-light hover:text-ink transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            도서함
          </Link>
          <span className="text-sm font-medium text-ink">글 수정</span>
          <div className="w-16" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full h-full">
          <WritingEditor
            initialWriting={serialized}
            writingGoal={session.user?.writingGoal ?? 100}
          />
        </div>
      </div>
    </div>
  );
}
