import Link from "next/link";
import { auth } from "@/lib/auth";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import HaniMessage from "@/components/hani/HaniMessage";
import QuickActionCard from "@/components/common/QuickActionCard";

export const metadata = {
  title: "한-글 | 하루에 한 자씩. 한 글로-",
};

const quickActions = [
  {
    href: "/write",
    label: "자유 글쓰기",
    description: "오늘의 생각을 자유롭게",
    icon: "✍️",
    colorClass: "hover:border-cheong",
  },
  {
    href: "/practice/vocabulary",
    label: "오늘의 순우리말",
    description: "새로운 우리말 한 단어",
    icon: "📖",
    colorClass: "hover:border-baek",
  },
  {
    href: "/practice/copywork",
    label: "오늘의 필사",
    description: "좋은 문장을 손으로 익히기",
    icon: "🖋️",
    colorClass: "hover:border-jeok",
  },
  {
    href: "/library",
    label: "나의 도서함",
    description: "쌓아온 글 모아보기",
    icon: "📚",
    colorClass: "hover:border-hwang",
  },
];

function getTodayString() {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());
}

export default async function HomePage() {
  const session = await auth();
  const userName = session?.user?.name?.split(" ")[0] ?? null;
  const today = getTodayString();

  const haniMessage = userName
    ? `${userName}님, 오늘도 한 자 써볼까요?`
    : "글을 쓰면서 나를 발견하는 시간";

  return (
    <div className="flex flex-col min-h-screen bg-hanji">
      <Header />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-6 pb-24">
        {/* 날짜 */}
        <p className="text-xs text-ink-light mb-6">{today}</p>

        {/* 한이 인사 */}
        <section className="flex flex-col items-center py-6">
          <HaniMessage mood="guide" message={haniMessage} size={88} />
        </section>

        {/* 글쓰기 CTA */}
        <section className="mt-4">
          <Link
            href="/write"
            className="block w-full py-4 rounded-2xl bg-cheong text-white text-center text-sm font-bold tracking-wide hover:opacity-90 active:opacity-75 transition-opacity"
          >
            오늘의 글 쓰기
          </Link>
        </section>

        {/* 빠른 실행 */}
        <section className="mt-8">
          <h2 className="text-xs font-bold text-ink-light uppercase tracking-widest mb-3">
            연습 &amp; 탐색
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <QuickActionCard key={action.href} {...action} />
            ))}
          </div>
        </section>

        {/* 비로그인 안내 */}
        {!session && (
          <section className="mt-8 p-4 rounded-2xl bg-white border border-border text-center">
            <p className="text-sm text-ink-light mb-3">
              로그인하면 글을 저장하고<br />나만의 도서함을 만들 수 있어요
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2 rounded-xl bg-cheong text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              로그인하기
            </Link>
          </section>
        )}

        {/* 로그인 사용자 — 포인트 현황 */}
        {session && (
          <section className="mt-8 p-4 rounded-2xl bg-white border border-border flex items-center justify-between">
            <div>
              <p className="text-xs text-ink-light">보유 포인트</p>
              <p className="text-lg font-bold text-hwang">
                {session.user?.points ?? 0}
                <span className="text-sm font-normal text-ink-light ml-1">pt</span>
              </p>
            </div>
            <Link
              href="/settings"
              className="text-xs text-ink-light underline underline-offset-2"
            >
              설정
            </Link>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
