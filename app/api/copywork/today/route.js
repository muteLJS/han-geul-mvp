import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Copywork from "@/models/Copywork";
import { SEED_COPYWORK } from "@/lib/copyworkSeed";

function todayIndex(total) {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return seed % total;
}

export async function GET() {
  await connectDB();

  let count = await Copywork.countDocuments();
  if (count === 0) {
    await Copywork.insertMany(SEED_COPYWORK);
    count = SEED_COPYWORK.length;
  }

  const idx = todayIndex(count);
  const item = await Copywork.findOne().skip(idx).lean();
  if (!item) return NextResponse.json({ error: "필사 데이터를 불러올 수 없습니다." }, { status: 500 });

  return NextResponse.json({
    copywork: {
      _id: String(item._id),
      title: item.title,
      sourceTitle: item.sourceTitle ?? "",
      author: item.author ?? "",
      content: item.content,
      level: item.level ?? 1,
      tags: item.tags ?? [],
    },
  });
}
