"use client";

import { useState, useEffect } from "react";

const KEY = "hanjaWrongIds";

export function useWrongAnswers() {
  const [wrongIds, setWrongIds] = useState<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) setWrongIds(JSON.parse(stored));
  }, []);

  const addWrongId = (id: number) => {
    setWrongIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  const removeWrongId = (id: number) => {
    setWrongIds((prev) => {
      const next = prev.filter((x) => x !== id);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  return { wrongIds, addWrongId, removeWrongId };
}
