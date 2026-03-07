# Plan: HanjaClaude v13

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v13 |
| 기반 | HanjaClaude v12 (Match Rate 100%) |
| 목표 | Play 화면 뒷면 뜻음 폰트 크기를 카드 크기의 30%로 확대 |
| 작성일 | 2026-03-07 |

---

## 배경 및 문제

v12에서 뜻음(`{card.meaning} {card.pronunciation}`)의 폰트 크기가 `text-3xl`(1.875rem 고정)로
카드가 커져도 폰트는 작게 유지된다. 카드 크기에 비례한 동적 폰트 크기가 필요하다.

---

## 요구사항

### F-v13-01: 뜻음 폰트 크기 — 카드 크기의 30%

- 현재: `text-3xl` (1.875rem 고정)
- 변경: `style={{ fontSize: 'calc(0.3 * min(90vw, 80vh))' }}`
- `text-3xl` 클래스 제거
- 나머지 클래스(`absolute bottom-[8%] max-w-[80%] max-h-[30%] overflow-hidden font-bold text-amber-700 text-center`) 유지

---

## 변경 파일

| 파일 | 변경 유형 |
|------|-----------|
| `components/FlipCard.tsx` | 수정 (F-v13-01) |

---

## 성공 기준

| 기준 | 검증 방법 |
|------|-----------|
| 뜻음 `style.fontSize = 'calc(0.3 * min(90vw, 80vh))'` | inline style 확인 |
| `text-3xl` 클래스 없음 | className 확인 |

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v13 |
| Phase | Plan |
| Status | Completed |
| Created | 2026-03-07 |
