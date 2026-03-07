# Plan: HanjaClaude v7

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v7 |
| Version | v7 |
| 기반 | HanjaClaude v6 (Match Rate 97%) |
| 목표 | 데이터셋 전환 기능 — 구몬 한자 B + 5급 신출 한자 지원 |
| 작성일 | 2026-03-07 |

---

## 배경 및 목적

v6까지는 `hanjab.csv` (구몬 한자 B, 89장)만 하드코딩되어 로드됨.
`public/data/data.csv`에 이미 두 개의 데이터셋이 등록되어 있지만,
실제 UI에서 선택/전환하는 기능이 없었음.

v7에서는 **구몬 한자 B**와 **5급 신출 한자**(grade5.csv, 149장)를
홈 화면에서 탭으로 전환할 수 있도록 한다.

---

## 현재 상태 (v6 기준)

| 항목 | 현재 상태 |
|------|----------|
| 데이터 로드 | `parseHanja.ts` — `hanjab.csv` 하드코딩 |
| 카드 ID 필터 | `page.tsx` — `n >= 1 && n <= 90` 하드코딩 |
| 홈 제목 | "구몬 한자 B" 하드코딩 |
| 데이터셋 목록 | `data.csv`에 등록되어 있으나 UI 미연결 |
| grade5.csv | `public/data/grade5.csv` 존재, 149장 |

---

## 기능 요구사항

### F-v7-01: 홈 화면 데이터셋 탭 전환

- 홈 화면 상단에 리스트 팝업 및 선택 UI 추가. 누르면 data.csv에 있는 목록 중에 '이름'을 나열하고 선택하면 해당 셋으로 전환한다.
  - 현재는 data.csv에 있는 다음 두개만 보여준다.
  - 5급 신출 한자 (grade5.csv, 149장)
  - B탭: 구몬 한자 B (hanjab.csv, 89장)
- 전환 시 카드 목록 즉시 변경
- 선택된 데이터셋을 `localStorage`에 저장 (재방문 시 유지)
- 전환 시 선택 상태(selectedIds) 초기화

### F-v7-02: 동적 목록 로드
- `loadSetData()` — 'data.csv'를 읽고 데이터를 저장한다.

### F-v7-02: 동적 데이터 로드

- `loadHanjaData(datasetFile: string)` — 파일명 파라미터로 동적 로드
- `useHanjaData(datasetFile: string)` — 데이터셋 파라미터 수신
- 카드 ID 범위 필터 제거 (하드코딩 `n >= 1 && n <= 90` 삭제)
- 홈 제목을 선택된 데이터셋 이름으로 동적 표시

### F-v7-03: 데이터셋 상태 관리

- `useDataset` hook 신규 생성
  - `selectedDataset: Dataset` (현재 선택된 데이터셋)
  - `setDataset(dataset: Dataset)` (데이터셋 변경)
  - localStorage key: `"hanja_dataset"` (기본값: `hanjab`)
- `Dataset` 타입 정의: `{ id: string; name: string; file: string }`
- `DATASETS` 상수: `data.csv` 기반으로 정적 정의

---

## 데이터셋 정의

```typescript
// types/hanja.ts 추가
export interface Dataset {
  id: int;    // 1 | 2
  name: string;  // "구몬 한자 B" | "5급 신출 한자"
  file: string;  // "hanjab.csv" | "grade5.csv"
}

export const DATASETS: Dataset[] = [
  { id: 1, name: "5급 신출 한자", file: "grade5.csv" },
  { id: 2, name: "구몬 한자 B",   file: "hanjab.csv" },
];
```

탭 순서: id 번호순으로 진행한다.

---

## 변경 파일 목록 (예상)

| 파일 | 변경 유형 | 내용 |
|------|-----------|------|
| `types/hanja.ts` | 수정 | `Dataset` 타입 + `DATASETS` 상수 추가 |
| `lib/parseHanja.ts` | 수정 | `loadHanjaData(file)` 파라미터화 |
| `hooks/useHanjaData.ts` | 수정 | `datasetFile` 파라미터 수신 |
| `hooks/useDataset.ts` | 신규 | 데이터셋 선택 상태 + localStorage |
| `app/page.tsx` | 수정 | 탭 UI, `useDataset` 연결, ID 필터 동적화, 제목 동적화 |

---

## Out of Scope (v7 제외)

- 이미지 파일 추가 (2~90.png)
- 학습 통계 기록
- PWA 오프라인 지원
- 구몬 한자 A/C단계 CSV 데이터 (별도 파일 필요)

---

## 성공 기준

- [ ] 홈 화면에서 타이틀을 눌러서 리스트 표시 가능
- [ ] 리스트 중에 셋을 선택하면 선택한 셋으로 저장 기능
- [ ] 셋 선택 시 카드 목록과 제목이 해당 데이터로 즉시 변경됨
- [ ] 카드 선택 상태가 셋 선택 시 초기화됨
- [ ] 데이터셋 선택이 localStorage에 저장되어 재방문 시 유지됨
- [ ] 기존 v6 기능 (카드 뒤집기, 오답방, 설정, 랜덤 순서 등) 정상 작동

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v7 |
| Phase | Plan |
| Status | In Progress |
| Created | 2026-03-07 |
