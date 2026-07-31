import type { Thumbnail } from "@/@types/mt-record";

interface RecordThumbnailProps {
  thumbnail: Thumbnail;
  alt: string;
}

// After: width/height属性とaspect-ratioを明示指定する。
// ブラウザは画像の実サイズが判明する前から領域を確保できるため、
// 読み込み完了前後でレイアウトが変化しない。
export function RecordThumbnail({ thumbnail, alt }: RecordThumbnailProps) {
  return (
    <img
      src={thumbnail.url}
      alt={alt}
      width={thumbnail.width}
      height={thumbnail.height}
      style={{ aspectRatio: `${thumbnail.width} / ${thumbnail.height}` }}
      loading="lazy"
      className="h-auto w-full rounded object-cover"
    />
  );
}
