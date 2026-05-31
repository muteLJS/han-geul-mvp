import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Writing from "@/models/Writing";
import PointHistory from "@/models/PointHistory";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = session.user.id;

  const [writings, user, recentPointHistory] = await Promise.all([
    Writing.find({ userId }).select("charCount createdAt category").lean(),
    User.findById(userId).select("points writingGoal subscription").lean(),
    PointHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("action points createdAt")
      .lean(),
  ]);

  // ── 기본 통계 ────────────────────────────────────────
  const totalWritings = writings.length;
  const totalChars = writings.reduce((s, w) => s + (w.charCount ?? 0), 0);

  // 목표 달성 글 수 (writingGoal 이상)
  const goal = user?.writingGoal ?? 100;
  const goalAchieved = writings.filter((w) => (w.charCount ?? 0) >= goal).length;

  // 연속 작성 스트릭 계산
  const writingDays = new Set(
    writings.map((w) => w.createdAt.toISOString().slice(0, 10))
  );
  const streak = calcStreak(writingDays);

  // 이번 달 작성 수
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthWritings = writings.filter((w) => new Date(w.createdAt) >= thisMonthStart);

  // 최근 30일 일별 글자 수 (히트맵용)
  const last30 = getLast30DaysActivity(writings);

  return NextResponse.json({
    summary: {
      totalWritings,
      totalChars,
      goalAchieved,
      streak,
      thisMonthCount: thisMonthWritings.length,
      points: user?.points ?? 0,
    },
    last30DaysActivity: last30,
    recentPointHistory: recentPointHistory.map((p) => ({
      action: p.action,
      points: p.points,
      createdAt: p.createdAt.toISOString(),
    })),
  });
}

// ── 헬퍼 ────────────────────────────────────────────────
function calcStreak(writingDays) {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (writingDays.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

function getLast30DaysActivity(writings) {
  const map = {};
  const today = new Date();

  // 초기화
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
