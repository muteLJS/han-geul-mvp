import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Copywork from "@/models/Copywork";
import { SEED_COPYWORK } from "@/lib/copyworkSeed";

export async function GET() {
  const session = await auth();

  await connectDB();

  let count = await Copywork.countDocuments();
  if (count === 0) {
    await Copywork.insertMany(SEED_COPYWORK);
  }

  // 무료 회원: 오늘의 필사 1개 / 구독 회원: 전체 목록
  const isSubscribed = session?.user?.subscription?.status === "active";
  const limit = isSubscribed ? 50 : 7; // 구독자는 최근 7일치도 무료와 같은 수준 접근

  const items = await Copywork.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("_id title author sourceTitle level tags")
    .lean();

  return NextResponse.json({
    copyworks: items.map((c) => ({ ...c, _id: String(c._id) })),
  });
}
