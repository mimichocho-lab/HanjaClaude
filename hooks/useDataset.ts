"use client";

import { useState, useEffect } from "react";
import type { Dataset } from "@/types/hanja";

const STORAGE_KEY = "hanja_dataset";

export function getStoredDatasetFile(): string {
  if (typeof window === "undefined") return "hanjab.csv";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.file) return parsed.file;
    }
  } catch {}
  return "hanjab.csv";
}

export function useDataset(datasets: Dataset[], initialId?: number) {
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  useEffect(() => {
    if (datasets.length === 0) return;

    // 1순위: URL 파라미터 (initialId)
    if (initialId) {
      const found = datasets.find((d) => d.id === initialId);
      if (found) {
        setSelectedDataset(found);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
        return;
      }
    }

    // 2순위: localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: Dataset = JSON.parse(stored);
        const found = datasets.find((d) => d.id === parsed.id);
        if (found) { setSelectedDataset(found); return; }
      } catch {}
    }

    // 3순위: datasets[0] fallback
    setSelectedDataset(datasets[0]);
  }, [datasets, initialId]);

  const setDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
  };

  return { selectedDataset, setDataset };
}
