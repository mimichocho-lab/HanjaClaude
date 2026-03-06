"use client";

import { useState, useRef, useEffect } from "react";
import type { CardFace, HanjaCard, PlayOptions } from "@/types/hanja";

const SWIPE_THRESHOLD = 50;

export function usePlaySession(cards: HanjaCard[], options: PlayOptions) {
  const [playCards, setPlayCards] = useState<HanjaCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [face, setFace] = useState<CardFace>("front");
  const [done, setDone] = useState(false);
  const [wrongAdded, setWrongAdded] = useState(false);

  const touchStartX = useRef(0);
  const startFaceRef = useRef<CardFace>("front");

  useEffect(() => {
    const resolved: CardFace =
      options.startFace === "random"
        ? Math.random() < 0.5 ? "front" : "back"
        : options.startFace;
    startFaceRef.current = resolved;
    setFace(resolved);
  }, [options.startFace]);

  useEffect(() => {
    if (cards.length === 0) return;
    const ordered =
      options.order === "random"
        ? [...cards].sort(() => Math.random() - 0.5)
        : cards;
    setPlayCards(ordered);
    setCurrentIndex(0);
    setDone(false);
  }, [cards, options.order]);

  const goToCard = (index: number) => {
    setCurrentIndex(index);
    setFace(startFaceRef.current);
    setWrongAdded(false);
  };

  const flipCard = () => setFace((f) => (f === "front" ? "back" : "front"));

  const handleSwipe = (deltaX: number) => {
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    if (deltaX > 0) {
      if (currentIndex > 0) goToCard(currentIndex - 1);
    } else {
      if (currentIndex < playCards.length - 1) goToCard(currentIndex + 1);
      else setDone(true);
    }
  };

  const onTouchStart = (clientX: number) => {
    touchStartX.current = clientX;
  };

  const onTouchEnd = (clientX: number) => {
    handleSwipe(touchStartX.current - clientX);
  };

  return {
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
  };
}
