"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { HanjaCard, CardFace } from "@/types/hanja";

interface Props {
  card: HanjaCard;
  face: CardFace;
  onFlip: () => void;
  animated?: boolean;
  fontFamily?: string;
}

export default function FlipCard({ card, face, onFlip, animated = true, fontFamily }: Props) {
  const isFlipped = face === "back";
  const [imageError, setImageError] = useState(false);
  const meaningRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setImageError(false);
  }, [card.id]);

  useEffect(() => {
    const el = meaningRef.current;
    if (!el) return;
    let size = 0.3;
    el.style.fontSize = `calc(${size} * min(90vw, 80vh))`;
    while (el.scrollWidth > el.clientWidth && size > 0.05) {
      size = Math.round((size - 0.01) * 100) / 100;
      el.style.fontSize = `calc(${size} * min(90vw, 80vh))`;
    }
  }, [card.id]);

  return (
    <div
      className="mx-auto cursor-pointer"
      style={{ perspective: 1000, width: 'min(90vw, 80vh)', height: 'min(90vw, 80vh)' }}
      onClick={onFlip}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={animated ? { duration: 0.4, ease: "easeInOut" } : { duration: 0 }}
        style={{ transformStyle: "preserve-3d", position: "relative" }}
        className="w-full h-full"
      >
        {/* 앞면: 한자 */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg border border-gray-100"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="absolute top-3 right-0 w-[10%] text-center text-xs text-gray-400">
            {card.id}
          </span>
          <span
            className="font-bold text-gray-800"
            style={{ fontSize: 'calc(0.8 * min(90vw, 80vh))', fontFamily }}
          >
            {card.hanja}
          </span>
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
              className="w-3/5 max-h-[45%] object-contain"
              onError={() => setImageError(true)}
            />
          )}
          <p
            ref={meaningRef}
            className="absolute bottom-[30%] max-w-[80%] font-bold text-amber-700 text-center"
            style={{ fontSize: 'calc(0.3 * min(90vw, 80vh))', whiteSpace: 'nowrap' }}
          >
            {card.meaning} {card.pronunciation}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
