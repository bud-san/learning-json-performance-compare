import { useEffect, useState } from "react";
import { hasConsent, setConsent } from "@/utils/consent-storage";

// Before: 初期HTMLでは常に帯をドキュメントフロー上に表示した状態でSSGされ、
// マウント後のuseEffectでlocalStorageを確認してからDOM自体を削除する。
// JSの実行が始まるまでの間は帯がフローに乗ったまま表示され続けるため、
// 同意済みユーザーでも一瞬帯が見えてから消え、その分ページ全体が上に詰まってガクツキが起きる。
export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (hasConsent()) {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) return null;

  function handleAccept() {
    setConsent();
    setIsVisible(false);
  }

  return (
    <div className="flex h-12 items-center justify-center gap-3 bg-blue-600 px-4 text-center text-sm font-medium text-white">
      <span>Cookieを使用しています。</span>
      <button
        type="button"
        onClick={handleAccept}
        className="rounded bg-white/20 px-2 py-1 text-xs hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        同意する
      </button>
    </div>
  );
}
