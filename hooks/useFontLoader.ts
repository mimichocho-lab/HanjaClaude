"use client";
import { useEffect, useRef } from "react";
import type { FontEntry } from "@/types/hanja";

export function useFontLoader(fonts: FontEntry[], fontId: number): string {
  const loadedRef = useRef<Set<number>>(new Set());

  const entry = fonts.find((f) => f.id === fontId) ?? fonts[0];

  useEffect(() => {
    if (!entry || loadedRef.current.has(entry.id)) return;

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const font = new FontFace(entry.name, `url(${basePath}/font/${entry.file})`);
    font.load()
      .then((loaded) => {
        document.fonts.add(loaded);
        loadedRef.current.add(entry.id);
      })
      .catch((err) => console.error(`폰트 로드 실패: ${entry.name}`, err));
  }, [entry?.id, fonts.length]);

  return entry?.name ?? "";
}
