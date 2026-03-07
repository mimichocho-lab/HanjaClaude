"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadSetData } from "@/lib/parseHanja";
import { useHanjaData } from "@/hooks/useHanjaData";
import { useDataset } from "@/hooks/useDataset";
import { useSelection } from "@/hooks/useSelection";
import { usePlayOptions } from "@/hooks/usePlayOptions";
import HanjaCardCell from "@/components/HanjaCard";
import BottomBar from "@/components/BottomBar";
import type { Dataset } from "@/types/hanja";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  useEffect(() => {
    loadSetData()
      .then((list) => setDatasets(list.sort((a, b) => a.id - b.id)))
      .catch((err) => console.error("데이터셋 목록 로드 실패:", err));
  }, []);

  const { selectedDataset, changeDataset } = useDataset(datasets);
  const { cards, loading } = useHanjaData(selectedDataset?.file ?? "hanjab.csv");

  const idsParam = searchParams.get("ids");
  const initialIds = idsParam
    ? idsParam.split(",").map(Number).filter((n) => n > 0)
    : undefined;

  const { selectedIds, selectedIdsArray, toggleCard, toggleAll, clearSelection } = useSelection(cards, initialIds);
  const { options } = usePlayOptions();

  const [showPopup, setShowPopup] = useState(false);

  const handleDatasetChange = (dataset: Dataset) => {
    changeDataset(dataset);
    clearSelection();
    setShowPopup(false);
  };

  const displayCards = useMemo(() => {
    if (options.homeOrder !== "random") return cards;
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [cards, options.homeOrder]);

  const handlePlay = () => {
    if (selectedIds.size === 0) return;
    router.push(`/play?ids=${selectedIdsArray.join(",")}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* 팝업 백드롭 */}
      {showPopup && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowPopup(false)}
        />
      )}

      {/* 상단 바 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <div className="relative">
          <button
            className="text-lg font-bold text-gray-800 flex items-center gap-1 active:opacity-70"
            onClick={() => setShowPopup((v) => !v)}
          >
            {selectedDataset?.name ?? "로딩 중..."}
            <span className="text-xs text-gray-500">{showPopup ? "▲" : "▼"}</span>
          </button>

          {/* 데이터셋 선택 팝업 */}
          {showPopup && (
            <div className="absolute left-0 top-8 z-30 bg-white rounded-xl shadow-lg border border-gray-200 min-w-[180px]">
              {datasets.map((ds) => (
                <button
                  key={ds.id}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                  onClick={() => handleDatasetChange(ds)}
                >
                  <span className="w-4 text-blue-500">
                    {selectedDataset?.id === ds.id ? "✓" : ""}
                  </span>
                  {ds.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 active:bg-gray-100"
            onClick={() => router.push("/wrong")}
          >
            오답방
          </button>
          <button
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 active:bg-gray-100"
            onClick={() => router.push(`/options?ids=${selectedIdsArray.join(",")}`)}
          >
            설정
          </button>
        </div>
      </div>

      {/* 한자 그리드 */}
      <div className="grid grid-cols-5 gap-2 p-3">
        {displayCards.map((card) => (
          <HanjaCardCell
            key={card.id}
            card={card}
            selected={selectedIds.has(card.id)}
            onTap={() => toggleCard(card.id)}
            showMeaning={options.showMeaning}
          />
        ))}
      </div>

      {/* 하단 바 */}
      <BottomBar
        selectedCount={selectedIds.size}
        totalCount={cards.length}
        onSelectAll={toggleAll}
        onPlay={handlePlay}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><p className="text-gray-400">로딩 중...</p></div>}>
      <HomeContent />
    </Suspense>
  );
}
