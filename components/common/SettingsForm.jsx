"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function SettingsForm({ user }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(user.name ?? "");
  const [writingGoal, setWritingGoal] = useState(user.writingGoal ?? 100);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const GOAL_OPTIONS = [50, 100, 150, 200, 300];

  const handleSave = () => {
    if (!name.trim()) { setError("이름을 입력해주세요."); return; }
    setError("");

    startTransition(async () => {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), writingGoal }),
      });

      if (!res.ok) { setError("저장에 실패했습니다."); return; }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-2xl border border-border">
      <p className="text-sm font-bold text-ink">프로필 설정</p>

      <div>
        <label className="text-xs text-ink-light mb-1.5 block">이름</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-ink outline-none focus:border-cheong transition-colors"
        />
      </div>

      <div>
        <label className="text-xs text-ink-light mb-1.5 block">하루 글쓰기 목표</label>
        <div className="flex gap-2 flex-wrap">
          {GOAL_OPTIONS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setWritingGoal(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                writingGoal === g
                  ? "bg-cheong border-cheong text-white"
                  : "border-border text-ink-light hover:bg-baek"
              }`}
            >
              {g}자
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-jeok">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
          saved
            ? "bg-baek text-ink-light"
            : "bg-cheong text-white hover:opacity-90 active:opacity-75"
        } disabled:opacity-40`}
      >
        {isPending ? "저장 중…" : saved ? "저장됨 ✓" : "저장하기"}
      </button>
    </div>
  );
}
