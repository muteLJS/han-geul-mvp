import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Copywork from "@/models/Copywork";
import { SEED_COPYWORK } from "@/lib/copyworkSeed";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import RefineEditor from "@/components/practice/RefineEditor";

export const metadata = {
  title: "글 다듬기 | 한-글",
};

// 오늘의 날짜 기반 지문 — 필사와 다른 날짜 오프셋 사용
function todayRefineIndex(total) {
  const d = new Date();
  // 하루 뒤 오프셋으로 필사와 다른 지문 노출
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() + 1;
  return seed % total;
}

async function getRefinePassage() {
  await connectDB();

  let count = await Copywork.countDocuments();
  if (count === 0) {
    await Copywork.insertMany(SEED_COPYWORK);
    count = SEED_COPYWORK.length;
  }

  const idx = todayRefineIndex(count);
  const item = await Copywork.findOne().skip(idx).lean();
  if (!item) return null;

  return {
    _id: String(item._id),
    title: item.title,
    sourceTitle: item.sourceTitle ?? "",
    author: item.author ?? "",
    content: item.content,
    tags: item.tags ?? [],
  };
}

export default async function RefinePage() {
  const [session, passage] = await Promise.all([auth(), getRefinePassage()]);

  return (
    <div className="flex flex-col min-h-screen bg-hanji">
      <Header />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-5 pb-24">
        <div className="mb-5">
          <p className="text-[10px] font-bold text-cheong uppercase tracking-widest">글 다듬기</p>
          <h1 className="text-xl font-bold text-ink mt-1">AI 연습 문제</h1>
          <p className="text-xs text-ink-light mt-1">
            지문에서 다듬어볼 문장을 AI가 골라줍니다. 나만의 표현으로 바꿔보세요.
          </p>
        </div>

        {passage ? (
          <RefineEditor passage={passage} isLoggedIn={!!session} />
        ) : (
          <div className="p-6 bg-white rounded-2xl border border-border text-center">
            <p className="text-sm text-ink-light">연습 지문을 불러올 수 없습니다.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
