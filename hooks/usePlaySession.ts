"use client";

import { useState, useRef, useEffect } from "react";
import type { CardFace, HanjaCard, PlayOptions } from "@/types/hanja";

const SWIPE_THRESHOLD = 50;

export function usePlaySession(cards: HanjaCard[], options: PlayOptions) {
  const [playCards, setPlayCards] = useState<HanjaCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [face, setFace] = useState<CardFace>("front");
  const [done, setDone] = useState(false);
  const [animated, setAnimated] = useState(false);

  const touchStartX = useRef(0);
  const optionsRef = useRef(options);
  useEffect(() => { optionsRef.current = options; }, [options]);

  const resolveStartFace = (): CardFace => {
    const sf = optionsRef.current.startFace;
    return sf === "random" ? (Math.random() < 0.5 ? "front" : "back") : sf;
  };

  useEffect(() => {
    setFace(resolveStartFace());
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // 버튼 이동: 시작면으로 리셋 (F-09)
  const goToCard = (index: number) => {
    setCurrentIndex(index);
    setFace(resolveStartFace());
    setAnimated(false);
  };

  // 스와이프 이동: 현재 면 유지 (F-13)
  const swipeToCard = (index: number) => {
    setCurrentIndex(index);
    setAnimated(false);
  };

  const flipCard = () => {
    setAnimated(true);
    setFace((f) => (f === "front" ? "back" : "front"));
  };

  const handleSwipe = (deltaX: number) => {
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    if (deltaX > 0) {
      if (currentIndex > 0) swipeToCard(currentIndex - 1);
    } else {
      if (currentIndex < playCards.length - 1) swipeToCard(currentIndex + 1);
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
    animated,
    done,
    setDone,
    goToCard,
    flipCard,
    onTouchStart,
    onTouchEnd,
  };
}
