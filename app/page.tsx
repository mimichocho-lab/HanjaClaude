"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHanjaData } from "@/hooks/useHanjaData";
import HanjaCardCell from "@/components/HanjaCard";
import BottomBar from "@/components/BottomBar";

export default function HomePage() {
  const router = useRouter();
  const { cards, loading } = useHanjaData();
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
    if (selectedIds.size === cards.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cards.map((c) => c.id)));
    }
  };

  const handlePlay = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds).join(",");
    router.push(`/play?ids=${ids}`);
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
      {/* 상단 바 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <h1 className="text-lg font-bold text-gray-800">한자클로드</h1>
        <div className="flex gap-2">
          <button
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 active:bg-gray-100"
            onClick={() => router.push("/wrong")}
          >
            오답방
          </button>
          <button
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 active:bg-gray-100"
            onClick={() => router.push("/options")}
          >
            설정
          </button>
        </div>
      </div>

      {/* 한자 그리드 */}
      <div className="grid grid-cols-5 gap-2 p-3">
        {cards.map((card) => (
          <HanjaCardCell
            key={card.id}
            card={card}
            selected={selectedIds.has(card.id)}
            onTap={() => toggleCard(card.id)}
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
