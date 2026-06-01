import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import WritingEditor from "@/components/writing/WritingEditor";

export const metadata = {
  title: "글쓰기 | 한-글",
};

export default async function WritePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex flex-col h-screen bg-hanji">
      {/* 최소 헤더 — 글쓰기 집중 */}
      <header className="w-full border-b border-border shrink-0">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-ink-light hover:text-ink transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            돌아가기
          </Link>
          <span className="text-sm font-medium text-ink">새 글</span>
          <div className="w-16" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full h-full">
          <WritingEditor writingGoal={session.user?.writingGoal ?? 100} />
        </div>
      </div>
    </div>
  );
}
