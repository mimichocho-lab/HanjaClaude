# Design: HanjaClaude v13

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v13 |
| 기반 Plan | docs/01-plan/features/HanjaClaude-v13.plan.md |
| 목표 | Play 화면 뒷면 뜻음 폰트 크기를 카드 크기의 30%로 확대 |
| 작성일 | 2026-03-07 |

---

## 변경 위치

`components/FlipCard.tsx` 단일 파일, 1개 항목

---

## F-v13-01: 뜻음 폰트 크기 — 카드 크기의 30%

### 변경 전

```tsx
<p className="absolute bottom-[8%] max-w-[80%] max-h-[30%] overflow-hidden text-3xl font-bold text-amber-700 text-center">
  {card.meaning} {card.pronunciation}
</p>
```

### 변경 후

```tsx
<p
  className="absolute bottom-[8%] max-w-[80%] max-h-[30%] overflow-hidden font-bold text-amber-700 text-center"
  style={{ fontSize: 'calc(0.3 * min(90vw, 80vh))' }}
>
  {card.meaning} {card.pronunciation}
</p>
```

**근거**:
- `text-3xl`(1.875rem 고정) → `calc(0.3 * min(90vw, 80vh))` (카드 크기의 30%, 동적)
- 나머지 클래스 유지: `absolute bottom-[8%] max-w-[80%] max-h-[30%] overflow-hidden font-bold text-amber-700 text-center`

---

## 변경 파일 목록

| 파일 | 변경 유형 | Feature |
|------|-----------|---------|
| `components/FlipCard.tsx` | 수정 | F-v13-01 |

---

## 성공 기준

| 기준 | 검증 |
|------|------|
| 뜻음 `style.fontSize = 'calc(0.3 * min(90vw, 80vh))'` | inline style 확인 |
| `text-3xl` 클래스 없음 | className 확인 |

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v13 |
| Phase | Design |
| Status | Completed |
| Created | 2026-03-07 |
