"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const TARGET_LABELS = {
  hani: "한이 꾸미기",
  writing: "글쓰기 테마",
  book: "책 표지",
  library: "도서함 테마",
  profile: "프로필 아이콘",
};

const TYPE_BADGE = {
  free: { label: "무료", cls: "bg-baek text-ink-light" },
  point: { label: "포인트", cls: "bg-hwang-light text-hwang" },
  subscription: { label: "구독", cls: "bg-cheong-light text-cheong" },
};

function ThemeCard({ theme, userPoints, isSelected, onPurchase, onSelect, isPending }) {
  const badge = TYPE_BADGE[theme.type] ?? TYPE_BADGE.free;
  const canAfford = userPoints >= theme.pointPrice;

  return (
    <div
      className={`flex flex-col p-3 rounded-2xl border transition-all ${
        isSelected ? "border-hwang bg-hwang-light/30" : "border-border bg-white"
      }`}
    >
      {/* 미리보기 영역 */}
      <div className="aspect-square rounded-xl bg-baek mb-2 flex items-center justify-center overflow-hidden relative">
        {theme.assetUrl ? (
          <Image src={theme.assetUrl} alt={theme.name} fill className="object-contain" unoptimized />
        ) : (
          <span className="text-2xl">🎨</span>
        )}
      </div>

      <p className="text-xs font-bold text-ink truncate">{theme.name}</p>

      <div className="flex items-center justify-between mt-1.5 gap-1">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${badge.cls}`}>
          {badge.label}
        </span>
        {theme.type === "point" && (
          <span className="text-[10px] text-hwang font-bold">{theme.pointPrice}pt</span>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="mt-2">
        {isSelected ? (
          <div className="w-full py-1.5 rounded-lg text-[11px] text-hwang font-bold text-center">
            선택됨 ✓
          </div>
        ) : theme.owned ? (
          <button
            type="button"
            onClick={() => onSelect(theme._id, theme.target)}
            disabled={isPending}
            className="w-full py-1.5 rounded-lg bg-hwang text-white text-[11px] font-bold hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            선택
          </button>
        ) : theme.type === "point" ? (
          <button
            type="button"
            onClick={() => onPurchase(theme._id)}
            disabled={isPending || !canAfford}
            className="w-full py-1.5 rounded-lg bg-hwang-light text-hwang text-[11px] font-bold hover:opacity-80 disabled:opacity-40 transition-opacity"
          >
            {canAfford ? "구매" : "포인트 부족"}
          </button>
        ) : theme.type === "subscription" ? (
          <div className="w-full py-1.5 rounded-lg text-[11px] text-cheong text-center bg-cheong-light">
            구독 전용
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function ThemeShop({ initialData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [activeTarget, setActiveTarget] = useState("hani");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const filtered = data.themes.filter((t) => t.target === activeTarget);

  const selectedIds = new Set([...data.selectedThemeIds, ...data.selectedHaniItems]);

  const flash = (msg, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(""), 3000); }
    else { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 3000); }
  };

  const handlePurchase = (themeId) => {
    startTransition(async () => {
      const res = await fetch("/api/themes/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId }),
      });
      const result = await res.json();
      if (!res.ok) { flash(result.error ?? "구매 실패", true); return; }

      flash("구매 완료!");
      // 로컬 상태 업데이트
      setData((prev) => ({
        ...prev,
        userPoints: result.remainingPoints,
        themes: prev.themes.map((t) =>
          String(t._id) === String(themeId) ? { ...t, owned: true } : t
        ),
        selectedThemeIds: result.selectedThemeIds ?? prev.selectedThemeIds,
      }));
      router.refresh();
    });
  };

  const handleSelect = (themeId, target) => {
    startTransition(async () => {
      const res = await fetch("/api/themes/select", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId, target }),
      });
      if (!res.ok) { flash("선택 실패", true); return; }

      flash("적용됐어요!");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 포인트 잔액 */}
      <div className="flex items-center justify-between px-4 py-3 bg-hwang-light rounded-2xl border border-hwang/30">
        <span className="text-sm text-ink-light">보유 포인트</span>
        <span className="text-lg font-bold text-hwang">{data.userPoints}pt</span>
      </div>

      {error && <p className="text-xs text-jeok text-center">{error}</p>}
      {successMsg && <p className="text-xs text-cheong text-center font-bold">{successMsg}</p>}

      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {Object.entries(TARGET_LABELS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTarget(key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeTarget === key
                ? "bg-hwang border-hwang text-white"
                : "border-border text-ink-light bg-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 테마 그리드 */}
      <div className="grid grid-cols-3 gap-3">
        {filtered.map((theme) => (
          <ThemeCard
            key={theme._id}
            theme={theme}
            userPoints={data.userPoints}
            isSelected={selectedIds.has(theme._id)}
            onPurchase={handlePurchase}
            onSelect={handleSelect}
            isPending={isPending}
          />
        ))}
      </div>
    </div>
  );
}
