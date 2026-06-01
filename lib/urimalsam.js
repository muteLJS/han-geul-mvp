// 국립국어원 우리말샘 Open API
// 내부 DB 우선 사용, API는 보조 검색용
// URIMALSAM_API_KEY 미설정 시 목업 데이터로 동작

import { SEED_VOCABULARY } from "@/lib/vocabularySeed";

const BASE_URL = "https://opendict.korean.go.kr/api/search";

export async function searchUrimalsam(query, num = 10) {
  const key = process.env.URIMALSAM_API_KEY;

  // API 키 없으면 시드 데이터에서 유사 검색으로 대체
  if (!key) {
    return searchMock(query, num);
  }

  const params = new URLSearchParams({
    key,
    q: query,
    part: "word",
    sort: "popular",
    num: String(num),
    start: "1",
    advanced: "y",
    type1: "고유어",
  });

  const res = await fetch(`${BASE_URL}?${params}`, {
    next: { revalidate: 3600 }, // 1시간 캐시
  });

  if (!res.ok) throw new Error(`우리말샘 API 오류: ${res.status}`);

  const xml = await res.text();
  return parseUrimalsam(xml);
}

// API 키 없을 때 시드 데이터 기반 목업 검색
function searchMock(query, num) {
  const q = query.toLowerCase();
  const results = SEED_VOCABULARY.filter(
    (v) =>
      v.word.includes(q) ||
      v.meaning.includes(q) ||
      (v.tags ?? []).some((t) => t.includes(q))
  ).slice(0, num);

  // 검색어와 일치하는 결과가 없으면 태그 기반 랜덤 샘플 반환
  const pool = results.length > 0 ? results : SEED_VOCABULARY.slice(0, num);

  return pool.map((v) => ({
    word: v.word,
    pos: "",
    meaning: v.meaning,
    source: "mock",
  }));
}

// XML 파싱 (간단한 정규식 기반)
function parseUrimalsam(xml) {
  const items = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

  for (const match of itemMatches) {
    const block = match[1];
    const word = extractTag(block, "word");
    const pos = extractTag(block, "pos");
    const definition = extractTag(block, "definition");

    if (word && definition) {
      items.push({
        word,
        pos: pos ?? "",
        meaning: definition,
        source: "urimalsam",
      });
    }
  }

  return items;
}

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}>([^<]*)<\\/${tag}>`));
  return m ? (m[1] ?? m[2] ?? "").trim() : null;
}
