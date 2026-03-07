# Design: HanjaClaude v6

## 개요

Plan 문서의 3개 기능(F-v6-01, F-v6-02, F-v6-03)에 대한 구현 설계.
변경 파일 6개, 신규 파일 0개.

---

## 1. 타입 변경 — `types/hanja.ts`

### 현재

```ts
export interface PlayOptions {
  order: "sequential" | "random";
  startFace: "front" | "back" | "random";
  showMeaning: boolean;
}
```

### 변경 후

```ts
export interface PlayOptions {
  order: "sequential" | "random";
  startFace: "front" | "back" | "random";
  showMeaning: boolean;
  homeOrder: "sequential" | "random";   // 신규: 홈 화면 카드 순서
}
```

---

## 2. 훅 변경 — `hooks/usePlayOptions.ts`

### 변경 사항

기본값에 `homeOrder: "sequential"` 추가.

```ts
const DEFAULT: PlayOptions = {
  order: "sequential",
  startFace: "front",
  showMeaning: true,
  homeOrder: "sequential",   // 신규
};
```

나머지 로직(`localStorage` 읽기/쓰기, `updateOptions`) 변경 없음.

---

## 3. 데이터 로딩 수정 — `lib/parseHanja.ts`

### 현재 문제

```ts
imagePath: `/images/hanja/${id}.png`,   // basePath 누락
```

### 변경 후

```ts
imagePath: `${basePath}/images/hanja/${id}.trim()}.png`,
```

실제 코드:
```ts
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
// ...
imagePath: `${basePath}/images/hanja/${id.trim()}.png`,
```

---

## 4. 컴포넌트 변경 — `components/FlipCard.tsx`

### 뒷면 레이아웃 설계

```
┌─────────────────────────────┐
│                          [번호]│
│                               │
│   ┌───────────────────────┐   │
│   │      이미지 영역       │   │  ← 이미지 있으면 표시
│   │   (object-contain)    │   │     없거나 에러면 숨김
│   └───────────────────────┘   │
│                               │
│        뜻 텍스트 (大)          │
│        음 텍스트 (中)          │
│                               │
│      탭해서 한자 보기           │
└─────────────────────────────┘
```

### 상태 관리

```ts
const [imageError, setImageError] = useState(false);
```

- `imageError = false` + `card.imagePath` 있음 → `<img>` 표시
- `imageError = true` 또는 `card.imagePath` 없음 → 이미지 영역 숨김 (텍스트만)

### 변경 코드 (뒷면 부분)

```tsx
{/* 뒷면: 이미지 + 뜻음 */}
<div
  className="absolute inset-0 flex flex-col items-center justify-center bg-amber-50 rounded-2xl shadow-lg border border-amber-100"
  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
>
  <span className="absolute top-3 right-4 text-sm text-gray-400">{card.id}</span>

  {/* 이미지 영역 (이미지 있고 에러 없을 때만) */}
  {card.imagePath && !imageError && (
    <img
      src={card.imagePath}
      alt={card.meaning}
      className="w-3/5 max-h-[45%] object-contain mb-2"
      onError={() => setImageError(true)}
    />
  )}

  <p className="text-5xl font-bold text-amber-700">{card.meaning}</p>
  <p className="text-2xl text-amber-500 mt-2">{card.pronunciation}</p>
  <span className="mt-4 text-gray-400 text-sm">탭해서 한자 보기</span>
</div>
```

### 카드 전환 시 imageError 초기화

카드가 바뀌면 `imageError`를 초기화해야 한다. `card.id`가 바뀔 때 reset:

```ts
useEffect(() => {
  setImageError(false);
}, [card.id]);
```

---

## 5. 옵션 화면 — `app/options/page.tsx`

### 추가 UI 섹션 (기존 카드 순서 섹션 아래에 삽입)

```
┌─────────────────────────────────┐
│ 카드 순서          [번호 순서][랜덤] │  ← 기존 (플레이 순서)
│ 시작 면       [한자먼저][뜻음먼저][랜덤] │  ← 기존
│ 홈 카드 순서   [번호 순서][랜덤]   │  ← 신규 (F-v6-03)
│ 홈/오답방 뜻음 표시  [보이기][숨기기] │  ← 기존
│ 선택 목록 URL 복사              │  ← 기존
└─────────────────────────────────┘
```

### 추가 코드 블록

```tsx
{/* 홈 화면 카드 순서 (F-v6-03) */}
<div className="bg-white rounded-xl p-4 shadow-sm">
  <p className="text-sm font-semibold text-gray-700 mb-3">홈 화면 카드 순서</p>
  <div className="flex gap-3">
    {[
      { value: "sequential", label: "번호 순서" },
      { value: "random", label: "랜덤" },
    ].map((opt) => (
      <button
        key={opt.value}
        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors
          ${options.homeOrder === opt.value
            ? "bg-blue-500 text-white border-blue-500"
            : "bg-white text-gray-600 border-gray-300"
          }`}
        onClick={() => updateOptions({ homeOrder: opt.value as "sequential" | "random" })}
      >
        {opt.label}
      </button>
    ))}
  </div>
</div>
```

---

## 6. 홈 화면 — `app/page.tsx`

### 셔플 로직 설계

- `cards` 데이터 로드 후, `homeOrder === "random"` 이면 셔플
- 셔플은 마운트 시 1회만 → `useMemo` 사용
- `options.homeOrder` 또는 `cards`가 변경될 때만 재계산

```ts
const displayCards = useMemo(() => {
  if (options.homeOrder !== "random") return cards;
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}, [cards, options.homeOrder]);
```

### 그리드 렌더링 변경

```tsx
{/* 기존: cards.map → 변경: displayCards.map */}
{displayCards.map((card) => (
  <HanjaCardCell ... />
))}
```

---

## 구현 순서

1. `types/hanja.ts` — `homeOrder` 필드 추가
2. `hooks/usePlayOptions.ts` — 기본값 추가
3. `lib/parseHanja.ts` — `imagePath` basePath 수정
4. `components/FlipCard.tsx` — 이미지 표시 + fallback + useEffect reset
5. `app/options/page.tsx` — '홈 화면 카드 순서' 섹션 추가
6. `app/page.tsx` — `useMemo` 셔플 적용

---

## 검증 포인트

| 항목 | 검증 방법 |
|------|-----------|
| 이미지 표시 (1.png) | 로컬에서 FlipCard 뒷면 탭 → 이미지 확인 |
| 이미지 없음 fallback | 존재하지 않는 번호 카드 뒷면 탭 → 텍스트만 표시 |
| imagePath 경로 | 개발자 도구 Network 탭 → `/images/hanja/1.png` 요청 확인 |
| 홈 랜덤 순서 | 옵션에서 랜덤 선택 → 홈 화면 카드 순서 변경 확인 |
| 홈 번호 순서 | 옵션에서 번호 순서 선택 → 1~90 순서 표시 확인 |
| localStorage 유지 | 옵션 변경 후 새로고침 → 설정 유지 확인 |
| 기존 기능 | 플레이/플립/스와이프/오답방 모두 정상 동작 |

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v6 |
| Phase | Design |
| BasedOn | HanjaClaude-v6.plan.md |
| Created | 2026-03-07 |
| Status | In Progress |
