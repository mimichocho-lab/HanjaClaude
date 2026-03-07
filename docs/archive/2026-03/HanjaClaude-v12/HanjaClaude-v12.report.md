# Report: HanjaClaude v12

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v12 |
| 기반 | HanjaClaude v11 (Match Rate 100%) |
| 목표 | Play 화면 FlipCard 반응형 크기 레이아웃 |
| Match Rate | 100% (8/8) |
| 완료일 | 2026-03-07 |

---

## PDCA 요약

| Phase | 상태 | 내용 |
|-------|------|------|
| Plan | 완료 | 3개 요구사항 정의 (F-v12-01, 02, 03) |
| Design | 완료 | FlipCard.tsx 단일 파일 3개 항목 설계 |
| Do | 완료 | components/FlipCard.tsx 수정 |
| Check | 완료 | Match Rate 100% (Gap 없음) |

---

## 구현 내용

### F-v12-01: 카드 크기 — min(90vw, 80vh) 정사각형

`w-[90vw] + aspect-[3/4]` 고정 비율에서 CSS `min()` 함수 기반 반응형 정사각형으로 전환.

```tsx
// 컨테이너
style={{ perspective: 1000, width: 'min(90vw, 80vh)', height: 'min(90vw, 80vh)' }}

// motion.div
className="w-full h-full"
```

### F-v12-02: 한자 크기 — 카드 크기의 80%

고정 `text-8xl`(6rem)에서 카드 크기 연동 동적 폰트 크기로 전환.

```tsx
style={{ fontSize: 'calc(0.8 * min(90vw, 80vh))' }}
```

### F-v12-03: 뜻음 — 카드 하단 absolute 배치

중앙 정렬에서 카드 하단 절대 위치 배치로 변경. 시각적 계층 구조 개선.

```tsx
className="absolute bottom-[8%] max-w-[80%] max-h-[30%] overflow-hidden text-3xl font-bold text-amber-700 text-center"
```

---

## 변경 파일

| 파일 | 변경 유형 |
|------|-----------|
| `components/FlipCard.tsx` | 수정 (3개 항목) |

---

## 개선 효과

| 항목 | v11 | v12 |
|------|-----|-----|
| 카드 크기 | `w-[90vw]` + `aspect-[3/4]` (세로 고정) | `min(90vw, 80vh)` 정사각형 (반응형) |
| 한자 크기 | `text-8xl` (6rem 고정) | `calc(0.8 * min(90vw, 80vh))` (동적) |
| 뜻음 배치 | 중앙 정렬 | `absolute bottom-[8%]` (하단 고정) |
| 가로 모드 | 카드 화면 이탈 가능 | 항상 화면 내 표시 |

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
| Feature | HanjaClaude-v12 |
| Phase | Report (Completed) |
| Match Rate | 100% |
| Completed | 2026-03-07 |
