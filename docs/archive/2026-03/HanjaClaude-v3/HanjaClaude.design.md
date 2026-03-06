# Design: HanjaClaude (v3)

## Overview

Plan v2 기준 구현 코드와의 Gap 3개를 수정하는 설계.

---

## 변경 사항 (v2 → v3)

| 구분 | 기능 | 내용 |
|------|------|------|
| 수정 | F-09 | 랜덤 시작면을 카드마다 독립 결정 |
| 수정 | F-13 | 스와이프 시 현재 면 유지 (goToCard와 분리) |
| 수정 | F-15 | 오답 버튼을 추가 전용 → 토글 (추가/해제) |

---

## GAP-1: F-09 — 랜덤 시작면 카드별 독립 결정

### 문제
현재 `usePlaySession`의 `startFaceRef`는 플레이 시작 시 한 번만 랜덤 결정됨.
모든 카드가 동일한 시작면을 가짐.

### 해결
`goToCard` 호출 시마다 `options.startFace === "random"`이면 그 자리에서 새로 랜덤 결정.

```typescript
// hooks/usePlaySession.ts 변경사항

// 추가
const optionsRef = useRef(options);
useEffect(() => { optionsRef.current = options; }, [options]);

const resolveStartFace = (): CardFace => {
  const sf = optionsRef.current.startFace;
  return sf === "random" ? (Math.random() < 0.5 ? "front" : "back") : sf;
};

const goToCard = (index: number) => {
  setCurrentIndex(index);
  setFace(resolveStartFace());  // 카드마다 새로 결정
  setAnimated(false);
  setWrongAdded(false);
};
```

`startFaceRef`와 기존 `useEffect([options.startFace])` 제거.

---

## GAP-2: F-13 — 스와이프 시 현재 면 유지

### 문제
현재 스와이프도 `goToCard`를 호출하므로 시작면으로 리셋됨.
Plan F-13: "현재 면 유지한 채 다음 카드로 이동".

### 해결
스와이프 전용 `swipeToCard` 함수 추가. face를 변경하지 않고 인덱스만 이동.

```typescript
// hooks/usePlaySession.ts 변경사항

const swipeToCard = (index: number) => {
  setCurrentIndex(index);
  // face 유지 (setFace 호출 없음)
  setAnimated(false);
  setWrongAdded(false);
};

const handleSwipe = (deltaX: number) => {
  if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
  if (deltaX > 0) {
    if (currentIndex > 0) swipeToCard(currentIndex - 1);
  } else {
    if (currentIndex < playCards.length - 1) swipeToCard(currentIndex + 1);
    else setDone(true);
  }
};
```

버튼(이전/다음)은 기존 `goToCard` 유지 → 시작면으로 리셋.

---

## GAP-3: F-15 — 오답 버튼 토글

### 문제
현재 `handleAddWrong`은 추가만 하고 `wrongAdded=true`로 버튼을 비활성화.
Plan F-15: "현재 한자가 오답 상태일때는 오답 해제, 그렇지 않을때는 추가".

### 해결
`useWrongAnswers`는 이미 `removeWrongId`를 제공. `play/page.tsx`에서 토글 처리.

`wrongAdded` 상태 제거 → `wrongIds`로 현재 카드의 오답 여부 실시간 판별.

```typescript
// app/play/page.tsx 변경사항

// useWrongAnswers에서 wrongIds, removeWrongId 추가 구조분해
const { wrongIds, addWrongId, removeWrongId } = useWrongAnswers();

// isWrong: 현재 카드가 오답 목록에 있는지
const isWrong = playCards[currentIndex]
  ? wrongIds.includes(playCards[currentIndex].id)
  : false;

const handleToggleWrong = () => {
  const card = playCards[currentIndex];
  if (!card) return;
  if (isWrong) {
    removeWrongId(card.id);
  } else {
    addWrongId(card.id);
  }
};
```

```tsx
// 버튼 UI
<button
  className={`px-4 py-3 rounded-xl text-sm border transition-colors ${
    isWrong
      ? "border-red-400 bg-red-50 text-red-500"
      : "border-gray-300 text-gray-500 active:bg-gray-100"
  }`}
  onClick={handleToggleWrong}
>
  {isWrong ? "오답 해제" : "오답"}
</button>
```

`usePlaySession`에서 `wrongAdded`, `setWrongAdded` 제거.

---

## 영향 범위

| 파일 | 변경 내용 |
|------|----------|
| `hooks/usePlaySession.ts` | `resolveStartFace()` 추가, `swipeToCard()` 추가, `startFaceRef` 제거, `wrongAdded` 제거 |
| `app/play/page.tsx` | `isWrong` 계산, `handleToggleWrong` 추가, `wrongAdded`/`setWrongAdded` 제거 |
| `hooks/useWrongAnswers.ts` | 변경 없음 (이미 `removeWrongId` 구현됨) |

---

## 변경 없는 항목

- Tech Stack
- 4개 화면 구조
- FlipCard, ProgressBar, BottomBar 컴포넌트
- Home, Options, Wrong 화면

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude |
| Phase | Design |
| Version | v3 |
| Created | 2026-03-06 |
| Status | In Progress |
