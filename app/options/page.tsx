"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadSetData } from "@/lib/parseHanja";
import { useDataset } from "@/hooks/useDataset";
import { usePlayOptions } from "@/hooks/usePlayOptions";
import type { Dataset } from "@/types/hanja";

function OptionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { options, updateOptions } = usePlayOptions();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  useEffect(() => {
    loadSetData()
      .then((list) => setDatasets(list.sort((a, b) => a.id - b.id)))
      .catch((err) => console.error("데이터셋 목록 로드 실패:", err));
  }, []);

  const { selectedDataset, setDataset } = useDataset(datasets);

  const handleDatasetChange = (ds: Dataset) => {
    setDataset(ds);
    router.push("/");
  };

  const idsParam = searchParams.get("ids") ?? "";
  const setParam = searchParams.get("set") ?? "";
  const selectedCount = idsParam ? idsParam.split(",").filter(Boolean).length : 0;

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const url = `${window.location.origin}${basePath}/?ids=${idsParam}&set=${setParam}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-800">학습 설정</h1>
        <p className="text-sm text-gray-500 mt-0.5">총 {selectedCount}장 선택됨</p>
      </div>

      <div className="p-4 space-y-4">
        {/* 데이터셋 선택 (F-v9-03) */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">학습 셋</p>
          <div className="flex flex-col gap-2">
            {datasets.map((ds) => (
              <button
                key={ds.id}
                className={`w-full py-2.5 rounded-lg text-sm font-medium border transition-colors text-left px-3
                  ${selectedDataset?.id === ds.id
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300"
                  }`}
                onClick={() => handleDatasetChange(ds)}
              >
                {ds.name}
              </button>
            ))}
          </div>
        </div>

        {/* 카드 순서 */}
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
                onClick={() => updateOptions({ order: opt.value as "sequential" | "random" })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 시작 면 */}
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
                onClick={() => updateOptions({ startFace: opt.value as "front" | "back" | "random" })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 홈 화면 카드 순서 (F-v6-03) */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">홈 화면 카드 순서</p>
          <div className="flex gap-3">
            {[
              { value: "sequential", label: "번호 순서" },
              { value: "random", label: "랜덤" },
            ].map((opt) => (
              <button
                key={opt.value}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors
                  ${options.homeOrder === opt.value
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300"
                  }`}
                onClick={() => updateOptions({ homeOrder: opt.value as "sequential" | "random" })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 뜻음 표시 (F-08) */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">홈/오답방 뜻음 표시</p>
          <div className="flex gap-3">
            {[
              { value: true, label: "보이기" },
              { value: false, label: "숨기기" },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors
                  ${options.showMeaning === opt.value
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300"
                  }`}
                onClick={() => updateOptions({ showMeaning: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 선택 목록 URL 복사 (F-09) */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-2">선택 목록 URL 복사</p>
          <div className="flex gap-2 items-center">
            <p className="flex-1 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 font-mono truncate">
              {idsParam ? `…/?ids=${idsParam}&set=${setParam}` : "선택된 카드 없음"}
            </p>
            <button
              className="px-3 py-2 rounded-lg text-sm border border-gray-300 text-gray-600 active:bg-gray-100 flex-shrink-0"
              onClick={handleCopy}
              disabled={!idsParam}
            >
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
        </div>
      </div>

      {/* 홈으로 */}
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

export default function OptionsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><p className="text-gray-400">로딩 중...</p></div>}>
      <OptionsContent />
    </Suspense>
  );
}
