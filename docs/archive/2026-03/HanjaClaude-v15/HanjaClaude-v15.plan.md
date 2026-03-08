# Plan: HanjaClaude-v15 — 셋 변경 시 카드 선택 초기화

## Feature Overview

옵션 화면에서 **셋(학습 셋)을 변경**할 때, 기존에 선택된 카드 목록을 자동으로 초기화한다.
홈 화면으로 돌아왔을 때 아무 카드도 선택되지 않은 빈 상태로 보이도록 한다.

## Problem Statement

현재 동작:
1. 홈 화면에서 일부 카드를 선택함 (localStorage에 저장됨)
2. 옵션 화면에서 다른 셋으로 변경함
3. 홈 화면으로 돌아오면 **이전 셋의 카드 선택 상태가 남아 있음**

이 상태는 사용자에게 혼란을 줌:
- 이전 셋의 ID가 새 셋에서도 존재할 경우 엉뚱한 카드가 선택된 것처럼 보임
- 새 셋을 선택했는데 기존 선택이 남아 있어 "전체 선택이 된 것처럼" 오해할 수 있음

## Requirements

### FR-01: 셋 변경 시 선택 자동 초기화

- 옵션 화면에서 **현재와 다른 셋**을 선택하면 카드 선택 목록을 비워야 함
- 같은 셋을 다시 선택하는 경우에는 초기화하지 않음

### FR-02: 홈 화면 반영

- 셋 변경 후 홈(`/`)으로 돌아왔을 때 카드가 아무것도 선택되지 않은 상태이어야 함
- "X장 선택" 카운트가 0으로 표시되어야 함
- "플레이 시작" 버튼이 비활성화(disabled) 상태이어야 함

### FR-03: 기존 같은 셋 내 선택은 유지

- 옵션에서 다른 설정(카드 순서, 시작 면 등)만 변경하고 셋은 그대로인 경우, 기존 카드 선택을 유지해야 함

## Technical Scope

### 변경 대상 파일

| 파일 | 변경 내용 |
|------|-----------|
| `hooks/useDataset.ts` | 셋 변경 시 콜백 또는 side effect 지원 |
| `app/options/page.tsx` | 셋 선택 시 선택 초기화 로직 추가 |
| `hooks/useSelection.ts` | `clearSelection` 함수 확인 (이미 존재) |

### 구현 전략

옵션 화면(`/app/options/page.tsx`)에서 셋을 선택할 때:

1. 현재 dataset ID와 선택한 dataset ID를 비교
2. **다를 경우**: `localStorage.removeItem("hanjaSelectedIds")` 또는 `clearSelection()` 호출 후 dataset 변경
3. 홈으로 navigate

`useSelection` hook의 `clearSelection()` 함수가 이미 존재하므로,
옵션 화면에서 이를 호출하는 것이 가장 간단한 접근이다.

단, 옵션 화면이 `useSelection`을 현재 사용하지 않으므로,
**localStorage 직접 초기화** 방식이 더 단순할 수 있음 (dependency 추가 없이).

## Acceptance Criteria

- [ ] 옵션에서 다른 셋 선택 → 홈으로 이동 → 카드 선택 0개
- [ ] 옵션에서 같은 셋 재선택 → 홈으로 이동 → 기존 선택 유지
- [ ] 옵션에서 셋만 변경 (다른 설정은 그대로) → 선택 초기화 확인
- [ ] 홈의 바텀바에 "0장 선택" 표시, 플레이 버튼 비활성화

## Implementation Estimate

- 변경 파일: 1개 (`app/options/page.tsx`)
- 복잡도: 낮음 (단순 조건 분기 + localStorage 초기화)
- 예상 라인 변경: ~10줄

## Notes

- `useSelection`의 `clearSelection()`은 state와 localStorage 모두 초기화함
- 옵션 화면에서 `useSelection`을 import하기보다 localStorage key(`"hanjaSelectedIds"`)를 직접 제거하는 방식 사용 권장 (간결성)
- 또는 useDataset hook에 onChange 콜백을 추가하는 방법도 가능하나 over-engineering
