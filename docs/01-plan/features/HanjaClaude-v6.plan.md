# Plan: HanjaClaude v6

## Overview

HanjaClaude v5 기반에서 카드 뒷면 이미지 표시 기능을 추가한다.
`FlipCard` 컴포넌트의 뒷면에 이미지를 보여주되, 이미지가 없을 때는 현재 텍스트 레이아웃으로 fallback한다.
옵션에 '홈 화면 카드 랜덤'을 추가한다. 랜덤을 선택하면 1번부터 90번까지의 한자를 랜덤하게 배열해서 유저에게 보여준다.

---

## Problem Statement

v5까지 카드 뒷면은 뜻과 음 텍스트만 표시된다. 구몬 교재에는 각 한자마다 연상 그림이 있어 학습 효과를 높인다. 이미지를 카드 뒷면에 추가하면 교재와 일치하는 학습 경험을 제공할 수 있다.

현재 문제:
- `types/hanja.ts`에 `imagePath?: string` 필드가 있으나 `FlipCard`가 사용하지 않음
- `parseHanja.ts`에서 `imagePath`를 `/images/hanja/${id}.png`로 설정하지만 `basePath`가 빠져 있어 GitHub Pages에서 잘못된 경로 생성

---

## Goals

- 카드 뒷면에 이미지 표시 (이미지 존재 시)
- 이미지 없을 때 텍스트만 표시 (fallback, 현재 동작 유지)
- `imagePath` 경로에 `basePath` 적용 (GitHub Pages 호환)
- 옵션에 '홈 화면 카드 랜덤'을 추가하고 홈 화면에서 카드를 보여주는 기능을 추가한다.

---

## Scope

### 변경 대상 파일

| 파일 | 변경 내용 |
|------|-----------|
| `types/hanja.ts` | `PlayOptions`에 `homeOrder` 필드 추가 |
| `hooks/usePlayOptions.ts` | `homeOrder` 기본값 추가 |
| `lib/parseHanja.ts` | `imagePath`에 `basePath` 포함 |
| `components/FlipCard.tsx` | 뒷면에 이미지 표시 + 이미지 에러 시 fallback |
| `app/options/page.tsx` | '홈 화면 카드 순서' 토글 UI 추가 |
| `app/page.tsx` | `homeOrder === "random"` 시 카드 목록 셔플 적용 |

### 기능 명세

#### F-v6-01: 카드 뒷면 이미지 표시

- 뒷면 레이아웃: 이미지(상단) + 뜻음 텍스트(하단)
- 이미지 경로: `${basePath}/images/hanja/${id}.png`
- 이미지가 정상 로드되면 이미지 표시
- 이미지 로드 실패(onError) 또는 파일 없음 → 현재 텍스트 전용 레이아웃으로 자동 fallback

#### F-v6-02: imagePath basePath 수정

- `parseHanja.ts`에서 `imagePath: \`${basePath}/images/hanja/${id}.png\``로 수정
- 로컬 환경: `basePath = ""` → `/images/hanja/1.png`
- GitHub Pages: `basePath = "/HanjaClaude"` → `/HanjaClaude/images/hanja/1.png`

#### F-v6-03: 홈 화면 카드 랜덤

- `PlayOptions`에 `homeOrder: "sequential" | "random"` 추가
- 기본값: `"sequential"` (1~90 번호 순)
- 옵션 화면에 '홈 화면 카드 순서' 섹션 추가 (번호 순서 / 랜덤 토글)
- `homeOrder === "random"` 시 홈 화면 로드 시점에 카드 배열을 셔플하여 표시
- 셔플 순서는 홈 화면 마운트 시 1회 결정 (재렌더링마다 재셔플 안 함)
- localStorage에 옵션 저장 (기존 `usePlayOptions` 패턴 그대로)

### Out of Scope

- 이미지 파일 제작 또는 추가 (별도 작업)
- 홈/오답방 카드 썸네일에 이미지 추가
- 이미지 로딩 스켈레톤 UI
- 홈 화면 랜덤 순서의 URL 파라미터 반영

---

## Success Criteria

- [ ] 이미지 파일이 존재할 때 FlipCard 뒷면에 이미지가 표시됨
- [ ] 이미지 파일이 없을 때 텍스트만 표시 (현재 동작과 동일)
- [ ] GitHub Pages에서 이미지 경로가 올바르게 생성됨 (`/HanjaClaude/images/hanja/1.png`)
- [ ] 로컬에서 이미지 경로가 올바름 (`/images/hanja/1.png`)
- [ ] 옵션 화면에 '홈 화면 카드 순서' 토글이 표시됨 (번호 순서 / 랜덤)
- [ ] '랜덤' 선택 시 홈 화면 카드가 1~90 무작위 순서로 표시됨
- [ ] '번호 순서' 선택 시 홈 화면 카드가 1~90 순서대로 표시됨
- [ ] 옵션이 localStorage에 저장되어 재방문 시 유지됨
- [ ] 기존 기능(플레이, 플립, 스와이프) 모두 정상 동작

---

## Technical Notes

- `FlipCard`에서 `useState`로 `imageError` 상태 관리 → `onError` 이벤트 시 fallback
- 이미지 크기: 뒷면 카드 상단 50~60% 영역, `object-contain`으로 비율 유지
- `next.config.js`의 `images` 설정은 불필요 (정적 `<img>` 태그 사용, SSG 환경)
- 홈 화면 셔플: `useMemo` + `useState`로 마운트 시 1회만 셔플 → 재렌더링 시 순서 유지

---

## Assumptions & Constraints

- 이미지 파일은 추후 `public/images/hanja/{1~90}.png` 형식으로 추가될 예정
- v6 구현 시점에는 이미지 없음 → fallback 동작만 검증 가능
- 이미지 포맷: PNG (파일명 `{번호}.png`)

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v6 |
| Phase | Plan |
| BasedOn | HanjaClaude v5 (Match Rate 98%) |
| Created | 2026-03-07 |
| Status | In Progress |
