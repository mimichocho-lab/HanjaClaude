"use client";

interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const percent = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="h-1 bg-gray-200">
      <div
        className="h-full bg-blue-400 transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
