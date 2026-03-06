"use client";

import { useState } from "react";
import type { HanjaCard } from "@/types/hanja";

export function useSelection(cards: HanjaCard[]) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggleCard = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === cards.length && cards.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cards.map((c) => c.id)));
    }
  };

  const selectedIdsArray = Array.from(selectedIds);

  return { selectedIds, selectedIdsArray, toggleCard, toggleAll };
}
