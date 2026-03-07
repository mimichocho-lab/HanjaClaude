# Design: HanjaClaude v10

## 개요

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v10 |
| 기반 Plan | docs/01-plan/features/HanjaClaude-v10.plan.md |
| 목표 | 이미지 경로에 셋별 하위 폴더 적용 (`/images/hanja/{folder}/{id}.png`) |
| 작성일 | 2026-03-07 |

---

## 변경 위치

`lib/parseHanja.ts` — `loadHanjaData(file: string)` 함수

---

## 변경 전

```typescript
export async function loadHanjaData(file: string): Promise<HanjaCard[]> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const res = await fetch(`${basePath}/data/${file}`);
  const text = await res.text();
  return text
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [id, hanja, meaning, pronunciation] = line.split(",");
      return {
        id: Number(id),
        hanja: hanja.trim(),
        meaning: meaning.trim(),
        pronunciation: pronunciation.trim(),
        imagePath: `${basePath}/images/hanja/${id.trim()}.png`,
      };
    });
}
```

## 변경 후

```typescript
export async function loadHanjaData(file: string): Promise<HanjaCard[]> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const imageFolder = file.replace(".csv", "");
  const res = await fetch(`${basePath}/data/${file}`);
  const text = await res.text();
  return text
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [id, hanja, meaning, pronunciation] = line.split(",");
      return {
        id: Number(id),
        hanja: hanja.trim(),
        meaning: meaning.trim(),
        pronunciation: pronunciation.trim(),
        imagePath: `${basePath}/images/hanja/${imageFolder}/${id.trim()}.png`,
      };
    });
}
```

---

## 변경 내용 요약

| 구분 | 내용 |
|------|------|
| 추가 | `const imageFolder = file.replace(".csv", "")` (fetch 호출 전) |
| 수정 | `imagePath` 경로: `hanja/${id}` → `hanja/${imageFolder}/${id}` |

---

## 이미지 경로 매핑

| CSV 파일 | imageFolder | 결과 경로 |
|----------|-------------|-----------|
| `hanjab.csv` | `hanjab` | `/images/hanja/hanjab/{id}.png` |
| `grade4j.csv` | `grade4j` | `/images/hanja/grade4j/{id}.png` |
| `grade5.csv` | `grade5` | `/images/hanja/grade5/{id}.png` |

---

## 변경 파일 목록

| 파일 | 변경 유형 | 내용 |
|------|-----------|------|
| `lib/parseHanja.ts` | 수정 | `imageFolder` 변수 추가, `imagePath`에 하위 폴더 포함 |

---

## 성공 기준 (Plan 연계)

| 성공 기준 | 검증 |
|----------|------|
| `hanjab.csv` 셋 → `/images/hanja/hanjab/{id}.png` | 이미지 로드 확인 |
| `grade4j.csv` 셋 → `/images/hanja/grade4j/{id}.png` | 이미지 로드 확인 |
| `grade5.csv` 셋 → `/images/hanja/grade5/{id}.png` | 이미지 로드 확인 |

---

## Metadata

| 항목 | 내용 |
|------|------|
| Feature | HanjaClaude-v10 |
| Phase | Design |
| Status | Completed |
| Created | 2026-03-07 |
