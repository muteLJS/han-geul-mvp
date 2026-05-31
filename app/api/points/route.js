import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import PointHistory from "@/models/PointHistory";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const [history, user] = await Promise.all([
    PointHistory.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean(),
    User.findById(session.user.id).select("points").lean(),
  ]);

  return NextResponse.json({
    points: user?.points ?? 0,
    history: history.map((h) => ({
      _id: String(h._id),
      action: h.action,
      points: h.points,
      createdAt: h.createdAt.toISOString(),
    })),
  });
}
