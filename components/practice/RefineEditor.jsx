"use client";

import { useState, useTransition } from "react";

// 문제 단계: idle → loading → solving → done
export default function RefineEditor({ passage, isLoggedIn }) {
  const [phase, setPhase] = useState("idle"); // idle | loading | solving | done
  const [problems, setProblems] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [answers, setAnswers] = useState([]); // { sentence, userInput, suggestion }
  const [pointsEarned, setPointsEarned] = useState(0);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const current = problems[currentIdx] ?? null;

  // ── 문제 생성 ─────────────────────────────────────────
  const handleGenerate = () => {
    setError("");
    setPhase("loading");

    startTransition(async () => {
      const res = await fetch("/api/ai/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: passage.content, action: "generate" }),
      });

      if (!res.ok) {
        setError("문제 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
        setPhase("idle");
        return;
      }

      const data = await res.json();
      if (!data.problems?.length) {
        setError("문제를 생성하지 못했습니다.");
        setPhase("idle");
        return;
      }

      setProblems(data.problems);
      setCurrentIdx(0);
      setUserInput("");
      setShowSuggestion(false);
      setAnswers([]);
      setPhase("solving");
    });
  };

  // ── 내 표현 제출 → AI 제안 보기 ──────────────────────
  const handleSubmit = () => {
    setShowSuggestion(true);
  };

  // ── 다음 문제 또는 완료 ───────────────────────────────
  const handleNext = () => {
    const newAnswers = [
      ...answers,
      { sentence: current.sentence, userInput, suggestion: current.suggestion },
    ];
    setAnswers(newAnswers);

    if (currentIdx + 1 < problems.length) {
      setCurrentIdx((i) => i + 1);
      setUserInput("");
      setShowSuggestion(false);
    } else {
      setPhase("done");
      if (isLoggedIn) {
        // 포인트 지급
        startTransition(async () => {
          const res = await fetch("/api/ai/practice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "complete",
              practiceId: passage._id,
            }),
          });
          const data = await res.json();
          setPointsEarned(data.pointsEarned ?? 0);
        });
      }
    }
  };

  // ── idle ──────────────────────────────────────────────
  if (phase === "idle") {
    return (
      <div className="flex flex-col gap-5">
        {/* 지문 미리보기 */}
        <div className="p-5 bg-hanji rounded-2xl border border-cheong/30">
          <p className="text-[10px] font-bold text-cheong uppercase tracking-widest mb-3">연습 지문</p>
          <p className="font-editor text-[16px] text-ink leading-[2]">{passage.content}</p>
          {(passage.sourceTitle || passage.author) && (
            <p className="text-xs text-ink-light mt-3 text-right">
              {passage.sourceTitle && `『${passage.sourceTitle}』`}
              {passage.author && ` — ${passage.author}`}
            </p>
          )}
        </div>

        {error && <p className="text-xs text-jeok">{error}</p>}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isPending}
          className="w-full py-3.5 rounded-xl bg-cheong text-white text-sm font-bold hover:opacity-90 active:opacity-75 disabled:opacity-40 transition-opacity"
        >
          AI 문제 생성하기 ✨
        </button>

        {!isLoggedIn && (
          <p className="text-xs text-ink-light text-center">
            <a href="/login" className="underline text-cheong">로그인</a>하면 완료 포인트를 받을 수 있어요
          </p>
        )}
      </div>
    );
  }

  // ── loading ───────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center py-16 gap-3">
        <div className="w-8 h-8 border-2 border-cheong border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-ink-light">AI가 문제를 만들고 있어요…</p>
      </div>
    );
  }

  // ── done ─────────────────────────────────────────────
  if (phase === "done") {
    return (
      <div className="flex flex-col gap-5">
        <div className="p-5 bg-white rounded-2xl border border-border text-center">
          <p className="text-xs font-bold text-ink-light uppercase tracking-widest mb-3">연습 완료</p>
          <p className="text-4xl font-bold text-cheong">{problems.length}</p>
          <p className="text-sm text-ink-light mt-1">문제를 완료했어요</p>
          {pointsEarned > 0 && (
            <p className="mt-3 text-sm font-bold text-hwang">+{pointsEarned}pt 획득!</p>
          )}
        </div>

        {/* 복습 */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-ink-light uppercase tracking-widest">복습</p>
          {answers.map((a, i) => (
            <div key={i} className="p-4 bg-white rounded-xl border border-border flex flex-col gap-2">
              <p className="text-[10px] text-ink-light">원문</p>
              <p className="text-xs text-ink-light line-through leading-relaxed">{a.sentence}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-cheong font-bold mb-1">내 표현</p>
                  <p className="text-xs text-ink leading-relaxed">{a.userInput || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-hwang font-bold mb-1">AI 제안</p>
                  <p className="text-xs text-ink leading-relaxed">{a.suggestion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => { setPhase("idle"); setProblems([]); setAnswers([]); setPointsEarned(0); }}
          className="w-full py-3 rounded-xl border border-border text-sm text-ink-light hover:bg-baek transition-colors"
        >
          다시 연습하기
        </button>
      </div>
    );
  }

  // ── solving ───────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* 진행 표시 */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-cheong">
          {currentIdx + 1} / {problems.length}
        </p>
        <div className="flex gap-1">
          {problems.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${i <= currentIdx ? "bg-cheong" : "bg-border"}`}
            />
          ))}
        </div>
      </div>

      {/* 힌트 */}
      <div className="p-4 bg-cheong-light rounded-xl border border-cheong/20">
        <p className="text-[10px] font-bold text-cheong uppercase tracking-widest mb-1.5">힌트</p>
        <p className="text-sm text-ink leading-relaxed">{current.hint}</p>
      </div>

      {/* 원문 문장 */}
      <div className="p-4 bg-hanji rounded-xl border border-border">
        <p className="text-[10px] font-bold text-ink-light mb-1.5">다듬어볼 문장</p>
        <p className="font-editor text-[15px] text-ink leading-[1.9]">{current.sentence}</p>
      </div>

      {/* 내 표현 입력 */}
      <div>
        <p className="text-xs font-bold text-ink-light mb-1.5">내 표현으로 다듬기</p>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="이 문장을 나만의 방식으로 다듬어보세요…"
          rows={3}
          className="font-editor w-full px-4 py-3 rounded-xl border border-border bg-white text-[15px] text-ink leading-[1.9] placeholder:text-border outline-none focus:border-cheong transition-colors resize-none"
        />
      </div>

      {/* AI 제안 보기 */}
      {showSuggestion && (
        <div className="p-4 bg-hwang-light rounded-xl border border-hwang/30">
          <p className="text-[10px] font-bold text-hwang uppercase tracking-widest mb-1.5">AI 제안</p>
          <p className="font-editor text-[15px] text-ink leading-[1.9]">{current.suggestion}</p>
        </div>
      )}

      <div className="flex gap-2">
        {!showSuggestion ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className="flex-1 py-3 rounded-xl bg-cheong text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            AI 제안 보기
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={isPending}
            className="flex-1 py-3 rounded-xl bg-cheong text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {isPending ? "처리 중…" : currentIdx + 1 < problems.length ? "다음 문제 →" : "연습 완료"}
          </button>
        )}
      </div>
    </div>
  );
}
