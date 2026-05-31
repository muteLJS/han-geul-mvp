import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Book from "@/models/Book";
import Writing from "@/models/Writing";

async function getBookOrFail(id, userId) {
  const book = await Book.findById(id).lean();
  if (!book) return { error: "존재하지 않는 책입니다.", status: 404 };
  if (String(book.userId) !== userId) return { error: "권한이 없습니다.", status: 403 };
  return { book };
}

export async function GET(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { error, status, book } = await getBookOrFail(params.id, session.user.id);
  if (error) return NextResponse.json({ error }, { status });

  // 포함된 글 목록 조회
  const writings = await Writing.find({ _id: { $in: book.writingIds } })
    .select("_id title category charCount createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ book, writings });
}

export async function PATCH(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { error, status } = await getBookOrFail(params.id, session.user.id);
  if (error) return NextResponse.json({ error }, { status });

  const body = await req.json();
  const updates = {};

  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.description !== undefined) updates.description = body.description;
  if (body.visibility !== undefined) updates.visibility = body.visibility;
  // writingIds 추가/제거
  if (body.addWritingId) {
    updates.$addToSet = { writingIds: body.addWritingId };
  }
  if (body.removeWritingId) {
    updates.$pull = { writingIds: body.removeWritingId };
  }
  // 글 순서 재정렬 — writingIds 배열 통째로 교체
  if (Array.isArray(body.reorderWritingIds)) {
    updates.writingIds = body.reorderWritingIds;
  }

  const updated = await Book.findByIdAndUpdate(params.id, updates, { new: true }).lean();
  return NextResponse.json({ book: updated });
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { error, status } = await getBookOrFail(params.id, session.user.id);
  if (error) return NextResponse.json({ error }, { status });

  await Book.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
