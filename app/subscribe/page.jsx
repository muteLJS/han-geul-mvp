import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import SubscribeButton from "@/components/subscription/SubscribeButton";

export const metadata = {
  title: "구독 | 한-글",
};

const FEATURES = [
  "AI 되짚음 하루 20회 (무료 3회)",
  "AI 되짚음 상세 모드",
  "월별 성장 리포트",
  "필사 라이브러리 확장",
  "구독 전용 테마",
  "글쓰기 목표 자유 설정",
];

export default async function SubscribePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isActive = session.user?.subscription?.status === "active";
  const plan = session.user?.subscription?.plan;
  const endedAt = session.user?.subscription?.endedAt;

  return (
    <div className="flex flex-col min-h-screen bg-hanji">
      <Header />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-5 pb-24">
        {/* 이미 구독 중 */}
        {isActive ? (
          <div className="flex flex-col items-center gap-5 py-8">
            <div className="text-center">
              <p className="text-xs font-bold text-cheong uppercase tracking-widest mb-2">구독 중</p>
              <h1 className="text-2xl font-bold text-ink">한-글 구독 멤버입니다</h1>
              <p className="text-sm text-ink-light mt-2">
                {plan === "yearly" ? "연 구독" : "월 구독"} ·{" "}
                {endedAt
                  ? `${new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(endedAt))} 까지`
                  : ""}
              </p>
            </div>

            <div className="w-full p-5 bg-white rounded-2xl border border-cheong/30">
              <p className="text-xs font-bold text-ink-light uppercase tracking-widest mb-3">
                구독 혜택
              </p>
              <ul className="flex flex-col gap-2">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-ink">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-cheong">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/settings"
              className="text-sm text-ink-light underline underline-offset-2"
            >
              설정으로 돌아가기
            </Link>
          </div>
        ) : (
          /* 구독 플랜 선택 */
          <div className="flex flex-col gap-5">
            <div className="text-center py-4">
              <h1 className="text-2xl font-bold text-ink">한-글 구독</h1>
              <p className="text-sm text-ink-light mt-2">
                더 깊이 쓰고 싶다면, 구독으로 확장하세요
              </p>
            </div>

            {/* 혜택 목록 */}
            <div className="p-5 bg-white rounded-2xl border border-border">
              <p className="text-xs font-bold text-ink-light uppercase tracking-widest mb-3">
                구독 혜택
              </p>
              <ul className="flex flex-col gap-2.5">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-ink">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-cheong">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* 플랜 카드 */}
            <div className="flex flex-col gap-3">
              {/* 연 구독 */}
              <div className="relative p-5 bg-white rounded-2xl border-2 border-cheong">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold bg-cheong text-white px-3 py-1 rounded-full">
                  추천 · 33% 할인
                </span>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-ink">연 구독</p>
                    <p className="text-xs text-ink-light mt-0.5">월 3,325원 상당</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-ink">39,900원</p>
                    <p className="text-xs text-ink-light">/년</p>
                  </div>
                </div>
                <SubscribeButton plan="yearly" label="연 구독 시작하기" amount={39900} />
              </div>

              {/* 월 구독 */}
              <div className="p-5 bg-white rounded-2xl border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-ink">월 구독</p>
                    <p className="text-xs text-ink-light mt-0.5">언제든 해지 가능</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-ink">4,900원</p>
                    <p className="text-xs text-ink-light">/월</p>
                  </div>
                </div>
                <SubscribeButton plan="monthly" label="월 구독 시작하기" amount={4900} />
              </div>
            </div>

            <p className="text-xs text-ink-light text-center leading-relaxed">
              테스트 환경에서는 Toss Payments 테스트 카드를 사용합니다.
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
