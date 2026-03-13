# HanjaClaude-v18 Planning Document

> **Summary**: Google Fonts CDN 의존 제거. 로컬 TTF 파일 기반 한자 폰트 선택 시스템으로 전환.
>
> **Project**: HanjaClaude
> **Version**: v18
> **Author**: hapines
> **Date**: 2026-03-13
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

v16/v17에서 구현한 한자 서체 선택은 Google Fonts CDN에 의존한다.
네트워크가 없거나 CDN 차단 환경에서는 폰트가 로드되지 않는다.
`public/font/`에 TTF 파일을 직접 제공하여 오프라인 환경에서도 한자 폰트를 사용할 수 있도록 한다.

### 1.2 Background

**현재 상태 (v16/v17):**
- `globals.css`에 Google Fonts CDN `@import` → 네트워크 필요
- `hanjaFont: "haeseo" | "myeongjo" | "gungseo"` 타입 → 고정 3종

**제공된 TTF 파일 (`public/font/`):**
```
public/data/font.csv:
번호,이름,데이터
1,猫啃珠圆体,MaoKenZhuYuanTi-MaokenZhuyuanTi-2.ttf
2,荆南麦圆体,Kingnammm-Maiyuan-II-Regular-2.ttf
3,苦累蛙圆体-CJK-JP SemiBold,KurewaGothicCjkJp-SemiBold-2.ttf
4,UnGungseo楷体,UnGungseo-2.ttf
```

**목표:**
- font.csv를 동적으로 파싱 → 옵션에서 이름 목록 표시
- 선택한 폰트 번호(int)를 localStorage에 저장
- `FontFace` API로 TTF 파일을 런타임에 로드하여 한자에 적용
- 저장된 폰트 번호가 없으면 font.csv 첫 번째 항목(번호 1) 사용

### 1.3 Related Documents

- v16: 한자 서체 선택 기능 (`docs/archive/2026-03/HanjaClaude-v16/`)
- v17: 홈/오답방 서체 적용 확장 (`docs/archive/2026-03/HanjaClaude-v17/`)

---

## 2. Scope

### 2.1 In Scope

- [x] `public/data/font.csv` 파싱 훅 (`useFontData`) 작성
- [x] `PlayOptions.hanjaFont` 타입을 `hanjaFontId: number` 로 변경
- [x] `usePlayOptions` 기본값: font.csv 첫 번째 번호 (1)
- [x] `FontFace` API로 선택된 TTF 파일 로드 및 `document.fonts` 등록
- [x] 옵션 화면: 폰트 이름 목록 버튼 UI (한 줄로 스크롤 또는 여러 줄)
- [x] `FlipCard`, `HanjaCardCell` 한자 span에 적용된 fontFamily 반영
- [x] `globals.css` Google Fonts `@import` 제거
- [x] 기존 `HanjaFont` 타입 및 `HANJA_FONT_FAMILY` 매핑 제거

### 2.2 Out of Scope

- TTF 파일 직접 생성/편집
- 폰트 미리보기 이미지
- 폰트 다운로드 진행률 표시

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `public/data/font.csv`를 fetch하여 폰트 목록(번호, 이름, 파일명)을 로드한다 | High | Pending |
| FR-02 | 옵션 화면에서 폰트 이름 목록을 버튼으로 표시한다 | High | Pending |
| FR-03 | 선택된 폰트 번호(int)를 localStorage에 저장한다 | High | Pending |
| FR-04 | 저장된 폰트 번호가 없으면 font.csv 첫 번째 항목을 기본값으로 사용한다 | High | Pending |
| FR-05 | `FontFace` API로 해당 TTF 파일(`/font/{파일명}`)을 로드하고 `document.fonts`에 등록한다 | High | Pending |
| FR-06 | `FlipCard`와 `HanjaCardCell` 한자에 선택된 폰트의 fontFamily를 적용한다 | High | Pending |
| FR-07 | 기존 Google Fonts CDN 의존성(`globals.css` @import)을 제거한다 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria |
|----------|----------|
| 오프라인 지원 | 네트워크 없이도 폰트 표시 |
| 성능 | TTF 파일은 필요 시 1회만 로드 (캐싱) |
| 확장성 | font.csv에 항목 추가 시 코드 변경 없이 반영 |

---

## 4. Architecture

### 4.1 폰트 로드 흐름

```
[앱 시작 / 폰트 선택 변경]
        │
        ▼
[useFontData] → fetch("/data/font.csv") → 파싱 → FontEntry[]
        │
        ▼
[useFontLoader] → new FontFace(name, "url(/font/{file})") → load() → document.fonts.add()
        │
        ▼
[FlipCard, HanjaCardCell] → style={{ fontFamily: selectedFontName }}
```

### 4.2 데이터 구조

```typescript
// types/hanja.ts 변경
export interface FontEntry {
  id: number;       // 번호
  name: string;     // 이름 (CSS font-family명으로도 사용)
  file: string;     // TTF 파일명
}

export interface PlayOptions {
  order: "sequential" | "random";
  startFace: "front" | "back" | "random";
  showMeaning: boolean;
  homeOrder: "sequential" | "random";
  hanjaFontId: number;   // 변경: HanjaFont string → number
}
// HanjaFont 타입 제거
```

### 4.3 변경 파일 목록

```
types/hanja.ts              → HanjaFont 제거, FontEntry 추가, PlayOptions.hanjaFontId
hooks/usePlayOptions.ts     → hanjaFontId 기본값 처리 (font.csv 첫 번째)
hooks/useFontData.ts        → 신규: font.csv 파싱 훅
hooks/useFontLoader.ts      → 신규: FontFace API 로드 훅
app/globals.css             → Google Fonts @import 제거, CSS variable 정리
app/layout.tsx              → 변경 없음
app/options/page.tsx        → 폰트 이름 목록 UI (useFontData 사용)
components/FlipCard.tsx     → HANJA_FONT_FAMILY 제거, fontFamily를 name으로
components/HanjaCard.tsx    → fontFamily를 name으로
app/page.tsx                → hanjaFontId → FontEntry 전달
app/play/page.tsx           → hanjaFontId → FontEntry 전달
app/wrong/page.tsx          → hanjaFontId → FontEntry 전달
```

---

## 5. 기술 결정

### FontFace API 사용 이유

| 방법 | 장점 | 단점 |
|------|------|------|
| CSS `@font-face` 정적 | 단순 | 동적 변경 불가, 모든 폰트 사전 정의 필요 |
| CSS `@font-face` 동적 (`<style>` 태그) | 가능 | SSR/hydration 문제 |
| **FontFace API** (선택) | 런타임 동적 로드, 완료 확인 가능 | `document` 필요 (클라이언트 전용) |

### 기본값 처리

```typescript
// usePlayOptions: hanjaFontId가 없으면 초기화 시 font.csv 첫 번째 id 사용
// font.csv 첫 번째 = 猫啃珠圆体 (id: 1)
const DEFAULT_FONT_ID = 1; // font.csv 첫 번째 번호
```

---

## 6. Success Criteria

- [ ] 네트워크 없이도 한자가 선택된 TTF 폰트로 표시된다
- [ ] 옵션 화면에서 4개 폰트 이름이 표시된다
- [ ] 선택 변경 시 FlipCard/HanjaCardCell에 즉시 반영된다
- [ ] localStorage에 fontId가 없으면 첫 번째 폰트가 적용된다
- [ ] Google Fonts CDN 호출이 없다
- [ ] 빌드 성공, TypeScript 오류 없음

---

## 7. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| TTF 파일 크기로 인한 초기 로드 지연 | Medium | 첫 방문 시에만 다운로드, 이후 브라우저 캐시 활용 |
| FontFace API SSR 불가 | Low | `"use client"` 훅으로만 사용, layout.tsx 미사용 |
| font.csv fetch 실패 | Low | try/catch + 빈 목록 fallback |

---

## 8. Next Steps

1. [ ] Design 문서 생략 (변경 범위 명확)
2. [ ] 구현 시작 (`/pdca do`)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-13 | Initial draft | hapines |
