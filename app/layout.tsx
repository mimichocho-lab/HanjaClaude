import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "한자클로드",
  description: "구몬한자 B단계 카드 학습 앱",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen max-w-md mx-auto">{children}</body>
    </html>
  );
}
