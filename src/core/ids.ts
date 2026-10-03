export type GoalId = `goal_${string}`;
export type TaskId = `task_${string}`;
export type RunId = `run_${string}`;
export type EvidenceId = `ev_${string}`;
export type DeliveryId = `dlv_${string}`;

export type IdPrefix = "goal" | "task" | "run" | "ev" | "dlv";

/**
 * Reference to the conversation/session that acted (a dot conversation, an executor session, a shell).
 * amaze-agi never mints these; it records whatever identifier the acting host exposes.
 */
export interface SessionRef {
  host: string;
  sessionId: string;
}

export interface Deps {
  now(): number;
  newId<P extends IdPrefix>(prefix: P): `${P}_${string}`;
}

export function defaultDeps(): Deps {
  return {
    now: () => Date.now(),
    newId: (prefix) => `${prefix}_${crypto.randomUUID().replaceAll("-", "")}` as const,
  };
}

/** Deterministic deps for tests and fixtures. */
export function sequentialDeps(start = 1_700_000_000_000): Deps & { advance(ms: number): void } {
  let clock = start;
  let counter = 0;
  return {
    now: () => clock,
    advance(ms: number) {
      clock += ms;
    },
    newId: (prefix) => `${prefix}_${String(++counter).padStart(6, "0")}` as const,
  };
}

const ID_RE = /^(goal|task|run|ev|dlv)_[A-Za-z0-9]+$/;

export function isCanonicalId<P extends IdPrefix>(value: string, prefix: P): value is `${P}_${string}` {
  const m = ID_RE.exec(value);
  return m !== null && m[1] === prefix;
}
