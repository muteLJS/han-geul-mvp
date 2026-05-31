import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { confirmPayment, PLANS } from "@/lib/toss";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { paymentKey, orderId, amount } = await req.json();

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json({ error: "결제 정보가 올바르지 않습니다." }, { status: 400 });
  }

  // orderId에서 플랜 추출 (hangul-monthly-... 또는 hangul-yearly-...)
  const planMatch = orderId.match(/^hangul-(monthly|yearly)-/);
  if (!planMatch) return NextResponse.json({ error: "유효하지 않은 주문입니다." }, { status: 400 });

  const plan = planMatch[1];
  const planInfo = PLANS[plan];

  // 금액 검증
  if (Number(amount) !== planInfo.amount) {
    return NextResponse.json({ error: "결제 금액이 일치하지 않습니다." }, { status: 400 });
  }

  // Toss 결제 승인 요청
  let payment;
  try {
    payment = await confirmPayment({ paymentKey, orderId, amount: Number(amount) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // 구독 만료일 계산
  const now = new Date();
  const endedAt = new Date(now);
  if (plan === "monthly") {
    endedAt.setMonth(endedAt.getMonth() + 1);
  } else {
    endedAt.setFullYear(endedAt.getFullYear() + 1);
  }

  // 사용자 구독 상태 업데이트
  await connectDB();
  await User.findByIdAndUpdate(session.user.id, {
    "subscription.status": "active",
    "subscription.plan": plan,
    "subscription.startedAt": now,
    "subscription.endedAt": endedAt,
  });

  return NextResponse.json({
    success: true,
    plan,
    endedAt: endedAt.toISOString(),
    paymentKey: payment.paymentKey,
  });
}
