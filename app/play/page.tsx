"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHanjaData } from "@/hooks/useHanjaData";
import { useWrongAnswers } from "@/hooks/useWrongAnswers";
import { usePlayOptions } from "@/hooks/usePlayOptions";
import { usePlaySession } from "@/hooks/usePlaySession";
import FlipCard from "@/components/FlipCard";
import ProgressBar from "@/components/ProgressBar";
import type { HanjaCard } from "@/types/hanja";

function PlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cards: allCards, loading } = useHanjaData();
  const { addWrongId } = useWrongAnswers();
  const { options } = usePlayOptions();
  const [filteredCards, setFilteredCards] = useState<HanjaCard[]>([]);

  useEffect(() => {
    if (loading || allCards.length === 0) return;
    const idsParam = searchParams.get("ids");
    if (!idsParam) return;
    const ids = new Set(idsParam.split(",").map(Number));
    setFilteredCards(allCards.filter((c) => ids.has(c.id)));
  }, [loading, allCards, searchParams]);

  const {
    playCards,
    currentIndex,
    face,
    done,
    wrongAdded,
    setWrongAdded,
    setDone,
    goToCard,
    flipCard,
    onTouchStart,
    onTouchEnd,
  } = usePlaySession(filteredCards, options);

  const handleAddWrong = () => {
    if (!playCards[currentIndex]) return;
    addWrongId(playCards[currentIndex].id);
    setWrongAdded(true);
  };

  if (loading || playCards.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 px-8">
        <p className="text-4xl">완료!</p>
        <p className="text-gray-500 text-center">
          {playCards.length}장 학습을 마쳤어요.
        </p>
        <button
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl"
          onClick={() => router.push("/")}
        >
          홈으로
        </button>
        <button
          className="w-full py-3 border border-gray-300 text-gray-600 rounded-xl"
          onClick={() => router.push("/wrong")}
        >
          오답 한자방
        </button>
      </div>
    );
  }

  const currentCard = playCards[currentIndex];

  return (
    <div className="min-h-screen flex flex-col">
      {/* 상단 네비 */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <button
          className="text-sm text-gray-500 active:text-gray-800"
          onClick={() => router.push("/")}
        >
          홈
        </button>
        <span className="text-sm font-medium text-gray-700">
          {currentIndex + 1} / {playCards.length}
        </span>
        <button
          className="text-sm text-gray-500 active:text-gray-800"
          onClick={() => router.push("/wrong")}
        >
          오답방
        </button>
      </div>

      <ProgressBar current={currentIndex + 1} total={playCards.length} />

      {/* 카드 영역 */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-8"
        onTouchStart={(e) => onTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => onTouchEnd(e.changedTouches[0].clientX)}
      >
        <FlipCard card={currentCard} face={face} onFlip={flipCard} />
      </div>

      {/* 하단 버튼 */}
      <div className="px-6 pb-8 flex gap-3">
        <button
          className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 text-sm active:bg-gray-100"
          onClick={() => currentIndex > 0 && goToCard(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          이전
        </button>
        <button
          className={`px-4 py-3 rounded-xl text-sm border transition-colors ${
            wrongAdded
              ? "border-red-300 bg-red-50 text-red-400"
              : "border-red-400 text-red-500 active:bg-red-50"
          }`}
          onClick={handleAddWrong}
          disabled={wrongAdded}
        >
          {wrongAdded ? "오답 추가됨" : "오답"}
        </button>
        <button
          className="flex-1 py-3 bg-blue-500 text-white rounded-xl text-sm font-semibold active:bg-blue-600"
          onClick={() =>
            currentIndex < playCards.length - 1
              ? goToCard(currentIndex + 1)
              : setDone(true)
          }
        >
          {currentIndex < playCards.length - 1 ? "다음" : "완료"}
        </button>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><p className="text-gray-400">로딩 중...</p></div>}>
      <PlayContent />
    </Suspense>
  );
}
