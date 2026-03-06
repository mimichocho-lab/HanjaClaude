# Design: HanjaClaude (v2)

## Overview

구몬한자 B단계 카드 학습 앱 — Plan v2 반영.
F-09(카드 표시 시작) 추가로 인한 FlipCard 애니메이션 동작 설계 업데이트.

---

## 변경 사항 (Plan v1 → v2)

| 구분 | 내용 |
|------|------|
| 추가 | F-09: 카드 표시 시작 — 시작 면이 뒷면일 때 애니메이션 없이 즉시 뒷면 표시 |
| 재번호 | 플레이 화면 F-10~F-17 (이전 F-09~F-16) |
| 재번호 | 오답 한자방 F-18~F-20 (이전 F-17~F-19) |

---

## F-09 상세 설계 — 카드 표시 시작

### 요구사항

- 카드가 처음 표시될 때 (플레이 시작, 다음/이전 카드 이동)
- 시작 면이 **앞면**: 앞면이 바로 표시됨 (기존 동작, 변경 없음)
- 시작 면이 **뒷면**: 뒷면이 **애니메이션 없이** 즉시 표시됨
- 이후 카드를 탭하면 앞/뒤 전환 애니메이션(flip)은 정상 동작

### 구현 설계

**문제**: 현재 `FlipCard.tsx`는 `face` prop이 변경될 때 항상 Framer Motion rotateY 애니메이션이 실행됨. 뒷면 시작 시에도 앞→뒤 회전이 보임.

**해결**: `FlipCard`에 `animate` 제어 prop 추가

```typescript
// components/FlipCard.tsx 변경사항
interface Props {
  card: HanjaCard;
  face: CardFace;
  onFlip: () => void;
  animated?: boolean;  // false면 즉시 전환 (애니메이션 없음)
}

// animated=false일 때
<motion.div
  animate={{ rotateY: isFlipped ? 180 : 0 }}
  transition={animated ? { duration: 0.4, ease: "easeInOut" } : { duration: 0 }}
>
```

**usePlaySession.ts 변경사항**

카드 이동 시 첫 표시는 `animated=false`, 이후 사용자 탭은 `animated=true`

```typescript
// usePlaySession.ts에 animated 상태 추가
const [animated, setAnimated] = useState(false);  // 카드 표시 시작: false

const goToCard = (index: number) => {
  setCurrentIndex(index);
  setFace(startFaceRef.current);
  setAnimated(false);   // 카드 이동 시 애니메이션 비활성
  setWrongAdded(false);
};

const flipCard = () => {
  setAnimated(true);    // 사용자 탭 시 애니메이션 활성
  setFace((f) => (f === "front" ? "back" : "front"));
};
```

**play/page.tsx 변경사항**

```tsx
<FlipCard
  card={currentCard}
  face={face}
  onFlip={flipCard}
  animated={animated}   // usePlaySession에서 제공
/>
```

---

## 영향 범위

| 파일 | 변경 내용 |
|------|----------|
| `components/FlipCard.tsx` | `animated?: boolean` prop 추가, transition 조건부 적용 |
| `hooks/usePlaySession.ts` | `animated` 상태 추가, `goToCard`/`flipCard`에서 제어 |
| `app/play/page.tsx` | `animated` prop 전달 |

---

## 변경 없는 항목

- Tech Stack (Next.js 14, TypeScript, Tailwind, Framer Motion, localStorage)
- 4개 화면 구조 및 라우팅
- 나머지 모든 컴포넌트/훅

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude |
| Phase | Design |
| Version | v2 |
| Created | 2026-03-06 |
| Status | In Progress |
