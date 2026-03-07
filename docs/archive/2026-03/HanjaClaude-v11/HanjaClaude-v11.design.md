# Design: HanjaClaude v11

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v11 |
| 기반 Plan | docs/01-plan/features/HanjaClaude-v11.plan.md |
| 목표 | Play 화면 카드 UI 개선 + Options 화면 셋 선택 UI 개선 + 스와이프 기능 제거 |
| 작성일 | 2026-03-07 |

---

## F-v11-01: 카드 폭 90% 적용

**파일**: `components/FlipCard.tsx`

### 변경 전

```tsx
<div
  className="w-full max-w-xs mx-auto cursor-pointer"
  style={{ perspective: 1000 }}
  onClick={onFlip}
>
```

### 변경 후

```tsx
<div
  className="w-[90vw] mx-auto cursor-pointer"
  style={{ perspective: 1000 }}
  onClick={onFlip}
>
```

**근거**: `max-w-xs`(320px 고정) → `w-[90vw]`(뷰포트 폭의 90%)

---

## F-v11-02: 뜻음 한 줄 표시

**파일**: `components/FlipCard.tsx`

### 변경 전

```tsx
<p className="text-5xl font-bold text-amber-700">{card.meaning}</p>
<p className="text-2xl text-amber-500 mt-2">{card.pronunciation}</p>
```

### 변경 후

```tsx
<p className="text-3xl font-bold text-amber-700">
  {card.meaning} {card.pronunciation}
</p>
```

**근거**: 두 `<p>` 태그를 하나로 합쳐 `{meaning} {pronunciation}` 형식으로 한 줄 표시. 폰트 크기는 `text-3xl`로 조정.

---

## F-v11-03: 안내 텍스트 제거

**파일**: `components/FlipCard.tsx`

### 변경 전 (앞면)

```tsx
<span className="mt-4 text-gray-400 text-sm">탭해서 확인</span>
```

### 변경 후 (앞면)

삭제

### 변경 전 (뒷면)

```tsx
<span className="mt-4 text-gray-400 text-sm">탭해서 한자 보기</span>
```

### 변경 후 (뒷면)

삭제

---

## F-v11-04: 카드 번호 폭 비율 적용

**파일**: `components/FlipCard.tsx`

### 변경 전 (앞면 + 뒷면 공통)

```tsx
<span className="absolute top-3 right-4 text-sm text-gray-400">
  {card.id}
</span>
```

### 변경 후 (앞면 + 뒷면 공통)

```tsx
<span className="absolute top-3 right-0 w-[10%] text-center text-xs text-gray-400">
  {card.id}
</span>
```

**근거**: `right-4` 고정 → `right-0 w-[10%]`로 카드 폭의 10% 영역 확보. 텍스트 크기 `text-xs`로 조정.

---

## F-v11-05: 옵션 화면 셋 선택 버튼 3열 그리드

**파일**: `app/options/page.tsx`

### 변경 전

```tsx
<div className="flex flex-col gap-2">
  {datasets.map((ds) => (
    <button
      key={ds.id}
      className={`w-full py-2.5 rounded-lg text-sm font-medium border transition-colors text-left px-3
        ${selectedDataset?.id === ds.id
          ? "bg-blue-500 text-white border-blue-500"
          : "bg-white text-gray-600 border-gray-300"
        }`}
      onClick={() => handleDatasetChange(ds)}
    >
      {ds.name}
    </button>
  ))}
</div>
```

### 변경 후

```tsx
<div className="grid grid-cols-3 gap-2">
  {datasets.map((ds) => (
    <button
      key={ds.id}
      className={`py-2.5 rounded-lg text-sm font-medium border transition-colors text-center
        ${selectedDataset?.id === ds.id
          ? "bg-blue-500 text-white border-blue-500"
          : "bg-white text-gray-600 border-gray-300"
        }`}
      onClick={() => handleDatasetChange(ds)}
    >
      {ds.name}
    </button>
  ))}
</div>
```

**근거**: `flex flex-col` → `grid grid-cols-3`. 버튼 정렬 `text-left px-3` → `text-center`.

---

## F-v11-06: 스와이프 기능 제거

### hooks/usePlaySession.ts — 삭제 항목

```typescript
// 삭제: 상수
const SWIPE_THRESHOLD = 50;

// 삭제: ref
const touchStartX = useRef(0);

// 삭제: 함수 3개
const swipeToCard = (index: number) => { ... };
const handleSwipe = (deltaX: number) => { ... };
const onTouchStart = (clientX: number) => { ... };
const onTouchEnd = (clientX: number) => { ... };

// 삭제: return에서 제거
// onTouchStart,
// onTouchEnd,
```

### app/play/page.tsx — 삭제 항목

```tsx
// 삭제: 구조 분해에서 제거
const {
  playCards,
  currentIndex,
  face,
  animated,
  done,
  setDone,
  goToCard,
  flipCard,
  // onTouchStart,   ← 삭제
  // onTouchEnd,     ← 삭제
} = usePlaySession(filteredCards, options);

// 삭제: 카드 영역 div에서 이벤트 핸들러 제거
<div
  className="flex-1 flex flex-col items-center justify-center px-6 py-8"
  // onTouchStart={(e) => onTouchStart(e.touches[0].clientX)}   ← 삭제
  // onTouchEnd={(e) => onTouchEnd(e.changedTouches[0].clientX)} ← 삭제
>
```

---

## 변경 파일 목록

| 파일 | 변경 유형 | Feature |
|------|-----------|---------|
| `components/FlipCard.tsx` | 수정 | F-v11-01, F-v11-02, F-v11-03, F-v11-04 |
| `app/options/page.tsx` | 수정 | F-v11-05 |
| `hooks/usePlaySession.ts` | 수정 | F-v11-06 |
| `app/play/page.tsx` | 수정 | F-v11-06 |

---

## 성공 기준

| 기준 | 검증 |
|------|------|
| 카드가 뷰포트 폭의 90% 차지 | `w-[90vw]` 클래스 확인 |
| 뜻음이 한 줄 표시 (`물 수` 형식) | 단일 `<p>` 태그 확인 |
| '탭해서 확인' 텍스트 없음 | 코드에서 해당 span 삭제 확인 |
| '탭해서 한자 보기' 텍스트 없음 | 코드에서 해당 span 삭제 확인 |
| 번호가 카드 폭의 10% 영역에 표시됨 | `w-[10%]` 클래스 확인 |
| 셋 버튼이 한 줄에 3개씩 표시됨 | `grid-cols-3` 클래스 확인 |
| 스와이프 핸들러 코드 없음 | `onTouchStart`/`onTouchEnd` 미존재 확인 |

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v11 |
| Phase | Design |
| Status | Completed |
| Created | 2026-03-07 |
