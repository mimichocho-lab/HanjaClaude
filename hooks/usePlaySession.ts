"use client";

import { useState, useRef, useEffect } from "react";
import type { CardFace, HanjaCard, PlayOptions } from "@/types/hanja";

export function usePlaySession(cards: HanjaCard[], options: PlayOptions) {
  const [playCards, setPlayCards] = useState<HanjaCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [face, setFace] = useState<CardFace>("front");
  const [done, setDone] = useState(false);
  const [animated, setAnimated] = useState(false);

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

  const flipCard = () => {
    setAnimated(true);
    setFace((f) => (f === "front" ? "back" : "front"));
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
  };
}
