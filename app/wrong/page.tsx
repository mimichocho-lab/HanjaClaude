"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHanjaData } from "@/hooks/useHanjaData";
import { useWrongAnswers } from "@/hooks/useWrongAnswers";
import { usePlayOptions } from "@/hooks/usePlayOptions";
import HanjaCardCell from "@/components/HanjaCard";

export default function WrongPage() {
  const router = useRouter();
  const { cards: allCards, loading } = useHanjaData();
  const { wrongIds, removeWrongId } = useWrongAnswers();
  const { options } = usePlayOptions();
  const [deleteMode, setDeleteMode] = useState(false);

  const wrongCards = allCards.filter((c) => wrongIds.includes(c.id));

  const handlePlayAll = () => {
    if (wrongCards.length === 0) return;
    const ids = wrongCards.map((c) => c.id).join(",");
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
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            className="text-sm text-gray-500 active:text-gray-800"
            onClick={() => router.push("/")}
          >
            ← 홈
          </button>
          <h1 className="text-lg font-bold text-gray-800">오답 한자방</h1>
        </div>
        <div className="flex gap-2">
          {wrongCards.length > 0 && (
            <>
              <button
                className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                  deleteMode
                    ? "border-red-400 text-red-500 bg-red-50"
                    : "border-gray-300 text-gray-600"
                }`}
                onClick={() => setDeleteMode((v) => !v)}
              >
                {deleteMode ? "완료" : "삭제"}
              </button>
              <button
                className="text-sm px-3 py-1.5 rounded-lg bg-blue-500 text-white active:bg-blue-600"
                onClick={handlePlayAll}
              >
                전체 플레이
              </button>
            </>
          )}
        </div>
      </div>

      {/* 내용 */}
      {wrongCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-2">
          <p className="text-2xl">📭</p>
          <p className="text-gray-400 text-sm">아직 오답 한자가 없어요</p>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2 p-3">
          {wrongCards.map((card) => (
            <HanjaCardCell
              key={card.id}
              card={card}
              deleteMode={deleteMode}
              onDelete={() => removeWrongId(card.id)}
              onLongPress={() => setDeleteMode(true)}
              showMeaning={options.showMeaning}
            />
          ))}
        </div>
      )}
    </div>
  );
}
