"use client";

import { useState, useEffect } from "react";
import { loadHanjaData } from "@/lib/parseHanja";
import type { HanjaCard } from "@/types/hanja";

export function useHanjaData() {
  const [cards, setCards] = useState<HanjaCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHanjaData().then((data) => {
      setCards(data);
      setLoading(false);
    });
  }, []);

  return { cards, loading };
}
