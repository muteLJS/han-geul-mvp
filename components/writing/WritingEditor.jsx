"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import CharCounter from "./CharCounter";
import FeedbackPanel from "@/components/feedback/FeedbackPanel";

const CATEGORY_LABELS = {
  daily: "일상",
  thought: "생각",
  practical: "실용",
  creative: "창작",
};

export default function WritingEditor({ initialWriting = null, writingGoal = 100 }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFeedbackPending, startFeedbackTransition] = useTransition();

  const [title, setTitle] = useState(initialWriting?.title ?? "");
  const [content, setContent] = useState(initialWriting?.content ?? "");
  const [category, setCategory] = useState(initialWriting?.category ?? "daily");
  const [isSaved, setIsSaved] = useState(false);
  const [savedWritingId, setSavedWritingId] = useState(initialWriting?._id ?? null);
  const [pointsMessage, setPointsMessage] = useState("");
  const [error, setError] = useState("");

  // 되짚음 상태
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const charCount = content.replace(/\s/g, "").length;

  const handleSave = useCallback(() => {
    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }
    setError("");

    startTransition(async () => {
      const isEdit = !!savedWritingId;
      const url = isEdit ? `/api/writings/${savedWritingId}` : "/api/writings";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "저장에 실패했습니다.");
        return;
      }

      const data = await res.json();
      setIsSaved(true);

      if (!isEdit) {
        setSavedWritingId(data.writing._id);
        router.push(`/write/${data.writing._id}`, { scroll: false });
      }

      if (data.pointsEarned > 0) {
        setPointsMessage(`+${data.pointsEarned}pt 획득!`);
        setTimeout(() => setPointsMessage(""), 3000);
      }
    });
  }, [title, content, category, savedWritingId, router]);

  const handleFeedback = useCallback(() => {
    if (!savedWritingId) {
      setFeedbackError("먼저 글을 저장해주세요.");
      return;
    }
    if (charCount < 10) {
      setFeedbackError("10자 이상 작성 후 되짚음을 요청할 수 있습니다.");
      return;
    }
    setFeedbackError("");

    startFeedbackTransition(async () => {
      const res = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writingId: savedWritingId, mode: "simple" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedbackError(data.error ?? "되짚음 요청에 실패했습니다.");
        return;
      }

      setFeedbackResult({ ...data.feedback, raw: data.raw, remaining: data.remaining });
      setShowFeedback(true);
    });
  }, [savedWritingId, charCount]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (isSaved) setIsSaved(false);
  };

  return (
    <div className="relative flex flex-col h-full">
      {/* 카테고리 선택 */}
      <div className="flex gap-2 px-4 pt-4 pb-2">
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategory(value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              category === value
                ? "bg-cheong border-cheong text-white"
                : "border-border text-ink-light bg-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 제목 */}
      <div className="px-4 py-2">
        <input
          type="text"
          placeholder="제목 (선택)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-lg font-bold text-ink bg-transparent outline-none placeholder:text-border"
          maxLength={100}
        />
      </div>

      <div className="h-px bg-border mx-4" />

      {/* 에디터 본문 */}
      <div className="flex-1 px-4 py-3">
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="오늘의 글을 시작해보세요..."
          className="font-editor w-full h-full min-h-[300px] bg-transparent text-ink text-[17px] leading-[1.9] outline-none resize-none placeholder:text-border"
          autoFocus
        />
      </div>

      {/* 하단 툴바 */}
      <div className="sticky bottom-0 bg-hanji border-t border-border px-4 py-3 space-y-2 safe-area-bottom">
        <CharCounter charCount={charCount} goal={writingGoal} />

        {error && <p className="text-xs text-jeok">{error}</p>}
        {feedbackError && <p className="text-xs text-jeok">{feedbackError}</p>}
        {pointsMessage && (
          <p className="text-xs text-hwang font-bold text-center">{pointsMessage}</p>
        )}

        <div className="flex gap-2">
          {/* 되짚음 버튼 */}
          <button
            type="button"
            onClick={handleFeedback}
            disabled={isFeedbackPending || !savedWritingId || charCount < 10}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-border bg-white text-sm text-ink-light hover:text-ink hover:border-cheong disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isFeedbackPending ? (
              <span className="text-xs">분석 중…</span>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                되짚음
              </>
            )}
          </button>

          {/* 저장 버튼 */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || !content.trim()}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              isSaved
                ? "bg-baek text-ink-light"
                : "bg-cheong text-white hover:opacity-90 active:opacity-75"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isPending ? "저장 중…" : isSaved ? "저장됨 ✓" : "저장하기"}
          </button>
        </div>
      </div>

      {/* 되짚음 패널 — 하단 슬라이드업 */}
      {showFeedback && feedbackResult && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/30">
          <div className="bg-hanji rounded-t-2xl h-[70vh] flex flex-col shadow-xl">
            <FeedbackPanel
              feedback={feedbackResult}
              onClose={() => setShowFeedback(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
