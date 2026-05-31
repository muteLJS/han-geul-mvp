import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Book from "@/models/Book";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const books = await Book.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .select("_id title description status writingIds createdAt updatedAt")
    .lean();

  return NextResponse.json({ books });
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description = "" } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 });
  }

  await connectDB();
  const book = await Book.create({
    userId: session.user.id,
    title: title.trim(),
    description,
  });

  return NextResponse.json({ book }, { status: 201 });
}
