import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ThemeItem from "@/models/Theme";
import User from "@/models/User";
import PointHistory from "@/models/PointHistory";

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { themeId } = await req.json();
  if (!themeId) return NextResponse.json({ error: "themeId가 필요합니다." }, { status: 400 });

  await connectDB();

  const [theme, user] = await Promise.all([
    ThemeItem.findById(themeId).lean(),
    User.findById(session.user.id).select("points selectedThemeIds selectedHaniItems subscription").lean(),
  ]);

  if (!theme) return NextResponse.json({ error: "존재하지 않는 테마입니다." }, { status: 404 });
  if (theme.type === "free") return NextResponse.json({ error: "무료 테마는 구매할 필요가 없습니다." }, { status: 400 });
  if (theme.type === "subscription" && user?.subscription?.status !== "active") {
    return NextResponse.json({ error: "구독 전용 테마입니다." }, { status: 403 });
  }

  // 이미 소유 중인지 확인
  const allOwned = [...(user?.selectedThemeIds ?? []), ...(user?.selectedHaniItems ?? [])].map(String);
  if (allOwned.includes(String(themeId))) {
    return NextResponse.json({ error: "이미 보유한 테마입니다." }, { status: 400 });
  }

  if (theme.type === "point") {
    if ((user?.points ?? 0) < theme.pointPrice) {
      return NextResponse.json({ error: "포인트가 부족합니다.", currentPoints: user?.points ?? 0 }, { status: 400 });
    }

    await Promise.all([
      User.findByIdAndUpdate(session.user.id, {
        $inc: { points: -theme.pointPrice },
        $addToSet: { selectedThemeIds: themeId },
      }),
      PointHistory.create({
        userId: session.user.id,
        action: "theme_purchase",
        points: -theme.pointPrice,
        targetId: themeId,
      }),
    ]);
  }

  const updated = await User.findById(session.user.id).select("points selectedThemeIds").lean();
  return NextResponse.json({
    success: true,
    remainingPoints: updated.points,
    selectedThemeIds: updated.selectedThemeIds.map(String),
  });
}
