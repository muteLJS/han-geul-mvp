import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  const { name, email, password } = await req.json();

  if (!name?.trim() || !email?.trim() || !password)
    return NextResponse.json({ error: "모든 항목을 입력해주세요." }, { status: 400 });

  if (password.length < 8)
    return NextResponse.json({ error: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });

  await connectDB();

  const existing = await User.findOne({ email: email.trim().toLowerCase() });
  if (existing)
    return NextResponse.json({ error: "이미 사용 중인 이메일입니다." }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    email: email.trim().toLowerCase(),
    name: name.trim(),
    provider: "credentials",
    passwordHash,
  });

  return NextResponse.json({ ok: true });
}
