"use client";

import { useState, useEffect } from "react";
import { loadHanjaData } from "@/lib/parseHanja";
import type { HanjaCard } from "@/types/hanja";

export function useHanjaData(file: string) {
  const [cards, setCards] = useState<HanjaCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setCards([]);
    loadHanjaData(file)
      .then((data) => {
        setCards(data);
      })
      .catch((err) => {
        console.error("한자 데이터 로드 실패:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [file]);

  return { cards, loading };
}
