import type { Thumbnail } from "@/@types/mt-record";

interface RecordThumbnailProps {
  thumbnail: Thumbnail;
  alt: string;
}

// Before: 意図的にwidth/height/aspect-ratioを指定しない。
// 画像の実サイズが判明するまで領域が確保されず、読み込み完了時にレイアウトシフトが発生する。
export function RecordThumbnail({ thumbnail, alt }: RecordThumbnailProps) {
  return (
    <img
      src={thumbnail.url}
      alt={alt}
      className="w-full rounded object-cover"
    />
  );
}
