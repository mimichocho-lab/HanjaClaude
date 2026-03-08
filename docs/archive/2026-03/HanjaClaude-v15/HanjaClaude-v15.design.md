# Design: HanjaClaude-v15 — 셋 변경 시 카드 선택 초기화

## 변경 파일

**단 1개 파일**: `app/options/page.tsx`

---

## 현재 코드 분석

### `handleDatasetChange` 현재 구현 (options/page.tsx:24-27)

```typescript
const handleDatasetChange = (ds: Dataset) => {
  setDataset(ds);      // localStorage에 새 셋 저장
  router.push("/");    // 홈으로 이동
};
```

**문제:** 셋이 바뀌어도 `localStorage["hanjaSelectedIds"]`를 건드리지 않아 기존 선택이 남음.

---

## 설계

### 변경할 함수: `handleDatasetChange`

```typescript
const handleDatasetChange = (ds: Dataset) => {
  if (selectedDataset?.id !== ds.id) {
    localStorage.removeItem("hanjaSelectedIds");
  }
  setDataset(ds);
  router.push("/");
};
```

**로직:**
1. `selectedDataset?.id !== ds.id` — 다른 셋을 선택한 경우에만
2. `localStorage.removeItem("hanjaSelectedIds")` — 선택 목록 삭제
3. 기존과 동일하게 `setDataset(ds)` + `router.push("/")`

### localStorage 키 출처

`hooks/useSelection.ts` line 6:
```typescript
const KEY = "hanjaSelectedIds";
```

`clearSelection()` 함수도 동일하게 `localStorage.removeItem(KEY)`를 사용.
→ 옵션 페이지에서 동일한 문자열로 직접 삭제하면 됨.

### 왜 useSelection import 불필요한가

- `useSelection`은 카드 데이터(`HanjaCard[]`)가 필요하지만 옵션 페이지는 카드 데이터를 로드하지 않음
- localStorage key를 직접 사용하면 dependency 추가 없이 동일 효과
- `"hanjaSelectedIds"`는 앱 전체에서 단 1곳에서 정의됨 (하드코딩 리스크 최소)

---

## 예상 diff

```diff
  const handleDatasetChange = (ds: Dataset) => {
+   if (selectedDataset?.id !== ds.id) {
+     localStorage.removeItem("hanjaSelectedIds");
+   }
    setDataset(ds);
    router.push("/");
  };
```

총 **+3줄** 추가.

---

## 동작 시나리오

| 시나리오 | 동작 |
|----------|------|
| 셋 A → 셋 B 선택 | 선택 초기화 + 홈 이동 (0장) |
| 셋 A → 셋 A 재선택 | 초기화 없음 + 홈 이동 (기존 선택 유지) |
| 다른 설정만 변경 (셋 그대로) | handleDatasetChange 호출 안 됨, 선택 유지 |

---

## Acceptance Criteria

- [ ] 옵션에서 다른 셋 선택 → 홈 이동 → 카드 선택 0개, 바텀바 "0장 선택"
- [ ] 옵션에서 같은 셋 재선택 → 홈 이동 → 기존 선택 유지
- [ ] 카드 순서/시작면 등 다른 옵션 변경 → 선택 상태 불변
