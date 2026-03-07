# Design: HanjaClaude v7

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v7 |
| 기반 Plan | docs/01-plan/features/HanjaClaude-v7.plan.md |
| 목표 | 홈 화면 타이틀 팝업으로 데이터셋 전환 (구몬 한자 B ↔ 5급 신출 한자) |
| 작성일 | 2026-03-07 |

---

## 아키텍처 개요

```
page.tsx (HomeContent)
  ├── loadSetData()          → datasets[] (data.csv 런타임 로드)
  ├── useDataset(datasets)   → selectedDataset, changeDataset
  ├── useHanjaData(file)     → cards[], loading (파일명 파라미터)
  ├── useSelection(cards)    → selectedIds, clearSelection
  └── [UI] DatasetPopup      → 타이틀 탭 → 팝업 → 선택 → 전환
```

---

## UI 설계

### 홈 화면 상단 (헤더)

```
┌──────────────────────────────────────────┐
│ [5급 신출 한자 ▼]      [오답방]  [설정]  │  ← sticky header
└──────────────────────────────────────────┘
```

- 타이틀 영역이 버튼으로 동작 — 현재 데이터셋 이름 + 아래 화살표 표시
- 탭 시 데이터셋 선택 팝업 노출

### 데이터셋 선택 팝업

```
┌──────────────────────────────────────────┐
│ [5급 신출 한자 ▼]      [오답방]  [설정]  │
│ ┌────────────────────────────────────┐   │
│ │ ✓  5급 신출 한자                   │   │ ← 현재 선택 표시
│ │    구몬 한자 B                      │   │
│ └────────────────────────────────────┘   │
│                                          │
│  [카드 그리드]                            │
└──────────────────────────────────────────┘
```

- 팝업은 헤더 바로 아래 absolute 포지셔닝
- 팝업 외부 영역(backdrop) 탭 시 닫힘
- 선택 시: 팝업 닫기 → 데이터셋 전환 → 선택 상태 초기화

---

## 타입 정의

### `types/hanja.ts` 추가

```typescript
export interface Dataset {
  id: number;      // 1, 2, ...
  name: string;    // "5급 신출 한자", "구몬 한자 B"
  file: string;    // "grade5.csv", "hanjab.csv"
}
```

> 주의: plan의 `id: int`는 TypeScript에서 `number`로 구현

---

## 함수/훅 설계

### lib/parseHanja.ts

#### `loadSetData()` (신규)

```typescript
export async function loadSetData(): Promise<Dataset[]> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const res = await fetch(`${basePath}/data/data.csv`);
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

#### `loadHanjaData(file: string)` (수정)

```typescript
// 변경 전: fetch(`${basePath}/data/hanjab.csv`) 하드코딩
// 변경 후: fetch(`${basePath}/data/${file}`) 파라미터화
export async function loadHanjaData(file: string): Promise<HanjaCard[]> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const res = await fetch(`${basePath}/data/${file}`);
  const text = await res.text();
  return text
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [id, hanja, meaning, pronunciation] = line.split(",");
      return {
        id: Number(id),
        hanja: hanja.trim(),
        meaning: meaning.trim(),
        pronunciation: pronunciation.trim(),
        imagePath: `${basePath}/images/hanja/${id.trim()}.png`,
        // 이미지 없는 카드는 FlipCard onError fallback으로 처리
      };
    });
}
```

---

### hooks/useHanjaData.ts (수정)

```typescript
export function useHanjaData(file: string) {
  const [cards, setCards] = useState<HanjaCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setCards([]);
    loadHanjaData(file)
      .then(setCards)
      .catch((err) => console.error("한자 데이터 로드 실패:", err))
      .finally(() => setLoading(false));
  }, [file]); // file 변경 시 재로드

  return { cards, loading };
}
```

---

### hooks/useDataset.ts (신규)

```typescript
"use client";

import { useState, useEffect } from "react";
import type { Dataset } from "@/types/hanja";

const STORAGE_KEY = "hanja_dataset";
const DEFAULT_DATASET_ID = 1; // 첫 번째 데이터셋 기본값

export function useDataset(datasets: Dataset[]) {
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  useEffect(() => {
    if (datasets.length === 0) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: Dataset = JSON.parse(stored);
        const found = datasets.find((d) => d.id === parsed.id);
        if (found) { setSelectedDataset(found); return; }
      } catch {}
    }
    // 기본값: id 오름차순 첫 번째
    setSelectedDataset(datasets[0]);
  }, [datasets]);

  const changeDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
  };

  return { selectedDataset, changeDataset };
}
```

---

### hooks/useSelection.ts (수정)

`clearSelection()` 함수 추가:

```typescript
const clearSelection = () => {
  setSelectedIds(new Set());
  localStorage.removeItem(KEY);
};

return { selectedIds, selectedIdsArray, toggleCard, toggleAll, clearSelection };
```

---

### app/page.tsx (수정)

주요 변경 사항:

```typescript
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 데이터셋 목록 로드 (data.csv)
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  useEffect(() => {
    loadSetData().then((list) => setDatasets(list.sort((a, b) => a.id - b.id)));
  }, []);

  // 데이터셋 선택 상태
  const { selectedDataset, changeDataset } = useDataset(datasets);

  // 카드 데이터 (선택된 데이터셋 파일 기반)
  const { cards, loading } = useHanjaData(selectedDataset?.file ?? "hanjab.csv");

  // 선택 상태 (clearSelection 추가)
  const { selectedIds, selectedIdsArray, toggleCard, toggleAll, clearSelection } = useSelection(cards, initialIds);

  // 팝업 상태
  const [showPopup, setShowPopup] = useState(false);

  // 데이터셋 전환
  const handleDatasetChange = (dataset: Dataset) => {
    changeDataset(dataset);
    clearSelection();
    setShowPopup(false);
  };

  // ...

  // 제목: 하드코딩 "구몬 한자 B" → selectedDataset?.name 동적 표시
  // ID 필터: n >= 1 && n <= 90 제거
```

---

## 팝업 컴포넌트 설계

`page.tsx` 내 인라인 구현 (별도 컴포넌트 파일 생성 없음):

```tsx
{/* 팝업 백드롭 */}
{showPopup && (
  <div
    className="fixed inset-0 z-20"
    onClick={() => setShowPopup(false)}
  />
)}

{/* 팝업 리스트 */}
{showPopup && (
  <div className="absolute left-4 top-12 z-30 bg-white rounded-xl shadow-lg border border-gray-200 min-w-[180px]">
    {datasets.map((ds) => (
      <button
        key={ds.id}
        className="w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
        onClick={() => handleDatasetChange(ds)}
      >
        <span className="w-4 text-blue-500">
          {selectedDataset?.id === ds.id ? "✓" : ""}
        </span>
        {ds.name}
      </button>
    ))}
  </div>
)}
```

타이틀 버튼:
```tsx
<button
  className="text-lg font-bold text-gray-800 flex items-center gap-1"
  onClick={() => setShowPopup((v) => !v)}
>
  {selectedDataset?.name ?? "로딩 중..."}
  <span className="text-xs text-gray-500">{showPopup ? "▲" : "▼"}</span>
</button>
```

---

## 변경 파일 목록

| 파일 | 변경 유형 | 변경 내용 |
|------|-----------|----------|
| `types/hanja.ts` | 수정 | `Dataset` 인터페이스 추가 |
| `lib/parseHanja.ts` | 수정 | `loadSetData()` 추가, `loadHanjaData(file)` 파라미터화 |
| `hooks/useHanjaData.ts` | 수정 | `file` 파라미터, `useEffect([file])` 의존성 |
| `hooks/useDataset.ts` | 신규 | 데이터셋 선택 상태 + localStorage |
| `hooks/useSelection.ts` | 수정 | `clearSelection()` 추가 |
| `app/page.tsx` | 수정 | datasets 로드, useDataset, 팝업 UI, ID필터 제거, 제목 동적화 |

---

## 구현 순서

1. `types/hanja.ts` — `Dataset` 타입 추가
2. `lib/parseHanja.ts` — `loadSetData()` 추가, `loadHanjaData` 수정
3. `hooks/useHanjaData.ts` — `file` 파라미터 수정
4. `hooks/useDataset.ts` — 신규 생성
5. `hooks/useSelection.ts` — `clearSelection()` 추가
6. `app/page.tsx` — 전체 통합

---

## 엣지 케이스

| 케이스 | 처리 방법 |
|--------|----------|
| data.csv 로드 실패 | `datasets`가 빈 배열 → `selectedDataset` null → `useHanjaData("hanjab.csv")` 기본값 |
| localStorage 저장값이 현재 datasets에 없음 | `datasets[0]` 기본값으로 fallback |
| 팝업 열린 상태에서 스크롤 | 백드롭이 fixed이므로 스크롤 가능 |
| grade5 카드 imagePath | 이미지 없으면 FlipCard `onError` → 텍스트 전용 fallback (기존 v6 동작 그대로) |
| URL `?ids=` 파라미터 + 데이터셋 전환 | `clearSelection()` 호출 시 localStorage 초기화됨. URL params는 초기 로드 시에만 적용 |

---

## 성공 기준 (Plan 연계)

| 항목 | 검증 방법 |
|------|----------|
| 타이틀 탭 → 팝업 표시 | UI 확인 |
| 팝업에서 데이터셋 선택 → 카드 목록 변경 | 카드 수 변화 확인 (89 ↔ 149) |
| 선택 상태 초기화 | 데이터셋 전환 후 선택 카드 0장 |
| localStorage 유지 | 새로고침 후 동일 데이터셋 표시 |
| 기존 v6 기능 정상 동작 | 뒤집기, 오답방, 설정, 랜덤 순서 |

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v7 |
| Phase | Design |
| Status | Completed |
| Created | 2026-03-07 |
