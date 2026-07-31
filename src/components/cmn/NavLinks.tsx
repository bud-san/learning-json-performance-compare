import { withBase } from "@/utils/with-base";

interface NavLinksProps {
  current: "before" | "after";
}

export function NavLinks({ current }: NavLinksProps) {
  return (
    <nav className="flex gap-2 text-sm" aria-label="Before/After切り替え">
      <a
        href={withBase("compare/before")}
        className={`rounded px-3 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
          current === "before"
            ? "bg-slate-900 text-white"
            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
        }`}
        aria-current={current === "before" ? "page" : undefined}
      >
        Before（未対策版）
      </a>
      <a
        href={withBase("compare/after")}
        className={`rounded px-3 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
          current === "after"
            ? "bg-slate-900 text-white"
            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
        }`}
        aria-current={current === "after" ? "page" : undefined}
      >
        After（対策版）
      </a>
    </nav>
  );
}
