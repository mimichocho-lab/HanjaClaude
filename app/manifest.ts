import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "한자클로드",
    short_name: "한자클로드",
    description: "구몬한자 B단계 카드 학습 앱",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#3b82f6",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
