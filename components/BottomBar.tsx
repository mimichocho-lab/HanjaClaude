"use client";

interface Props {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onPlay: () => void;
}

export default function BottomBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onPlay,
}: Props) {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 safe-area-bottom">
      <span className="text-sm text-gray-600 flex-shrink-0">
        {selectedCount}장 선택
      </span>
      <button
        className="flex-shrink-0 px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 active:bg-gray-100"
        onClick={onSelectAll}
      >
        {allSelected ? "선택 해제" : "전체 선택"}
      </button>
      <button
        className={`flex-1 py-2 rounded-lg text-white font-semibold text-sm transition-colors
          ${selectedCount > 0 ? "bg-blue-500 active:bg-blue-600" : "bg-gray-300 cursor-not-allowed"}`}
        onClick={onPlay}
        disabled={selectedCount === 0}
      >
        플레이 시작
      </button>
    </div>
  );
}
