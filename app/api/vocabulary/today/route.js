import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Vocabulary from "@/models/Vocabulary";
import { SEED_VOCABULARY } from "@/lib/vocabularySeed";

// 날짜 기반 결정적 인덱스 — 같은 날 항상 같은 단어
function todayIndex(total) {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return seed % total;
}

export async function GET() {
  await connectDB();

  let count = await Vocabulary.countDocuments();

  // DB가 비어 있으면 시드 데이터 삽입
  if (count === 0) {
    await Vocabulary.insertMany(
      SEED_VOCABULARY.map((v) => ({ ...v, source: "manual" }))
    );
    count = SEED_VOCABULARY.length;
  }

  const idx = todayIndex(count);
  const word = await Vocabulary.findOne().skip(idx).lean();

  if (!word) return NextResponse.json({ error: "단어를 불러올 수 없습니다." }, { status: 500 });

  return NextResponse.json({
    word: {
      _id: String(word._id),
      word: word.word,
      meaning: word.meaning,
      example: word.example ?? "",
      tags: word.tags ?? [],
      source: word.source,
    },
  });
}
