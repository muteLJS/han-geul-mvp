import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function PATCH(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, writingGoal } = await req.json();
  const updates = {};

  if (name !== undefined) {
    if (!name.trim()) return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
    updates.name = name.trim();
  }
  if (writingGoal !== undefined) {
    const goal = Number(writingGoal);
    if (isNaN(goal) || goal < 10 || goal > 1000) {
      return NextResponse.json({ error: "목표는 10~1000자 사이여야 합니다." }, { status: 400 });
    }
    updates.writingGoal = goal;
  }

  await connectDB();
  await User.findByIdAndUpdate(session.user.id, updates);
  return NextResponse.json({ success: true });
}
