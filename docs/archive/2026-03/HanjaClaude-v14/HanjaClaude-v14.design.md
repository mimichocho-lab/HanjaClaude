# Design: HanjaClaude v14

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v14 |
| 기반 Plan | docs/01-plan/features/HanjaClaude-v14.plan.md |
| 목표 | 뜻음 클리핑 수정 + overflow 시 폰트 auto-fit |
| 작성일 | 2026-03-07 |

---

## 변경 위치

`components/FlipCard.tsx` 단일 파일, 2개 항목

---

## F-v14-01: 뜻음 위치 수정

### 변경 전

```tsx
<p
  className="absolute bottom-[8%] max-w-[80%] max-h-[30%] overflow-hidden font-bold text-amber-700 text-center"
  style={{ fontSize: 'calc(0.3 * min(90vw, 80vh))' }}
>
  {card.meaning} {card.pronunciation}
</p>
```

### 변경 후

```tsx
<p
  ref={meaningRef}
  className="absolute bottom-[30%] max-w-[80%] font-bold text-amber-700 text-center"
  style={{ fontSize: 'calc(0.3 * min(90vw, 80vh))', whiteSpace: 'nowrap' }}
>
  {card.meaning} {card.pronunciation}
</p>
```

**변경 내용**:
- `bottom-[8%]` → `bottom-[30%]` (위로 이동)
- `max-h-[30%]` 제거 (auto-fit으로 대체)
- `overflow-hidden` 제거 (auto-fit으로 대체)
- `whiteSpace: 'nowrap'` 추가 (한 줄 강제)
- `ref={meaningRef}` 추가 (auto-fit용)

---

## F-v14-02: useRef + useEffect auto-fit

### 추가 코드

```tsx
// import 추가
import { useState, useEffect, useRef } from "react";

// ref 선언
const meaningRef = useRef<HTMLParagraphElement>(null);

// useEffect (card.id 의존)
useEffect(() => {
  const el = meaningRef.current;
  if (!el) return;
  let size = 0.3;
  el.style.fontSize = `calc(${size} * min(90vw, 80vh))`;
  while (el.scrollWidth > el.clientWidth && size > 0.05) {
    size = Math.round((size - 0.01) * 100) / 100;
    el.style.fontSize = `calc(${size} * min(90vw, 80vh))`;
  }
}, [card.id]);
```

**동작**:
1. 카드 변경 시마다 실행
2. 초기 font-size = `calc(0.3 * min(90vw, 80vh))`
3. `scrollWidth > clientWidth` (overflow) 이면 0.01씩 줄임
4. 최소 `calc(0.05 * min(90vw, 80vh))`까지

---

## 변경 파일 목록

| 파일 | 변경 유형 | Feature |
|------|-----------|---------|
| `components/FlipCard.tsx` | 수정 | F-v14-01, F-v14-02 |

---

## 성공 기준

| 기준 | 검증 |
|------|------|
| `<p ref={meaningRef}>` | ref prop 확인 |
| `bottom-[30%]` | className 확인 |
| `whiteSpace: 'nowrap'` | style 확인 |
| `max-h-[30%]`, `overflow-hidden` 없음 | className 확인 |
| `meaningRef = useRef<HTMLParagraphElement>(null)` | 코드 확인 |
| `useEffect`에서 scrollWidth > clientWidth 감지 | 코드 확인 |
| `card.id` 의존성 | useEffect deps 확인 |

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v14 |
| Phase | Design |
| Status | Completed |
| Created | 2026-03-07 |
