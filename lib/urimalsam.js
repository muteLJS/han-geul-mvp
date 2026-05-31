// 국립국어원 우리말샘 Open API
// 내부 DB 우선 사용, API는 보조 검색용

const BASE_URL = "https://opendict.korean.go.kr/api/search";

export async function searchUrimalsam(query, num = 10) {
  const key = process.env.URIMALSAM_API_KEY;
  if (!key) throw new Error("URIMALSAM_API_KEY가 설정되지 않았습니다.");

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
