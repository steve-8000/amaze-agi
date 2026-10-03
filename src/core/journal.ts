import type { Delivery, EvidenceReceipt, Goal, Run, State, Task } from "./types.ts";

export type Put =
  | { kind: "goal"; value: Goal }
  | { kind: "task"; value: Task }
  | { kind: "run"; value: Run }
  | { kind: "evidence"; value: EvidenceReceipt }
  | { kind: "delivery"; value: Delivery }
  | { kind: "alias"; key: string; canonical: string }
  | { kind: "target"; canonical: string };

/** One atomic, append-only journal line. `op` is the audited semantic operation. */
export interface JournalRecord {
  seq: number;
  at: number;
  op: string;
  puts: Put[];
}

export function applyPut(state: State, put: Put): void {
  switch (put.kind) {
    case "goal":
      state.goals[put.value.id] = put.value;
      return;
    case "task":
      state.tasks[put.value.id] = put.value;
      return;
    case "run":
      state.runs[put.value.id] = put.value;
      return;
    case "evidence":
      state.evidence[put.value.id] = put.value;
      return;
    case "delivery":
      state.deliveries[put.value.id] = put.value;
      return;
    case "alias":
      state.aliases[put.key] = put.canonical;
      return;
    case "target":
      state.targets[put.canonical] = true;
      return;
  }
}

export function applyRecord(state: State, record: JournalRecord): void {
  for (const put of record.puts) applyPut(state, put);
  state.seq = record.seq;
}
