# 한-글 MVP — Claude Code 컨텍스트 문서

> 이 파일은 Claude Code가 한-글 MVP를 바이브코딩으로 개발할 때 항상 참조하는 기준 문서다.
> 모든 작업 지시는 이 문서의 기준을 따른다. 임의로 기준을 변경하거나 제외 기능을 추가하지 않는다.

---

## 0. 프로젝트 한눈에 보기

| 항목      | 내용                                                           |
| --------- | -------------------------------------------------------------- |
| 서비스명  | 한-글                                                          |
| 슬로건    | 하루에 한 자씩. 한 글로-                                       |
| 정의      | 쓰면서 배우고, 쌓으면서 성장하는 한국어 글쓰기 에듀테크 플랫폼 |
| 핵심 철학 | 평가 없는 자기 주도 학습. 직접 쓰기 중심. AI 대필 금지         |
| 핵심 루프 | 글쓰기 → 저장 → 되짚음 → 도서함 축적 → 나의 책 → 기록 유지     |
| 플랫폼    | 웹 반응형 + PWA                                                |
| 배포      | Vercel                                                         |

---

## 1. 기술 스택

| 영역               | 기술                                                     |
| ------------------ | -------------------------------------------------------- |
| Framework          | Next.js App Router                                       |
| Language           | JavaScript                                               |
| Styling            | Tailwind CSS                                             |
| Database           | MongoDB Atlas                                            |
| ODM                | Mongoose                                                 |
| Auth               | NextAuth.js (Google / Kakao / Naver)                     |
| AI                 | OpenAI API                                               |
| 한국어 데이터      | 국립국어원 우리말샘 Open API (내부 DB 우선, 보조 조회용) |
| Payment            | Toss Payments                                            |
| Deploy             | Vercel                                                   |
| PWA                | next-pwa                                                 |
| Editor             | textarea 기반 커스텀 에디터                              |
| 서버 데이터        | TanStack Query                                           |
| 클라이언트 UI 상태 | Zustand                                                  |
| 폼 관리            | React Hook Form + Zod                                    |

---

## 2. 프로젝트 폴더 구조

```
src/
  app/
    page.jsx
    layout.jsx
    login/page.jsx
    write/
      page.jsx
      [id]/page.jsx
    practice/
      page.jsx
      vocabulary/page.jsx
      copywork/page.jsx
      refine/page.jsx
    library/
      page.jsx
      books/[id]/page.jsx
    records/page.jsx
    settings/page.jsx
    subscribe/page.jsx
    api/
      auth/
      writings/
      ai/
      vocabulary/
      copywork/
      books/
      reports/
      points/
      payments/
  components/
    common/
    layout/
    hani/
    writing/
    feedback/
    practice/
    library/
    records/
    subscription/
  features/
    auth/
    writing/
    feedback/
    vocabulary/
    copywork/
    books/
    records/
    points/
    themes/
    subscription/
  lib/
    db.js
    auth.js
    openai.js
    toss.js
    cloudinary.js
    urimalsam.js
    validators.js
  models/
    User.js
    Writing.js
    Feedback.js
    Vocabulary.js
    Copywork.js
    Book.js
    PointHistory.js
    Theme.js
  stores/
    useUiStore.js
    useThemeStore.js
    useHaniStore.js
  styles/
    globals.css
```

---

## 3. 데이터 모델

### User

```js
{
  email, name, image, provider,
  role: 'user' | 'admin',
  subscription: {
    status: 'free' | 'active' | 'expired',
    plan: 'monthly' | 'yearly' | null,
    startedAt: Date, endedAt: Date
  },
  writingGoal: 100,   // 기본 목표 글자 수
  points: 0,
  selectedThemeIds: [],
  selectedHaniItems: [],
  createdAt: Date, updatedAt: Date
}
```

### Writing

```js
{
  userId, title, content,
  category: 'daily' | 'thought' | 'practical' | 'creative',
  type: String,
  visibility: 'private' | 'public' | 'link',
  charCount, wordCount,
  feedbackIds: [], bookIds: [],
  createdAt: Date, updatedAt: Date
}
```

### Book

```js
{
  userId, title, description, coverThemeId,
  writingIds: [],
  status: 'draft' | 'completed',
  visibility: 'private' | 'public' | 'link',
  completedAt: Date, createdAt: Date, updatedAt: Date
}
```

### Feedback

```js
{
  userId, writingId, targetText,
  mode: 'simple' | 'detail',
  suggestions: [{ type: 'vocabulary' | 'flow' | 'meaning', original, suggestion, reason }],
  question,
  createdAt: Date
}
```

### Vocabulary

```js
{ word, meaning, example, source: 'manual' | 'urimalsam', level, tags: [], createdAt: Date }
```

### Copywork

```js
{
  title, sourceTitle, author, content,
  copyrightStatus: 'public_domain' | 'licensed' | 'original',
  level, tags: [], createdAt: Date
}
```

### PointHistory

```js
{ userId, action, points, targetId, createdAt: Date }
```

### ThemeItem

```js
{
  name, type: 'free' | 'point' | 'subscription',
  target: 'hani' | 'writing' | 'book' | 'library' | 'profile',
  pointPrice, assetUrl, createdAt: Date
}
```

---

## 4. API 엔드포인트

| Method   | Endpoint                 | 설명                |
| -------- | ------------------------ | ------------------- |
| GET/POST | /api/auth/[...nextauth]  | 소셜 로그인         |
| GET      | /api/writings            | 내 글 목록          |
| POST     | /api/writings            | 글 생성             |
| GET      | /api/writings/:id        | 글 상세             |
| PATCH    | /api/writings/:id        | 글 수정             |
| DELETE   | /api/writings/:id        | 글 삭제             |
| POST     | /api/ai/feedback         | 글 전체 되짚음      |
| POST     | /api/ai/refine           | 선택 문장 다듬기    |
| POST     | /api/ai/practice         | 글 다듬기 문제 생성 |
| GET      | /api/vocabulary/today    | 오늘의 순우리말     |
| GET      | /api/vocabulary/search   | 우리말샘 검색       |
| POST     | /api/vocabulary/complete | 확인 완료 + 포인트  |
| GET      | /api/copywork/today      | 오늘의 필사         |
| GET      | /api/copywork            | 필사 목록           |
| POST     | /api/copywork/complete   | 필사 완료           |
| GET      | /api/books               | 나의 책 목록        |
| POST     | /api/books               | 책 생성             |
| GET      | /api/books/:id           | 책 상세             |
| PATCH    | /api/books/:id           | 책 수정             |
| POST     | /api/books/:id/complete  | 책 완성하기         |
| GET      | /api/points              | 포인트 내역         |
| POST     | /api/points/use          | 포인트 사용         |
| GET      | /api/themes              | 테마 목록           |
| POST     | /api/themes/purchase     | 포인트 구매         |
| PATCH    | /api/themes/select       | 테마 선택           |
| POST     | /api/payments/checkout   | Toss 결제 요청      |
| POST     | /api/payments/confirm    | 결제 승인           |
| POST     | /api/payments/webhook    | 결제 상태 동기화    |
| GET      | /api/reports/summary     | 기본 기록 요약      |
| GET      | /api/reports/categories  | 분야별 기록         |

---

## 5. 권한 정책

| 기능        | 비회원          | 무료 회원     | 구독 회원        |
| ----------- | --------------- | ------------- | ---------------- |
| 글쓰기 체험 | 가능            | 가능          | 가능             |
| 글 저장     | 로그인 필요     | 가능          | 가능             |
| 도서함      | 불가            | 가능          | 가능             |
| AI 되짚음   | 불가 (체험 1회) | 하루 3회      | 제한 완화 + 상세 |
| 어휘 연습   | 일부            | 가능          | 가능             |
| 필사        | 일부            | 오늘의 필사   | 라이브러리 확장  |
| 글 다듬기   | 제한            | 일부          | 전체             |
| 나의 책     | 불가            | 기본          | 확장             |
| 기록 리포트 | 불가            | 기본 요약     | 상세 리포트      |
| 테마        | 기본            | 기본 + 포인트 | 유료 테마 포함   |

---

## 6. 포인트 정책

| 활동                 | 포인트 |
| -------------------- | ------ |
| 100자 달성           | +10pt  |
| 150자 달성           | +3pt   |
| 200자 달성           | +7pt   |
| 300자 이상 달성      | +15pt  |
| 글 다듬기 완료       | +5pt   |
| 필사 완료            | +5pt   |
| 필사 후 한 줄 감상   | +3pt   |
| 오늘의 순우리말 확인 | +2pt   |

포인트 사용처: 한이 꾸미기, 글쓰기 화면 테마, 책 표지, 도서함 테마, 프로필 아이콘
포인트는 랭킹·현금성 보상에 사용하지 않는다.

---

## 7. 구독 정책

| 구분    | 가격     |
| ------- | -------- |
| 월 구독 | 4,900원  |
| 연 구독 | 39,900원 |

MVP에서는 Toss Payments 테스트 키만 사용한다.

---

## 8. AI 되짚음 원칙

AI는 사용자의 글을 대신 작성하지 않는다. 사용자가 버튼을 눌렀을 때만 호출된다.

**응답 JSON 형식**

```json
{
  "vocabularySuggestions": [
    {
      "original": "좋았다",
      "suggestions": ["포근했다", "흐뭇했다", "뿌듯했다"],
      "reason": "문맥에 따라 감정의 결을 더 구체적으로 표현할 수 있습니다."
    }
  ],
  "flowSuggestions": [
    {
      "target": "문장 일부",
      "suggestion": "더 자연스럽게 다듬은 예시",
      "reason": "앞뒤 문장의 의미 연결을 돕습니다."
    }
  ],
  "meaningQuestion": "이 글에서 가장 남기고 싶은 생각은 무엇인가요?"
}
```

**AI 응답에서 절대 금지하는 표현**

- 틀렸어요 / 부족해요 / 실패했어요
- 점수 / 등급 / 낮은 수준

---

## 9. 디자인 기준

### 컬러 시스템

| 용도              | 값                |
| ----------------- | ----------------- |
| 배경              | 한지 크림 #FAF6EE |
| 기본 텍스트       | 먹색 #1A1A1A      |
| 청 (자유 글쓰기)  | #3B82C4 계열      |
| 백 (어휘 연습)    | #F5F0E8 계열      |
| 적 (필사)         | #C94040 계열      |
| 흑 (나를 담은 글) | #2C2C2C 계열      |
| 황 (나의 책)      | #D4A017 계열      |

### 폰트

| 용도               | 폰트              |
| ------------------ | ----------------- |
| 기본 텍스트        | 학교안심 바른바탕 |
| 글쓰기 에디터 본문 | 조선일보명조체    |

### 핵심 디자인 원칙

- 모바일 375px 우선 설계
- 글쓰기 화면은 입력에 집중, 최소한의 UI
- 오방색은 기능 포인트 컬러로만 사용 (배경 도배 금지)
- 한이는 완료·안내·빈 상태에서만 등장, 챗봇 아님
- 과도한 애니메이션 금지

---

## 10. 이미지 자산 정책

MVP Phase 1에서는 Cloudinary 없이 `/public` 폴더로 시작한다.

```
public/
  images/
    hani/
      hani-default.png
      hani-happy.png
      hani-complete.png
      hani-guide.png
    themes/
      book-basic.png
      book-ink.png
      book-hanji.png
    icons/
```

Cloudinary는 사용자 업로드 이미지(프로필, 책 표지)가 생길 때 연결한다.
단, `lib/cloudinary.js`는 초기부터 구조만 준비해둔다.

---

## 11. 환경 변수 목록

```env
MONGODB_URI=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
OPENAI_API_KEY=
URIMALSAM_API_KEY=
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 12. MVP 포함 / 제외 기능

### 포함 (구현 대상)

- 홈, 로그인/회원가입, 자유 글쓰기, 글 저장
- 도서함, 나의 책 기본 구조
- 오늘의 순우리말, 어휘 연습, 필사, 글 다듬기
- AI 되짚음 (요청 시에만)
- 기록/성장 리포트 기본
- 포인트, 구독 결제 기본 구조
- 한이 안내 및 꾸미기 기본
- PWA, Vercel 배포

### 제외 (절대 구현하지 않음)

- 랭킹
- 커뮤니티 / 댓글 / 공개 피드
- B2B
- 네이티브 앱 배포
- 실물책 제작 / PDF / ePub
- AI 대필
- 한이 챗봇화

---

## 13. Claude Code 작업 원칙

1. **한 번에 하나의 작업만** — UI 수정과 DB/API 작업을 한 프롬프트에 섞지 않는다
2. **수정 허용 파일을 명시** — 지정되지 않은 기존 파일은 건드리지 않는다
3. **완료 후 반드시 검증** — `npm run lint` → `npm run build` 순서로 실행하고 결과를 보고한다
4. **변경 파일 목록 보고** — 생성/수정한 파일을 모두 보고한다
5. **서비스 철학 임의 변경 금지** — AI 대필, 점수화, 랭킹 등 제외 기능을 추가하지 않는다
6. **Cloudinary는 Phase 1에서 필수 의존성으로 만들지 않는다**

---

## 14. 개발 단계 (Step 순서)

| Step | 작업                    | 핵심 파일                                             |
| ---- | ----------------------- | ----------------------------------------------------- |
| 1    | 프로젝트 초기 세팅      | layout.jsx, globals.css, tailwind.config.js           |
| 2    | MongoDB + Mongoose 연결 | lib/db.js, models/User,Writing,Book                   |
| 3    | NextAuth 소셜 로그인    | api/auth, lib/auth.js, login/page.jsx, middleware.js  |
| 4    | 홈 화면                 | app/page.jsx, components/hani, components/layout      |
| 5    | 글쓰기 에디터           | app/write, api/writings, components/writing           |
| 6    | 도서함                  | app/library, api/writings, api/books                  |
| 7    | AI 되짚음               | lib/openai.js, api/ai/feedback, api/ai/refine         |
| 8    | 순우리말 + 우리말샘 API | lib/urimalsam.js, api/vocabulary, models/Vocabulary   |
| 9    | 필사                    | app/practice/copywork, api/copywork, models/Copywork  |
| 10   | 글 다듬기               | app/practice/refine, api/ai/practice                  |
| 11   | 나의 책                 | app/library/books, api/books                          |
| 12   | 기록/성장 리포트        | app/records, api/reports                              |
| 13   | 포인트 + 한이 꾸미기    | models/PointHistory,ThemeItem, api/points, api/themes |
| 14   | Toss Payments 구독 결제 | lib/toss.js, app/subscribe, api/payments              |
| 15   | PWA + Vercel 배포       | next-pwa 설정, manifest, Vercel 환경변수              |

---

## 15. MVP 완료 기준

- [ ] 회원가입 / 로그인 가능
- [ ] 글 작성 및 저장 가능
- [ ] 저장한 글이 도서함에 표시됨
- [ ] AI 되짚음 요청 가능 (버튼 클릭 시에만)
- [ ] 오늘의 순우리말 확인 가능
- [ ] 필사 또는 글 다듬기 최소 1개 이상 작동
- [ ] 나의 책 생성 가능
- [ ] 기본 기록 확인 가능
- [ ] 포인트 적립 가능
- [ ] 모바일 375px 반응형 정상
- [ ] Vercel 배포 완료 및 접근 가능
