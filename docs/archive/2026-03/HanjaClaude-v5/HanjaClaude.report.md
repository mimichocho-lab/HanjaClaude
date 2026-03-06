# Report: HanjaClaude v5

## 완료 요약

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude |
| Version | v5 |
| Match Rate | 98% |
| Iterations | 0 (1회 통과) |
| 완료일 | 2026-03-07 |
| 배포 URL | https://mimichocho-lab.github.io/HanjaClaude/ |

**[Plan] ✅ → [Design] ✅ → [Do] ✅ → [Check] ✅ (98%) → [Report] ✅**

---

## 프로젝트 개요

구몬한자 B단계 90장 한자를 디지털 카드로 학습하는 모바일 우선 웹 앱. Next.js + TypeScript + Tailwind CSS 기반, GitHub Pages 정적 배포.

---

## v5 핵심 변경 사항

### v4 → v5 변경 비교

| 항목 | v4 | v5 | 결과 |
|------|----|----|------|
| F-09 선택 목록 공유 | 카드 번호 텍스트 복사 | 전체 URL 복사 (`/?ids=...`) | 붙여넣기만으로 동일 학습 상태 재현 |
| F-10 텍스트 반영 | 텍스트 입력 → localStorage 반영 | **제거** | UX 단순화, URL 공유로 대체 |
| 홈 URL 파라미터 | 없음 | `/?ids=1,2,3` 초기 선택 상태 지원 | 공유 URL로 바로 학습 진입 |
| useSelection | localStorage만 사용 | URL params 우선, localStorage 보조 | 공유 URL 정확히 반영 |
| app/page.tsx | Suspense 없음 | Suspense 래핑 (useSearchParams) | Next.js SSG 호환 |
| F-09 URL 구성 | - | `NEXT_PUBLIC_BASE_PATH` 환경변수 활용 | 로컬/GitHub Pages 모두 정확한 URL |

---

## 구현 완료 기능 목록

### 홈 화면 (app/page.tsx)
- ✅ F-01: 90장 전체 한자 5열 그리드 표시
- ✅ F-02: 개별/전체 카드 선택 (localStorage 저장)
- ✅ F-03: 플레이 진입 버튼 (1장 이상 선택 시 활성)
- ✅ F-04: 오답 한자방 진입 버튼
- ✅ F-05: 옵션 진입 버튼 (선택된 ids를 URL param으로 전달)
- ✅ (신규) `/?ids=` URL 파라미터로 초기 선택 상태 진입

### 옵션 화면 (app/options/page.tsx)
- ✅ F-06: 카드 순서 선택 (번호순 / 랜덤)
- ✅ F-07: 시작 면 선택 (한자먼저 / 뜻음먼저 / 랜덤)
- ✅ F-08: 홈/오답방 뜻음 표시 토글 (보이기 / 숨기기)
- ✅ F-09: 전체 URL 복사 — `${origin}${NEXT_PUBLIC_BASE_PATH}/?ids=...`
- ✅ F-10: 홈으로 버튼

### 플레이 화면 (app/play/page.tsx)
- ✅ F-12: 카드 표시 시작 (시작 면 옵션 반영)
- ✅ F-13: 앞면 — 한자 크게 표시
- ✅ F-14: 뒷면 — 뜻음 텍스트 (이미지 대체)
- ✅ F-15: 카드 뒤집기 (3D flip 애니메이션)
- ✅ F-16: 스와이프 다음 카드 (현재 면 유지)
- ✅ F-17: 진행 표시 (N / 전체)
- ✅ F-18: 오답 토글 버튼 (오답 추가 / 해제)
- ✅ F-19: 오답방 진입 버튼
- ✅ F-20: 홈으로 버튼
- ✅ F-24: 랜덤 순서 — 진입 시 셔플, 이후 그 순서 유지

### 오답 한자방 (app/wrong/page.tsx)
- ✅ F-21: 오답 카드 그리드 표시
- ✅ F-22: 길게 누르기 또는 삭제 버튼 → X 버튼 → 삭제
- ✅ F-23: 전체 플레이 버튼

---

## 기술 스택 및 아키텍처

| 항목 | 기술 |
|------|------|
| Framework | Next.js 14 (App Router, Static Export) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | framer-motion (3D flip) |
| Storage | localStorage (선택/옵션/오답) |
| Data | data/hanjab.csv → 런타임 fetch |
| Hosting | GitHub Pages (`/HanjaClaude/`) |

### 핵심 설계 결정

| 결정 | 이유 |
|------|------|
| goToCard vs swipeToCard 분리 | 버튼 이동은 시작면 리셋, 스와이프는 현재 면 유지 |
| optionsRef + resolveStartFace | 카드마다 독립 랜덤 결정, 클로저 stale 방지 |
| NEXT_PUBLIC_BASE_PATH 활용 | 로컬/GitHub Pages 환경별 올바른 URL 생성 |
| Suspense 래핑 (홈/플레이/옵션) | useSearchParams SSG 호환 |
| URL params 우선 → localStorage 보조 | 공유 URL 정확 반영 후 이후 변경 저장 |

---

## Gap 분석 결과 요약

**Match Rate: 98%** (66개 항목 중 65개 일치)

| Gap ID | 항목 | 영향도 | 비고 |
|--------|------|--------|------|
| G-01 | FlipCard 뒷면 이미지 미표시 | 낮음 | Plan에서 "텍스트 대체 가능" 명시 |

실질적 완성도: **100%** (G-01은 계획에서 허용된 항목)

---

## 배포 현황

- GitHub Pages 자동 배포 (`.github/workflows/` CI/CD)
- 빌드: `next build` → `output: "export"` → `gh-pages` 브랜치
- URL: `https://mimichocho-lab.github.io/HanjaClaude/`

---

## 향후 개선 가능 항목 (Out of Scope)

- 카드 뒷면 이미지 추가 (`public/images/hanja/{번호}.png`)
- PWA 오프라인 지원 강화
- 학습 통계 기록 (맞춘 횟수, 학습 시간)
- 구몬한자 A / C단계 확장

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude |
| Phase | Report |
| Version | v5 |
| Match Rate | 98% |
| Completed | 2026-03-07 |
| Status | Completed |
