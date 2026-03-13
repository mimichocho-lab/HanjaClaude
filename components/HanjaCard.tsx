"use client";

import type { HanjaCard, HanjaFont } from "@/types/hanja";
import { HANJA_FONT_FAMILY } from "@/components/FlipCard";

interface Props {
  card: HanjaCard;
  selected?: boolean;
  onTap?: () => void;
  onLongPress?: () => void;
  deleteMode?: boolean;
  onDelete?: () => void;
  showMeaning?: boolean;
  hanjaFont?: HanjaFont;
}

export default function HanjaCardCell({
  card,
  selected = false,
  onTap,
  onLongPress,
  deleteMode = false,
  onDelete,
  showMeaning = true,
  hanjaFont = "haeseo",
}: Props) {
  let pressTimer: ReturnType<typeof setTimeout> | null = null;

  const handleTouchStart = () => {
    pressTimer = setTimeout(() => {
      onLongPress?.();
    }, 600);
  };

  const handleTouchEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
  };

  return (
    <div
      className={`relative aspect-square flex flex-col items-center justify-center rounded-lg border-2 cursor-pointer select-none
        ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}
        active:scale-95 transition-transform`}
      onClick={onTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 카드 번호 */}
      <span className="absolute top-1 right-1.5 text-[10px] text-gray-400">
        {card.id}
      </span>

      {/* 한자 */}
      <span className="text-3xl font-bold text-gray-800" style={{ fontFamily: HANJA_FONT_FAMILY[hanjaFont] }}>{card.hanja}</span>

      {/* 뜻음 */}
      {showMeaning && (
        <span className="text-[11px] text-gray-500 mt-0.5">
          {card.meaning} {card.pronunciation}
        </span>
      )}

      {/* 삭제 모드 X 버튼 */}
      {deleteMode && (
        <button
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center z-10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
