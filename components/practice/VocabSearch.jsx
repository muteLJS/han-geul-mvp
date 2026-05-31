"use client";

import { useState, useTransition } from "react";

export default function VocabSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setError("");

    startTransition(async () => {
      const res = await fetch(`/api/vocabulary/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "검색에 실패했습니다.");
        setResults(null);
        return;
      }
      setResults(data.results);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="순우리말 검색…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-ink placeholder:text-border outline-none focus:border-cheong transition-colors"
        />
        <button
          type="submit"
          disabled={isPending || !query.trim()}
          className="px-4 py-2.5 rounded-xl bg-cheong text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {isPending ? "…" : "검색"}
        </button>
      </form>

      {error && <p className="text-xs text-jeok">{error}</p>}

      {results !== null && (
        <div className="flex flex-col gap-2">
          {results.length === 0 ? (
            <p className="text-sm text-ink-light text-center py-6">검색 결과가 없습니다.</p>
          ) : (
            results.map((item, i) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-ink">{item.word}</span>
                  {item.source === "urimalsam" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-baek text-ink-light">
                      우리말샘
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink-light leading-relaxed">{item.meaning}</p>
                {item.example && (
                  <p className="font-editor text-xs text-ink mt-2 leading-relaxed border-l-2 border-baek pl-2">
                    {item.example}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
