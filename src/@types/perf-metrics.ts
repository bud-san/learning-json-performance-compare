export interface PerfMetrics {
  fetchMs: number | null;
  parseMs: number | null;
  firstRenderMs: number | null;
  longTaskCount: number;
  longTaskTotalMs: number;
  cls: number;
}

export const INITIAL_PERF_METRICS: PerfMetrics = {
  fetchMs: null,
  parseMs: null,
  firstRenderMs: null,
  longTaskCount: 0,
  longTaskTotalMs: 0,
  cls: 0,
};
