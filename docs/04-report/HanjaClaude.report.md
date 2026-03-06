# Report: HanjaClaude (v2)

## 완료 요약

구몬한자 B단계 카드 학습 앱 HanjaClaude v2 완료.
F-09 (카드 표시 시작 — 뒷면 즉시 표시) 기능 추가 및 검증 완료.

---

## PDCA 사이클 요약

| Phase | 내용 | 결과 |
|-------|------|------|
| Plan | F-09 추가, 플레이/오답 기능 번호 재정렬 (F-09~F-20) | 완료 |
| Design | FlipCard `animated` prop 설계, usePlaySession 상태 설계 | 완료 |
| Do | 3개 파일 구현 (FlipCard, usePlaySession, play/page) | 완료 |
| Check | Gap 분석 — Match Rate 100%, Gap 없음 | 완료 |
| Act | 불필요 (100% 달성) | N/A |

---

## 구현 내용 (F-09)

### 문제
카드가 처음 표시될 때 시작 면이 뒷면이면 앞→뒤 flip 애니메이션이 보이는 문제.

### 해결
`animated` 상태로 카드 이동 시와 사용자 탭 시를 구분:

| 동작 | `animated` | 결과 |
|------|-----------|------|
| 카드 이동 (goToCard) | `false` | 즉시 전환 (duration: 0) |
| 사용자 탭 (flipCard) | `true` | 3D flip 애니메이션 (duration: 0.4s) |

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `components/FlipCard.tsx` | `animated?: boolean` prop, transition 조건부 적용 |
| `hooks/usePlaySession.ts` | `animated` 상태, goToCard/flipCard에서 제어, 반환 |
| `app/play/page.tsx` | `animated={animated}` prop 전달 |

---

## 전체 기능 현황 (v1 + v2)

| # | 기능 | 화면 | 상태 |
|---|------|------|------|
| F-01 | 전체 카드 목록 표시 (90장 그리드) | Home | 완료 |
| F-02 | 카드 선택 (개별/전체) | Home | 완료 |
| F-03 | 플레이 진입 버튼 | Home | 완료 |
| F-04 | 오답 한자방 진입 버튼 | Home | 완료 |
| F-05 | 옵션 진입 버튼 | Home | 완료 |
| F-06 | 순서 선택 (순서/랜덤) | Options | 완료 |
| F-07 | 시작 면 선택 (앞/뒷/랜덤) | Options | 완료 |
| F-08 | 홈으로 돌아가기 | Options | 완료 |
| F-09 | 카드 표시 시작 (뒷면 즉시 표시) | Play | 완료 (v2 신규) |
| F-10 | 앞면 표시 (한자) | Play | 완료 |
| F-11 | 뒷면 표시 (뜻음) | Play | 완료 |
| F-12 | 카드 뒤집기 (flip 애니메이션) | Play | 완료 |
| F-13 | 다음 카드 (스와이프) | Play | 완료 |
| F-14 | 진행 표시 (N / 전체) | Play | 완료 |
| F-15 | 오답 추가 버튼 | Play | 완료 |
| F-16 | 오답 한자방 진입 버튼 | Play | 완료 |
| F-17 | 홈으로 돌아가기 | Play | 완료 |
| F-18 | 오답 카드 목록 | Wrong | 완료 |
| F-19 | 카드 삭제 (길게 누르기) | Wrong | 완료 |
| F-20 | 오답 카드 플레이 | Wrong | 완료 |

**총 20개 기능 — 전체 완료**

---

## Tech Stack

| 항목 | 내용 |
|------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Data | CSV (public/data/hanjab.csv, 90장) |
| Storage | localStorage (오답, 옵션) |
| PWA | native manifest.ts + service worker |
| Deploy | Static Export (output: "export") |

---

## Match Rate

| 사이클 | Match Rate |
|--------|-----------|
| v1 (F-01~F-08, F-10~F-20) | 93% |
| v2 (F-09 추가) | 100% |

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude |
| Phase | Completed |
| Version | v2 |
| Created | 2026-03-06 |
| Final Match Rate | 100% |
| Status | Completed |
