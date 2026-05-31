"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function NewBookForm({ onCancel }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    setError("");

    startTransition(async () => {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "책 생성에 실패했습니다.");
        return;
      }

      const { book } = await res.json();
      router.push(`/library/books/${book._id}`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <input
          type="text"
          placeholder="책 제목 *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm text-ink placeholder:text-border outline-none focus:border-cheong transition-colors"
        />
      </div>
      <div>
        <textarea
          placeholder="책 소개 (선택)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={200}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm text-ink placeholder:text-border outline-none focus:border-cheong transition-colors resize-none"
        />
      </div>
      {error && <p className="text-xs text-jeok">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-border text-sm text-ink-light hover:bg-baek transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-3 rounded-xl bg-hwang text-white text-sm font-bold hover:opacity-90 active:opacity-75 transition-opacity disabled:opacity-40"
        >
          {isPending ? "생성 중…" : "책 만들기"}
        </button>
      </div>
    </form>
  );
}
