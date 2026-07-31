/** Astro の base とパスを安全に結合する（BASE_URL の末尾スラッシュ有無を吸収） */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return `${base}${path.replace(/^\//, "")}`;
}
