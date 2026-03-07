import type { Dataset, HanjaCard } from "@/types/hanja";

export async function loadSetData(): Promise<Dataset[]> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const res = await fetch(`${basePath}/data/data.csv`);
  const text = await res.text();
  return text
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [id, name, file] = line.split(",");
      return { id: Number(id), name: name.trim(), file: file.trim() };
    });
}

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
