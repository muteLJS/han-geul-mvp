import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Writing from "@/models/Writing";
import Feedback from "@/models/Feedback";
import { getFeedback } from "@/lib/openai";

// 권한별 하루 되짚음 횟수
const DAILY_LIMIT = { free: 3, active: 20 };

async function getDailyUsage(userId) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return Feedback.countDocuments({ userId, createdAt: { $gte: start } });
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { writingId, mode = "simple" } = await req.json();
  if (!writingId) return NextResponse.json({ error: "writingId가 필요합니다." }, { status: 400 });

  await connectDB();

  // 글 소유권 확인
  const writing = await Writing.findById(writingId).lean();
  if (!writing) return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  if (String(writing.userId) !== session.user.id)
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  // 최소 글자 수 확인
  if ((writing.charCount ?? 0) < 10) {
    return NextResponse.json({ error: "글이 너무 짧습니다. 10자 이상 작성해주세요." }, { status: 400 });
  }

  // 하루 사용 횟수 확인
  const subStatus = session.user?.subscription?.status ?? "free";
  const limit = DAILY_LIMIT[subStatus] ?? DAILY_LIMIT.free;
  const usage = await getDailyUsage(session.user.id);

  if (usage >= limit) {
    return NextResponse.json(
      { error: `오늘 되짚음을 ${limit}회 모두 사용했습니다. 내일 다시 시도해주세요.`, limitReached: true },
      { status: 429 }
    );
  }

  // 구독자만 detail 모드 허용
  const allowedMode = subStatus === "active" ? mode : "simple";

  // OpenAI 호출
  const result = await getFeedback(writing.content, allowedMode);

  // 피드백 저장
  const suggestions = [
    ...(result.vocabularySuggestions ?? []).map((s) => ({
      type: "vocabulary",
      original: s.original,
      suggestion: (s.suggestions ?? []).join(" / "),
      reason: s.reason ?? "",
    })),
    ...(result.flowSuggestions ?? []).map((s) => ({
      type: "flow",
      original: s.target,
      suggestion: s.suggestion,
      reason: s.reason ?? "",
    })),
  ];

  const feedback = await Feedback.create({
    userId: session.user.id,
    writingId,
    mode: allowedMode,
    suggestions,
    question: result.meaningQuestion ?? "",
  });

  // Writing에 feedbackId 연결
  await Writing.findByIdAndUpdate(writingId, { $addToSet: { feedbackIds: feedback._id } });

  const remaining = limit - usage - 1;

  return NextResponse.json({
    feedback: {
      _id: String(feedback._id),
      mode: allowedMode,
      suggestions,
      question: feedback.question,
      createdAt: feedback.createdAt,
    },
    raw: result,
    remaining,
  });
}
