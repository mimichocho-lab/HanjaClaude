# Report: HanjaClaude (v3)

## 완료 요약

HanjaClaude v3 완료. Plan v2 기준 구현 Gap 3개 (F-09/F-13/F-15) 수정.

---

## PDCA 사이클 요약

| Phase | 내용 | 결과 |
|-------|------|------|
| Plan | v2 plan 복원, 기존 F-01~F-20 기준 | 완료 |
| Design | GAP-1(F-09), GAP-2(F-13), GAP-3(F-15) 설계 | 완료 |
| Do | usePlaySession.ts, play/page.tsx 수정 | 완료 |
| Check | Match Rate 100%, Gap 없음 | 완료 |
| Act | 불필요 (100% 달성) | N/A |

---

## 수정 내용 (v3)

### GAP-1: F-09 — 랜덤 시작면 카드별 독립 결정

**문제**: `startFaceRef`에 플레이 시작 시 1회만 랜덤 결정 → 모든 카드 동일 면

**해결**: `resolveStartFace()` 함수로 `goToCard` 호출마다 새로 결정

```typescript
const resolveStartFace = (): CardFace => {
  const sf = optionsRef.current.startFace;
  return sf === "random" ? (Math.random() < 0.5 ? "front" : "back") : sf;
};
```

---

### GAP-2: F-13 — 스와이프 시 현재 면 유지

**문제**: 스와이프도 `goToCard` 호출 → 시작면으로 리셋

**해결**: `swipeToCard()` 분리 — face 변경 없이 인덱스만 이동

```typescript
const swipeToCard = (index: number) => {
  setCurrentIndex(index);
  setAnimated(false);
};
```

버튼(이전/다음): `goToCard` → 시작면 리셋
스와이프: `swipeToCard` → 현재 면 유지

---

### GAP-3: F-15 — 오답 버튼 토글

**문제**: 추가만 되고 비활성화, 해제 불가

**해결**: `isWrong` 실시간 판별 + `handleToggleWrong` 토글

```typescript
const isWrong = currentCard ? wrongIds.includes(currentCard.id) : false;

const handleToggleWrong = () => {
  if (isWrong) removeWrongId(currentCard.id);
  else addWrongId(currentCard.id);
};
```

---

## 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `hooks/usePlaySession.ts` | `resolveStartFace()`, `swipeToCard()` 추가 / `startFaceRef`, `wrongAdded` 제거 |
| `app/play/page.tsx` | `isWrong`, `handleToggleWrong` 추가 / `wrongAdded`/`setWrongAdded` 제거 |

---

## 전체 기능 현황

| # | 기능 | 상태 |
|---|------|------|
| F-01~F-08 | 홈/옵션 화면 전체 기능 | 완료 (v1) |
| F-09 | 카드 표시 시작 (뒷면 즉시, 랜덤 카드별) | 완료 (v2+v3) |
| F-10~F-12 | 앞/뒷면 표시, 뒤집기 | 완료 (v1) |
| F-13 | 스와이프 이동 (현재 면 유지) | 완료 (v3) |
| F-14 | 진행 표시 | 완료 (v1) |
| F-15 | 오답 버튼 토글 | 완료 (v3) |
| F-16~F-17 | 오답방/홈 진입 | 완료 (v1) |
| F-18~F-20 | 오답 한자방 전체 기능 | 완료 (v1) |

**총 20개 기능 — 전체 완료**

---

## Match Rate 히스토리

| 사이클 | Match Rate | 주요 내용 |
|--------|-----------|----------|
| v1 | 93% | 전체 앱 최초 구현 |
| v2 | 100% | F-09 뒷면 즉시 표시 |
| v3 | 100% | F-09 랜덤 카드별, F-13 스와이프 면 유지, F-15 오답 토글 |

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude |
| Phase | Completed |
| Version | v3 |
| Created | 2026-03-06 |
| Final Match Rate | 100% |
| Status | Completed |
