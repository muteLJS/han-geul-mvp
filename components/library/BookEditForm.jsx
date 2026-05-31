"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const VISIBILITY_LABELS = {
  private: "나만 보기",
  link: "링크 공유",
  public: "공개",
};

export default function BookEditForm({ book, onCancel }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(book.title);
  const [description, setDescription] = useState(book.description ?? "");
  const [visibility, setVisibility] = useState(book.visibility ?? "private");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    setError("");

    startTransition(async () => {
      const res = await fetch(`/api/books/${book._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description, visibility }),
      });

      if (!res.ok) {
        setError("수정에 실패했습니다.");
        return;
      }

      router.refresh();
      onCancel();
    });
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-hwang">
      <p className="text-sm font-bold text-ink">책 정보 수정</p>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={60}
        placeholder="제목"
        className="px-4 py-2.5 rounded-xl border border-border text-sm text-ink outline-none focus:border-hwang transition-colors"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={200}
        placeholder="책 소개 (선택)"
        rows={2}
        className="px-4 py-2.5 rounded-xl border border-border text-sm text-ink outline-none focus:border-hwang transition-colors resize-none"
      />

      {/* 공개 설정 */}
      <div className="flex gap-2">
        {Object.entries(VISIBILITY_LABELS).map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => setVisibility(val)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
              visibility === val
                ? "bg-hwang border-hwang text-white"
                : "border-border text-ink-light hover:bg-baek"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-jeok">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-border text-sm text-ink-light hover:bg-baek transition-colors"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="flex-1 py-2.5 rounded-xl bg-hwang text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {isPending ? "저장 중…" : "저장"}
        </button>
      </div>
    </div>
  );
}
