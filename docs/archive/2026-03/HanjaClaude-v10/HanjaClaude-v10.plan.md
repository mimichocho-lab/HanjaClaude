# Plan: HanjaClaude v10

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v10 |
| Version | v10 |
| 기반 | HanjaClaude v9 (Match Rate 100%) |
| 목표 | 이미지 경로를 셋(CSV 파일)별 하위 폴더로 분리 |
| 작성일 | 2026-03-07 |

---

## 배경 및 목적

현재 모든 셋의 이미지가 `/public/images/hanja/` 단일 폴더를 사용한다.
셋이 여러 개로 늘어나면서 이미지가 혼재되는 문제가 있으므로,
CSV 파일명 앞부분(확장자 제거)을 하위 폴더명으로 사용해 셋별로 이미지를 분리한다.

---

## 현재 상태 (v9 기준)

| 항목 | 현재 상태 |
|------|----------|
| 이미지 경로 | `/images/hanja/{id}.png` (셋 구분 없음) |
| 이미지 폴더 | `/public/images/hanja/` 단일 폴더 |
| 이미지 경로 생성 위치 | `lib/parseHanja.ts:32` |

---

## 기능 요구사항

### F-v10-01: 이미지 경로에 셋 하위 폴더 적용

- CSV 파일명에서 `.csv` 확장자를 제거한 문자열을 이미지 폴더명으로 사용
- `loadHanjaData(file)` 함수 내에서 `file` 파라미터로 폴더명 도출
- 변경 전: `${basePath}/images/hanja/${id}.png`
- 변경 후: `${basePath}/images/hanja/${imageFolder}/${id}.png`

**예시:**

| CSV 파일 | 이미지 폴더 | 이미지 경로 예시 |
|----------|------------|----------------|
| `hanjab.csv` | `hanjab` | `/images/hanja/hanjab/1.png` |
| `grade4j.csv` | `grade4j` | `/images/hanja/grade4j/1.png` |
| `grade5.csv` | `grade5` | `/images/hanja/grade5/1.png` |

---

## 변경 파일 목록

| 파일 | 변경 유형 | 내용 |
|------|-----------|------|
| `lib/parseHanja.ts` | 수정 | `imageFolder` 도출 로직 추가, `imagePath` 경로에 하위 폴더 포함 |

---

## Out of Scope (v10 제외)

- 이미지 파일 자체의 이동/복사 (폴더 구조는 별도 작업)
- `data.csv` 구조 변경
- 이미지 없을 때의 fallback UI

---

## 성공 기준

- [ ] `hanjab.csv` 셋 접근 시 이미지 경로가 `/images/hanja/hanjab/{id}.png`
- [ ] `grade4j.csv` 셋 접근 시 이미지 경로가 `/images/hanja/grade4j/{id}.png`
- [ ] `grade5.csv` 셋 접근 시 이미지 경로가 `/images/hanja/grade5/{id}.png`
- [ ] 기존 `/images/hanja/hanjab/` 폴더의 이미지 정상 표시

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v10 |
| Phase | Plan |
| Status | In Progress |
| Created | 2026-03-07 |
