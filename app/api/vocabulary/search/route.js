import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Vocabulary from "@/models/Vocabulary";
import { searchUrimalsam } from "@/lib/urimalsam";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q) return NextResponse.json({ error: "검색어를 입력해주세요." }, { status: 400 });

  await connectDB();

  // 내부 DB 먼저 검색
  const internal = await Vocabulary.find({
    $or: [
      { word: { $regex: q, $options: "i" } },
      { meaning: { $regex: q, $options: "i" } },
      { tags: q },
    ],
  })
    .limit(10)
    .lean();

  if (internal.length > 0) {
    return NextResponse.json({
      results: internal.map((v) => ({
        _id: String(v._id),
        word: v.word,
        meaning: v.meaning,
        example: v.example ?? "",
        tags: v.tags ?? [],
        source: v.source,
      })),
      source: "internal",
    });
  }

  // 내부 결과 없으면 우리말샘 API 조회
  try {
    const apiResults = await searchUrimalsam(q, 5);
    return NextResponse.json({ results: apiResults, source: "urimalsam" });
  } catch {
    return NextResponse.json({ results: [], source: "internal" });
  }
}
