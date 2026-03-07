# Report: HanjaClaude v14

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v14 |
| 기반 | HanjaClaude v13 (Match Rate 100%) |
| 목표 | 뜻음 클리핑 버그 수정 + overflow 시 폰트 auto-fit |
| Match Rate | 100% (8/8) |
| 완료일 | 2026-03-07 |

---

## PDCA 요약

| Phase | 상태 | 내용 |
|-------|------|------|
| Plan | 완료 | 2개 요구사항 정의 (F-v14-01, F-v14-02) |
| Design | 완료 | FlipCard.tsx 위치 수정 + auto-fit 로직 설계 |
| Do | 완료 | components/FlipCard.tsx 수정 |
| Check | 완료 | Match Rate 100% (Gap 없음) |

---

## 구현 내용

### F-v14-01: 뜻음 위치 수정

`bottom-[8%]` + `max-h-[30%]` + `overflow-hidden` 클리핑 문제를 위치 조정으로 해결.

```tsx
<p
  ref={meaningRef}
  className="absolute bottom-[30%] max-w-[80%] font-bold text-amber-700 text-center"
  style={{ fontSize: 'calc(0.3 * min(90vw, 80vh))', whiteSpace: 'nowrap' }}
>
```

### F-v14-02: Auto-fit 폰트 크기

텍스트 overflow 시 font-size를 0.01씩 줄여 한 줄에 맞춤.

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
| `components/FlipCard.tsx` | 수정 (2개 항목) |

---

## 개선 효과

| 항목 | v13 | v14 |
|------|-----|-----|
| 위치 | `bottom-[8%]` | `bottom-[30%]` |
| 클리핑 | `max-h-[30%] overflow-hidden` | 제거 |
| 줄바꿈 | (기본) | `whiteSpace: nowrap` |
| 긴 텍스트 | overflow 잘림 | auto-fit 축소 |

---

## Gap 분석 결과

| 항목 | 결과 |
|------|------|
| Match Rate | 100% |
| 통과 항목 | 8/8 |
| Gap | 없음 |
| Iteration | 0회 |

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v14 |
| Phase | Report (Completed) |
| Match Rate | 100% |
| Completed | 2026-03-07 |
