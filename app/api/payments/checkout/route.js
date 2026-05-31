import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PLANS } from "@/lib/toss";
import crypto from "crypto";

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  if (!plan || !PLANS[plan]) {
    return NextResponse.json({ error: "올바른 플랜을 선택해주세요." }, { status: 400 });
  }

  const planInfo = PLANS[plan];
  // orderId: 고유 주문 ID (영문+숫자, 6~64자)
  const orderId = `hangul-${plan}-${session.user.id}-${crypto.randomBytes(6).toString("hex")}`;

  return NextResponse.json({
    orderId,
    orderName: `한-글 ${planInfo.name}`,
    amount: planInfo.amount,
    plan,
  });
}
