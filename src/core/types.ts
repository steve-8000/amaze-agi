import type { DeliveryId, EvidenceId, GoalId, RunId, SessionRef, TaskId } from "./ids.ts";

/**
 * How a criterion is read back at the finish line. Local probes run where the helper runs (for example
 * inside an executor session). `receipt` criteria can only be satisfied by a recorded connector readback
 * and are reported as attested, not locally verified.
 */
export type ReadbackSpec =
  | { probe: "file_sha256"; path: string; sha256: string }
  | { probe: "file_contains"; path: string; text: string }
  | { probe: "json_pointer_equals"; path: string; pointer: string; value: unknown }
  | { probe: "http"; url: string; expectStatus: number; bodyIncludes?: string; timeoutMs?: number }
  | { probe: "command"; argv: string[]; expectExitCode: number; stdoutIncludes?: string; timeoutMs?: number }
  | { probe: "receipt"; expect: string };

export interface Criterion {
  id: string;
  text: string;
  readback: ReadbackSpec;
}

/** Caller-attested record of the user's words that set a revision; not authentication or execution permission. */
export interface CriteriaDecision {
  kind: "user_request" | "user_decision";
  /** The user's request or reply, quoted or referenced, as relayed by the recording session. */
  reference: string;
  recordedBy: SessionRef;
  at: number;
}

export interface CriteriaRevision {
  revision: number;
  criteria: Criterion[];
  /** sha256 over the canonical criteria JSON, so evidence binds to exact criteria. */
  criteriaHash: string;
  reason: string;
  at: number;
  proposedBy: SessionRef;
  decision?: CriteriaDecision;
}

export interface GoalBudget {
  maxTasks: number;
  maxRunsTotal: number;
  /** Absolute epoch ms after which no new handoff is recorded. */
  deadline?: number;
}

export type GoalStatus = "open" | "closed" | "cancelled";

export interface Goal {
  id: GoalId;
  title: string;
  scope: string;
  desiredOutcome: string;
  stopCriteria: string[];
  reporting: string;
  budget: GoalBudget;
  revisions: CriteriaRevision[];
  status: GoalStatus;
  cancelLatched: boolean;
  createdAt: number;
  closedAt?: number;
  closureEvidence?: EvidenceId[];
}

export interface TaskBudget {
  maxRuns: number;
}

export type TaskStatus = "pending" | "running" | "verifying" | "done" | "failed" | "cancelled";

export interface Task {
  id: TaskId;
  goalId: GoalId;
  title: string;
  dependsOn: TaskId[];
  owner?: string;
  budget: TaskBudget;
  stopCriteria: string[];
  verify: ReadbackSpec[];
  status: TaskStatus;
  runs: RunId[];
}

export type RunStatus =
  | "handed_off"
  | "succeeded"
  | "failed"
  | "unknown"
  | "reconciled_applied"
  | "reconciled_not_applied";

/** One handoff of one task to an existing executor or connector. amaze-agi records it; it does not execute. */
export interface Run {
  id: RunId;
  taskId: TaskId;
  goalId: GoalId;
  attempt: number;
  executor: string;
  action: string;
  target: string;
  session: SessionRef;
  status: RunStatus;
  handedOffAt: number;
  finishedAt?: number;
  detail?: string;
  lateObservations: string[];
}

export type SourceKind =
  | "repo_file"
  | "url"
  | "readback"
  | "gbrain"
  | "chatgpt_project"
  | "connector"
  | "vendored_source"
  | "human_observation";

export interface EvidenceSource {
  kind: SourceKind;
  uri: string;
  /** Git commit or tree SHA when the source is a repository file. */
  repoSha?: string;
  path?: string;
  /** Inclusive 1-based line span. */
  lines?: [number, number];
  /** Non-git revision marker (page revision, server SHA, ETag, content hash). */
  revision?: string;
}

export type EvidenceStatus = "supported" | "contradicted" | "inconclusive";

/** What a receipt is about; these are independent claims and never imply one another. */
export type ClaimKind =
  | "source_available"
  | "app_installed"
  | "app_selected"
  | "data_fetched"
  | "reasoning"
  | "execution_result"
  | "connector_readback"
  | "readback";

/** Strength of observation, weakest first. */
export type EvidenceLevel = "claimed" | "read_observed" | "source_verified" | "executed_test";

export interface EvidenceReceipt {
  id: EvidenceId;
  goalId: GoalId;
  taskId?: TaskId;
  runId?: RunId;
  criterionId?: string;
  criteriaRevision: number;
  source: EvidenceSource;
  claimKind: ClaimKind;
  claim: string;
  status: EvidenceStatus;
  level: EvidenceLevel;
  contentSha256?: string;
  observed?: string;
  /** Earlier receipt whose observation was re-bound to this revision after an applicability review. */
  reuses?: EvidenceId;
  recordedAt: number;
  recordedBy: SessionRef;
}

/** verified: destination hash equals source bytes; accepted: connector confirmed without a destination hash. */
export type UploadPhase = "verified" | "accepted" | "failed" | "unknown";
/** listed: a fresh listing showed the item; accepted: connector confirmed the attachment. */
export type AttachPhase = "not_started" | "listed" | "accepted" | "failed" | "unknown";

/** Delivery receipt: source bytes, upload and attachment are separate facts; recipient view is not observed. */
export interface Delivery {
  id: DeliveryId;
  goalId: GoalId;
  artifactPath: string;
  localSha256: string;
  bytes: number;
  destination: string;
  upload: { phase: UploadPhase; remoteRef?: string; serverSha256?: string; detail: string };
  attach: { phase: AttachPhase; container?: string; detail?: string };
}

export interface State {
  seq: number;
  goals: Record<string, Goal>;
  tasks: Record<string, Task>;
  runs: Record<string, Run>;
  evidence: Record<string, EvidenceReceipt>;
  deliveries: Record<string, Delivery>;
  /** `${namespace}:${alias}` -> canonical */
  aliases: Record<string, string>;
  targets: Record<string, true>;
}

export function emptyState(): State {
  return { seq: 0, goals: {}, tasks: {}, runs: {}, evidence: {}, deliveries: {}, aliases: {}, targets: {} };
}
