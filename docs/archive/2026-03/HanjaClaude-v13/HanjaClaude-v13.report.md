# Report: HanjaClaude v13

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v13 |
| 기반 | HanjaClaude v12 (Match Rate 100%) |
| 목표 | Play 화면 뒷면 뜻음 폰트 크기를 카드 크기의 30%로 확대 |
| Match Rate | 100% (2/2) |
| 완료일 | 2026-03-07 |

---

## PDCA 요약

| Phase | 상태 | 내용 |
|-------|------|------|
| Plan | 완료 | 1개 요구사항 정의 (F-v13-01) |
| Design | 완료 | FlipCard.tsx 1개 항목 설계 |
| Do | 완료 | components/FlipCard.tsx 수정 |
| Check | 완료 | Match Rate 100% (Gap 없음) |

---

## 구현 내용

### F-v13-01: 뜻음 폰트 크기 — 카드 크기의 30%

고정 `text-3xl`(1.875rem)에서 카드 크기 연동 동적 폰트 크기로 전환.

```tsx
<p
  className="absolute bottom-[8%] max-w-[80%] max-h-[30%] overflow-hidden font-bold text-amber-700 text-center"
  style={{ fontSize: 'calc(0.3 * min(90vw, 80vh))' }}
>
  {card.meaning} {card.pronunciation}
</p>
```

---

## 변경 파일

| 파일 | 변경 유형 |
|------|-----------|
| `components/FlipCard.tsx` | 수정 (1개 항목) |

---

## 개선 효과

| 항목 | v12 | v13 |
|------|-----|-----|
| 뜻음 폰트 크기 | `text-3xl` (1.875rem 고정) | `calc(0.3 * min(90vw, 80vh))` (동적) |

---

## Gap 분석 결과

| 항목 | 결과 |
|------|------|
| Match Rate | 100% |
| 통과 항목 | 2/2 |
| Gap | 없음 |
| Iteration | 0회 |

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v13 |
| Phase | Report (Completed) |
| Match Rate | 100% |
| Completed | 2026-03-07 |
