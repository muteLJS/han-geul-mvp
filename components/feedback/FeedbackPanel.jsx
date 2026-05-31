"use client";

import { useState } from "react";

function VocabCard({ item }) {
  return (
    <div className="p-3 bg-cheong-light rounded-xl border border-cheong/20">
      <div className="flex items-start gap-2 flex-wrap">
        <span className="text-sm font-bold text-cheong">&ldquo;{item.original}&rdquo;</span>
        <span className="text-xs text-ink-light self-center">→</span>
        <div className="flex flex-wrap gap-1">
          {item.suggestions.map((s, i) => (
            <span key={i} className="text-xs bg-white border border-cheong/30 text-cheong px-2 py-0.5 rounded-full">
              {s}
            </span>
          ))}
        </div>
      </div>
      {item.reason && <p className="text-xs text-ink-light mt-1.5 leading-relaxed">{item.reason}</p>}
    </div>
  );
}

function FlowCard({ item }) {
  return (
    <div className="p-3 bg-white rounded-xl border border-border">
      <p className="text-xs text-ink-light line-through mb-1">&ldquo;{item.target}&rdquo;</p>
      <p className="text-sm text-ink font-medium">&ldquo;{item.suggestion}&rdquo;</p>
      {item.reason && <p className="text-xs text-ink-light mt-1.5 leading-relaxed">{item.reason}</p>}
    </div>
  );
}

export default function FeedbackPanel({ feedback, onClose }) {
  const [tab, setTab] = useState("vocab");

  const vocabItems = feedback.raw?.vocabularySuggestions ?? [];
  const flowItems = feedback.raw?.flowSuggestions ?? [];
  const question = feedback.raw?.meaningQuestion ?? feedback.question ?? "";

  return (
    <div className="flex flex-col h-full bg-hanji">
      {/* 패널 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-bold text-ink">되짚음</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-ink-light hover:text-ink transition-colors"
          aria-label="닫기"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-border text-xs font-medium">
        {[
          { id: "vocab", label: `어휘 (${vocabItems.length})` },
          { id: "flow", label: `흐름 (${flowItems.length})` },
          { id: "question", label: "질문" },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 py-2.5 transition-colors ${
              tab === id ? "text-cheong border-b-2 border-cheong" : "text-ink-light"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {tab === "vocab" && (
          <>
            {vocabItems.length === 0 ? (
              <p className="text-sm text-ink-light text-center py-6">어휘 제안이 없습니다.</p>
            ) : (
              vocabItems.map((item, i) => <VocabCard key={i} item={item} />)
            )}
          </>
        )}

        {tab === "flow" && (
          <>
            {flowItems.length === 0 ? (
              <p className="text-sm text-ink-light text-center py-6">문장 흐름 제안이 없습니다.</p>
            ) : (
              flowItems.map((item, i) => <FlowCard key={i} item={item} />)
            )}
          </>
        )}

        {tab === "question" && (
          <div className="p-4 bg-white rounded-2xl border border-border">
            <p className="text-xs font-bold text-ink-light uppercase tracking-widest mb-2">
              되짚어보기
            </p>
            <p className="text-sm text-ink leading-relaxed">{question || "이 글에서 가장 남기고 싶은 생각은 무엇인가요?"}</p>
          </div>
        )}
      </div>

      {/* 남은 횟수 */}
      {feedback.remaining !== undefined && (
        <div className="px-4 py-2 border-t border-border">
          <p className="text-xs text-ink-light text-center">
            오늘 남은 되짚음: <span className="font-bold text-ink">{feedback.remaining}회</span>
          </p>
        </div>
      )}
    </div>
  );
}
