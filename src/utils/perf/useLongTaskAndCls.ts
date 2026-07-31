import { useEffect, useRef, useState } from "react";

export interface LongTaskAndClsMetrics {
  longTaskCount: number;
  longTaskTotalMs: number;
  cls: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

const INITIAL_METRICS: LongTaskAndClsMetrics = {
  longTaskCount: 0,
  longTaskTotalMs: 0,
  cls: 0,
};

const LONG_TASK_THRESHOLD_MS = 50;

export function useLongTaskAndCls(): LongTaskAndClsMetrics {
  const [metrics, setMetrics] =
    useState<LongTaskAndClsMetrics>(INITIAL_METRICS);
  const longTaskCountRef = useRef(0);
  const longTaskTotalRef = useRef(0);
  const clsRef = useRef(0);

  useEffect(() => {
    if (typeof PerformanceObserver === "undefined") return;

    let longTaskObserver: PerformanceObserver | null = null;
    let clsObserver: PerformanceObserver | null = null;

    try {
      longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration >= LONG_TASK_THRESHOLD_MS) {
            longTaskCountRef.current += 1;
            longTaskTotalRef.current += entry.duration;
          }
        }
        setMetrics((prev) => ({
          ...prev,
          longTaskCount: longTaskCountRef.current,
          longTaskTotalMs: longTaskTotalRef.current,
        }));
      });
      longTaskObserver.observe({ type: "longtask", buffered: true });
    } catch {
      // Long Tasks API未対応環境は無視する
    }

    try {
      clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as LayoutShiftEntry[]) {
          if (!entry.hadRecentInput) {
            clsRef.current += entry.value;
          }
        }
        setMetrics((prev) => ({ ...prev, cls: clsRef.current }));
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch {
      // Layout Shift API未対応環境は無視する
    }

    return () => {
      longTaskObserver?.disconnect();
      clsObserver?.disconnect();
    };
  }, []);

  return metrics;
}
