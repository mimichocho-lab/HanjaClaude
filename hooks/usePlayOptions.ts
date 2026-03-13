"use client";

import { useState, useEffect } from "react";
import type { PlayOptions } from "@/types/hanja";

const KEY = "hanjaPlayOptions";
const DEFAULT: PlayOptions = { order: "sequential", startFace: "front", showMeaning: true, homeOrder: "sequential", hanjaFontId: 1 };

export function usePlayOptions() {
  const [options, setOptions] = useState<PlayOptions>(DEFAULT);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) setOptions({ ...DEFAULT, ...JSON.parse(stored) });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        setOptions({ ...DEFAULT, ...JSON.parse(e.newValue) });
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
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
