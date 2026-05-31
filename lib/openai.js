import OpenAI from "openai";

let client;

function getClient() {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY가 설정되지 않았습니다.");
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

// ── 글 전체 되짚음 ───────────────────────────────────────
export async function getFeedback(content, mode = "simple") {
  const isDetail = mode === "detail";

  const systemPrompt = `당신은 한국어 글쓰기를 따뜻하게 안내하는 조력자입니다.
사용자의 글을 대신 써주거나 고쳐 쓰지 않습니다.
다음 규칙을 반드시 지키세요:
- "틀렸어요", "부족해요", "실패했어요", "점수", "등급", "낮은 수준" 같은 표현을 절대 쓰지 마세요.
- 제안은 가능성으로 제시하고, 최종 선택은 항상 사용자에게 있음을 전제합니다.
- 응답은 반드시 아래 JSON 형식만 반환합니다. 설명 문장 없이 JSON만 출력하세요.`;

  const userPrompt = `다음 글을 읽고 되짚음을 JSON으로 제공하세요.
${isDetail ? "vocabularySuggestions 3개 이상, flowSuggestions 2개 이상" : "vocabularySuggestions 2개, flowSuggestions 1개"}

글:
"""
${content}
"""

응답 형식:
{
  "vocabularySuggestions": [
    {
      "original": "원문 단어/표현",
      "suggestions": ["대안1", "대안2", "대안3"],
      "reason": "이 표현을 쓴 이유나 문맥 설명"
    }
  ],
  "flowSuggestions": [
    {
      "target": "원문 문장 일부",
      "suggestion": "더 자연스럽게 다듬은 예시",
      "reason": "앞뒤 문장의 연결을 돕는 이유"
    }
  ],
  "meaningQuestion": "이 글에서 가장 남기고 싶은 생각은 무엇인가요?"
}`;

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: isDetail ? 1200 : 700,
  });

  const raw = response.choices[0].message.content;
  return JSON.parse(raw);
}

// ── 선택 문장 다듬기 ─────────────────────────────────────
export async function getRefineSuggestions(selectedText, fullContent) {
  const systemPrompt = `당신은 한국어 문장을 자연스럽게 다듬는 도우미입니다.
원문의 의미와 사용자 목소리를 최대한 보존합니다.
"틀렸어요", "부족해요" 같은 평가 표현을 쓰지 마세요.
반드시 JSON만 반환하세요.`;

  const userPrompt = `전체 글의 맥락을 고려해 선택된 문장을 자연스럽게 다듬어주세요.
선택된 문장을 다시 쓰는 것이 아니라, 표현 방법 3가지를 제안하세요.

전체 글 맥락:
"""
${fullContent}
"""

선택된 문장:
"""
${selectedText}
"""

응답 형식:
{
  "suggestions": [
    { "text": "다듬은 표현 1", "reason": "이렇게 표현하면 ~" },
    { "text": "다듬은 표현 2", "reason": "이렇게 표현하면 ~" },
    { "text": "다듬은 표현 3", "reason": "이렇게 표현하면 ~" }
  ]
}`;

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
    max_tokens: 600,
  });

  return JSON.parse(response.choices[0].message.content);
}

// ── 글 다듬기 문제 생성 ──────────────────────────────────
export async function getPracticeProblems(content) {
  const systemPrompt = `당신은 한국어 글쓰기 연습 문제를 만드는 선생님입니다.
주어진 글에서 더 자연스럽게 표현할 수 있는 문장 2개를 골라 연습 문제를 만드세요.
"틀렸어요", "부족해요" 같은 평가 표현을 절대 쓰지 마세요.
반드시 JSON만 반환하세요.`;

  const userPrompt = `아래 글에서 표현을 다듬어 볼 만한 문장 2개를 골라 연습 문제를 만들어주세요.
각 문제에는 원문 문장, 생각해볼 힌트, 그리고 AI가 제안하는 표현을 포함하세요.

글:
"""
${content}
"""

응답 형식:
{
  "problems": [
    {
      "sentence": "원문에서 가져온 문장 그대로",
      "hint": "이 문장에서 어떤 부분을 생각해볼까요? (구체적이고 따뜻한 안내)",
      "suggestion": "더 자연스럽게 다듬은 표현 예시"
    }
  ]
}`;

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 800,
  });

  return JSON.parse(response.choices[0].message.content);
}
