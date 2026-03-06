"use client";

import { useState, useEffect } from "react";
import type { HanjaCard } from "@/types/hanja";

const KEY = "hanjaSelectedIds";

export function useSelection(cards: HanjaCard[]) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) {
      const ids: number[] = JSON.parse(stored);
      setSelectedIds(new Set(ids));
    }
  }, []);

  const save = (next: Set<number>) => {
    localStorage.setItem(KEY, JSON.stringify(Array.from(next)));
  };

  const toggleCard = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      save(next);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next =
        prev.size === cards.length && cards.length > 0
          ? new Set<number>()
          : new Set(cards.map((c) => c.id));
      save(next);
      return next;
    });
  };

  const selectedIdsArray = Array.from(selectedIds);

  return { selectedIds, selectedIdsArray, toggleCard, toggleAll };
}
