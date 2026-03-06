# Gap Analysis: HanjaClaude

## Summary

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude |
| Phase | Check |
| Analyzed | 2026-03-06 |
| **Match Rate** | **80%** |
| Status | Iteration 필요 (< 90%) |

---

## PDCA Progress

**[Plan] ✅ → [Design] ✅ → [Do] ✅ → [Check] 🔄 → [Act] ⏳**

---

## Match Rate 계산

| 카테고리 | 설계 항목 수 | 구현됨 | 부분 구현 | 미구현 |
|---------|------------|--------|----------|--------|
| Tech Stack | 8 | 6 | 0 | 2 |
| Project Structure (파일) | 12 | 8 | 3 | 1 |
| 홈 화면 기능 | 5 | 5 | 0 | 0 |
| 옵션 화면 기능 | 3 | 3 | 0 | 0 |
| 플레이 화면 기능 | 7 | 6 | 1 | 0 |
| 오답 한자방 기능 | 4 | 4 | 0 | 0 |
| State Management | 3 | 3 | 0 | 0 |
| Routing | 4 | 4 | 0 | 0 |
| **합계** | **46** | **39** | **4** | **3** |

**계산식**: (완전 구현 + 부분 구현 × 0.5) / 전체 = (39 + 2) / 46 = **89%** 기능적 구현

> 단, PWA 설정 미구현(핵심 tech stack 항목)을 별도 감점으로 반영하여 **Match Rate: 80%**

---

## 구현 완료 항목 ✅

### Tech Stack
- Next.js 14 App Router ✅
- TypeScript ✅
- Tailwind CSS ✅
- Framer Motion (카드 flip) ✅
- React useState / useReducer ✅
- localStorage (오답, 옵션) ✅

### 4개 화면 전체 기능
- 홈 화면: 그리드, 선택, 전체선택, 플레이 버튼, 오답방/설정 버튼 ✅
- 옵션 화면: 순서/시작면 선택, localStorage 저장, 홈으로 버튼 ✅
- 플레이 화면: FlipCard, Framer Motion 3D flip, swipe, 오답 추가, 완료 화면 ✅
- 오답 한자방: 그리드, 삭제 모드, 빈 상태 메시지, 전체 플레이 ✅

### 데이터 레이어
- `lib/parseHanja.ts` — CSV fetch + 파싱 ✅
- `hooks/useHanjaData.ts` ✅
- `hooks/useWrongAnswers.ts` ✅
- `hooks/usePlayOptions.ts` ✅
- `types/hanja.ts` (HanjaCard, CardFace, PlayOptions) ✅

---

## Gap 목록

### GAP-01: PWA 설정 미구현 [심각도: 중]

**설계 명세**: `next-pwa` 패키지로 오프라인 지원 및 PWA manifest 설정

**현재 상태**: `next-pwa` 패키지 미설치, manifest 없음

**영향**: 모바일에서 홈 화면 추가 불가, 오프라인 동작 불가

**해결 방법**:
```bash
npm install next-pwa
```
```javascript
// next.config.mjs
import withPWA from 'next-pwa';
export default withPWA({ dest: 'public' })({});
```
```typescript
// app/manifest.ts
export default function manifest() {
  return {
    name: '한자클로드',
    short_name: '한자클로드',
    start_url: '/',
    display: 'standalone',
    theme_color: '#3b82f6',
  };
}
```

---

### GAP-02: ProgressBar.tsx 별도 컴포넌트 미구현 [심각도: 낮]

**설계 명세**: `components/ProgressBar.tsx` — 진행 표시 컴포넌트

**현재 상태**: 플레이 화면(`app/play/page.tsx`)에 인라인으로 구현됨

**영향**: 재사용성 낮음 (현재는 단일 사용이므로 기능적 영향 없음)

**해결 방법**: 인라인 진행 바를 별도 컴포넌트로 분리

---

### GAP-03: useSelection.ts / usePlaySession.ts 훅 미구현 [심각도: 낮]

**설계 명세**:
- `hooks/useSelection.ts` — 카드 선택 상태 관리
- `hooks/usePlaySession.ts` — 플레이 순서/면 상태 관리

**현재 상태**: 각 기능이 `app/page.tsx`, `app/play/page.tsx` 내부에 인라인으로 구현됨

**영향**: 기능 동작은 정상. 코드 재사용성/관심사 분리 미흡

**해결 방법**: 선택 로직과 플레이 세션 로직을 각 훅으로 추출

---

### GAP-04: 플레이 화면 뒷면 이미지 미표시 [심각도: 낮]

**설계 명세**: 뒷면에 `public/images/hanja/{번호}.png` 이미지 표시 (선택적)

**현재 상태**: 뒷면에 뜻 텍스트만 표시. 이미지 없음.

**영향**: Plan에서 "초기 버전은 텍스트로 대체 가능"으로 명시 → 현재 허용 범위

**해결 방법**: 이미지 파일 준비 후 FlipCard 뒷면에 `<img>` 추가

---

## 우선순위 개선 계획

| 순위 | Gap | 작업 | 예상 영향 |
|------|-----|------|----------|
| 1 | GAP-01 | PWA 설정 (manifest + next-pwa) | Match Rate +8% → 88% |
| 2 | GAP-02 | ProgressBar.tsx 분리 | Match Rate +3% → 91% |
| 3 | GAP-03 | useSelection / usePlaySession 분리 | Match Rate +4% → 95% |
| 4 | GAP-04 | 이미지 표시 (에셋 확보 시) | 선택적 |

> GAP-01~03 해결 시 Match Rate 91% 달성 → 90% 기준 통과 예상

---

## 결론

기능적으로 Plan의 F-01~F-19 대부분이 구현됨. TypeScript 타입 에러 없음, 빌드 성공.
주요 미구현은 PWA 설정(GAP-01)이며, 이 항목 해결 시 90% 기준 통과 가능.

**권장 다음 단계**: `/pdca iterate HanjaClaude` — GAP-01~03 자동 개선
