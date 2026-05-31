"use client";

import { useState } from "react";

const CATEGORY_LABELS = {
  daily: "일상",
  thought: "생각",
  practical: "실용",
  creative: "창작",
};

function formatDate(dateStr) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr));
}

function WritingEntry({ writing, index }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <article className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 text-xs text-ink-light tabular-nums w-5">{index + 1}</span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink truncate">
              {writing.title || "제목 없음"}
            </p>
            <p className="text-xs text-ink-light mt-0.5">
              {formatDate(writing.createdAt)} · {writing.charCount}자
            </p>
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-ink-light transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="pb-6 px-1">
          {writing.category && (
            <span className="inline-block text-[10px] text-ink-light bg-baek px-2 py-0.5 rounded-full mb-4">
              {CATEGORY_LABELS[writing.category] ?? writing.category}
            </span>
          )}
          <p className="font-editor text-[17px] text-ink leading-[2] whitespace-pre-wrap">
            {writing.content}
          </p>
        </div>
      )}
    </article>
  );
}

export default function BookReadingView({ book, writings }) {
  const totalChars = writings.reduce((sum, w) => sum + (w.charCount ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* 책 표지 영역 */}
      <div className="p-6 bg-white rounded-2xl border border-hwang/40 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-hwang-light flex items-center justify-center text-2xl">
          📚
        </div>
        <h2 className="text-xl font-bold text-ink">{book.title}</h2>
        {book.description && (
          <p className="text-sm text-ink-light mt-2">{book.description}</p>
        )}
        <div className="flex justify-center gap-4 mt-4 text-xs text-ink-light">
          <span>{writings.length}편</span>
          <span>·</span>
          <span>총 {totalChars.toLocaleString()}자</span>
          {book.completedAt && (
            <>
              <span>·</span>
              <span>{formatDate(book.completedAt)} 완성</span>
            </>
          )}
        </div>
      </div>

      {/* 목차 + 본문 */}
      <div className="bg-white rounded-2xl border border-border divide-y divide-border overflow-hidden">
        <div className="px-4 py-3">
          <p className="text-xs font-bold text-ink-light uppercase tracking-widest">수록 글</p>
        </div>
        <div className="px-4">
          {writings.length === 0 ? (
            <p className="py-8 text-sm text-ink-light text-center">수록된 글이 없습니다.</p>
          ) : (
            writings.map((w, i) => (
              <WritingEntry key={w._id} writing={w} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
