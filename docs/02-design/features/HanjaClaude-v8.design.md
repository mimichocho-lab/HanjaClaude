# Design: HanjaClaude v8

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v8 |
| 기반 Plan | docs/01-plan/features/HanjaClaude-v8.plan.md |
| 목표 | URL `set` 파라미터로 데이터셋 지정 + URL 복사 시 셋 정보 포함 |
| 작성일 | 2026-03-07 |

---

## 아키텍처 개요

```
app/page.tsx (HomeContent)
  ├── searchParams.get("set")     → initialSetId (F-v8-01)
  ├── useDataset(datasets, initialSetId)
  │     └── URL > localStorage > datasets[0] 우선순위 적용
  └── router.push(`/options?ids=...&set=${id}`) (F-v8-03)

app/options/page.tsx (OptionsContent)
  ├── searchParams.get("set")     → setParam (F-v8-02)
  ├── handleCopy: /?ids=...&set={setParam}
  └── 미리보기: …/?ids=...&set={setParam}
```

---

## 함수/훅 설계

### hooks/useDataset.ts (수정, F-v8-01 + F-v8-04)

`initialId?: number` 파라미터 추가. URL 파라미터 → localStorage → datasets[0] 우선순위 적용.

```typescript
export function useDataset(datasets: Dataset[], initialId?: number) {
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  useEffect(() => {
    if (datasets.length === 0) return;

    // 1순위: URL 파라미터 (initialId)
    if (initialId) {
      const found = datasets.find((d) => d.id === initialId);
      if (found) {
        setSelectedDataset(found);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(found)); // F-v8-04: localStorage 동기화
        return;
      }
    }

    // 2순위: localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: Dataset = JSON.parse(stored);
        const found = datasets.find((d) => d.id === parsed.id);
        if (found) { setSelectedDataset(found); return; }
      } catch {}
    }

    // 3순위: datasets[0] fallback
    setSelectedDataset(datasets[0]);
  }, [datasets, initialId]);

  const setDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset)); // F-v8-04
  };

  return { selectedDataset, setDataset };
}
```

> `initialId`가 유효하지 않은 숫자이면 `datasets.find`가 `undefined`를 반환하므로
> localStorage → datasets[0] fallback이 자연스럽게 동작한다.

---

### app/page.tsx (수정, F-v8-01 + F-v8-03)

`set` searchParam 읽기 + `useDataset`에 전달 + 옵션 이동 URL에 `set` 포함.

```typescript
// set 파라미터 읽기 (F-v8-01)
const setParam = searchParams.get("set");
const initialSetId = setParam ? Number(setParam) : undefined;

// useDataset에 initialSetId 전달
const { selectedDataset, setDataset } = useDataset(datasets, initialSetId);

// 옵션 이동 시 set 포함 (F-v8-03)
onClick={() =>
  router.push(`/options?ids=${selectedIdsArray.join(",")}&set=${selectedDataset?.id ?? ""}`)
}
```

---

### app/options/page.tsx (수정, F-v8-02)

`set` searchParam 읽기 + `handleCopy` URL에 포함 + 미리보기 업데이트.

```typescript
// set 파라미터 읽기
const setParam = searchParams.get("set") ?? "";

// URL 복사 (F-v8-02)
const handleCopy = async () => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const url = `${window.location.origin}${basePath}/?ids=${idsParam}&set=${setParam}`;
  await navigator.clipboard.writeText(url);
  setCopied(true);
  setTimeout(() => setCopied(false), 1500);
};

// 미리보기 텍스트 (F-v8-02)
`…/?ids=${idsParam}&set=${setParam}`
```

---

## 변경 파일 목록

| 파일 | 변경 유형 | 내용 |
|------|-----------|------|
| `hooks/useDataset.ts` | 수정 | `initialId?: number` 파라미터, URL 우선 적용 + localStorage 동기화 |
| `app/page.tsx` | 수정 | `set` searchParam 읽기, `useDataset` 전달, 옵션 URL에 `set` 포함 |
| `app/options/page.tsx` | 수정 | `set` searchParam 읽기, `handleCopy` + 미리보기에 `set` 포함 |

---

## 우선순위 규칙 (F-v8-01)

| 순위 | 조건 | 동작 |
|------|------|------|
| 1 | URL `set` 파라미터 존재 + 유효한 id | 해당 셋 적용, localStorage 동기화 |
| 2 | localStorage에 저장된 셋이 존재 | 저장된 셋 적용 |
| 3 | 위 모두 해당 없음 | `datasets[0]` (id 오름차순 첫 번째) |

---

## 엣지 케이스

| 케이스 | 처리 |
|--------|------|
| `?set=99` (존재하지 않는 id) | localStorage → datasets[0] fallback |
| `?set=abc` (숫자가 아님) | `Number("abc") === NaN` → `initialId = NaN` → find 실패 → fallback |
| `set` 없는 URL | `initialId = undefined` → 기존 동작 유지 |
| `selectedDataset`가 null (로딩 중) | 옵션 URL: `set=` (빈값) — 허용 |

---

## 성공 기준 (Plan 연계)

| 성공 기준 | 검증 |
|----------|------|
| `/?ids=1,2&set=1` → "5급 신출 한자" | URL 접근 후 타이틀 확인 |
| `/?ids=1,2&set=2` → "구몬 한자 B" | URL 접근 후 타이틀 확인 |
| `set` 없으면 localStorage 동작 유지 | 기존 동작 동일 |
| 홈 화면에서 셋 변경 시 타이틀/카드 변경 | 팝업 선택 후 확인 |
| 유효하지 않은 `set` → fallback | `?set=99` 접근 후 확인 |
| 옵션 URL 복사에 `&set={id}` 포함 | 복사 결과 확인 |
| 옵션 미리보기에 `&set={id}` 표시 | UI 확인 |
| 홈 → 옵션 URL에 `&set={id}` 포함 | 주소창 확인 |

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v8 |
| Phase | Design |
| Status | Completed |
| Created | 2026-03-07 |
