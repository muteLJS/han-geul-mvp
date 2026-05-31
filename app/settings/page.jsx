import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import ThemeItem from "@/models/Theme";
import { SEED_THEMES } from "@/lib/themeSeed";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import SettingsForm from "@/components/common/SettingsForm";
import ThemeShop from "@/components/subscription/ThemeShop";

export const metadata = {
  title: "설정 | 한-글",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();

  // 테마 시드
  const themeCount = await ThemeItem.countDocuments();
  if (themeCount === 0) await ThemeItem.insertMany(SEED_THEMES);

  const [user, themes] = await Promise.all([
    User.findById(session.user.id)
      .select("name email writingGoal points selectedThemeIds selectedHaniItems subscription")
      .lean(),
    ThemeItem.find().sort({ type: 1, target: 1 }).lean(),
  ]);

  const subStatus = user?.subscription?.status ?? "free";
  const ownedIds = new Set([
    ...(user?.selectedThemeIds ?? []).map(String),
    ...(user?.selectedHaniItems ?? []).map(String),
  ]);

  const serializedUser = {
    name: user?.name ?? "",
    email: user?.email ?? "",
    writingGoal: user?.writingGoal ?? 100,
    points: user?.points ?? 0,
  };

  const themeData = {
    themes: themes.map((t) => ({
      _id: String(t._id),
      name: t.name,
      type: t.type,
      target: t.target,
      pointPrice: t.pointPrice,
      assetUrl: t.assetUrl,
      owned: t.type === "free" || ownedIds.has(String(t._id)),
      available:
        t.type === "free" ||
        t.type === "point" ||
        (t.type === "subscription" && subStatus === "active"),
    })),
    userPoints: user?.points ?? 0,
    selectedThemeIds: (user?.selectedThemeIds ?? []).map(String),
    selectedHaniItems: (user?.selectedHaniItems ?? []).map(String),
  };

  return (
    <div className="flex flex-col min-h-screen bg-hanji">
      <Header />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-5 pb-24 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-ink">설정</h1>
        </div>

        {/* 프로필 설정 */}
        <SettingsForm user={serializedUser} />

        {/* 구독 상태 */}
        <div className="p-4 bg-white rounded-2xl border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-ink">구독 상태</p>
              <p className="text-xs text-ink-light mt-0.5">
                {subStatus === "active" ? "구독 중" : "무료 플랜"}
              </p>
            </div>
            {subStatus !== "active" && (
              <a
                href="/subscribe"
                className="px-4 py-2 rounded-xl bg-cheong text-white text-xs font-bold hover:opacity-90 transition-opacity"
              >
                구독하기
              </a>
            )}
          </div>
        </div>

        {/* 테마 상점 */}
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-bold text-ink">꾸미기 상점</h2>
            <p className="text-xs text-ink-light mt-0.5">
              포인트로 한이와 글쓰기 화면을 꾸며보세요
            </p>
          </div>
          <ThemeShop initialData={themeData} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
