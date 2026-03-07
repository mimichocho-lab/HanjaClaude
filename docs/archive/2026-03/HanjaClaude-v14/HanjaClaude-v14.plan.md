# Plan: HanjaClaude v14

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v14 |
| 기반 | HanjaClaude v13 (Match Rate 100%) |
| 목표 | Play 화면 뒷면 뜻음 클리핑 버그 수정 + 한 줄 auto-fit |
| 작성일 | 2026-03-07 |

---

## 배경 및 문제

v13에서 뜻음 폰트를 `calc(0.3 * min(90vw, 80vh))`로 확대 후 두 가지 문제 발생:
1. 큰 폰트 + `bottom-[8%]` + `max-h-[30%]` + `overflow-hidden` → 텍스트 상단 클리핑
2. 뜻음이 길면 두 줄로 넘쳐 overflow 발생 → 일부 텍스트 잘림

---

## 요구사항

### F-v14-01: 뜻음 위치 — 위로 이동하여 클리핑 방지

- `bottom-[8%]` → `bottom-[30%]` (카드 중하단으로 이동)
- `max-h-[30%]` → `max-h-[45%]` (큰 폰트 수용)
- `overflow-hidden` → `overflow-visible` (auto-fit 적용 시 불필요)
- `white-space: nowrap` 추가 (한 줄 강제)

### F-v14-02: 뜻음 폰트 auto-fit — overflow 시 폰트 축소

- `useRef`로 `<p>` 요소 참조
- `useEffect`에서 `scrollWidth > clientWidth` 감지
- overflow 시 font-size를 0.01 단위로 줄여 한 줄에 맞춤
- 최소 font-size: `calc(0.05 * min(90vw, 80vh))` (너무 작아지지 않도록)
- card 변경 시마다 재계산

---

## 구현 방식

```tsx
const meaningRef = useRef<HTMLParagraphElement>(null);

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

---

## 변경 파일

| 파일 | 변경 유형 |
|------|-----------|
| `components/FlipCard.tsx` | 수정 (F-v14-01, F-v14-02) |

---

## 성공 기준

| 기준 | 검증 방법 |
|------|-----------|
| 뜻음 `bottom-[30%]` | className 확인 |
| 뜻음 `white-space: nowrap` | style 확인 |
| `meaningRef` ref 연결 | ref prop 확인 |
| `useEffect`에서 overflow 감지 후 폰트 축소 | 코드 확인 |
| 카드 변경 시 재계산 (`card.id` 의존) | useEffect 의존성 확인 |

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v14 |
| Phase | Plan |
| Status | Completed |
| Created | 2026-03-07 |
