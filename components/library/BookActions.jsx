"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import BookEditForm from "./BookEditForm";

export default function BookActions({ book, addableWritings, writingsInBook }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [error, setError] = useState("");
  const isCompleted = book.status === "completed";

  const handleAddWriting = (writingId) => {
    startTransition(async () => {
      const res = await fetch(`/api/books/${book._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addWritingId: writingId }),
      });
      if (!res.ok) { setError("글 추가에 실패했습니다."); return; }
      setShowAddPanel(false);
      router.refresh();
    });
  };

  const handleRemoveWriting = (writingId) => {
    startTransition(async () => {
      await fetch(`/api/books/${book._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeWritingId: writingId }),
      });
      router.refresh();
    });
  };

  const handleMoveWriting = (writingId, direction) => {
    const ids = [...book.writingIds];
    const idx = ids.indexOf(writingId);
    if (idx === -1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= ids.length) return;
    [ids[idx], ids[newIdx]] = [ids[newIdx], ids[idx]];

    startTransition(async () => {
      await fetch(`/api/books/${book._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorderWritingIds: ids }),
      });
      router.refresh();
    });
  };

  const handleComplete = () => {
    startTransition(async () => {
      const res = await fetch(`/api/books/${book._id}/complete`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "완성에 실패했습니다.");
        return;
      }
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm("이 책을 삭제할까요? 수록된 글은 삭제되지 않습니다.")) return;
    startTransition(async () => {
      await fetch(`/api/books/${book._id}`, { method: "DELETE" });
      router.push("/library");
      router.refresh();
    });
  };

  // ── 완성된 책: 편집 버튼만 표시 ─────────────────────
  if (isCompleted) {
    return (
      <div className="flex flex-col gap-2">
        {showEditForm ? (
          <BookEditForm book={book} onCancel={() => setShowEditForm(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setShowEditForm(true)}
            className="py-2.5 rounded-xl border border-border text-sm text-ink-light bg-white hover:bg-baek transition-colors"
          >
            책 정보 수정
          </button>
        )}
      </div>
    );
  }

  // ── 작성 중인 책 ──────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-xs text-jeok">{error}</p>}

      {/* 편집 폼 */}
      {showEditForm && (
        <BookEditForm book={book} onCancel={() => setShowEditForm(false)} />
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setShowEditForm((v) => !v); setShowAddPanel(false); }}
          disabled={isPending}
          className="py-2.5 px-3 rounded-xl border border-border text-sm text-ink bg-white hover:bg-baek active:opacity-75 transition-colors"
        >
          수정
        </button>
        <button
          type="button"
          onClick={() => { setShowAddPanel((v) => !v); setShowEditForm(false); }}
          disabled={isPending}
          className="flex-1 py-2.5 rounded-xl border border-border text-sm text-ink bg-white hover:bg-baek active:opacity-75 transition-colors"
        >
          글 추가
        </button>
        <button
          type="button"
          onClick={handleComplete}
          disabled={isPending || book.writingIds.length === 0}
          className="flex-1 py-2.5 rounded-xl bg-hwang text-white text-sm font-bold hover:opacity-90 active:opacity-75 transition-opacity disabled:opacity-40"
        >
          {isPending ? "처리 중…" : "책 완성하기"}
        </button>
      </div>

      {/* 글 추가 패널 */}
      {showAddPanel && (
        <div className="p-4 bg-white rounded-2xl border border-border">
          <p className="text-xs font-bold text-ink-light uppercase tracking-widest mb-3">
            추가할 글 선택
          </p>
          {addableWritings.length === 0 ? (
            <p className="text-sm text-ink-light text-center py-4">추가할 수 있는 글이 없습니다.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {addableWritings.map((w) => (
                <button
                  key={w._id}
                  type="button"
                  onClick={() => handleAddWriting(w._id)}
                  disabled={isPending}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-border hover:border-cheong text-left transition-colors disabled:opacity-40"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">{w.title || "제목 없음"}</p>
                    <p className="text-xs text-ink-light">{w.charCount}자</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="shrink-0 text-cheong ml-2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 수록 글 순서 관리 */}
      {writingsInBook?.length > 0 && (
        <div className="p-4 bg-white rounded-2xl border border-border">
          <p className="text-xs font-bold text-ink-light uppercase tracking-widest mb-3">
            수록 글 순서
          </p>
          <div className="flex flex-col gap-1.5">
            {writingsInBook.map((w, i) => (
              <div
                key={w._id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-hanji"
              >
                <span className="text-xs text-ink-light w-4 tabular-nums">{i + 1}</span>
                <p className="flex-1 text-sm text-ink truncate min-w-0">
                  {w.title || "제목 없음"}
                </p>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveWriting(w._id, "up")}
                    disabled={isPending || i === 0}
                    className="p-1 text-ink-light hover:text-ink disabled:opacity-30 transition-colors"
                    aria-label="위로"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveWriting(w._id, "down")}
                    disabled={isPending || i === writingsInBook.length - 1}
                    className="p-1 text-ink-light hover:text-ink disabled:opacity-30 transition-colors"
                    aria-label="아래로"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveWriting(w._id)}
                    disabled={isPending}
                    className="p-1 text-ink-light hover:text-jeok disabled:opacity-30 transition-colors"
                    aria-label="제거"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 삭제 */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="py-2 text-xs text-ink-light hover:text-jeok transition-colors"
      >
        책 삭제
      </button>
    </div>
  );
}
