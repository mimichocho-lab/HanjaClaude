"use client";
import { useState, useEffect } from "react";
import { loadFontData } from "@/lib/parseHanja";
import type { FontEntry } from "@/types/hanja";

export function useFontData() {
  const [fonts, setFonts] = useState<FontEntry[]>([]);

  useEffect(() => {
    loadFontData()
      .then(setFonts)
      .catch((err) => console.error("폰트 목록 로드 실패:", err));
  }, []);

  return fonts;
}
