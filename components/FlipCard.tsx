"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { HanjaCard, CardFace } from "@/types/hanja";

interface Props {
  card: HanjaCard;
  face: CardFace;
  onFlip: () => void;
  animated?: boolean;
}

export default function FlipCard({ card, face, onFlip, animated = true }: Props) {
  const isFlipped = face === "back";
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [card.id]);

  return (
    <div
      className="w-[90vw] mx-auto cursor-pointer"
      style={{ perspective: 1000 }}
      onClick={onFlip}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={animated ? { duration: 0.4, ease: "easeInOut" } : { duration: 0 }}
        style={{ transformStyle: "preserve-3d", position: "relative" }}
        className="w-full aspect-[3/4]"
      >
        {/* 앞면: 한자 */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg border border-gray-100"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="absolute top-3 right-0 w-[10%] text-center text-xs text-gray-400">
            {card.id}
          </span>
          <span className="text-8xl font-bold text-gray-800">{card.hanja}</span>
        </div>

        {/* 뒷면: 이미지 + 뜻음 */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-amber-50 rounded-2xl shadow-lg border border-amber-100"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <span className="absolute top-3 right-0 w-[10%] text-center text-xs text-gray-400">
            {card.id}
          </span>
          {card.imagePath && !imageError && (
            <img
              src={card.imagePath}
              alt={card.meaning}
              className="w-3/5 max-h-[45%] object-contain mb-2"
              onError={() => setImageError(true)}
            />
          )}
          <p className="text-3xl font-bold text-amber-700">
            {card.meaning} {card.pronunciation}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
