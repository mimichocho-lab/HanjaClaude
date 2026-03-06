# Design: HanjaClaude

## Overview

구몬한자 B단계 카드 학습 앱 전체 시스템 설계 (Next.js PWA, 모바일 우선).

---

## Tech Stack

| 항목 | 기술 |
|------|------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Storage | localStorage |
| Data | CSV (data/hanjab.csv) → 런타임 fetch |
| Hosting | GitHub Pages (Static Export) |

---

## 화면 구성 및 라우팅

```
/           → 홈 화면      (app/page.tsx)
/play       → 플레이 화면  (app/play/page.tsx) ?ids=1,2,3,...
/options    → 옵션 화면    (app/options/page.tsx)
/wrong      → 오답 한자방  (app/wrong/page.tsx)
```

---

## 데이터 모델

### types/hanja.ts

```typescript
export interface HanjaCard {
  id: number;
  hanja: string;
  meaning: string;
  pronunciation: string;
  imagePath?: string;
}

export type CardFace = "front" | "back";

export interface PlayOptions {
  order: "sequential" | "random";
  startFace: "front" | "back" | "random";
  showMeaning: boolean;  // 홈/오답방 카드 셀에 뜻음 표시 여부 (F-08)
}
```

### hanjab.csv 구조

| 컬럼 | 설명 |
|------|------|
| 번호 | 카드 번호 (1~90) |
| 한자 | 한자 문자 |
| 뜻 | 뜻 (한국어) |
| 음 | 음 (한국어) |

---

## Hooks 설계

### useHanjaData
- `data/hanjab.csv` fetch → `HanjaCard[]` 파싱 반환
- 반환: `{ cards, loading }`

### useSelection(cards)
- 카드 선택/해제 상태 관리 (Set<number>)
- localStorage (`hanjaSelectedIds`) 기반 선택 상태 영속화 (F-09/F-10 연동)
- 반환: `{ selectedIds, selectedIdsArray, toggleCard, toggleAll }`

### usePlayOptions
- localStorage (`hanjaPlayOptions`) 기반 옵션 저장
- 기본값: `{ order: "sequential", startFace: "front", showMeaning: true }`
- 반환: `{ options, updateOptions }`

### useWrongAnswers
- localStorage (`hanjaWrongIds`) 기반 오답 ID 저장
- 반환: `{ wrongIds, addWrongId, removeWrongId }`

### usePlaySession(cards, options)
- 플레이 세션 핵심 로직
- `goToCard(index)` — 시작면으로 리셋하며 이동 (이전/다음 버튼)
- `swipeToCard(index)` — 현재 면 유지하며 이동 (스와이프)
- `flipCard()` — 앞뒤 전환 + flip 애니메이션 활성화
- `resolveStartFace()` — random일 때 카드마다 새로 결정 (optionsRef 사용)
- 반환: `{ playCards, currentIndex, face, animated, done, setDone, goToCard, flipCard, onTouchStart, onTouchEnd }`

---

## Components 설계

### HanjaCardCell (components/HanjaCard.tsx)
- 용도: 홈 화면 / 오답방 그리드 셀
- Props: `{ card, selected?, onTap?, onLongPress?, deleteMode?, onDelete?, showMeaning? }`
- 표시: 한자(크게) + 번호(우상단), 뜻음은 showMeaning=true일 때만 표시 (F-08)
- 선택 시: blue border
- deleteMode 시: 우상단 빨간 X 버튼

### FlipCard (components/FlipCard.tsx)
- 용도: 플레이 화면 카드
- Props: `{ card, face, onFlip, animated }`
- 앞면: 한자 크게 표시
- 뒷면: 이미지(있으면) + 뜻음 텍스트
- 카드 탭 → flipCard() 호출 → 3D flip 애니메이션

### ProgressBar (components/ProgressBar.tsx)
- Props: `{ current, total }`
- 플레이 화면 상단에 진행률 표시

### BottomBar (components/BottomBar.tsx)
- 용도: 홈 화면 하단 고정 바
- Props: `{ selectedCount, totalCount, onSelectAll, onPlay }`
- 선택 개수 + 전체선택 버튼 + 플레이 시작 버튼

---

## 화면별 설계

### 홈 화면 (app/page.tsx)

```
useHanjaData() → cards
useSelection(cards) → selectedIds, selectedIdsArray, toggleCard, toggleAll
usePlayOptions() → options (showMeaning 사용)

[상단] "구몬 한자 B" 타이틀 + 오답방 버튼 + 설정 버튼
[그리드] 5열 × HanjaCardCell (선택 상태, showMeaning=options.showMeaning)
[하단] BottomBar (선택수 / 전체선택 / 플레이)

플레이 버튼 → router.push(`/play?ids=${selectedIdsArray.join(",")}`)
설정 버튼 → router.push(`/options?ids=${selectedIdsArray.join(",")}`)
```

### 플레이 화면 (app/play/page.tsx)

```
useHanjaData() + useSearchParams("ids") → filteredCards
usePlayOptions() → options
useWrongAnswers() → wrongIds, addWrongId, removeWrongId
usePlaySession(filteredCards, options) → 세션 상태

[상단] 홈 버튼 | N/전체 | 오답방 버튼
[프로그레스바] ProgressBar
[카드 영역] FlipCard (onTouchStart/onTouchEnd 스와이프)
[하단] 이전 버튼 | 오답 토글 버튼 | 다음/완료 버튼

isWrong = wrongIds.includes(currentCard.id)
오답 토글: isWrong → removeWrongId / !isWrong → addWrongId
완료 화면: 홈으로 + 오답방 버튼
```

### 옵션 화면 (app/options/page.tsx)

```
usePlayOptions() → options, updateOptions
useSearchParams("ids") → selectedIdsArray (홈에서 전달)

[상단] "총 N장 선택됨" 요약 표시

카드 순서: [번호 순서] [랜덤] (토글)  ← F-06
시작 면: [한자 먼저] [뜻음 먼저] [랜덤] (토글)  ← F-07
뜻음 표시: [보이기] [숨기기] (토글)  ← F-08

현재 선택 목록 (F-09):
  문자열 표시: "1,2,3,...,N" 형태
  [복사] 버튼 → navigator.clipboard.writeText(ids)

선택 목록 반영 (F-10):
  텍스트 입력폼 (placeholder: "카드 번호 붙여넣기")
  [반영] 버튼 → ids 파싱 → localStorage(hanjaSelectedIds) 업데이트

[홈으로] 버튼  ← F-11
```

**F-10 선택 반영 흐름:**
1. 입력된 문자열을 `,` 또는 공백으로 split → 숫자 배열 파싱
2. 유효한 id(1~90)만 필터링
3. localStorage `hanjaSelectedIds`에 저장
4. router.push("/") → home useSelection이 localStorage에서 읽어 반영

### 오답 한자방 (app/wrong/page.tsx)

```
useHanjaData() → allCards
useWrongAnswers() → wrongIds, removeWrongId
usePlayOptions() → options (showMeaning 사용)

wrongCards = allCards.filter(c => wrongIds.includes(c.id))

[상단] ← 홈 | 오답 한자방 | 삭제 버튼 | 전체 플레이 버튼
[그리드] 5열 × HanjaCardCell (deleteMode 지원, showMeaning=options.showMeaning)
빈 상태: "아직 오답 한자가 없어요" 메시지

삭제 모드: 길게 누르기 또는 삭제 버튼 → HanjaCardCell에 X 표시
전체 플레이: router.push(`/play?ids=${wrongCards.map(c=>c.id).join(",")}`)
```

---

## 상태 흐름

```
localStorage
  hanjaPlayOptions   ←→  usePlayOptions  (order, startFace, showMeaning)
  hanjaWrongIds      ←→  useWrongAnswers
  hanjaSelectedIds   ←→  useSelection    (F-10 선택 반영 연동)

URL Query
  /play?ids=...      →   useSearchParams → filteredCards → usePlaySession
  /options?ids=...   →   useSearchParams → 선택 목록 표시 (F-09)
```

---

## 핵심 설계 결정

| 결정 | 이유 |
|------|------|
| goToCard vs swipeToCard 분리 | 버튼 이동은 시작면 리셋, 스와이프는 현재 면 유지 (F-16) |
| optionsRef + resolveStartFace | 카드마다 독립 랜덤 결정, 클로저 stale 방지 (F-12) |
| isWrong을 wrongIds로 계산 | 실시간 토글 상태 반영, 별도 wrongAdded 불필요 (F-18) |
| ids를 URL QueryString으로 전달 | 홈/오답방 → 플레이 진입, 홈 → 옵션 선택 목록 전달 |
| localStorage 직접 사용 | 서버 불필요, 간단한 영속성 |
| showMeaning을 PlayOptions에 포함 | 옵션 화면에서 통합 관리, 홈/오답방 공통 적용 (F-08) |
| useSelection → localStorage 연동 | F-10 텍스트 반영 후 홈으로 복귀 시 선택 상태 복원 |
| /options?ids= URL 전달 | 옵션 진입 시 선택 목록 표시(F-09), 서버리스 상태 공유 |

---

## 파일 구조

```
app/
  page.tsx              홈 화면
  play/page.tsx         플레이 화면
  options/page.tsx      옵션 화면
  wrong/page.tsx        오답 한자방
components/
  HanjaCard.tsx         카드 셀 (홈/오답방)
  FlipCard.tsx          뒤집기 카드 (플레이)
  ProgressBar.tsx       진행 바
  BottomBar.tsx         홈 하단 바
hooks/
  useHanjaData.ts       CSV 데이터 로드
  useSelection.ts       카드 선택 관리
  usePlayOptions.ts     플레이 옵션
  useWrongAnswers.ts    오답 목록
  usePlaySession.ts     플레이 세션 로직
types/
  hanja.ts              타입 정의
data/
  hanjab.csv            90장 한자 데이터
public/
  images/hanja/         {번호}.png 카드 이미지
```

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude |
| Phase | Design |
| Version | v4 (updated) |
| Created | 2026-03-07 |
| Updated | 2026-03-07 |
| Status | In Progress |
