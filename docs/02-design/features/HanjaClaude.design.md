# Design: HanjaClaude

## Overview

구몬한자 B단계 카드 학습 앱 — Next.js 기반 모바일 우선 웹 앱 (PWA).
로컬 CSV 데이터를 기반으로 서버 없이 동작하며, 4개 화면으로 구성된다.

---

## Tech Stack

| 항목 | 기술 | 비고 |
|------|------|------|
| Framework | Next.js 14 (App Router) | PWA 지원 |
| Language | TypeScript | |
| Styling | Tailwind CSS | 모바일 우선 |
| Animation | Framer Motion | 카드 flip / swipe |
| State | React useState / useReducer | 서버 불필요, 로컬만 |
| Data | CSV → JSON (빌드 시 파싱) | `data/hanjab.csv` |
| Storage | localStorage | 오답 카드, 옵션 설정 저장 |
| PWA | next-pwa | 오프라인 지원 |

---

## Project Structure

```
hanjaclaude/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (PWA 메타)
│   ├── page.tsx                # 홈 화면 (/)
│   ├── options/
│   │   └── page.tsx            # 옵션 화면 (/options)
│   ├── play/
│   │   └── page.tsx            # 플레이 화면 (/play)
│   └── wrong/
│       └── page.tsx            # 오답 한자방 (/wrong)
├── components/
│   ├── HanjaCard.tsx           # 카드 셀 (홈/오답 그리드용)
│   ├── FlipCard.tsx            # 플레이 화면 flip 카드
│   ├── BottomBar.tsx           # 하단 고정 바 (홈 화면)
│   └── ProgressBar.tsx         # 진행 표시 (플레이 화면)
├── hooks/
│   ├── useHanjaData.ts         # CSV 파싱 및 카드 데이터 로딩
│   ├── useSelection.ts         # 카드 선택 상태 관리
│   ├── usePlaySession.ts       # 플레이 순서/면 상태 관리
│   └── useWrongAnswers.ts      # 오답 카드 localStorage 관리
├── lib/
│   └── parseHanja.ts           # CSV → HanjaCard[] 파싱 유틸
├── types/
│   └── hanja.ts                # 타입 정의
├── data/
│   └── hanjab.csv              # 한자 원본 데이터 (90장)
└── public/
    └── images/
        └── hanja/              # {번호}.png 이미지 (선택적)
```

---

## Data Types

```typescript
// types/hanja.ts

export interface HanjaCard {
  id: number;          // 카드 번호 (1~90)
  hanja: string;       // 한자 문자 (예: "目")
  meaning: string;     // 뜻 (예: "눈")
  pronunciation: string; // 음 (예: "목")
  imagePath?: string;  // /images/hanja/{id}.png (선택적)
}

export type CardFace = 'front' | 'back';  // front=한자, back=뜻음

export interface PlayOptions {
  order: 'sequential' | 'random';
  startFace: 'front' | 'back' | 'random';
}
```

---

## Screen Design

### 1. 홈 화면 (`/`)

**컴포넌트 구성**
```
<HomePage>
  <TopBar>              # 상단: 타이틀 + 옵션 버튼(우측)
  <HanjaGrid>           # 스크롤 영역: HanjaCard 셀 목록
    <HanjaCard />       # 개별 카드: 한자(크게) + 뜻음(작게) + 번호(우상단)
  <BottomBar>           # 고정 하단: 선택 개수 + 전체선택 + 플레이 버튼
```

**상태**
```typescript
const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
```

**동작**
- 카드 탭 → 선택/해제 (selectedIds 토글)
- 전체선택 버튼 → 1~90 전체 토글
- 플레이 버튼 (선택 >= 1) → `/play?ids=1,2,3...` 로 이동
- 옵션 버튼 → `/options` 로 이동
- 오답 한자방 버튼 → `/wrong` 로 이동

---

### 2. 옵션 화면 (`/options`)

**컴포넌트 구성**
```
<OptionsPage>
  <SectionTitle>         # "학습 설정"
  <OptionRow label="순서">
    <RadioGroup>         # 순서대로 | 랜덤
  <OptionRow label="시작 면">
    <RadioGroup>         # 앞면(한자) | 뒷면(뜻음) | 랜덤
  <HomeButton>           # 하단 "홈으로" 버튼
```

**상태 & 저장**
```typescript
// localStorage key: 'hanjaPlayOptions'
const [options, setOptions] = useState<PlayOptions>({
  order: 'sequential',
  startFace: 'front',
});
// 변경 즉시 localStorage에 저장
```

---

### 3. 플레이 화면 (`/play`)

**URL 파라미터**: `?ids=1,2,5,10,...`

**컴포넌트 구성**
```
<PlayPage>
  <TopNav>               # 진행 표시 (N / 전체) + 홈 버튼 + 오답한자방 버튼
  <FlipCard>             # 메인 카드 (앞면 또는 뒷면)
    <CardFront>          # 한자 크게 + 번호(우상단)
    <CardBack>           # 이미지(선택적) + 뜻음 텍스트 + 번호(우상단)
  <WrongButton>          # 오답 추가 버튼 (별/하트 아이콘)
```

**상태**
```typescript
const [cards, setCards] = useState<HanjaCard[]>([]);    // 선택된 카드 (순서 적용)
const [currentIndex, setCurrentIndex] = useState(0);
const [isFlipped, setIsFlipped] = useState(false);
const [currentFace, setCurrentFace] = useState<CardFace>('front');
```

**동작**
- 카드 탭 → flip 애니메이션 (앞/뒤 전환)
- 좌/우 스와이프 → 다음/이전 카드 (현재 face 방향 유지)
- 오답 버튼 → localStorage wrongAnswerIds에 현재 카드 id 추가
- 마지막 카드 스와이프 → 완료 메시지 또는 홈 이동

**Flip 애니메이션 (Framer Motion)**
```typescript
// FlipCard.tsx
const variants = {
  front: { rotateY: 0 },
  back:  { rotateY: 180 },
};
// perspective: 1000px, transformStyle: preserve-3d
```

**스와이프 (Touch Event)**
```typescript
// 50px 이상 수평 스와이프 시 다음/이전 카드
const SWIPE_THRESHOLD = 50;
```

---

### 4. 오답 한자방 (`/wrong`)

**컴포넌트 구성**
```
<WrongPage>
  <TopBar>              # "오답 한자방" 타이틀 + 전체 플레이 버튼
  <HanjaGrid>           # 오답 카드 그리드 (홈 화면과 동일 레이아웃)
    <HanjaCard />       # 길게 누르면 삭제 모드
  <EmptyState />        # 오답 없을 때 안내 메시지
```

**상태**
```typescript
// localStorage key: 'hanjaWrongIds'
const [wrongIds, setWrongIds] = useState<number[]>([]);
const [deleteMode, setDeleteMode] = useState(false);
```

**동작**
- 카드 길게 누르기 → 삭제 모드 (X 아이콘 표시)
- X 탭 → 해당 카드 wrongIds에서 제거 → localStorage 업데이트
- 전체 플레이 버튼 → `/play?ids={wrongIds}` 로 이동

---

## State Management (No Server)

| 상태 | 저장 위치 | 키 |
|------|-----------|-----|
| 카드 선택 | React state | `selectedIds` (홈 화면 로컬) |
| 플레이 옵션 | localStorage | `hanjaPlayOptions` |
| 오답 카드 IDs | localStorage | `hanjaWrongIds` |

---

## Data Loading

```typescript
// lib/parseHanja.ts
// CSV 파일을 fetch하여 HanjaCard[] 로 파싱
export async function loadHanjaData(): Promise<HanjaCard[]> {
  const res = await fetch('/data/hanjab.csv');
  const text = await res.text();
  // 헤더(번호,한자,뜻,음) 스킵 후 파싱
  return text.trim().split('\n').slice(1).map(line => {
    const [id, hanja, meaning, pronunciation] = line.split(',');
    return {
      id: Number(id),
      hanja,
      meaning,
      pronunciation,
      imagePath: `/images/hanja/${id}.png`,
    };
  });
}
```

`hanjab.csv`는 `public/data/hanjab.csv`로 복사하여 런타임 fetch로 사용.

---

## Routing

| 화면 | 경로 | 진입 방법 |
|------|------|-----------|
| 홈 | `/` | 앱 시작, 플레이 종료 후 |
| 옵션 | `/options` | 홈 상단 옵션 버튼 |
| 플레이 | `/play?ids=...` | 홈 플레이 버튼, 오답 한자방 전체 플레이 |
| 오답 한자방 | `/wrong` | 홈 오답 버튼, 플레이 화면 오답방 버튼 |

---

## UI/UX Guidelines

- **폰트**: 한자는 `font-size: 2.5rem` 이상, 뜻음은 `0.75rem`
- **카드 셀**: 정사각형에 가까운 비율, 그리드 5열 (모바일 기준)
- **색상**: 배경 흰색/연한 베이지, 선택 카드 파란 테두리
- **플레이 카드**: 화면 80% 높이, 중앙 정렬, 그림자 효과
- **터치 영역**: 최소 44px (iOS HIG 기준)
- **오답 버튼**: 빨간색 계열, 플레이 카드 하단 고정

---

## Implementation Order

1. **기반 설정**: Next.js + TypeScript + Tailwind 프로젝트 초기화
2. **데이터 레이어**: `parseHanja.ts` + `useHanjaData.ts` 구현
3. **홈 화면**: `HanjaCard` + `HanjaGrid` + `BottomBar` + 선택 상태
4. **옵션 화면**: 설정 UI + localStorage 저장
5. **플레이 화면**: `FlipCard` + flip 애니메이션 + 스와이프
6. **오답 한자방**: 오답 목록 + 삭제 + 플레이 연결
7. **PWA 설정**: manifest + next-pwa 적용

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude |
| Phase | Design |
| Level | Starter |
| Created | 2026-03-06 |
| Status | In Progress |
