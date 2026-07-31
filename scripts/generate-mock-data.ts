import { writeFile } from "node:fs/promises";
import type { MtRecord } from "../src/@types/mt-record";
import { CATEGORIES, TAGS } from "../src/utils/mock/constants";

const RECORD_COUNT = 30_000;
const OUTPUT_PATH = new URL(
  "../public/mock-mt-data/mt-export.json",
  import.meta.url,
);
const THUMBNAIL_WIDTH = 640;
const THUMBNAIL_HEIGHT = 360;
const DATE_RANGE_START_MS = new Date("2022-01-01T00:00:00.000Z").getTime();
const DATE_RANGE_END_MS = new Date("2026-07-23T00:00:00.000Z").getTime();

const WORD_POOL = [
  "組織",
  "戦略",
  "改善",
  "分析",
  "顧客",
  "体験",
  "設計",
  "開発",
  "運用",
  "品質",
  "連携",
  "共有",
  "検証",
  "計測",
  "改良",
  "対応",
  "検討",
  "整理",
  "活用",
  "実践",
  "手順",
  "基盤",
  "環境",
  "課題",
  "方針",
  "体制",
  "施策",
  "運営",
  "調整",
  "確認",
];

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randomPick<T>(arr: readonly T[]): T {
  const index = Math.floor(Math.random() * arr.length);
  const value = arr[index];
  if (value === undefined) {
    throw new Error("randomPick: empty array");
  }
  return value;
}

function randomPickMultiple<T>(
  arr: readonly T[],
  min: number,
  max: number,
): T[] {
  const count = randomInt(min, max);
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomDateBetween(startMs: number, endMs: number): string {
  const t = startMs + Math.random() * (endMs - startMs);
  return new Date(t).toISOString();
}

function generateTitle(index: number, category: string): string {
  const word1 = randomPick(WORD_POOL);
  const word2 = randomPick(WORD_POOL);
  return `${word1}と${word2}に関する${category}記事 No.${index}`;
}

function generateBody(minChars: number, maxChars: number): string {
  const target = randomInt(minChars, maxChars);
  let text = "";
  while (text.length < target) {
    text += `${randomPick(WORD_POOL)}、`;
  }
  return `${text.slice(0, target)}。`;
}

function generateRecord(index: number): MtRecord {
  const category = randomPick(CATEGORIES);
  return {
    id: `mt-${String(index).padStart(6, "0")}`,
    title: generateTitle(index, category),
    body: generateBody(100, 180),
    category,
    tags: randomPickMultiple(TAGS, 1, 4),
    date: randomDateBetween(DATE_RANGE_START_MS, DATE_RANGE_END_MS),
    thumbnail: {
      url: `https://picsum.photos/seed/mt-${index}/${THUMBNAIL_WIDTH}/${THUMBNAIL_HEIGHT}`,
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
    },
  };
}

async function main(): Promise<void> {
  const records: MtRecord[] = [];
  for (let i = 0; i < RECORD_COUNT; i++) {
    records.push(generateRecord(i));
  }
  const json = JSON.stringify(records);
  await writeFile(OUTPUT_PATH, json, "utf-8");
  const sizeMb = Buffer.byteLength(json, "utf-8") / 1024 / 1024;
  console.log(
    `Generated ${records.length} records, ${sizeMb.toFixed(2)} MB -> ${OUTPUT_PATH.pathname}`,
  );
}

main();
