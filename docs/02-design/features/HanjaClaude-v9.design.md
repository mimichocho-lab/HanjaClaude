# Design: HanjaClaude v9

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v9 |
| 기반 Plan | docs/01-plan/features/HanjaClaude-v9.plan.md |
| 목표 | 셋 선택 UI 홈 → 옵션 이동, 홈은 셋 이름 텍스트만 표기 |
| 작성일 | 2026-03-07 |

---

## 아키텍처 개요

```
app/page.tsx (HomeContent)
  ├── loadSetData() + datasets 유지 (URL ?set= 파라미터 지원용)
  ├── useDataset(datasets, initialSetId) — localStorage 읽기
  ├── 셋 이름: <span> plain text (버튼/팝업 제거)
  └── showPopup state, handleDatasetChange 제거

app/options/page.tsx (OptionsContent)
  ├── loadSetData() + datasets 신규 추가
  ├── useDataset(datasets) — 현재 셋 + setDataset
  ├── 데이터셋 선택 UI (버튼 목록)
  └── 선택 시: setDataset(ds) → router.push("/")
```

---

## app/page.tsx 변경 (F-v9-01, F-v9-02)

### 제거 항목

| 제거 대상 | 위치 |
|-----------|------|
| `const [showPopup, setShowPopup] = useState(false)` | state |
| `const handleDatasetChange = (dataset: Dataset) => {...}` | 함수 |
| 팝업 백드롭 `<div className="fixed inset-0 z-20" ...>` | JSX |
| 데이터셋 팝업 드롭다운 `{showPopup && <div>...datasets.map...</div>}` | JSX |
| 상단 바 버튼의 `▼/▲` `<span>` | JSX |
| `onClick={() => setShowPopup(...)}` on 타이틀 | JSX |

### 변경 후 상단 타이틀

```tsx
{/* 셋 이름 plain text (F-v9-01) */}
<span className="text-lg font-bold text-gray-800">
  {selectedDataset?.name ?? "로딩 중..."}
</span>
```

> `datasets` state와 `loadSetData()` useEffect는 URL `?set=` 파라미터 지원을 위해 유지.

---

## app/options/page.tsx 변경 (F-v9-03, F-v9-04)

### 신규 추가 imports

```typescript
import { useState, useEffect, Suspense } from "react";
import { loadSetData } from "@/lib/parseHanja";
import { useDataset } from "@/hooks/useDataset";
import type { Dataset } from "@/types/hanja";
```

### 신규 추가 state/hook

```typescript
const [datasets, setDatasets] = useState<Dataset[]>([]);
useEffect(() => {
  loadSetData()
    .then((list) => setDatasets(list.sort((a, b) => a.id - b.id)))
    .catch((err) => console.error("데이터셋 목록 로드 실패:", err));
}, []);

const { selectedDataset, setDataset } = useDataset(datasets);

const handleDatasetChange = (ds: Dataset) => {
  setDataset(ds);
  router.push("/");
};
```

### 신규 UI 섹션 (데이터셋 선택, 최상단 배치)

```tsx
{/* 데이터셋 선택 (F-v9-03) */}
<div className="bg-white rounded-xl p-4 shadow-sm">
  <p className="text-sm font-semibold text-gray-700 mb-3">학습 셋</p>
  <div className="flex flex-col gap-2">
    {datasets.map((ds) => (
      <button
        key={ds.id}
        className={`w-full py-2.5 rounded-lg text-sm font-medium border transition-colors text-left px-3
          ${selectedDataset?.id === ds.id
            ? "bg-blue-500 text-white border-blue-500"
            : "bg-white text-gray-600 border-gray-300"
          }`}
        onClick={() => handleDatasetChange(ds)}
      >
        {ds.name}
      </button>
    ))}
  </div>
</div>
```

> 선택 즉시 `router.push("/")` — 홈 이동 후 `useDataset`이 localStorage에서 새 셋 자동 적용 (F-v9-04).

---

## 변경 파일 목록

| 파일 | 변경 유형 | 내용 |
|------|-----------|------|
| `app/page.tsx` | 수정 | 팝업 UI 제거, 셋 이름 `<span>` plain text |
| `app/options/page.tsx` | 수정 | datasets 로드, `useDataset` 추가, 셋 선택 UI 추가 |

---

## 데이터 흐름

```
[옵션 페이지]
  datasets 로드 (loadSetData)
  → 현재 셋 표시 (useDataset → localStorage)
  → 셋 버튼 클릭 → setDataset(ds) → localStorage 저장
  → router.push("/")

[홈 페이지]
  useDataset(datasets, initialSetId)
  → 1순위: URL ?set= (유지)
  → 2순위: localStorage (새 셋 반영)
  → 3순위: datasets[0]
  → selectedDataset.name → <span> 표시
  → selectedDataset.file → 카드 로드
```

---

## 성공 기준 (Plan 연계)

| 성공 기준 | 검증 방법 |
|----------|-----------|
| 홈 상단 셋 이름이 탭 불가 텍스트 | 탭해도 반응 없음 확인 |
| 홈에서 팝업 없음 | UI 확인 |
| 옵션에 셋 목록 표시 | 셋 이름 버튼 목록 확인 |
| 현재 셋 하이라이트 | 파란색 버튼 확인 |
| 셋 선택 후 홈 이동 + 새 셋 반영 | 이름/카드 변경 확인 |
| URL `?set=` 파라미터 동작 유지 | `/?set=1` 접근 확인 |

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v9 |
| Phase | Design |
| Status | Completed |
| Created | 2026-03-07 |
