import { auth } from "@/lib/auth";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import TodayWordCard from "@/components/practice/TodayWordCard";
import VocabSearch from "@/components/practice/VocabSearch";

export const metadata = {
  title: "오늘의 순우리말 | 한-글",
};

async function getTodayWord() {
  // 서버 컴포넌트에서 내부 API 호출 대신 직접 DB 조회
  const { connectDB } = await import("@/lib/db");
  const Vocabulary = (await import("@/models/Vocabulary")).default;
  const { SEED_VOCABULARY } = await import("@/lib/vocabularySeed");

  await connectDB();

  let count = await Vocabulary.countDocuments();
  if (count === 0) {
    await Vocabulary.insertMany(SEED_VOCABULARY.map((v) => ({ ...v, source: "manual" })));
    count = SEED_VOCABULARY.length;
  }

  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const idx = seed % count;

  const word = await Vocabulary.findOne().skip(idx).lean();
  if (!word) return null;

  return {
    _id: String(word._id),
    word: word.word,
    meaning: word.meaning,
    example: word.example ?? "",
    tags: word.tags ?? [],
  };
}

export default async function VocabularyPage() {
  const [session, todayWord] = await Promise.all([auth(), getTodayWord()]);

  return (
    <div className="flex flex-col min-h-screen bg-hanji">
      <Header />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-5 pb-24 flex flex-col gap-6">
        {/* 오늘의 단어 카드 */}
        {todayWord ? (
          <TodayWordCard word={todayWord} isLoggedIn={!!session} />
        ) : (
          <div className="p-6 bg-white rounded-2xl border border-border text-center">
            <p className="text-sm text-ink-light">오늘의 단어를 불러올 수 없습니다.</p>
          </div>
        )}

        {/* 검색 */}
        <div>
          <h2 className="text-xs font-bold text-ink-light uppercase tracking-widest mb-3">
            순우리말 찾기
          </h2>
          <VocabSearch />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
