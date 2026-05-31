import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Writing from "@/models/Writing";
import PointHistory from "@/models/PointHistory";
import User from "@/models/User";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import StatCard from "@/components/records/StatCard";
import ActivityHeatmap from "@/components/records/ActivityHeatmap";
import CategoryChart from "@/components/records/CategoryChart";
import MonthlyTrend from "@/components/records/MonthlyTrend";
import PointHistoryList from "@/components/records/PointHistoryList";
import HaniMessage from "@/components/hani/HaniMessage";

export const metadata = {
  title: "기록 | 한-글",
};

const CATEGORY_LABELS = {
  daily: "일상",
  thought: "생각",
  practical: "실용",
  creative: "창작",
};

function calcStreak(writings) {
  const days = new Set(writings.map((w) => w.createdAt.toISOString().slice(0, 10)));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (days.has(d.toISOString().slice(0, 10))) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

function getLast30Days(writings) {
  const map = {};
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    map[d.toISOString().slice(0, 10)] = 0;
  }
  writings.forEach((w) => {
    const key = w.createdAt.toISOString().slice(0, 10);
    if (key in map) map[key] += w.charCount ?? 0;
  });
  return Object.entries(map).map(([date, chars]) => ({ date, chars }));
}

function getCategoryStats(writings) {
  const map = Object.fromEntries(
    Object.keys(CATEGORY_LABELS).map((k) => [k, { count: 0, totalChars: 0, label: CATEGORY_LABELS[k] }])
  );
  writings.forEach((w) => {
    const cat = w.category ?? "daily";
    if (map[cat]) {
      map[cat].count++;
      map[cat].totalChars += w.charCount ?? 0;
    }
  });
  return Object.entries(map).map(([category, val]) => ({ category, ...val }));
}

function getMonthlyTrend(writings) {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: `${d.getMonth() + 1}월`, year: d.getFullYear(), month: d.getMonth(), count: 0, totalChars: 0 });
  }
  writings.forEach((w) => {
    const d = new Date(w.createdAt);
    const entry = months.find((m) => m.year === d.getFullYear() && m.month === d.getMonth());
    if (entry) { entry.count++; entry.totalChars += w.charCount ?? 0; }
  });
  return months.map(({ label, count, totalChars }) => ({ label, count, totalChars }));
}

export default async function RecordsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();
  const userId = session.user.id;

  const [writings, user, recentPoints] = await Promise.all([
    Writing.find({ userId }).select("charCount category createdAt").lean(),
    User.findById(userId).select("points writingGoal subscription").lean(),
    PointHistory.find({ userId }).sort({ createdAt: -1 }).limit(10)
      .select("action points createdAt").lean(),
  ]);

  const goal = user?.writingGoal ?? 100;
  const totalWritings = writings.length;
  const totalChars = writings.reduce((s, w) => s + (w.charCount ?? 0), 0);
  const goalAchieved = writings.filter((w) => (w.charCount ?? 0) >= goal).length;
  const streak = calcStreak(writings);

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthCount = writings.filter((w) => new Date(w.createdAt) >= thisMonthStart).length;

  const last30 = getLast30Days(writings);
  const categories = getCategoryStats(writings);
  const monthlyTrend = getMonthlyTrend(writings);

  const serializedPoints = recentPoints.map((p) => ({
    action: p.action,
    points: p.points,
    createdAt: p.createdAt.toISOString(),
  }));

  const isSubscribed = user?.subscription?.status === "active";

  return (
    <div className="flex flex-col min-h-screen bg-hanji">
      <Header />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-5 pb-24 flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-bold text-ink">나의 기록</h1>
          <p className="text-xs text-ink-light mt-1">지금까지 쌓아온 글쓰기 여정</p>
        </div>

        {totalWritings === 0 ? (
          <div className="flex flex-col items-center py-12">
            <HaniMessage mood="guide" message="첫 글을 쓰면 기록이 시작돼요!" size={80} />
          </div>
        ) : (
          <>
            {/* 핵심 통계 2×2 그리드 */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="총 글 수" value={totalWritings} unit="편" accent />
              <StatCard
                label="총 글자 수"
                value={totalChars}
                unit="자"
                sub={`목표 달성 ${goalAchieved}편`}
              />
              <StatCard
                label="연속 작성"
                value={streak}
                unit="일"
                sub={streak > 0 ? "이어서 써요!" : "오늘 글을 써보세요"}
                accent={streak > 0}
              />
              <StatCard
                label="이번 달"
                value={thisMonthCount}
                unit="편"
                sub={`보유 포인트 ${(user?.points ?? 0).toLocaleString()}pt`}
              />
            </div>

            {/* 30일 활동 히트맵 */}
            <ActivityHeatmap data={last30} />

            {/* 분야별 / 월별 — 구독자는 상세 표시 */}
            <CategoryChart categories={categories} />

            {isSubscribed && <MonthlyTrend data={monthlyTrend} />}

            {/* 포인트 내역 */}
            <PointHistoryList history={serializedPoints} />

            {!isSubscribed && (
              <div className="p-4 bg-white rounded-2xl border border-border text-center">
                <p className="text-sm text-ink-light mb-2">
                  구독하면 월별 추이 등 상세 리포트를 볼 수 있어요
                </p>
                <a
                  href="/subscribe"
                  className="inline-block px-5 py-2 rounded-xl bg-cheong text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  구독 알아보기
                </a>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
