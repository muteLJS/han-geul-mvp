import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Writing from "@/models/Writing";

const CATEGORY_LABELS = {
  daily: "일상",
  thought: "생각",
  practical: "실용",
  creative: "창작",
};

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const writings = await Writing.find({ userId: session.user.id })
    .select("category charCount createdAt")
    .lean();

  // 분야별 집계
  const categoryMap = {};
  for (const cat of Object.keys(CATEGORY_LABELS)) {
    categoryMap[cat] = { count: 0, totalChars: 0, label: CATEGORY_LABELS[cat] };
  }

  writings.forEach((w) => {
    const cat = w.category ?? "daily";
    if (categoryMap[cat]) {
      categoryMap[cat].count++;
      categoryMap[cat].totalChars += w.charCount ?? 0;
    }
  });

  const categories = Object.entries(categoryMap).map(([key, val]) => ({
    category: key,
    ...val,
  }));

  // 월별 작성 추이 (최근 6개월)
  const monthlyTrend = getMonthlyTrend(writings);

  return NextResponse.json({ categories, monthlyTrend });
}

function getMonthlyTrend(writings) {
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: `${d.getMonth() + 1}월`,
      year: d.getFullYear(),
      month: d.getMonth(),
      count: 0,
      totalChars: 0,
    });
  }

  writings.forEach((w) => {
    const d = new Date(w.createdAt);
    const entry = months.find(
      (m) => m.year === d.getFullYear() && m.month === d.getMonth()
    );
    if (entry) {
      entry.count++;
      entry.totalChars += w.charCount ?? 0;
    }
  });

  return months.map(({ label, count, totalChars }) => ({ label, count, totalChars }));
}
