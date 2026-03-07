"use client";

import { useState, useEffect } from "react";
import type { HanjaCard } from "@/types/hanja";

const KEY = "hanjaSelectedIds";

export function useSelection(cards: HanjaCard[], initialIds?: number[]) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (initialIds && initialIds.length > 0) {
      const next = new Set(initialIds);
      setSelectedIds(next);
      localStorage.setItem(KEY, JSON.stringify(Array.from(next)));
      return;
    }
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

  const clearSelection = () => {
    setSelectedIds(new Set());
    localStorage.removeItem(KEY);
  };

  const selectedIdsArray = Array.from(selectedIds);

  return { selectedIds, selectedIdsArray, toggleCard, toggleAll, clearSelection };
}
