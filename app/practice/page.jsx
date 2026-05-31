import Link from "next/link";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

export const metadata = {
  title: "연습 | 한-글",
};

const practiceItems = [
  {
    href: "/practice/vocabulary",
    color: "border-baek bg-baek",
    accentColor: "text-ink",
    icon: "📖",
    title: "오늘의 순우리말",
    description: "하루 한 단어, 우리말의 결을 느껴보세요",
    badge: "+2pt",
  },
  {
    href: "/practice/copywork",
    color: "border-jeok-light bg-jeok-light",
    accentColor: "text-jeok",
    icon: "🖋️",
    title: "오늘의 필사",
    description: "좋은 문장을 손으로 익히며 글의 흐름을 배워요",
    badge: "+5pt",
  },
  {
    href: "/practice/refine",
    color: "border-cheong-light bg-cheong-light",
    accentColor: "text-cheong",
    icon: "✨",
    title: "글 다듬기",
    description: "문장을 골라 더 자연스럽게 표현해봐요",
    badge: "+5pt",
  },
];

export default function PracticePage() {
  return (
    <div className="flex flex-col min-h-screen bg-hanji">
      <Header />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-5 pb-24">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink">연습</h1>
          <p className="text-xs text-ink-light mt-1">매일 조금씩 글쓰기 실력을 키워요</p>
        </div>

        <div className="flex flex-col gap-3">
          {practiceItems.map(({ href, color, accentColor, icon, title, description, badge }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 p-4 rounded-2xl border ${color} hover:opacity-90 active:opacity-75 transition-opacity`}
            >
              <span className="text-3xl shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${accentColor}`}>{title}</p>
                <p className="text-xs text-ink-light mt-0.5 leading-snug">{description}</p>
              </div>
              <span className="shrink-0 text-xs font-bold text-hwang bg-hwang-light px-2 py-1 rounded-full">
                {badge}
              </span>
            </Link>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
