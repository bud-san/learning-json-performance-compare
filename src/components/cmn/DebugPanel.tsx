import type { PerfMetrics } from "@/@types/perf-metrics";

interface DebugPanelProps {
  metrics: PerfMetrics;
}

// 一般的な目安値: Long Tasks合計が200ms以上、CLSが0.1以上で「良くない」とされる水準。
// これを超えたら警告色で強調し、数値の変化を見た目でも気づきやすくする。
const LONG_TASK_WARNING_MS = 200;
const CLS_WARNING_THRESHOLD = 0.1;

function formatMs(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(1)} ms`;
}

export function DebugPanel({ metrics }: DebugPanelProps) {
  const isLongTaskWarning = metrics.longTaskTotalMs >= LONG_TASK_WARNING_MS;
  const isClsWarning = metrics.cls >= CLS_WARNING_THRESHOLD;

  return (
    <section
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-300 bg-slate-100 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]"
      aria-label="計測パネル"
    >
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 p-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs font-medium text-slate-500">fetch時間</dt>
          <dd className="font-mono text-slate-900">
            {formatMs(metrics.fetchMs)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">parse時間</dt>
          <dd className="font-mono text-slate-900">
            {formatMs(metrics.parseMs)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">Long Tasks合計</dt>
          <dd
            className={`font-mono ${
              isLongTaskWarning
                ? "motion-safe:animate-pulse font-bold text-red-600"
                : "text-slate-900"
            }`}
          >
            {metrics.longTaskCount}件 / {metrics.longTaskTotalMs.toFixed(1)} ms
            {isLongTaskWarning && (
              <>
                <span className="ml-1" aria-hidden="true">
                  ⚠️
                </span>
                <span className="sr-only">（警告: 目安値を超えています）</span>
              </>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">CLS値</dt>
          <dd
            className={`font-mono ${
              isClsWarning
                ? "motion-safe:animate-pulse font-bold text-red-600"
                : "text-slate-900"
            }`}
          >
            {metrics.cls.toFixed(4)}
            {isClsWarning && (
              <>
                <span className="ml-1" aria-hidden="true">
                  ⚠️
                </span>
                <span className="sr-only">（警告: 目安値を超えています）</span>
              </>
            )}
          </dd>
        </div>
      </div>
    </section>
  );
}
