# HanjaClaude-v16 Design Document

> **Summary**: 옵션 화면에 한자 서체 선택 UI를 추가하고, FlipCard 앞면 한자에 선택된 서체를 적용한다.
>
> **Project**: HanjaClaude
> **Version**: v16
> **Author**: hapines
> **Date**: 2026-03-13
> **Status**: Draft
> **Planning Doc**: [HanjaClaude-v16.plan.md](../01-plan/features/HanjaClaude-v16.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- `PlayOptions`에 `hanjaFont` 필드를 추가하여 기존 옵션 저장 구조 재사용
- `next/font/google`으로 3종 폰트를 로드하고 CSS variable로 전달
- `FlipCard`가 `hanjaFont` props를 받아 `style.fontFamily`에 적용
- 옵션 화면의 기존 버튼 패턴(한 줄 flex)을 그대로 재사용

### 1.2 Design Principles

- 기존 `usePlayOptions` 패턴 확장 (새로운 상태 관리 불필요)
- 컴포넌트 단순성 유지 (FlipCard에 fontFamily만 추가)
- Next.js 권장 폰트 로드 방식 사용 (`next/font/google`)

---

## 2. Architecture

### 2.1 Data Flow

```
[options/page.tsx]
  사용자가 서체 버튼 클릭
        │
        ▼
[usePlayOptions] updateOptions({ hanjaFont: "haeseo" | "myeongjo" | "gungseo" })
        │
        ▼
  localStorage "hanjaPlayOptions" 저장
        │
        ▼
[app/page.tsx, app/play/page.tsx]
  options.hanjaFont → FlipCard props로 전달
        │
        ▼
[FlipCard.tsx]
  style={{ fontFamily: fontFamilyOf(hanjaFont) }} 한자 글자에 적용
```

### 2.2 폰트 CSS Variable 흐름

```
[app/layout.tsx]
  next/font/google 로드 → CSS variable 생성
  --font-haeseo  : Noto Sans KR
  --font-myeongjo: Noto Serif KR
  --font-gungseo : Ma Shan Zheng
        │
        ▼
  <html> className에 variable 주입
        │
        ▼
[FlipCard] style={{ fontFamily: `var(--font-haeseo)` }} 등으로 적용
```

### 2.3 Component Dependencies

| Component | Depends On |
|-----------|-----------|
| `app/options/page.tsx` | `usePlayOptions` |
| `FlipCard.tsx` | `hanjaFont` props (string) |
| `app/page.tsx` | `usePlayOptions`, `FlipCard` |
| `app/play/page.tsx` | `usePlayOptions`, `FlipCard` |
| `app/layout.tsx` | `next/font/google` |

---

## 3. Data Model

### 3.1 타입 변경

```typescript
// types/hanja.ts — 변경 전
export interface PlayOptions {
  order: "sequential" | "random";
  startFace: "front" | "back" | "random";
  showMeaning: boolean;
  homeOrder: "sequential" | "random";
}

// types/hanja.ts — 변경 후
export type HanjaFont = "haeseo" | "myeongjo" | "gungseo";

export interface PlayOptions {
  order: "sequential" | "random";
  startFace: "front" | "back" | "random";
  showMeaning: boolean;
  homeOrder: "sequential" | "random";
  hanjaFont: HanjaFont;  // 추가
}
```

### 3.2 폰트 매핑 상수

```typescript
// 폰트 매핑 (FlipCard 또는 별도 lib/fonts.ts)
export const HANJA_FONT_FAMILY: Record<HanjaFont, string> = {
  haeseo:  "var(--font-haeseo)",
  myeongjo: "var(--font-myeongjo)",
  gungseo: "var(--font-gungseo)",
};
```

---

## 4. 구현 명세

### 4.1 app/layout.tsx — 폰트 로드

```typescript
import { Noto_Sans_KR, Noto_Serif_KR, Ma_Shan_Zheng } from "next/font/google";

const haeseo = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-haeseo",
  display: "swap",
});
const myeongjo = Noto_Serif_KR({
  subsets: ["latin"],
  variable: "--font-myeongjo",
  display: "swap",
});
const gungseo = Ma_Shan_Zheng({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gungseo",
  display: "swap",
});

// <html className={`${haeseo.variable} ${myeongjo.variable} ${gungseo.variable}`}>
```

> **주의**: `Noto_Sans_KR`과 `Noto_Serif_KR`은 파일 크기가 크므로 `preload: false` 옵션 고려.

### 4.2 hooks/usePlayOptions.ts — 기본값 추가

```typescript
const DEFAULT: PlayOptions = {
  order: "sequential",
  startFace: "front",
  showMeaning: true,
  homeOrder: "sequential",
  hanjaFont: "haeseo",   // 추가
};
```

### 4.3 app/options/page.tsx — 서체 선택 UI

```tsx
{/* 한자 서체 */}
<div className="bg-white rounded-xl p-4 shadow-sm">
  <p className="text-sm font-semibold text-gray-700 mb-3">한자 서체</p>
  <div className="flex gap-3">
    {[
      { value: "haeseo",   label: "해서체" },
      { value: "myeongjo", label: "명조체" },
      { value: "gungseo",  label: "궁서체" },
    ].map((opt) => (
      <button
        key={opt.value}
        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors
          ${options.hanjaFont === opt.value
            ? "bg-blue-500 text-white border-blue-500"
            : "bg-white text-gray-600 border-gray-300"
          }`}
        onClick={() => updateOptions({ hanjaFont: opt.value as HanjaFont })}
      >
        {opt.label}
      </button>
    ))}
  </div>
</div>
```

### 4.4 components/FlipCard.tsx — 서체 props 적용

```typescript
// Props 인터페이스 변경
interface Props {
  card: HanjaCard;
  face: CardFace;
  onFlip: () => void;
  animated?: boolean;
  hanjaFont?: HanjaFont;  // 추가 (기본값: "haeseo")
}

// 한자 글자 span에 적용
const fontFamily = HANJA_FONT_FAMILY[hanjaFont ?? "haeseo"];

<span
  className="font-bold text-gray-800"
  style={{
    fontSize: 'calc(0.8 * min(90vw, 80vh))',
    fontFamily,
  }}
>
  {card.hanja}
</span>
```

### 4.5 app/page.tsx, app/play/page.tsx — props 전달

```tsx
// FlipCard 사용 시 hanjaFont 추가
<FlipCard
  card={card}
  face={face}
  onFlip={handleFlip}
  hanjaFont={options.hanjaFont}
/>
```

---

## 5. UI/UX Design

### 5.1 옵션 화면 서체 선택 섹션

```
┌─────────────────────────────────┐
│ 한자 서체                        │
│ ┌─────────┬─────────┬─────────┐ │
│ │ 해서체   │ 명조체  │ 궁서체  │ │
│ │ [선택됨] │         │         │ │
│ └─────────┴─────────┴─────────┘ │
└─────────────────────────────────┘
```

- 기존 "시작 면" 섹션과 동일한 flex 3-버튼 레이아웃
- 선택된 버튼: `bg-blue-500 text-white`
- 비선택 버튼: `bg-white text-gray-600 border-gray-300`

### 5.2 삽입 위치

옵션 화면 내 섹션 순서:
1. 학습 셋
2. 카드 순서
3. 시작 면
4. **한자 서체** ← 새로 추가
5. 홈 화면 카드 순서
6. 홈/오답방 뜻음 표시
7. 선택 목록 URL 복사

---

## 6. 변경 파일 요약

| 파일 | 변경 내용 |
|------|----------|
| `types/hanja.ts` | `HanjaFont` 타입 추가, `PlayOptions.hanjaFont` 추가 |
| `hooks/usePlayOptions.ts` | DEFAULT에 `hanjaFont: "haeseo"` 추가 |
| `app/layout.tsx` | `next/font/google` 3종 폰트 로드, CSS variable html에 주입 |
| `app/options/page.tsx` | 한자 서체 선택 섹션 추가, `HanjaFont` import |
| `components/FlipCard.tsx` | `hanjaFont` props 추가, 한자 span에 `fontFamily` style 적용, `HANJA_FONT_FAMILY` 매핑 정의 |
| `app/page.tsx` | FlipCard에 `hanjaFont={options.hanjaFont}` 전달 |
| `app/play/page.tsx` | FlipCard에 `hanjaFont={options.hanjaFont}` 전달 |

---

## 7. Test Plan

### 7.1 검증 항목

- [ ] 옵션 화면에서 명조체 선택 → FlipCard 한자가 명조체로 변경
- [ ] 앱 재시작 후 마지막 선택 서체 유지
- [ ] 기본값(해서체) 미설정 시에도 해서체 표시
- [ ] 기존 옵션(카드 순서, 시작 면 등) 정상 동작

---

## 8. Implementation Order

1. [ ] `types/hanja.ts` — `HanjaFont` 타입 및 `PlayOptions` 수정
2. [ ] `hooks/usePlayOptions.ts` — DEFAULT 기본값 추가
3. [ ] `app/layout.tsx` — next/font/google 폰트 로드
4. [ ] `components/FlipCard.tsx` — props 및 fontFamily 적용
5. [ ] `app/options/page.tsx` — 서체 선택 UI 추가
6. [ ] `app/page.tsx`, `app/play/page.tsx` — hanjaFont props 전달

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-13 | Initial draft | hapines |
