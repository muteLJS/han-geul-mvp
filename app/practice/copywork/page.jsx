import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Copywork from "@/models/Copywork";
import { SEED_COPYWORK } from "@/lib/copyworkSeed";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import CopyworkEditor from "@/components/practice/CopyworkEditor";

export const metadata = {
  title: "오늘의 필사 | 한-글",
};

function todayIndex(total) {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return seed % total;
}

async function getTodayCopywork() {
  await connectDB();

  let count = await Copywork.countDocuments();
  if (count === 0) {
    await Copywork.insertMany(SEED_COPYWORK);
    count = SEED_COPYWORK.length;
  }

  const idx = todayIndex(count);
  const item = await Copywork.findOne().skip(idx).lean();
  if (!item) return null;

  return {
    _id: String(item._id),
    title: item.title,
    sourceTitle: item.sourceTitle ?? "",
    author: item.author ?? "",
    content: item.content,
    level: item.level ?? 1,
    tags: item.tags ?? [],
  };
}

export default async function CopyworkPage() {
  const [session, copywork] = await Promise.all([auth(), getTodayCopywork()]);

  return (
    <div className="flex flex-col min-h-screen bg-hanji">
      <Header />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-5 pb-24">
        {/* 페이지 헤더 */}
        <div className="mb-5">
          <p className="text-[10px] font-bold text-jeok uppercase tracking-widest">오늘의 필사</p>
          <h1 className="text-xl font-bold text-ink mt-1">
            {copywork?.title ?? "필사"}
          </h1>
          {copywork?.tags?.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {copywork.tags.map((tag) => (
                <span key={tag} className="text-[11px] px-2.5 py-0.5 rounded-full bg-jeok-light text-jeok">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {copywork ? (
          <CopyworkEditor copywork={copywork} isLoggedIn={!!session} />
        ) : (
          <div className="p-6 bg-white rounded-2xl border border-border text-center">
            <p className="text-sm text-ink-light">오늘의 필사를 불러올 수 없습니다.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
