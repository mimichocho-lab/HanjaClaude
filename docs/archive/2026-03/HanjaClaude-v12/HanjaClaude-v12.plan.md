# Plan: HanjaClaude v12

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v12 |
| 기반 | HanjaClaude v11 (Match Rate 100%) |
| 목표 | Play 화면 FlipCard 반응형 크기 레이아웃 |
| 작성일 | 2026-03-07 |

---

## 배경 및 문제

v11에서 카드 폭을 `w-[90vw]` + `aspect-[3/4]`로 고정해 세로가 긴 형태였다.
화면 높이를 고려하지 않아 세로가 짧은 기기(가로 모드, 태블릿)에서 카드가 화면을 벗어날 수 있다.
뜻음이 중앙 배치되어 있어 시각적 계층 구조가 부족하다.

---

## 요구사항

### F-v12-01: 카드 크기 — 폭/높이 중 작은 값 기준 정사각형

- 카드 폭 최대: `90vw`
- 카드 높이 최대: `80vh`
- 실제 크기: `min(90vw, 80vh)` × `min(90vw, 80vh)` (정사각형)
- CSS `min()` 함수 사용: `style={{ width: 'min(90vw, 80vh)', height: 'min(90vw, 80vh)' }}`
- 기존 `aspect-[3/4]` 제거

### F-v12-02: 한자 크기 — 카드 크기의 80%

- 앞면 한자 font-size: `calc(0.8 * min(90vw, 80vh))`
- inline style 적용: `style={{ fontSize: 'calc(0.8 * min(90vw, 80vh))' }}`
- 기존 `text-8xl` 제거

### F-v12-03: 뜻음 — 카드 하단 배치

- 뒷면 뜻음을 카드 중앙에서 하단 쪽으로 이동
- 배치: `absolute` + `bottom-[8%]` (하단에서 8% 위)
- 폭 제한: `max-w-[80%]`
- 높이 제한: `max-h-[30%]`
- 텍스트 크기: `overflow-hidden` + 기존 `text-3xl` 유지

---

## 변경 파일

| 파일 | 변경 유형 |
|------|-----------|
| `components/FlipCard.tsx` | 수정 (F-v12-01, F-v12-02, F-v12-03) |

---

## 성공 기준

| 기준 | 검증 방법 |
|------|-----------|
| 카드가 `min(90vw, 80vh)` 정사각형으로 표시됨 | inline style 확인 |
| 한자 크기가 `calc(0.8 * min(90vw, 80vh))` | inline style 확인 |
| 뜻음이 카드 하단 근처에 절대 위치로 배치됨 | `absolute bottom-[8%]` 확인 |
| 뜻음 폭 최대 80%, 높이 최대 30% | `max-w-[80%] max-h-[30%]` 확인 |

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v12 |
| Phase | Plan |
| Status | Completed |
| Created | 2026-03-07 |
