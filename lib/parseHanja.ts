import type { HanjaCard } from "@/types/hanja";

export async function loadHanjaData(): Promise<HanjaCard[]> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const res = await fetch(`${basePath}/data/hanjab.csv`);
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
        imagePath: `/images/hanja/${id}.png`,
      };
    });
}
