import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PointHistory from "@/models/PointHistory";

const VOCAB_POINTS = 2;

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { wordId } = await req.json();
  if (!wordId) return NextResponse.json({ error: "wordId가 필요합니다." }, { status: 400 });

  await connectDB();

  // 오늘 이미 이 단어를 확인했는지 체크
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const already = await PointHistory.exists({
    userId: session.user.id,
    action: "vocabulary_complete",
    targetId: wordId,
    createdAt: { $gte: todayStart },
  });

  if (already) {
    return NextResponse.json({ message: "오늘 이미 확인한 단어입니다.", pointsEarned: 0 });
  }

  await PointHistory.create({
    userId: session.user.id,
    action: "vocabulary_complete",
    points: VOCAB_POINTS,
    targetId: wordId,
  });

  await User.findByIdAndUpdate(session.user.id, { $inc: { points: VOCAB_POINTS } });

  return NextResponse.json({ pointsEarned: VOCAB_POINTS });
}
