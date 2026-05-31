import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Writing from "@/models/Writing";
import User from "@/models/User";
import PointHistory from "@/models/PointHistory";

async function getWritingOrFail(id, userId) {
  const writing = await Writing.findById(id).lean();
  if (!writing) return { error: "존재하지 않는 글입니다.", status: 404 };
  if (String(writing.userId) !== userId) return { error: "권한이 없습니다.", status: 403 };
  return { writing };
}

export async function GET(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { error, status, writing } = await getWritingOrFail(params.id, session.user.id);
  if (error) return NextResponse.json({ error }, { status });

  return NextResponse.json({ writing });
}

export async function PATCH(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { error, status, writing: existing } = await getWritingOrFail(params.id, session.user.id);
  if (error) return NextResponse.json({ error }, { status });

  const body = await req.json();
  const { title, content, category, visibility } = body;

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (content !== undefined) {
    updates.content = content;
    updates.charCount = content.replace(/\s/g, "").length;
    updates.wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  }
  if (category !== undefined) updates.category = category;
  if (visibility !== undefined) updates.visibility = visibility;

  const updated = await Writing.findByIdAndUpdate(params.id, updates, { new: true }).lean();

  // 포인트 — 글자 수 증가 시 새 마일스톤 확인
  let pointsEarned = 0;
  if (updates.charCount !== undefined && updates.charCount > (existing.charCount ?? 0)) {
    ({ pointsEarned } = await awardWritingPoints(session.user.id, params.id, updates.charCount));
  }

  return NextResponse.json({ writing: updated, pointsEarned });
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { error, status } = await getWritingOrFail(params.id, session.user.id);
  if (error) return NextResponse.json({ error }, { status });

  await Writing.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}

// ── 포인트 지급 헬퍼 ────────────────────────────────────
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
