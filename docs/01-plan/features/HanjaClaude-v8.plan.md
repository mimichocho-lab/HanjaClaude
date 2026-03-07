# Plan: HanjaClaude v8

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v8 |
| Version | v8 |
| 기반 | HanjaClaude v7 (Match Rate 100%) |
| 목표 | URL로 데이터셋 지정 + URL 복사 시 셋 정보 포함 |
| 작성일 | 2026-03-07 |

---

## 배경 및 목적

v7에서 데이터셋 전환 기능을 추가했지만, URL을 공유해도 어떤 셋인지 전달되지 않음.
`?ids=1,2,3` URL을 열면 홈 화면이 localStorage의 셋을 사용하므로
URL을 받은 사람과 다른 셋을 볼 수 있는 문제가 있음.

v8에서는 URL에 `set` 파라미터를 추가해 셋을 명시적으로 지정하고,
옵션 페이지의 URL 복사 시 현재 셋 ID를 함께 포함한다.

---

## 현재 상태 (v7 기준)

| 항목 | 현재 상태 |
|------|----------|
| URL 복사 | `/?ids=1,2,3` — 셋 정보 없음 |
| 홈 URL 파라미터 | `ids`만 읽음, `set` 없음 |
| 옵션 → 홈 이동 | `router.push("/")` — 셋 파라미터 없음 |
| 홈 → 옵션 이동 | `/options?ids=...` — 셋 파라미터 없음 |
| 데이터셋 초기화 | localStorage에서만 읽음 |

---

## 기능 요구사항

### F-v8-01: URL `set` 파라미터로 데이터셋 지정

- 홈 화면(`/`) URL에서 `set` 파라미터를 읽음
- `set` 값은 Dataset의 `id` (숫자, 예: `?set=1`)
- URL의 `set`이 있으면 localStorage보다 우선 적용
- 유효하지 않은 `set` 값이면 localStorage fallback, 그 다음 datasets[0]

**예시 URL**: `https://.../?ids=1,2,3&set=1`

### F-v8-02: 옵션 페이지 URL 복사에 `set` 포함

- 옵션 페이지는 현재 `set` ID를 URL 파라미터로 받음
- URL 복사 시 `/?ids=...&set={id}` 형태로 생성
- 미리보기 텍스트도 `…/?ids=...&set={id}` 로 업데이트

### F-v8-03: 홈 ↔ 옵션 라우팅에 `set` 파라미터 전달

- 홈 → 옵션: `/options?ids=...&set={selectedDataset.id}`
- 옵션 → 홈: `router.push("/")` (변경 없음 — 홈은 URL `set` 또는 localStorage 사용)

---

## 변경 파일 목록 (예상)

| 파일 | 변경 유형 | 내용 |
|------|-----------|------|
| `app/page.tsx` | 수정 | `set` searchParam 읽기, `useDataset`에 우선 적용 |
| `hooks/useDataset.ts` | 수정 | `initialId?: number` 파라미터 추가 — URL 우선 적용 |
| `app/options/page.tsx` | 수정 | `set` searchParam 읽기, `handleCopy`에 `set` 포함, 미리보기 업데이트 |

---

## Out of Scope (v8 제외)

- play/wrong 페이지의 URL에 `set` 전달 (play는 ids로 카드 특정, 셋 불필요)
- 셋 이름을 URL에 포함 (id로 충분)
- URL에서 옵션(order, startFace 등) 전달

---

## 성공 기준

- [ ] `/?ids=1,2&set=1` URL 접근 시 "5급 신출 한자" 셋으로 홈이 열림
- [ ] `/?ids=1,2&set=2` URL 접근 시 "구몬 한자 B" 셋으로 홈이 열림
- [ ] URL의 `set`이 없으면 기존 localStorage 동작 유지
- [ ] 유효하지 않은 `set` 값이면 localStorage → datasets[0] fallback
- [ ] 옵션 페이지 URL 복사 결과에 `&set={id}` 포함
- [ ] 옵션 페이지 미리보기 텍스트에 `&set={id}` 표시
- [ ] 홈 → 옵션 이동 URL에 `&set={id}` 포함

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v8 |
| Phase | Plan |
| Status | In Progress |
| Created | 2026-03-07 |
