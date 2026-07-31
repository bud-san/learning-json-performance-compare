import type { FilterParams } from "./filter-params";
import type { MtRecord } from "./mt-record";

export interface WorkerInitRequest {
  type: "init";
  dataUrl: string;
}

export interface WorkerFilterRequest {
  type: "filter";
  params: FilterParams;
  requestId: number;
}

export type WorkerRequest = WorkerInitRequest | WorkerFilterRequest;

export interface WorkerInitProgress {
  type: "init-progress";
  phase: "fetch-start" | "fetch-done" | "parse-done";
  elapsedMs: number;
}

export interface WorkerFilterResult {
  type: "filter-result";
  requestId: number;
  items: MtRecord[];
  total: number;
  totalPages: number;
  page: number;
  timings: {
    filterMs: number;
  };
}

export interface WorkerErrorResponse {
  type: "error";
  message: string;
}

export type WorkerResponse =
  | WorkerInitProgress
  | WorkerFilterResult
  | WorkerErrorResponse;
