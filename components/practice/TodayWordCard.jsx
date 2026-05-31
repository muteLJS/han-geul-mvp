"use client";

import { useState, useTransition } from "react";

export default function TodayWordCard({ word, isLoggedIn }) {
  const [confirmed, setConfirmed] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleComplete = () => {
    if (!isLoggedIn || confirmed) return;

    startTransition(async () => {
      const res = await fetch("/api/vocabulary/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: word._id }),
      });
      const data = await res.json();
      setConfirmed(true);
      setPointsEarned(data.pointsEarned ?? 0);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-5">
      {/* 단어 */}
      <div className="text-center">
        <span className="text-xs font-bold text-ink-light uppercase tracking-widest">
          오늘의 순우리말
        </span>
        <h2 className="text-4xl font-bold text-ink mt-3 tracking-wide">{word.word}</h2>

        {/* 태그 */}
        {word.tags?.length > 0 && (
          <div className="flex justify-center gap-1.5 mt-3 flex-wrap">
            {word.tags.map((tag) => (
              <span key={tag} className="text-[11px] px-2.5 py-0.5 rounded-full bg-baek text-ink-light">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* 뜻 */}
      <div>
        <p className="text-xs font-bold text-ink-light mb-1.5">뜻</p>
        <p className="text-sm text-ink leading-relaxed">{word.meaning}</p>
      </div>

      {/* 예문 */}
      {word.example && (
        <div>
          <p className="text-xs font-bold text-ink-light mb-1.5">예문</p>
          <p className="font-editor text-sm text-ink leading-[1.9] px-3 py-2 bg-hanji rounded-xl border-l-2 border-cheong">
            {word.example}
          </p>
        </div>
      )}

      {/* 확인 버튼 */}
      {isLoggedIn ? (
        <button
          type="button"
          onClick={handleComplete}
          disabled={isPending || confirmed}
          className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
            confirmed
              ? "bg-baek text-ink-light cursor-default"
              : "bg-cheong text-white hover:opacity-90 active:opacity-75"
          } disabled:opacity-60`}
        >
          {confirmed
            ? `확인 완료 ✓${pointsEarned > 0 ? `  +${pointsEarned}pt` : ""}`
            : isPending
            ? "처리 중…"
            : "오늘의 단어 확인했어요  +2pt"}
        </button>
      ) : (
        <a
          href="/login"
          className="block w-full py-3.5 rounded-xl text-sm font-bold text-center bg-cheong text-white hover:opacity-90 transition-opacity"
        >
          로그인하고 포인트 받기
        </a>
      )}
    </div>
  );
}
