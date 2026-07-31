import type { CATEGORIES, TAGS } from "@/utils/mock/constants";

export type Category = (typeof CATEGORIES)[number];
export type Tag = (typeof TAGS)[number];

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface MtRecord {
  id: string;
  title: string;
  body: string;
  category: Category;
  tags: readonly Tag[];
  date: string;
  thumbnail: Thumbnail;
}
