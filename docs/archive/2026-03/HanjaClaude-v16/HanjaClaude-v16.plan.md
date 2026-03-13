# HanjaClaude-v16 Planning Document

> **Summary**: 옵션 화면에서 한자 서체를 선택할 수 있도록 한다. 기본값은 해서체이며 해서체/명조체/궁서체 3종을 한 줄로 선택할 수 있다.
>
> **Project**: HanjaClaude
> **Version**: v16
> **Author**: hapines
> **Date**: 2026-03-13
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

한자 학습 카드의 서체를 사용자가 직접 선택할 수 있도록 한다. 현재는 OS 기본 시스템 폰트가 사용되며 기기마다 다르게 표시된다. 서체 선택 기능을 통해 학습 목적에 맞는 서체로 일관된 경험을 제공한다.

### 1.2 Background

한자 학습에서 서체는 중요한 역할을 한다.
- **해서체(楷書體)**: 정자체, 가장 표준적인 한자 서체. 획이 명확하고 균형이 잡혀 있어 학습 입문에 적합
- **명조체(明朝體)**: 삐침(세리프)이 있는 인쇄용 서체. 가독성이 높고 전통적인 느낌
- **궁서체(宮書體)**: 붓으로 쓴 듯한 궁중 서예 스타일. 전통적이고 격식 있는 느낌

현재 앱은 OS 기본 폰트를 사용하므로 기기별로 한자가 다르게 보인다. 명시적 서체 설정이 필요하다.

### 1.3 Related Documents

- 기존 옵션 구조: `app/options/page.tsx`
- 플레이 옵션 훅: `hooks/usePlayOptions.ts`
- 타입 정의: `types/hanja.ts`

---

## 2. Scope

### 2.1 In Scope

- [x] `PlayOptions` 타입에 `hanjaFont` 필드 추가
- [x] `usePlayOptions` 훅에 기본값(해서체) 및 저장/로드 반영
- [x] 옵션 화면에 서체 선택 UI 추가 (한 줄, 3개 버튼)
- [x] `FlipCard` 앞면 한자 글자에 선택된 서체 CSS 적용
- [x] Web-safe 또는 Google Fonts CJK 폰트 로드

### 2.2 Out of Scope

- 뒷면 뜻음(의미/음) 텍스트 서체 변경 (한글이므로 제외)
- 홈 화면 카드 목록 서체 변경
- 4종 이상의 서체 추가

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 옵션 화면에 "한자 서체" 섹션을 추가한다 | High | Pending |
| FR-02 | 해서체 / 명조체 / 궁서체 3개 버튼을 한 줄로 표시한다 | High | Pending |
| FR-03 | 기본값은 해서체로 설정한다 | High | Pending |
| FR-04 | 선택된 서체는 localStorage에 저장되어 재방문 시 유지된다 | High | Pending |
| FR-05 | FlipCard 앞면의 한자 글자에 선택된 서체가 즉시 반영된다 | High | Pending |
| FR-06 | 각 서체에 대응하는 웹 폰트를 로드한다 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 폰트 로드로 인한 LCP 증가 최소화 (font-display: swap) | Lighthouse |
| UX | 서체 변경 시 즉각적인 시각 반영 | 육안 확인 |
| Compatibility | iOS/Android/Windows 모두 동일 서체로 표시 | 기기별 테스트 |

---

## 4. Font Mapping

| 선택 옵션 | CSS font-family | Google Fonts / 대안 |
|-----------|-----------------|----------------------|
| 해서체 | `"Noto Sans KR"`, `"Noto Sans SC"`, sans-serif | Google Fonts: Noto Sans KR |
| 명조체 | `"Noto Serif KR"`, `"Noto Serif SC"`, serif | Google Fonts: Noto Serif KR |
| 궁서체 | `"Ma Shan Zheng"`, cursive | Google Fonts: Ma Shan Zheng |

> **참고**: 순수 CJK 한자 표시에는 KR보다 SC(Simplified Chinese) 또는 TC(Traditional Chinese) 폰트가 더 많은 한자를 커버한다. 실제 폰트 로드 테스트 후 최적 선택.

---

## 5. Success Criteria

### 5.1 Definition of Done

- [ ] 옵션 화면에 서체 선택 섹션이 표시된다
- [ ] 해서체/명조체/궁서체 3개 버튼이 한 줄로 배치된다
- [ ] 선택 서체가 FlipCard 한자 글자에 즉시 적용된다
- [ ] localStorage에 저장되어 앱 재시작 후에도 유지된다
- [ ] 빌드 오류 없음

### 5.2 Quality Criteria

- [ ] TypeScript 타입 오류 없음
- [ ] 기존 옵션(카드 순서, 시작 면 등) 동작 이상 없음

---

## 6. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 폰트 파일 크기로 인한 로딩 속도 저하 | Medium | High | `font-display: swap` + subset 사용 |
| 궁서체 폰트가 일부 한자를 미지원 | Low | Medium | fallback 폰트 체인 지정 |
| Next.js `next/font` vs CDN 방식 선택 | Low | Low | `next/font/google` 우선 적용 |

---

## 7. Architecture Considerations

### 7.1 Project Level

| Level | Selected |
|-------|:--------:|
| Dynamic | ✅ |

### 7.2 Key Architectural Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| 폰트 로드 방식 | `next/font/google` | Next.js 최적화 (자동 preload, display:swap) |
| 서체 상태 관리 | `usePlayOptions` 확장 | 기존 옵션 패턴과 통일 |
| 서체 전달 방식 | CSS custom property 또는 props | FlipCard에 fontFamily props 전달 |

### 7.3 변경 파일 목록

```
types/hanja.ts             → PlayOptions에 hanjaFont 타입 추가
hooks/usePlayOptions.ts    → 기본값 및 타입 반영
app/layout.tsx             → next/font/google 폰트 로드
app/options/page.tsx       → 서체 선택 UI 섹션 추가
components/FlipCard.tsx    → hanjaFont props 수신 및 style 적용
app/page.tsx               → FlipCard에 hanjaFont 전달
app/play/page.tsx          → FlipCard에 hanjaFont 전달
```

---

## 8. Next Steps

1. [ ] Design 문서 작성 (`HanjaClaude-v16.design.md`)
2. [ ] 구현
3. [ ] Gap 분석

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-13 | Initial draft | hapines |
