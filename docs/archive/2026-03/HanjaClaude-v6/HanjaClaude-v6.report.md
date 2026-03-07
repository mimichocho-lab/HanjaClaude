# Report: HanjaClaude v6

## 완료 요약

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v6 |
| Version | v6 |
| Match Rate | 97% |
| Iterations | 0 (1회 통과) |
| 완료일 | 2026-03-07 |
| 배포 URL | https://mimichocho-lab.github.io/HanjaClaude/ |

**[Plan] ✅ → [Design] ✅ → [Do] ✅ → [Check] ✅ (97%) → [Report] ✅**

---

## 프로젝트 개요

HanjaClaude v5 기반에서 카드 뒷면 이미지 표시 및 홈 화면 카드 랜덤 순서 옵션을 추가한 업데이트. Next.js + TypeScript + Tailwind CSS 기반, GitHub Pages 정적 배포.

---

## v6 핵심 변경 사항

### v5 → v6 변경 비교

| 항목 | v5 | v6 | 결과 |
|------|----|----|------|
| FlipCard 뒷면 | 뜻음 텍스트만 표시 | 이미지(상단) + 텍스트(하단), 이미지 없으면 텍스트만 | 교재 연상 그림 학습 지원 |
| imagePath 경로 | `basePath` 누락 (`/images/hanja/1.png`) | `basePath` 포함 (`/HanjaClaude/images/hanja/1.png`) | GitHub Pages 이미지 경로 정상화 |
| 홈 화면 카드 순서 | 항상 1~90 번호 순 | 옵션에서 번호 순서 / 랜덤 선택 가능 | 랜덤 순서로 학습 효율 향상 |
| PlayOptions 타입 | `order, startFace, showMeaning` | `homeOrder` 필드 추가 | |
| localStorage 로드 | `JSON.parse(stored)` 완전 대체 | `{ ...DEFAULT, ...JSON.parse(stored) }` 병합 | 구버전 호환성 보장 |

---

## 구현 완료 기능 목록

### F-v6-01: 카드 뒷면 이미지 표시
- ✅ 이미지 파일 존재 시 FlipCard 뒷면 상단에 이미지 표시
- ✅ 이미지 로드 실패 시 텍스트 전용 레이아웃으로 자동 fallback
- ✅ 카드 전환 시 `useEffect([card.id])`로 imageError 상태 초기화

### F-v6-02: imagePath basePath 수정
- ✅ `parseHanja.ts`에서 `imagePath: \`${basePath}/images/hanja/${id.trim()}.png\``로 수정
- ✅ 로컬 환경: `/images/hanja/1.png`
- ✅ GitHub Pages: `/HanjaClaude/images/hanja/1.png`

### F-v6-03: 홈 화면 카드 랜덤 순서
- ✅ `PlayOptions`에 `homeOrder: "sequential" | "random"` 추가
- ✅ 옵션 화면 '홈 화면 카드 순서' 토글 (번호 순서 / 랜덤)
- ✅ 홈 화면 `useMemo` Fisher-Yates 셔플 (마운트 시 1회, 재렌더링 시 순서 유지)
- ✅ localStorage 저장 및 재방문 시 설정 유지

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
| `imageError` useState + `onError` | 이미지 404 시 조용한 fallback, UX 저하 없음 |
| `useEffect([card.id])` reset | 카드 전환 시 이전 이미지 에러 상태 초기화 |
| `useMemo([cards, homeOrder])` 셔플 | 재렌더링마다 재셔플 방지, 안정적인 순서 유지 |
| `{ ...DEFAULT, ...JSON.parse }` 병합 | 신규 옵션 필드 추가 시 구버전 localStorage 호환 |
| `id.trim()` 적용 | CSV 파싱 시 공백 제거로 경로 정확성 보장 |

---

## Gap 분석 결과 요약

**Match Rate: 97%** (30개 항목 중 29개 일치)

| Gap ID | 항목 | 영향도 | 처리 |
|--------|------|--------|------|
| G-v6-01 | localStorage 구버전 마이그레이션 | 낮음 | 즉시 수정 완료 (`{ ...DEFAULT, ...JSON.parse }`) |

실질적 완성도: **100%** (G-v6-01 수정 포함)

---

## 변경 파일 목록

| 파일 | 변경 유형 | 내용 |
|------|-----------|------|
| `types/hanja.ts` | 수정 | `PlayOptions.homeOrder` 추가 |
| `hooks/usePlayOptions.ts` | 수정 | 기본값 및 localStorage 병합 로드 |
| `lib/parseHanja.ts` | 수정 | `imagePath` basePath 포함 |
| `components/FlipCard.tsx` | 수정 | 이미지 표시 + fallback + useEffect reset |
| `app/options/page.tsx` | 수정 | '홈 화면 카드 순서' 토글 추가 |
| `app/page.tsx` | 수정 | `useMemo` 셔플 + `displayCards` 렌더링 |

---

## 배포 현황

- GitHub Pages 자동 배포 (`.github/workflows/` CI/CD)
- 빌드: `next build` → `output: "export"` → `gh-pages` 브랜치
- URL: `https://mimichocho-lab.github.io/HanjaClaude/`

---

## 향후 개선 가능 항목 (Out of Scope)

- 이미지 파일 추가 (`public/images/hanja/2~90.png`)
- 학습 통계 기록 (맞춘 횟수, 학습 시간)
- 구몬한자 A / C단계 확장
- PWA 오프라인 지원 강화

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v6 |
| Phase | Report |
| Version | v6 |
| Match Rate | 97% |
| Completed | 2026-03-07 |
| Status | Completed |
