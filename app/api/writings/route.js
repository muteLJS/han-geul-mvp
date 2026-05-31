import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Writing from "@/models/Writing";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const writings = await Writing.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .select("_id title category charCount createdAt updatedAt")
    .lean();

  return NextResponse.json({ writings });
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title = "", content, category = "daily", visibility = "private" } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }

  const charCount = content.replace(/\s/g, "").length;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  await connectDB();
  const writing = await Writing.create({
    userId: session.user.id,
    title,
    content,
    category,
    visibility,
    charCount,
    wordCount,
  });

  // 포인트 지급
  const { pointsEarned } = await awardWritingPoints(session.user.id, writing._id, charCount);

  return NextResponse.json({ writing, pointsEarned }, { status: 201 });
}

// ── 포인트 지급 헬퍼 ────────────────────────────────────
import User from "@/models/User";
import PointHistory from "@/models/PointHistory";

const MILESTONES = [
  { chars: 300, action: "writing_300", points: 15 },
  { chars: 200, action: "writing_200", points: 7 },
  { chars: 150, action: "writing_150", points: 3 },
  { chars: 100, action: "writing_100", points: 10 },
];

async function awardWritingPoints(userId, writingId, charCount) {
  let totalPoints = 0;

  for (const milestone of MILESTONES) {
    if (charCount < milestone.chars) continue;

    const already = await PointHistory.exists({
      userId,
      targetId: writingId,
      action: milestone.action,
    });
    if (already) continue;

    await PointHistory.create({
      userId,
      action: milestone.action,
      points: milestone.points,
      targetId: writingId,
    });
    totalPoints += milestone.points;
  }

  if (totalPoints > 0) {
    await User.findByIdAndUpdate(userId, { $inc: { points: totalPoints } });
  }

  return { pointsEarned: totalPoints };
}
