"use client";

import { useState } from "react";
import WritingCard from "./WritingCard";
import BookCard from "./BookCard";
import NewBookForm from "./NewBookForm";
import HaniMessage from "@/components/hani/HaniMessage";

export default function LibraryTabs({ writings, books }) {
  const [tab, setTab] = useState("writings");
  const [showNewBook, setShowNewBook] = useState(false);

  return (
    <div className="flex flex-col flex-1">
      {/* 탭 헤더 */}
      <div className="flex border-b border-border">
        {[
          { id: "writings", label: `글 ${writings.length}` },
          { id: "books", label: `나의 책 ${books.length}` },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === id
                ? "text-cheong border-b-2 border-cheong"
                : "text-ink-light"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 px-4 py-4">
        {tab === "writings" && (
          <div className="flex flex-col gap-3">
            {writings.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <HaniMessage mood="guide" message="첫 글을 써볼까요?" size={72} />
              </div>
            ) : (
              writings.map((w) => <WritingCard key={w._id} writing={w} />)
            )}
          </div>
        )}

        {tab === "books" && (
          <div className="flex flex-col gap-3">
            {/* 새 책 만들기 */}
            {showNewBook ? (
              <div className="p-4 bg-white rounded-2xl border border-hwang">
                <p className="text-sm font-bold text-ink mb-3">새 책 만들기</p>
                <NewBookForm onCancel={() => setShowNewBook(false)} />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewBook(true)}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-hwang text-hwang text-sm font-medium hover:bg-hwang-light transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                새 책 만들기
              </button>
            )}

            {books.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <HaniMessage mood="default" message="글을 모아 나만의 책을 만들어봐요" size={64} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {books.map((b) => <BookCard key={b._id} book={b} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
