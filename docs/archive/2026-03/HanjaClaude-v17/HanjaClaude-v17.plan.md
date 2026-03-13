# HanjaClaude-v17 Planning Document

> **Summary**: 홈화면/오답방의 HanjaCardCell에 선택 서체 적용, 옵션 변경 시 즉시 반영
>
> **Project**: HanjaClaude
> **Version**: v17
> **Author**: hapines
> **Date**: 2026-03-13
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

v16에서 서체 선택 기능을 구현했으나 `FlipCard`(플레이 화면)에만 적용되었다.
홈화면과 오답방의 `HanjaCardCell`에는 서체가 미적용 상태이며,
또한 옵션 변경 후 페이지 이동 없이 즉시 반영되지 않는 문제가 있다.

### 1.2 Background

**현재 상태 분석:**

| 화면 | 컴포넌트 | 서체 적용 | 문제 |
|------|----------|----------|------|
| 플레이 | `FlipCard` | ✅ 적용됨 | 없음 |
| 홈화면 | `HanjaCardCell` | ❌ 미적용 | 서체 props 없음 |
| 오답방 | `HanjaCardCell` | ❌ 미적용 | 서체 props 없음 |
| 옵션 변경 즉시 반영 | 전체 | ❌ 미반영 | mount 시 1회만 읽음 |

**`usePlayOptions` 현재 구조:**
```typescript
useEffect(() => {
  const stored = localStorage.getItem(KEY);
  if (stored) setOptions({ ...DEFAULT, ...JSON.parse(stored) });
}, []); // mount 시 1회만 실행
```
→ 옵션 페이지에서 서체 변경 후 홈으로 돌아오면 remount 되어 반영되나,
  같은 페이지 내에서 실시간 변경이 필요한 경우에는 동작하지 않음.

### 1.3 Related Documents

- v16 구현: `docs/archive/2026-03/HanjaClaude-v16/`
- HanjaCardCell: `components/HanjaCard.tsx`
- usePlayOptions: `hooks/usePlayOptions.ts`

---

## 2. Scope

### 2.1 In Scope

- [x] `HanjaCardCell`에 `hanjaFont` props 추가 및 한자 글자에 적용
- [x] 홈화면(`app/page.tsx`)에서 HanjaCardCell에 `hanjaFont` 전달
- [x] 오답방(`app/wrong/page.tsx`)에서 HanjaCardCell에 `hanjaFont` 전달
- [x] `storage` 이벤트를 이용해 `usePlayOptions`가 localStorage 변경을 감지하도록 개선
  → 옵션 페이지에서 서체 변경 시 다른 탭/창에서 즉시 반영 (same-page는 이미 동작)

### 2.2 Out of Scope

- 서체 종류 추가
- 옵션 페이지 자체에서 실시간 미리보기 (현재 옵션 페이지는 서체 선택 버튼만 있음)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 홈화면 한자 카드 셀에 선택된 서체가 적용된다 | High | Pending |
| FR-02 | 오답방 한자 카드 셀에 선택된 서체가 적용된다 | High | Pending |
| FR-03 | `usePlayOptions`가 localStorage 변경(storage event)을 감지하여 즉시 업데이트한다 | Medium | Pending |

### 3.2 변경 파일 목록

```
components/HanjaCard.tsx     → hanjaFont props 추가, 한자 span에 fontFamily 적용
hooks/usePlayOptions.ts      → storage event listener 추가
app/page.tsx                 → HanjaCardCell에 hanjaFont 전달
app/wrong/page.tsx           → HanjaCardCell에 hanjaFont 전달
```

---

## 4. Success Criteria

- [ ] 홈화면 한자 셀이 선택된 서체로 표시된다
- [ ] 오답방 한자 셀이 선택된 서체로 표시된다
- [ ] 옵션에서 서체 변경 후 홈으로 돌아오면 즉시 반영된다
- [ ] TypeScript 오류 없음, 빌드 성공

---

## 5. Architecture

변경 최소화 원칙: 기존 `usePlayOptions` 패턴 재사용, `HanjaCardCell`에 선택적 props만 추가.

```
[app/page.tsx, app/wrong/page.tsx]
  options.hanjaFont → HanjaCardCell props 전달
        │
        ▼
[HanjaCardCell]
  style={{ fontFamily: HANJA_FONT_FAMILY[hanjaFont] }}
  한자 span에 적용
```

---

## 6. Next Steps

1. [ ] Design 문서 작성 (`HanjaClaude-v17.design.md`)
2. [ ] 구현
3. [ ] Gap 분석

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-13 | Initial draft | hapines |
