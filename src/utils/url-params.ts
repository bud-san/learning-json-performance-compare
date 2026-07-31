import {
  DEFAULT_FILTER_PARAMS,
  type FilterParams,
} from "@/@types/filter-params";
import type { Category, Tag } from "@/@types/mt-record";
import { CATEGORIES, TAGS } from "./mock/constants";

function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

function isTag(value: string): value is Tag {
  return (TAGS as readonly string[]).includes(value);
}

export function parseFilterParams(search: URLSearchParams): FilterParams {
  const categoryRaw = search.get("category");
  const category =
    categoryRaw !== null && isCategory(categoryRaw) ? categoryRaw : null;

  const tags = search.getAll("tag").filter(isTag);

  const pageRaw = Number.parseInt(search.get("page") ?? "1", 10);
  const page = Number.isNaN(pageRaw) ? 1 : Math.max(1, pageRaw);

  return {
    category,
    tags,
    from: search.get("from"),
    to: search.get("to"),
    q: search.get("q") ?? "",
    page,
  };
}

// SSGビルド時のプリレンダーではwindowが存在しないため、その場合は既定値を返す。
export function readParamsFromLocationOrDefault(): FilterParams {
  if (typeof window === "undefined") return DEFAULT_FILTER_PARAMS;
  return parseFilterParams(new URLSearchParams(window.location.search));
}

export function serializeFilterParams(params: FilterParams): URLSearchParams {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  for (const tag of params.tags) sp.append("tag", tag);
  if (params.from) sp.set("from", params.from);
  if (params.to) sp.set("to", params.to);
  if (params.q) sp.set("q", params.q);
  if (params.page > 1) sp.set("page", String(params.page));
  return sp;
}

// フィルタ・ページネーション変更時に通常のページ遷移として扱う（フルページ遷移型サイトと
// 同じ遷移方式にし、アクセス解析の自動ページビュー計測に自然に乗せるため、
// SPA的なpushStateではなくフルリロードする）。
export function navigateToFilterParams(params: FilterParams): void {
  const sp = serializeFilterParams(params);
  const query = sp.toString();
  window.location.href = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;
}
