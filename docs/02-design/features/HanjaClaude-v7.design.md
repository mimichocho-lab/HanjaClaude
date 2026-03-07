# Design: HanjaClaude v7

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v7 |
| 기반 Plan | docs/01-plan/features/HanjaClaude-v7.plan.md |
| 목표 | 홈 화면 타이틀 팝업으로 데이터셋 선택/전환 |
| 작성일 | 2026-03-07 |

---

## 아키텍처 개요

```
page.tsx (HomeContent)
  ├── loadSetData()           → datasets[] (data.csv 런타임 로드, F-v7-02)
  ├── useDataset(datasets)    → selectedDataset, setDataset (F-v7-03)
  ├── useHanjaData(file)      → cards[], loading (F-v7-02)
  ├── useSelection(cards)     → selectedIds, clearSelection
  └── [UI] DatasetPopup       → 타이틀 탭 → 팝업 → 선택 → 전환 (F-v7-01)

app/play/page.tsx
  └── getStoredDatasetFile()  → 현재 선택된 데이터셋 파일 읽기

app/wrong/page.tsx
  └── getStoredDatasetFile()  → 현재 선택된 데이터셋 파일 읽기
```

---

## UI 설계 (F-v7-01)

### 홈 화면 상단 헤더

```
┌──────────────────────────────────────────┐
│ [5급 신출 한자 ▼]      [오답방]  [설정]  │  ← sticky header
└──────────────────────────────────────────┘
```

- 타이틀이 탭 가능한 버튼 — 현재 데이터셋 이름 + `▼/▲` 표시
- 탭 시 데이터셋 선택 팝업 노출

### 데이터셋 선택 팝업

```
┌──────────────────────────────────────────┐
│ [5급 신출 한자 ▼]      [오답방]  [설정]  │
│ ┌────────────────────────────────────┐   │
│ │ ✓  5급 신출 한자                   │   │ ← 현재 선택 (✓)
│ │    구몬 한자 B                     │   │
│ └────────────────────────────────────┘   │
│  [카드 그리드]                            │
└──────────────────────────────────────────┘
```

- data.csv 목록을 id 오름차순으로 표시
- 현재 선택 항목에 `✓` 표시
- 팝업 외부(backdrop) 탭 시 닫힘
- 선택 시: 팝업 닫기 → 데이터셋 전환 → 카드 선택 상태 초기화

---

## 타입 정의

### `types/hanja.ts` 추가 (F-v7-03)

```typescript
export interface Dataset {
  id: number;    // Plan의 int → TypeScript에서 number
  name: string;
  file: string;
}
```

> Plan의 `DATASETS` 정적 상수는 `loadSetData()`(F-v7-02) 동적 로드로 대체.
> data.csv가 단일 진실 공급원(Source of Truth).

---

## 함수/훅 설계

### lib/parseHanja.ts

#### `loadSetData()` (신규, F-v7-02)

data.csv를 읽어 Dataset 목록 반환.

```typescript
export async function loadSetData(): Promise<Dataset[]> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const res = await fetch(`${basePath}/data/data.csv`);
  const text = await res.text();
  return text
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [id, name, file] = line.split(",");
      return { id: Number(id), name: name.trim(), file: file.trim() };
    });
}
```

#### `loadHanjaData(file: string)` (수정, F-v7-02)

하드코딩 `hanjab.csv` → 파라미터 `file`로 교체.

```typescript
export async function loadHanjaData(file: string): Promise<HanjaCard[]> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const res = await fetch(`${basePath}/data/${file}`);
  // ... 기존 파싱 로직 동일
}
```

---

### hooks/useHanjaData.ts (수정, F-v7-02)

`file` 파라미터 추가, 파일 변경 시 재로드.

```typescript
export function useHanjaData(file: string) {
  const [cards, setCards] = useState<HanjaCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setCards([]);
    loadHanjaData(file)
      .then(setCards)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [file]);

  return { cards, loading };
}
```

---

### hooks/useDataset.ts (신규, F-v7-03)

데이터셋 선택 상태 관리 + localStorage 유지.

```typescript
const STORAGE_KEY = "hanja_dataset";

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
    setSelectedDataset(datasets[0]); // 기본값: id 오름차순 첫 번째
  }, [datasets]);

  const setDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
  };

  return { selectedDataset, setDataset };
}

// play/wrong 페이지용 유틸리티
export function getStoredDatasetFile(): string {
  if (typeof window === "undefined") return "hanjab.csv";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.file) return parsed.file;
    }
  } catch {}
  return "hanjab.csv"; // 기본값
}
```

---

### hooks/useSelection.ts (수정)

데이터셋 전환 시 선택 초기화를 위해 `clearSelection()` 추가.

```typescript
const clearSelection = () => {
  setSelectedIds(new Set());
  localStorage.removeItem(KEY);
};

return { selectedIds, selectedIdsArray, toggleCard, toggleAll, clearSelection };
```

---

### app/page.tsx (수정, F-v7-01 통합)

```typescript
function HomeContent() {
  // F-v7-02: data.csv 목록 로드
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  useEffect(() => {
    loadSetData()
      .then((list) => setDatasets(list.sort((a, b) => a.id - b.id)))
      .catch(console.error);
  }, []);

  // F-v7-03: 데이터셋 선택
  const { selectedDataset, setDataset } = useDataset(datasets);

  // F-v7-02: 선택된 데이터셋으로 카드 로드
  const { cards, loading } = useHanjaData(selectedDataset?.file ?? "hanjab.csv");

  // 선택 상태 (전환 시 초기화)
  const { ..., clearSelection } = useSelection(cards, initialIds);

  // F-v7-01: 팝업 상태
  const [showPopup, setShowPopup] = useState(false);

  const handleDatasetChange = (dataset: Dataset) => {
    setDataset(dataset);      // 저장
    clearSelection();          // 카드 선택 초기화
    setShowPopup(false);       // 팝업 닫기
  };
}
```

#### 팝업 JSX

```tsx
{/* 백드롭: 외부 탭 시 팝업 닫기 */}
{showPopup && (
  <div className="fixed inset-0 z-20" onClick={() => setShowPopup(false)} />
)}

{/* 타이틀 버튼 */}
<button
  className="text-lg font-bold text-gray-800 flex items-center gap-1 active:opacity-70"
  onClick={() => setShowPopup((v) => !v)}
>
  {selectedDataset?.name ?? "로딩 중..."}
  <span className="text-xs text-gray-500">{showPopup ? "▲" : "▼"}</span>
</button>

{/* 팝업 리스트 */}
{showPopup && (
  <div className="absolute left-0 top-8 z-30 bg-white rounded-xl shadow-lg border border-gray-200 min-w-[180px]">
    {datasets.map((ds) => (
      <button key={ds.id} onClick={() => handleDatasetChange(ds)} ...>
        <span>{selectedDataset?.id === ds.id ? "✓" : ""}</span>
        {ds.name}
      </button>
    ))}
  </div>
)}
```

---

### app/play/page.tsx, app/wrong/page.tsx (수정)

`useHanjaData`가 `file` 파라미터를 요구하므로 현재 선택 데이터셋 파일 전달.

```typescript
// play/page.tsx
const [datasetFile] = useState(() => getStoredDatasetFile());
const { cards: allCards, loading } = useHanjaData(datasetFile);

// wrong/page.tsx
const { cards: allCards, loading } = useHanjaData(getStoredDatasetFile());
```

---

## 변경 파일 목록

| 파일 | 변경 유형 | 내용 |
|------|-----------|------|
| `types/hanja.ts` | 수정 | `Dataset` 인터페이스 추가 |
| `lib/parseHanja.ts` | 수정 | `loadSetData()` 추가, `loadHanjaData(file)` 파라미터화 |
| `hooks/useHanjaData.ts` | 수정 | `file` 파라미터, `useEffect([file])` |
| `hooks/useDataset.ts` | 신규 | `useDataset()` + `getStoredDatasetFile()` |
| `hooks/useSelection.ts` | 수정 | `clearSelection()` 추가 |
| `app/page.tsx` | 수정 | 팝업 UI, useDataset, 동적 제목, ID 필터 제거 |
| `app/play/page.tsx` | 수정 | `getStoredDatasetFile()` 연결 |
| `app/wrong/page.tsx` | 수정 | `getStoredDatasetFile()` 연결 |

---

## 엣지 케이스

| 케이스 | 처리 |
|--------|------|
| data.csv 로드 실패 | `datasets = []` → `selectedDataset = null` → `useHanjaData("hanjab.csv")` 기본값 |
| localStorage 저장값이 현재 datasets에 없음 | `datasets[0]` fallback |
| grade5 카드 imagePath | FlipCard `onError` → 텍스트 전용 fallback (v6 동작 그대로) |
| 팝업 외부 탭 | fixed backdrop onClick으로 닫힘 |

---

## 성공 기준 (Plan 연계)

| 성공 기준 | 검증 |
|----------|------|
| 타이틀 탭 → 팝업 리스트 표시 | UI 확인 |
| 리스트에서 셋 선택 → localStorage 저장 | 재방문 후 동일 셋 유지 |
| 셋 선택 시 카드 목록/제목 즉시 변경 | 카드 수 변화 (89 ↔ 149) |
| 카드 선택 상태 초기화 | 전환 후 선택 0장 |
| 기존 v6 기능 정상 동작 | 뒤집기, 오답방, 설정, 랜덤 순서 |

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v7 |
| Phase | Design |
| Status | Completed |
| Created | 2026-03-07 |
