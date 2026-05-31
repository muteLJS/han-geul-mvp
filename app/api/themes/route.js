import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ThemeItem from "@/models/Theme";
import User from "@/models/User";
import { SEED_THEMES } from "@/lib/themeSeed";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  // 시드가 없으면 삽입
  const count = await ThemeItem.countDocuments();
  if (count === 0) {
    await ThemeItem.insertMany(SEED_THEMES);
  }

  const [themes, user] = await Promise.all([
    ThemeItem.find().sort({ type: 1, target: 1 }).lean(),
    User.findById(session.user.id)
      .select("points selectedThemeIds selectedHaniItems subscription")
      .lean(),
  ]);

  const ownedIds = new Set([
    ...(user?.selectedThemeIds ?? []).map(String),
    ...(user?.selectedHaniItems ?? []).map(String),
  ]);

  const subStatus = user?.subscription?.status ?? "free";

  return NextResponse.json({
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
  });
}
