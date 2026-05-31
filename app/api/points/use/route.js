import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PointHistory from "@/models/PointHistory";

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { points, action, targetId } = await req.json();

  if (!points || points <= 0) {
    return NextResponse.json({ error: "올바른 포인트 값이 필요합니다." }, { status: 400 });
  }

  await connectDB();

  const user = await User.findById(session.user.id).select("points").lean();
  if (!user) return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });

  if (user.points < points) {
    return NextResponse.json({ error: "포인트가 부족합니다.", currentPoints: user.points }, { status: 400 });
  }

  await Promise.all([
    User.findByIdAndUpdate(session.user.id, { $inc: { points: -points } }),
    PointHistory.create({
      userId: session.user.id,
      action: action ?? "point_use",
      points: -points,
      targetId: targetId ?? null,
    }),
  ]);

  const updated = await User.findById(session.user.id).select("points").lean();
  return NextResponse.json({ remainingPoints: updated.points });
}
