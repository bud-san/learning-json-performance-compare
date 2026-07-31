import { type ChangeEvent, type KeyboardEvent, useState } from "react";
import type { FilterParams } from "@/@types/filter-params";
import type { Category, Tag } from "@/@types/mt-record";
import { CATEGORIES, TAGS } from "@/utils/mock/constants";

interface FilterFormProps {
  value: FilterParams;
  onChange: (next: FilterParams) => void;
}

export function FilterForm({ value, onChange }: FilterFormProps) {
  // キーワード欄はIME変換中の1文字ごとの確定・フルリロードを避けるため、
  // ローカルstateで下書きを保持し、Enterキーまたはフォーカスが外れた時だけ親に伝える。
  const [queryDraft, setQueryDraft] = useState(value.q);

  function updateAndResetPage(patch: Partial<FilterParams>) {
    onChange({ ...value, ...patch, page: 1 });
  }

  function handleCategoryChange(e: ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value === "" ? null : (e.target.value as Category);
    updateAndResetPage({ category: next });
  }

  function handleTagToggle(tag: Tag) {
    const next = value.tags.includes(tag)
      ? value.tags.filter((t) => t !== tag)
      : [...value.tags, tag];
    updateAndResetPage({ tags: next });
  }

  function handleFromChange(e: ChangeEvent<HTMLInputElement>) {
    updateAndResetPage({ from: e.target.value === "" ? null : e.target.value });
  }

  function handleToChange(e: ChangeEvent<HTMLInputElement>) {
    updateAndResetPage({ to: e.target.value === "" ? null : e.target.value });
  }

  function handleQueryDraftChange(e: ChangeEvent<HTMLInputElement>) {
    setQueryDraft(e.target.value);
  }

  function commitQuery() {
    if (queryDraft === value.q) return;
    updateAndResetPage({ q: queryDraft });
  }

  function handleQueryKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // IME変換中のEnter（変換確定）ではisComposingがtrueになるため、
    // その場合は検索を実行せず変換確定のみとして扱う。
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      // <form>内でEnterを押すと暗黙的にsubmitが発生し、ページがリロードされて
      // クエリなしの状態に戻ってしまうため、デフォルト動作を止める。
      e.preventDefault();
      commitQuery();
    }
  }

  return (
    <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">カテゴリ</span>
        <select
          className="rounded border border-slate-300 px-2 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          value={value.category ?? ""}
          onChange={handleCategoryChange}
        >
          <option value="">すべて</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">キーワード</span>
        <input
          type="text"
          className="rounded border border-slate-300 px-2 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          value={queryDraft}
          onChange={handleQueryDraftChange}
          onKeyDown={handleQueryKeyDown}
          onBlur={commitQuery}
          placeholder="タイトルで検索（Enterで検索）"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">開始日</span>
        <input
          type="date"
          className="rounded border border-slate-300 px-2 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          value={value.from ?? ""}
          onChange={handleFromChange}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">終了日</span>
        <input
          type="date"
          className="rounded border border-slate-300 px-2 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          value={value.to ?? ""}
          onChange={handleToChange}
        />
      </label>

      <fieldset className="col-span-full flex flex-col gap-1 text-sm">
        <legend className="font-medium text-slate-700">
          タグ（複数選択可）
        </legend>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <label
              key={tag}
              className="flex items-center gap-1 rounded-full border border-slate-300 px-2 py-1 text-xs has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
            >
              <input
                type="checkbox"
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                checked={value.tags.includes(tag)}
                onChange={() => handleTagToggle(tag)}
              />
              {tag}
            </label>
          ))}
        </div>
      </fieldset>
    </form>
  );
}
