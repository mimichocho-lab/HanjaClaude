# HanjaClaude-v18 Design Document

> **Summary**: Google Fonts CDN을 제거하고 `public/font/*.ttf` + `FontFace` API 기반 로컬 폰트 선택 시스템으로 전환한다.
>
> **Project**: HanjaClaude
> **Version**: v18
> **Author**: hapines
> **Date**: 2026-03-13
> **Status**: Draft
> **Planning Doc**: [HanjaClaude-v18.plan.md](../01-plan/features/HanjaClaude-v18.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- font.csv 기반 동적 폰트 목록 (코드 변경 없이 폰트 추가 가능)
- `FontFace` API로 필요한 TTF만 런타임 로드 (오프라인 지원)
- 기존 `usePlayOptions` / `parseHanja` 패턴 최대 재사용
- `HanjaFont` string union 타입 완전 제거

### 1.2 Design Principles

- 기존 CSV 파싱 패턴(`lib/parseHanja.ts`) 재사용
- 컴포넌트는 `fontFamily: string`만 받음 (FontEntry 의존성 없음)
- FontFace 로드는 단일 훅(`useFontLoader`)에서 집중 관리

---

## 2. Data Flow

```
[앱 시작]
  useFontData → fetch("/data/font.csv") → FontEntry[]
        │
        ▼
  options.hanjaFontId (localStorage) → 매칭 FontEntry
        │
        ▼
  useFontLoader → new FontFace(entry.name, url) → document.fonts.add()
        │
        ▼
  현재 fontFamily = entry.name (로드 완료 시)
        │
  ┌─────┴─────┐
  ▼           ▼
FlipCard   HanjaCardCell
style={{ fontFamily }}
```

---

## 3. Data Model

### 3.1 타입 변경

```typescript
// types/hanja.ts

// 추가
export interface FontEntry {
  id: number;    // font.csv 번호
  name: string;  // font.csv 이름 (CSS font-family 이름으로 사용)
  file: string;  // font.csv 데이터 (TTF 파일명)
}

// 변경
export interface PlayOptions {
  order: "sequential" | "random";
  startFace: "front" | "back" | "random";
  showMeaning: boolean;
  homeOrder: "sequential" | "random";
  hanjaFontId: number;   // 변경: hanjaFont: HanjaFont → hanjaFontId: number
}

// 제거
// export type HanjaFont = "haeseo" | "myeongjo" | "gungseo";
```

---

## 4. 구현 명세

### 4.1 lib/parseHanja.ts — loadFontData 추가

기존 `loadSetData` 패턴과 동일하게 추가:

```typescript
export async function loadFontData(): Promise<FontEntry[]> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const res = await fetch(`${basePath}/data/font.csv`);
  const text = await res.text();
  return text
    .trim()
    .split("\n")
    .slice(1) // 헤더 제거
    .map((line) => {
      const [id, name, file] = line.split(",");
      return { id: Number(id), name: name.trim(), file: file.trim() };
    });
}
```

### 4.2 hooks/useFontData.ts — 신규 훅

```typescript
"use client";
import { useState, useEffect } from "react";
import { loadFontData } from "@/lib/parseHanja";
import type { FontEntry } from "@/types/hanja";

export function useFontData() {
  const [fonts, setFonts] = useState<FontEntry[]>([]);

  useEffect(() => {
    loadFontData()
      .then(setFonts)
      .catch((err) => console.error("폰트 목록 로드 실패:", err));
  }, []);

  return fonts;
}
```

### 4.3 hooks/useFontLoader.ts — 신규 훅 (FontFace API)

```typescript
"use client";
import { useEffect, useRef } from "react";
import type { FontEntry } from "@/types/hanja";

export function useFontLoader(fonts: FontEntry[], fontId: number): string {
  const loadedRef = useRef<Set<number>>(new Set());

  const entry = fonts.find((f) => f.id === fontId) ?? fonts[0];

  useEffect(() => {
    if (!entry || loadedRef.current.has(entry.id)) return;

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const font = new FontFace(entry.name, `url(${basePath}/font/${entry.file})`);
    font.load()
      .then((loaded) => {
        document.fonts.add(loaded);
        loadedRef.current.add(entry.id);
      })
      .catch((err) => console.error(`폰트 로드 실패: ${entry.name}`, err));
  }, [entry?.id, fonts.length]);

  return entry?.name ?? "";
}
```

> **설계 결정**: 같은 폰트는 1회만 로드 (`loadedRef`로 추적). 컴포넌트 remount 시에도 재로드 없음.

### 4.4 hooks/usePlayOptions.ts — DEFAULT 변경

```typescript
const DEFAULT: PlayOptions = {
  order: "sequential",
  startFace: "front",
  showMeaning: true,
  homeOrder: "sequential",
  hanjaFontId: 1,   // 변경: "haeseo" → 1 (font.csv 첫 번째)
};
```

### 4.5 app/globals.css — Google Fonts @import 제거

```css
/* 제거:
@import url('https://fonts.googleapis.com/css2?family=...');
:root { --font-haeseo: ...; --font-myeongjo: ...; --font-gungseo: ...; }
*/
```

### 4.6 components/FlipCard.tsx — 변경

```typescript
// 제거: HANJA_FONT_FAMILY, import HanjaFont
// 변경: hanjaFont?: HanjaFont → fontFamily?: string

interface Props {
  card: HanjaCard;
  face: CardFace;
  onFlip: () => void;
  animated?: boolean;
  fontFamily?: string;   // 변경
}

// 한자 span
<span
  className="font-bold text-gray-800"
  style={{ fontSize: 'calc(0.8 * min(90vw, 80vh))', fontFamily }}
>
```

### 4.7 components/HanjaCard.tsx — 변경

```typescript
// 제거: import HANJA_FONT_FAMILY, HanjaFont
// 변경: hanjaFont?: HanjaFont → fontFamily?: string

interface Props {
  // ...
  fontFamily?: string;   // 변경
}

// 한자 span
<span
  className="text-3xl font-bold text-gray-800"
  style={{ fontFamily }}
>
```

### 4.8 app/options/page.tsx — 폰트 선택 UI

```tsx
// useFontData로 목록 로드, options.hanjaFontId와 비교
const fonts = useFontData();

{/* 한자 폰트 */}
<div className="bg-white rounded-xl p-4 shadow-sm">
  <p className="text-sm font-semibold text-gray-700 mb-3">한자 폰트</p>
  <div className="flex flex-wrap gap-2">
    {fonts.map((font) => (
      <button
        key={font.id}
        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors
          ${options.hanjaFontId === font.id
            ? "bg-blue-500 text-white border-blue-500"
            : "bg-white text-gray-600 border-gray-300"
          }`}
        onClick={() => updateOptions({ hanjaFontId: font.id })}
      >
        {font.name}
      </button>
    ))}
  </div>
</div>
```

> **UI 결정**: 4개 폰트 이름이 길 수 있어 `flex-wrap` 사용. 이름이 한자이므로 한 줄 배치 시도하되 넘치면 줄바꿈.

### 4.9 app/page.tsx / app/play/page.tsx / app/wrong/page.tsx

각 페이지에서 `useFontData`, `useFontLoader` 호출 후 `fontFamily`를 컴포넌트에 전달:

```tsx
const fonts = useFontData();
const fontFamily = useFontLoader(fonts, options.hanjaFontId);

// HanjaCardCell / FlipCard에 전달
<HanjaCardCell fontFamily={fontFamily} ... />
<FlipCard fontFamily={fontFamily} ... />
```

---

## 5. 변경 파일 요약

| 파일 | 변경 유형 | 내용 |
|------|---------|------|
| `types/hanja.ts` | 수정 | FontEntry 추가, HanjaFont 제거, PlayOptions.hanjaFontId |
| `lib/parseHanja.ts` | 수정 | loadFontData 함수 추가 |
| `hooks/useFontData.ts` | **신규** | font.csv 파싱 훅 |
| `hooks/useFontLoader.ts` | **신규** | FontFace API 로드 훅 |
| `hooks/usePlayOptions.ts` | 수정 | DEFAULT.hanjaFontId = 1 |
| `app/globals.css` | 수정 | Google Fonts @import 및 CSS variable 제거 |
| `components/FlipCard.tsx` | 수정 | HANJA_FONT_FAMILY 제거, fontFamily: string props |
| `components/HanjaCard.tsx` | 수정 | HANJA_FONT_FAMILY 제거, fontFamily: string props |
| `app/options/page.tsx` | 수정 | 폰트 목록 UI (useFontData 사용) |
| `app/page.tsx` | 수정 | useFontData, useFontLoader 사용, fontFamily 전달 |
| `app/play/page.tsx` | 수정 | useFontData, useFontLoader 사용, fontFamily 전달 |
| `app/wrong/page.tsx` | 수정 | useFontData, useFontLoader 사용, fontFamily 전달 |

---

## 6. Implementation Order

1. [ ] `types/hanja.ts` — FontEntry 추가, HanjaFont 제거, hanjaFontId
2. [ ] `lib/parseHanja.ts` — loadFontData 추가
3. [ ] `hooks/useFontData.ts` — 신규
4. [ ] `hooks/useFontLoader.ts` — 신규
5. [ ] `hooks/usePlayOptions.ts` — DEFAULT 수정
6. [ ] `app/globals.css` — @import 제거
7. [ ] `components/FlipCard.tsx` — fontFamily: string 으로 변경
8. [ ] `components/HanjaCard.tsx` — fontFamily: string 으로 변경
9. [ ] `app/options/page.tsx` — 폰트 목록 UI
10. [ ] `app/page.tsx` — useFontLoader 연결
11. [ ] `app/play/page.tsx` — useFontLoader 연결
12. [ ] `app/wrong/page.tsx` — useFontLoader 연결

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-13 | Initial draft | hapines |
