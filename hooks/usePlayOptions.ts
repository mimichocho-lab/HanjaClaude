"use client";

import { useState, useEffect } from "react";
import type { PlayOptions } from "@/types/hanja";

const KEY = "hanjaPlayOptions";
const DEFAULT: PlayOptions = { order: "sequential", startFace: "front" };

export function usePlayOptions() {
  const [options, setOptions] = useState<PlayOptions>(DEFAULT);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) setOptions(JSON.parse(stored));
  }, []);

  const updateOptions = (next: Partial<PlayOptions>) => {
    setOptions((prev) => {
      const updated = { ...prev, ...next };
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { options, updateOptions };
}
