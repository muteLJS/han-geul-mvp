import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// Toss Payments 웹훅 — 결제 상태 동기화
// 웹훅 시크릿은 Toss 대시보드에서 발급받아 환경변수에 저장
export async function POST(req) {
  const body = await req.json();
  const { eventType, data } = body;

  // 지원하는 이벤트만 처리
  if (!["PAYMENT_STATUS_CHANGED", "CANCEL_STATUS_CHANGED"].includes(eventType)) {
    return NextResponse.json({ received: true });
  }

  const { status, orderId, metadata } = data ?? {};

  if (!orderId) return NextResponse.json({ received: true });

  // orderId에서 플랜과 userId 추출
  const match = orderId.match(/^hangul-(monthly|yearly)-([a-f0-9]+)-/);
  if (!match) return NextResponse.json({ received: true });

  const [, plan, userId] = match;

  await connectDB();

  if (status === "CANCELED" || status === "ABORTED") {
    await User.findByIdAndUpdate(userId, {
      "subscription.status": "expired",
    });
  } else if (status === "DONE") {
    const now = new Date();
    const endedAt = new Date(now);
    if (plan === "monthly") endedAt.setMonth(endedAt.getMonth() + 1);
    else endedAt.setFullYear(endedAt.getFullYear() + 1);

    await User.findByIdAndUpdate(userId, {
      "subscription.status": "active",
      "subscription.plan": plan,
      "subscription.startedAt": now,
      "subscription.endedAt": endedAt,
    });
  }

  return NextResponse.json({ received: true });
}
