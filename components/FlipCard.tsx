"use client";

import { motion } from "framer-motion";
import type { HanjaCard, CardFace } from "@/types/hanja";

interface Props {
  card: HanjaCard;
  face: CardFace;
  onFlip: () => void;
}

export default function FlipCard({ card, face, onFlip }: Props) {
  const isFlipped = face === "back";

  return (
    <div
      className="w-full max-w-xs mx-auto cursor-pointer"
      style={{ perspective: 1000 }}
      onClick={onFlip}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d", position: "relative" }}
        className="w-full aspect-[3/4]"
      >
        {/* 앞면: 한자 */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg border border-gray-100"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="absolute top-3 right-4 text-sm text-gray-400">
            {card.id}
          </span>
          <span className="text-8xl font-bold text-gray-800">{card.hanja}</span>
          <span className="mt-4 text-gray-400 text-sm">탭해서 확인</span>
        </div>

        {/* 뒷면: 뜻음 */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-amber-50 rounded-2xl shadow-lg border border-amber-100"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <span className="absolute top-3 right-4 text-sm text-gray-400">
            {card.id}
          </span>
          <p className="text-5xl font-bold text-amber-700">{card.meaning}</p>
          <p className="text-2xl text-amber-500 mt-2">{card.pronunciation}</p>
          <span className="mt-4 text-gray-400 text-sm">탭해서 한자 보기</span>
        </div>
      </motion.div>
    </div>
  );
}
