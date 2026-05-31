import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PointHistory from "@/models/PointHistory";

const COMPLETE_POINTS = 5;
const IMPRESSION_POINTS = 3;

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { copyworkId, impression } = await req.json();
  if (!copyworkId) return NextResponse.json({ error: "copyworkId가 필요합니다." }, { status: 400 });

  await connectDB();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let totalPoints = 0;

  // 필사 완료 포인트 (하루 1회)
  const alreadyComplete = await PointHistory.exists({
    userId: session.user.id,
    action: "copywork_complete",
    targetId: copyworkId,
    createdAt: { $gte: todayStart },
  });

  if (!alreadyComplete) {
    await PointHistory.create({
      userId: session.user.id,
      action: "copywork_complete",
      points: COMPLETE_POINTS,
      targetId: copyworkId,
    });
    totalPoints += COMPLETE_POINTS;
  }

  // 한 줄 감상 포인트 (선택, 하루 1회)
  if (impression?.trim()) {
    const alreadyImpression = await PointHistory.exists({
      userId: session.user.id,
      action: "copywork_impression",
      targetId: copyworkId,
      createdAt: { $gte: todayStart },
    });

    if (!alreadyImpression) {
      await PointHistory.create({
        userId: session.user.id,
        action: "copywork_impression",
        points: IMPRESSION_POINTS,
        targetId: copyworkId,
      });
      totalPoints += IMPRESSION_POINTS;
    }
  }

  if (totalPoints > 0) {
    await User.findByIdAndUpdate(session.user.id, { $inc: { points: totalPoints } });
  }

  return NextResponse.json({ pointsEarned: totalPoints });
}
