import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PointHistory from "@/models/PointHistory";
import { getPracticeProblems } from "@/lib/openai";

const PRACTICE_POINTS = 5;

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, practiceId, action } = await req.json();

  // action: "generate" | "complete"
  if (action === "complete") {
    if (!practiceId) return NextResponse.json({ error: "practiceId가 필요합니다." }, { status: 400 });

    await connectDB();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const already = await PointHistory.exists({
      userId: session.user.id,
      action: "practice_complete",
      targetId: practiceId,
      createdAt: { $gte: todayStart },
    });

    if (already) {
      return NextResponse.json({ pointsEarned: 0, message: "오늘 이미 완료한 연습입니다." });
    }

    await PointHistory.create({
      userId: session.user.id,
      action: "practice_complete",
      points: PRACTICE_POINTS,
      targetId: practiceId,
    });
    await User.findByIdAndUpdate(session.user.id, { $inc: { points: PRACTICE_POINTS } });

    return NextResponse.json({ pointsEarned: PRACTICE_POINTS });
  }

  // action: "generate" (기본)
  if (!content?.trim()) {
    return NextResponse.json({ error: "글 내용이 필요합니다." }, { status: 400 });
  }

  const result = await getPracticeProblems(content);
  return NextResponse.json({ problems: result.problems ?? [] });
}
