# Plan: HanjaClaude v9

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v9 |
| Version | v9 |
| 기반 | HanjaClaude v8 (Match Rate 100%) |
| 목표 | 셋 선택 UI를 홈 → 옵션으로 이동, 홈은 셋 이름만 표기 |
| 작성일 | 2026-03-07 |

---

## 배경 및 목적

v8까지 홈 화면 상단에 셋 이름 버튼(▼)을 탭하면 팝업으로 셋을 선택할 수 있었다.
이 선택 UI를 옵션 페이지로 이동하여 홈 화면을 단순화한다.

- 홈: 현재 셋 이름만 텍스트로 표기 (탭 불가)
- 옵션: 셋 선택 → localStorage 저장 → 홈으로 이동 → 새 셋 데이터 표시

---

## 현재 상태 (v8 기준)

| 항목 | 현재 상태 |
|------|----------|
| 홈 상단 셋 버튼 | 탭 시 팝업 드롭다운으로 셋 선택 |
| 홈 datasets 로딩 | `loadSetData()` + `useState<Dataset[]>` |
| 홈 팝업 상태 | `showPopup`, `handleDatasetChange` |
| 옵션 페이지 | 셋 선택 UI 없음 |

---

## 기능 요구사항

### F-v9-01: 홈 화면 셋 선택 UI 제거

- 상단 셋 이름 버튼 → 탭 불가 텍스트로 교체
- `▼/▲` 인디케이터 제거
- 팝업 드롭다운 및 백드롭 제거
- `showPopup` state, `handleDatasetChange` 제거

### F-v9-02: 홈 화면 셋 이름 표기 유지

- `selectedDataset?.name` 을 plain text로 상단에 표기
- 데이터 로딩 중에는 "로딩 중..." 표시 (기존 동작 유지)
- `useDataset` 훅 유지 — localStorage + URL `set` 파라미터 읽기 동작 유지

### F-v9-03: 옵션 페이지에 셋 선택 UI 추가

- 옵션 페이지에서 `loadSetData()` 로 데이터셋 목록 로드
- 데이터셋 목록을 버튼 그룹으로 표시 (현재 선택 항목 하이라이트)
- 셋 선택 시:
  1. `localStorage`에 선택한 셋 저장 (`useDataset`의 `setDataset` 활용)
  2. `router.push("/")` 로 홈으로 이동

### F-v9-04: 홈 화면 복귀 시 새 셋 데이터 표시

- 옵션에서 셋 변경 후 홈으로 이동하면 `useDataset`이 localStorage에서 새 셋을 읽어 자동 반영
- 홈 화면 상단에 새 셋 이름 표시, 그리드에 새 셋 카드 표시
- 별도 상태 전달 불필요 (localStorage 기반으로 자연스럽게 동작)

---

## 변경 파일 목록

| 파일 | 변경 유형 | 내용 |
|------|-----------|------|
| `app/page.tsx` | 수정 | 팝업 UI 제거, 셋 이름 plain text 표기 |
| `app/options/page.tsx` | 수정 | 셋 선택 UI 추가, `loadSetData` 호출, 선택 시 localStorage 저장 + 홈 이동 |

---

## Out of Scope (v9 제외)

- `useDataset` 훅 내부 변경 (v8 로직 그대로 유지)
- URL `set` 파라미터 동작 변경 (유지)
- 옵션 → 홈 이동 시 URL에 `set` 포함 여부 (이미 localStorage 저장으로 충분)

---

## 성공 기준

- [ ] 홈 화면 상단에 셋 이름이 탭 불가 텍스트로 표기됨
- [ ] 홈 화면에서 팝업/드롭다운이 나타나지 않음
- [ ] 옵션 페이지에 셋 목록이 표시됨
- [ ] 옵션에서 셋 선택 시 현재 선택 항목이 하이라이트됨
- [ ] 옵션에서 셋 선택 후 홈으로 이동 시 새 셋 이름 및 카드 표시
- [ ] URL `set` 파라미터 동작 유지 (`/?set=1` 접근 시 해당 셋 적용)

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v9 |
| Phase | Plan |
| Status | In Progress |
| Created | 2026-03-07 |
