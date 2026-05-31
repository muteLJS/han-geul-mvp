"use client";

import { useState, useTransition, useRef } from "react";

// 두 문자열을 글자 단위로 비교해 정확도(%) 반환
function calcAccuracy(original, input) {
  if (!input) return 0;
  const orig = original.replace(/\s/g, "");
  const inp = input.replace(/\s/g, "");
  if (orig.length === 0) return 100;
  let match = 0;
  const len = Math.min(orig.length, inp.length);
  for (let i = 0; i < len; i++) {
    if (orig[i] === inp[i]) match++;
  }
  return Math.round((match / orig.length) * 100);
}

export default function CopyworkEditor({ copywork, isLoggedIn }) {
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState("writing"); // writing | result | impression
  const [accuracy, setAccuracy] = useState(0);
  const [impression, setImpression] = useState("");
  const [pointsEarned, setPointsEarned] = useState(0);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef(null);

  const progress = Math.min(
    (input.replace(/\s/g, "").length / copywork.content.replace(/\s/g, "").length) * 100,
    100
  );

  const handleComplete = () => {
    const acc = calcAccuracy(copywork.content, input);
    setAccuracy(acc);
    setPhase("result");

    if (!isLoggedIn) return;

    startTransition(async () => {
      const res = await fetch("/api/copywork/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ copyworkId: copywork._id }),
      });
      const data = await res.json();
      setPointsEarned(data.pointsEarned ?? 0);
    });
  };

  const handleImpressionSubmit = () => {
    if (!impression.trim() || !isLoggedIn) {
      setPhase("done");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/copywork/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ copyworkId: copywork._id, impression }),
      });
      const data = await res.json();
      setPointsEarned((prev) => prev + (data.pointsEarned ?? 0));
      setPhase("done");
    });
  };

  // ── 완료 결과 화면 ────────────────────────────────────
  if (phase === "result" || phase === "impression" || phase === "done") {
    return (
      <div className="flex flex-col gap-5">
        {/* 결과 카드 */}
        <div className="p-5 bg-white rounded-2xl border border-border text-center">
          <p className="text-xs font-bold text-ink-light uppercase tracking-widest mb-3">필사 완료</p>
          <p className="text-5xl font-bold text-cheong">{accuracy}%</p>
          <p className="text-sm text-ink-light mt-1">정확도</p>
          {pointsEarned > 0 && (
            <p className="mt-3 text-sm font-bold text-hwang">+{pointsEarned}pt 획득!</p>
          )}
          {!isLoggedIn && (
            <p className="mt-3 text-xs text-ink-light">
              <a href="/login" className="underline text-cheong">로그인</a>하면 포인트를 받을 수 있어요
            </p>
          )}
        </div>

        {/* 원문 vs 입력 비교 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-hanji rounded-xl border border-border">
            <p className="text-[10px] font-bold text-ink-light mb-2">원문</p>
            <p className="font-editor text-xs text-ink leading-[1.9]">{copywork.content}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-border">
            <p className="text-[10px] font-bold text-ink-light mb-2">내 필사</p>
            <p className="font-editor text-xs text-ink leading-[1.9] whitespace-pre-wrap">{input || "—"}</p>
          </div>
        </div>

        {/* 한 줄 감상 */}
        {phase === "result" && isLoggedIn && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold text-ink">
              한 줄 감상 <span className="text-xs font-normal text-hwang ml-1">+3pt</span>
            </p>
            <textarea
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              placeholder="이 문장을 읽고 어떤 생각이 들었나요?"
              maxLength={100}
              rows={2}
              className="font-editor w-full px-4 py-3 rounded-xl border border-border bg-hanji text-sm text-ink placeholder:text-border outline-none focus:border-cheong transition-colors resize-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPhase("done")}
                className="flex-1 py-3 rounded-xl border border-border text-sm text-ink-light hover:bg-baek transition-colors"
              >
                건너뛰기
              </button>
              <button
                type="button"
                onClick={handleImpressionSubmit}
                disabled={isPending}
                className="flex-1 py-3 rounded-xl bg-jeok text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {isPending ? "저장 중…" : "감상 남기기"}
              </button>
            </div>
          </div>
        )}

        {/* 완료 후 다시하기 */}
        {(phase === "done" || (!isLoggedIn && phase === "result")) && (
          <button
            type="button"
            onClick={() => { setInput(""); setPhase("writing"); setAccuracy(0); setPointsEarned(0); setImpression(""); }}
            className="w-full py-3 rounded-xl border border-border text-sm text-ink-light hover:bg-baek transition-colors"
          >
            다시 필사하기
          </button>
        )}
      </div>
    );
  }

  // ── 필사 입력 화면 ────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* 원문 */}
      <div className="p-5 bg-hanji rounded-2xl border border-jeok/30">
        <p className="text-[10px] font-bold text-jeok uppercase tracking-widest mb-3">원문</p>
        <p className="font-editor text-[16px] text-ink leading-[2] select-none">{copywork.content}</p>
        {(copywork.sourceTitle || copywork.author) && (
          <p className="text-xs text-ink-light mt-3 text-right">
            {copywork.sourceTitle && `『${copywork.sourceTitle}』`}
            {copywork.author && ` — ${copywork.author}`}
          </p>
        )}
      </div>

      {/* 진행 바 */}
      <div className="h-1 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-jeok rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 입력 영역 */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="위 문장을 따라 써보세요…"
          rows={5}
          className="font-editor w-full px-4 py-4 rounded-2xl border border-border bg-white text-[16px] text-ink leading-[2] placeholder:text-border outline-none focus:border-jeok transition-colors resize-none"
          autoFocus
        />
        <span className="absolute bottom-3 right-4 text-[10px] text-ink-light">
          {input.replace(/\s/g, "").length} / {copywork.content.replace(/\s/g, "").length}
        </span>
      </div>

      {/* 완료 버튼 */}
      <button
        type="button"
        onClick={handleComplete}
        disabled={isPending || !input.trim()}
        className="w-full py-3.5 rounded-xl bg-jeok text-white text-sm font-bold hover:opacity-90 active:opacity-75 disabled:opacity-40 transition-opacity"
      >
        필사 완료
      </button>

      {!isLoggedIn && (
        <p className="text-xs text-ink-light text-center">
          <a href="/login" className="underline text-cheong">로그인</a>하면 완료 포인트를 받을 수 있어요
        </p>
      )}
    </div>
  );
}
