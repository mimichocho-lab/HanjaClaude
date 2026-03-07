# Report: HanjaClaude v7

## 완료 요약

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v7 |
| Version | v7 |
| Match Rate | 100% |
| Iterations | 0 (1회 통과) |
| 완료일 | 2026-03-07 |
| 배포 URL | https://mimichocho-lab.github.io/HanjaClaude/ |

**[Plan] ✅ → [Design] ✅ → [Do] ✅ → [Check] ✅ (100%) → [Report] ✅**

---

## 프로젝트 개요

HanjaClaude v6 기반에서 데이터셋 전환 기능을 추가한 업데이트.
홈 화면 타이틀 탭으로 팝업을 열어 **구몬 한자 B** (89장)와 **5급 신출 한자** (149장)를
자유롭게 전환할 수 있다. Next.js + TypeScript + Tailwind CSS 기반, GitHub Pages 정적 배포.

---

## v7 핵심 변경 사항

### v6 → v7 변경 비교

| 항목 | v6 | v7 | 결과 |
|------|----|----|------|
| 데이터셋 | 구몬 한자 B (89장) 하드코딩 | 팝업으로 2개 데이터셋 전환 | 학습 범위 확장 |
| 데이터 로드 | `hanjab.csv` 고정 | `loadHanjaData(file)` 파라미터화 | 동적 데이터 로드 |
| 데이터셋 목록 | 없음 | `loadSetData()` — data.csv 런타임 로드 | 확장 가능한 구조 |
| 홈 제목 | "구몬 한자 B" 하드코딩 | `selectedDataset?.name` 동적 표시 | 현재 셋 반영 |
| 카드 ID 필터 | `n >= 1 && n <= 90` 하드코딩 | `n > 0` 양수 필터 (범위 제거) | 149장 지원 |
| 데이터셋 상태 | 없음 | `useDataset` hook + localStorage | 재방문 시 유지 |

---

## 구현 완료 기능 목록

### F-v7-01: 홈 화면 데이터셋 팝업 전환

- ✅ 홈 화면 타이틀 탭 → 팝업 리스트 표시
- ✅ data.csv에서 데이터셋 목록 동적 로드 (id 오름차순)
- ✅ 현재 선택 항목 `✓` 표시
- ✅ 팝업 외부(backdrop) 탭 시 닫힘
- ✅ 선택 시 카드 목록/제목 즉시 전환

### F-v7-02: 동적 데이터 로드

- ✅ `loadSetData()` — data.csv fetch → Dataset[] 반환
- ✅ `loadHanjaData(file: string)` — 파일명 파라미터로 동적 로드
- ✅ `useHanjaData(file)` — `useEffect([file])` 파일 변경 시 재로드

### F-v7-03: 데이터셋 상태 관리

- ✅ `useDataset(datasets)` hook — `{ selectedDataset, setDataset }` 반환
- ✅ localStorage `"hanja_dataset"` 키로 선택 유지
- ✅ 저장값 없거나 매칭 실패 시 `datasets[0]` fallback
- ✅ `getStoredDatasetFile()` — play/wrong 페이지에서 현재 데이터셋 파일 조회
- ✅ 데이터셋 전환 시 카드 선택 상태(`clearSelection()`) 초기화

---

## 기술 스택 및 아키텍처

| 항목 | 기술 |
|------|------|
| Framework | Next.js 14 (App Router, Static Export) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | framer-motion (3D flip) |
| Storage | localStorage (선택/옵션/오답/데이터셋) |
| Data | data.csv → Dataset[], {file}.csv → HanjaCard[] 런타임 fetch |
| Hosting | GitHub Pages (`/HanjaClaude/`) |

### 핵심 설계 결정

| 결정 | 이유 |
|------|------|
| `loadSetData()` 동적 로드 | data.csv가 단일 진실 공급원 — 새 데이터셋 추가 시 코드 수정 불필요 |
| `useDataset(datasets)` hook | 데이터셋 선택 상태를 컴포넌트에서 분리, 재사용 가능 |
| `getStoredDatasetFile()` | play/wrong 페이지에서 `useDataset`을 사용할 수 없으므로 localStorage 직접 읽기 |
| `setDataset` 명칭 | Plan 문서 명칭 정합성 (`setDataset`으로 통일) |
| `clearSelection()` on 전환 | 다른 데이터셋의 ID가 겹칠 수 있으므로 전환 시 선택 초기화 |
| `id: number` (not `int`) | TypeScript에서 정수형은 `number`로 표현 |

---

## 변경 파일 목록

| 파일 | 변경 유형 | 내용 |
|------|-----------|------|
| `types/hanja.ts` | 수정 | `Dataset` 인터페이스 추가 |
| `lib/parseHanja.ts` | 수정 | `loadSetData()` 추가, `loadHanjaData(file)` 파라미터화 |
| `hooks/useHanjaData.ts` | 수정 | `file` 파라미터, `useEffect([file])` 의존성 |
| `hooks/useDataset.ts` | 신규 | `useDataset()` + `getStoredDatasetFile()` |
| `hooks/useSelection.ts` | 수정 | `clearSelection()` 추가 |
| `app/page.tsx` | 수정 | 팝업 UI, useDataset, 동적 제목, ID 필터 제거 |
| `app/play/page.tsx` | 수정 | `getStoredDatasetFile()` 연결 |
| `app/wrong/page.tsx` | 수정 | `getStoredDatasetFile()` 연결 |
| `public/data/data.csv` | 신규 | 데이터셋 목록 (구몬 한자 B, 5급 신출 한자) |
| `public/data/grade5.csv` | 신규 | 5급 신출 한자 149장 |

---

## Gap 분석 결과 요약

**Match Rate: 100%** (20개 항목 전체 일치, Gap 0개)

PDCA 이력:
- 1차 Design → Do → Check: 100% (changeDataset 명칭으로 진행)
- Design 재작성: Plan 기준 `setDataset` 명칭 정합성 반영
- 2차 Do: 명칭 수정 (changeDataset → setDataset)
- 2차 Check: 100% 유지 확인

---

## 배포 현황

- GitHub Pages 자동 배포 (`.github/workflows/` CI/CD)
- 빌드: `next build` → `output: "export"` → `gh-pages` 브랜치
- URL: `https://mimichocho-lab.github.io/HanjaClaude/`

---

## 향후 개선 가능 항목 (Out of Scope)

- 이미지 파일 추가 (`public/images/hanja/2~90.png`)
- 학습 통계 기록 (맞춘 횟수, 학습 시간)
- 구몬 한자 A/C단계 CSV 데이터 추가
- PWA 오프라인 지원 강화
- 오답방 데이터셋별 분리 관리

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v7 |
| Phase | Report |
| Version | v7 |
| Match Rate | 100% |
| Completed | 2026-03-07 |
| Status | Completed |
