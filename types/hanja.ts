export interface Dataset {
  id: number;
  name: string;
  file: string;
}

export interface HanjaCard {
  id: number;
  hanja: string;
  meaning: string;
  pronunciation: string;
  imagePath?: string;
}

export type CardFace = "front" | "back";

export type HanjaFont = "haeseo" | "myeongjo" | "gungseo";

export interface PlayOptions {
  order: "sequential" | "random";
  startFace: "front" | "back" | "random";
  showMeaning: boolean;
  homeOrder: "sequential" | "random";
  hanjaFont: HanjaFont;
}
