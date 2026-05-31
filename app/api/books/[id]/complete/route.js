import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Book from "@/models/Book";

export async function POST(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const book = await Book.findById(params.id);
  if (!book) return NextResponse.json({ error: "존재하지 않는 책입니다." }, { status: 404 });
  if (String(book.userId) !== session.user.id)
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  if (book.writingIds.length === 0) {
    return NextResponse.json({ error: "글이 하나 이상 있어야 완성할 수 있습니다." }, { status: 400 });
  }

  book.status = "completed";
  book.completedAt = new Date();
  await book.save();

  return NextResponse.json({ book: book.toObject() });
}
