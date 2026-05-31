// MVP 초기 테마 아이템 시드 데이터
export const SEED_THEMES = [
  // ── 한이 꾸미기 ──────────────────────────────────────
  { name: "기본 한이", type: "free", target: "hani", pointPrice: 0, assetUrl: "/images/hani/hani-default.png" },
  { name: "행복한 한이", type: "point", target: "hani", pointPrice: 30, assetUrl: "/images/hani/hani-happy.png" },
  { name: "완료 한이", type: "point", target: "hani", pointPrice: 30, assetUrl: "/images/hani/hani-complete.png" },
  { name: "안내 한이", type: "point", target: "hani", pointPrice: 20, assetUrl: "/images/hani/hani-guide.png" },

  // ── 글쓰기 화면 테마 ─────────────────────────────────
  { name: "기본 (한지)", type: "free", target: "writing", pointPrice: 0, assetUrl: "" },
  { name: "밤하늘", type: "point", target: "writing", pointPrice: 50, assetUrl: "" },
  { name: "봄 들판", type: "point", target: "writing", pointPrice: 50, assetUrl: "" },
  { name: "먹빛", type: "subscription", target: "writing", pointPrice: 0, assetUrl: "" },

  // ── 책 표지 ──────────────────────────────────────────
  { name: "기본 표지", type: "free", target: "book", pointPrice: 0, assetUrl: "/images/themes/book-basic.png" },
  { name: "먹 표지", type: "point", target: "book", pointPrice: 40, assetUrl: "/images/themes/book-ink.png" },
  { name: "한지 표지", type: "point", target: "book", pointPrice: 40, assetUrl: "/images/themes/book-hanji.png" },
  { name: "청 표지", type: "subscription", target: "book", pointPrice: 0, assetUrl: "" },

  // ── 도서함 테마 ──────────────────────────────────────
  { name: "기본 도서함", type: "free", target: "library", pointPrice: 0, assetUrl: "" },
  { name: "나무 책장", type: "point", target: "library", pointPrice: 60, assetUrl: "" },

  // ── 프로필 아이콘 ────────────────────────────────────
  { name: "기본 아이콘", type: "free", target: "profile", pointPrice: 0, assetUrl: "" },
  { name: "붓 아이콘", type: "point", target: "profile", pointPrice: 20, assetUrl: "" },
  { name: "책 아이콘", type: "point", target: "profile", pointPrice: 20, assetUrl: "" },
];
