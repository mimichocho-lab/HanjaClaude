"use client";

import { useRouter } from "next/navigation";
import { usePlayOptions } from "@/hooks/usePlayOptions";

export default function OptionsPage() {
  const router = useRouter();
  const { options, updateOptions } = usePlayOptions();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-800">학습 설정</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* 순서 선택 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">카드 순서</p>
          <div className="flex gap-3">
            {[
              { value: "sequential", label: "번호 순서" },
              { value: "random", label: "랜덤" },
            ].map((opt) => (
              <button
                key={opt.value}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors
                  ${options.order === opt.value
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300"
                  }`}
                onClick={() =>
                  updateOptions({ order: opt.value as "sequential" | "random" })
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 시작 면 선택 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">시작 면</p>
          <div className="flex gap-3">
            {[
              { value: "front", label: "한자 먼저" },
              { value: "back", label: "뜻음 먼저" },
              { value: "random", label: "랜덤" },
            ].map((opt) => (
              <button
                key={opt.value}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors
                  ${options.startFace === opt.value
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300"
                  }`}
                onClick={() =>
                  updateOptions({
                    startFace: opt.value as "front" | "back" | "random",
                  })
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 홈으로 버튼 */}
      <div className="p-4">
        <button
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl active:bg-blue-600"
          onClick={() => router.push("/")}
        >
          홈으로
        </button>
      </div>
    </div>
  );
}
