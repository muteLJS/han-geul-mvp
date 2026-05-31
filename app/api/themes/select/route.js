import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ThemeItem from "@/models/Theme";
import User from "@/models/User";

export async function PATCH(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { themeId, target } = await req.json();
  if (!themeId || !target) {
    return NextResponse.json({ error: "themeId와 target이 필요합니다." }, { status: 400 });
  }

  await connectDB();

  const theme = await ThemeItem.findById(themeId).lean();
  if (!theme) return NextResponse.json({ error: "존재하지 않는 테마입니다." }, { status: 404 });

  // 소유 확인 (free는 항상 선택 가능)
  if (theme.type !== "free") {
    const user = await User.findById(session.user.id)
      .select("selectedThemeIds subscription")
      .lean();
    const owned = (user?.selectedThemeIds ?? []).map(String);
    if (theme.type === "subscription" && user?.subscription?.status !== "active") {
      return NextResponse.json({ error: "구독 전용 테마입니다." }, { status: 403 });
    }
    if (theme.type === "point" && !owned.includes(String(themeId))) {
      return NextResponse.json({ error: "먼저 구매해야 합니다." }, { status: 400 });
    }
  }

  // hani 타겟은 selectedHaniItems, 나머지는 selectedThemeIds
  const field = target === "hani" ? "selectedHaniItems" : "selectedThemeIds";

  // 같은 target의 기존 선택 제거 후 새로 추가
  const user = await User.findById(session.user.id).select(`${field}`).lean();
  const existingIds = (user?.[field] ?? []).map(String);

  // 같은 target의 테마를 모두 조회해서 제거 후 새 ID 추가
  const sameTargetThemes = await ThemeItem.find({ target }).select("_id").lean();
  const sameTargetIds = sameTargetThemes.map((t) => String(t._id));

  const filteredIds = existingIds.filter((id) => !sameTargetIds.includes(id));
  filteredIds.push(String(themeId));

  await User.findByIdAndUpdate(session.user.id, { [field]: filteredIds });

  return NextResponse.json({ success: true });
}
