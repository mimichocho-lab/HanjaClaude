# Design: HanjaClaude v12

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v12 |
| 기반 Plan | docs/01-plan/features/HanjaClaude-v12.plan.md |
| 목표 | Play 화면 FlipCard 반응형 크기 레이아웃 |
| 작성일 | 2026-03-07 |

---

## 변경 위치

`components/FlipCard.tsx` 단일 파일, 3개 항목

---

## F-v12-01: 카드 크기 — min(90vw, 80vh) 정사각형

### 변경 전

```tsx
{/* 외부 컨테이너 */}
<div
  className="w-[90vw] mx-auto cursor-pointer"
  style={{ perspective: 1000 }}
  onClick={onFlip}
>
  <motion.div
    ...
    className="w-full aspect-[3/4]"
  >
```

### 변경 후

```tsx
{/* 외부 컨테이너 */}
<div
  className="mx-auto cursor-pointer"
  style={{ perspective: 1000, width: 'min(90vw, 80vh)', height: 'min(90vw, 80vh)' }}
  onClick={onFlip}
>
  <motion.div
    ...
    className="w-full h-full"
  >
```

**근거**:
- `w-[90vw]` → `width: 'min(90vw, 80vh)'` (CSS min() 함수)
- `aspect-[3/4]` → `height: 'min(90vw, 80vh)'` (명시적 정사각형)
- motion.div: `aspect-[3/4]` → `h-full` (컨테이너 크기 상속)

---

## F-v12-02: 한자 크기 — 카드 크기의 80%

### 변경 전

```tsx
<span className="text-8xl font-bold text-gray-800">{card.hanja}</span>
```

### 변경 후

```tsx
<span
  className="font-bold text-gray-800"
  style={{ fontSize: 'calc(0.8 * min(90vw, 80vh))' }}
>
  {card.hanja}
</span>
```

**근거**: `text-8xl`(고정 6rem) → `calc(0.8 * min(90vw, 80vh))` (카드 크기의 80%)

---

## F-v12-03: 뜻음 — 카드 하단 absolute 배치

### 변경 전

```tsx
{/* 뒷면 */}
<div
  className="absolute inset-0 flex flex-col items-center justify-center bg-amber-50 ..."
  ...
>
  <span className="absolute top-3 ...">...</span>
  {card.imagePath && !imageError && (
    <img className="w-3/5 max-h-[45%] object-contain mb-2" ... />
  )}
  <p className="text-3xl font-bold text-amber-700">
    {card.meaning} {card.pronunciation}
  </p>
</div>
```

### 변경 후

```tsx
{/* 뒷면 */}
<div
  className="absolute inset-0 flex flex-col items-center justify-center bg-amber-50 ..."
  ...
>
  <span className="absolute top-3 ...">...</span>
  {card.imagePath && !imageError && (
    <img className="w-3/5 max-h-[45%] object-contain" ... />
  )}
  <p
    className="absolute bottom-[8%] max-w-[80%] max-h-[30%] overflow-hidden text-3xl font-bold text-amber-700 text-center"
  >
    {card.meaning} {card.pronunciation}
  </p>
</div>
```

**근거**:
- `<p>` → `absolute bottom-[8%]` (하단 8% 위)
- `max-w-[80%]` (폭 최대 80%)
- `max-h-[30%]` (높이 최대 30%)
- `overflow-hidden` (영역 초과 방지)
- 이미지 `mb-2` 제거 (뜻음이 absolute라 마진 불필요)

---

## 변경 파일 목록

| 파일 | 변경 유형 | Feature |
|------|-----------|---------|
| `components/FlipCard.tsx` | 수정 | F-v12-01, F-v12-02, F-v12-03 |

---

## 성공 기준

| 기준 | 검증 |
|------|------|
| 컨테이너 `style.width = 'min(90vw, 80vh)'` | inline style 확인 |
| 컨테이너 `style.height = 'min(90vw, 80vh)'` | inline style 확인 |
| motion.div `h-full` 클래스 | className 확인 |
| 한자 `style.fontSize = 'calc(0.8 * min(90vw, 80vh))'` | inline style 확인 |
| 뜻음 `absolute bottom-[8%] max-w-[80%] max-h-[30%]` | className 확인 |

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v12 |
| Phase | Design |
| Status | Completed |
| Created | 2026-03-07 |
