import * as fs from "node:fs";
import { AmazeError, fail } from "./errors.ts";
import { sha256Hex } from "./hash.ts";
import { aliasKey, lookupGoal, lookupTarget, resolveGoal, resolveTarget, resolveTask } from "./identity.ts";
import {
  type DeliveryId,
  type Deps,
  type EvidenceId,
  type GoalId,
  isCanonicalId,
  type RunId,
  type SessionRef,
  type TaskId,
} from "./ids.ts";
import { type ReadbackPolicy, type ReadbackResult, runReadback } from "./readback.ts";
import { Store, type Tx } from "./store.ts";
import type {
  ClaimKind,
  CriteriaRevision,
  Criterion,
  Delivery,
  EvidenceLevel,
  EvidenceReceipt,
  EvidenceSource,
  EvidenceStatus,
  Goal,
  GoalBudget,
  ReadbackSpec,
  Run,
  State,
  Task,
  TaskBudget,
} from "./types.ts";

export interface CriterionInput {
  id?: string;
  text: string;
  readback: ReadbackSpec;
}

export interface CreateGoalInput {
  title: string;
  scope: string;
  desiredOutcome: string;
  criteria: CriterionInput[];
  stopCriteria: string[];
  reporting: string;
  budget: GoalBudget;
  /**
   * The user's request that already fixes outcome and finish line, quoted or referenced. When present it
   * binds revision 1; when absent revision 1 stays proposed until the user decides the open scope.
   */
  request?: string;
  alias?: string;
}

export interface AddTaskInput {
  title: string;
  dependsOn?: string[];
  owner?: string;
  budget: TaskBudget;
  stopCriteria?: string[];
  verify?: ReadbackSpec[];
  alias?: string;
}

export interface EvidenceInput {
  goal: string;
  task?: string;
  run?: string;
  criterionId?: string;
  criteriaRevision: number;
  source: EvidenceSource;
  claimKind: Exclude<ClaimKind, "readback">;
  claim: string;
  status: EvidenceStatus;
  /** Callers may only assert weak levels; strong levels come from validators and local readbacks. */
  level: Extract<EvidenceLevel, "claimed" | "read_observed">;
  contentSha256?: string;
  observed?: string;
  /** Earlier receipt of this goal re-bound here after the caller reviewed that it still applies. */
  reuses?: string;
}

export interface HandoffRequest {
  task: string;
  /** Existing executor or connector, e.g. "omp" or a connected app name. */
  executor: string;
  action: string;
  target: string;
  session: SessionRef;
}

export type RunOutcome =
  | { kind: "succeeded"; detail: string }
  | { kind: "failed"; detail: string }
  | { kind: "unknown"; detail: string };

export interface CloseCheck {
  criterionId: string;
  verification: "executed" | "attested";
  status: EvidenceStatus;
  evidenceId: string;
}

export interface CloseResult {
  closed: boolean;
  goalId: GoalId;
  /** The user-decided revision the finish line was judged against. */
  revision: number;
  checks: CloseCheck[];
  evidence: EvidenceReceipt[];
  reason?: string;
}

export interface UploadReport {
  status: "succeeded" | "failed" | "unknown";
  remoteRef?: string;
  /** Hash reported by the destination's own readback, when available. */
  serverSha256?: string;
  detail: string;
}

export interface AttachReport {
  status: "succeeded" | "failed" | "unknown";
  container: string;
  /** True only when a fresh listing of the container showed the uploaded object. */
  listed: boolean;
  detail: string;
}

const SHA_RE = /^[0-9a-f]{40}([0-9a-f]{24})?$/;
const TERMINAL_TASK: Record<string, true> = { done: true, failed: true, cancelled: true };
const UNRESOLVED_RUN: Record<string, true> = { handed_off: true, unknown: true };

function requireText(value: string, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) fail("invalid", `${field} must be non-empty`);
  return value;
}

function normalizeCriteria(input: CriterionInput[]): Criterion[] {
  if (input.length === 0) fail("invalid", "a goal needs at least one acceptance criterion");
  const seen = new Set<string>();
  return input.map((c, i) => {
    const id = c.id ?? `c${i + 1}`;
    if (seen.has(id)) fail("invalid", `duplicate criterion id ${id}`);
    seen.add(id);
    return { id, text: requireText(c.text, "criterion.text"), readback: c.readback };
  });
}

export function criteriaHash(criteria: Criterion[]): string {
  return sha256Hex(Buffer.from(JSON.stringify(criteria), "utf8"));
}

/** The latest revision the user set by request or decision; proposed revisions never take effect on their own. */
export function effectiveRevision(goal: Goal): CriteriaRevision | undefined {
  return [...goal.revisions].reverse().find((r) => r.decision !== undefined);
}

function validateSource(source: EvidenceSource): void {
  requireText(source.uri, "source.uri");
  if (source.kind === "repo_file") {
    if (!source.repoSha) fail("invalid", "repo_file evidence requires a full commit/tree SHA");
    requireText(source.path ?? "", "source.path");
  }
  if (source.repoSha !== undefined && !SHA_RE.test(source.repoSha))
    fail("invalid", "source.repoSha must be a full commit/tree SHA");
  if (source.lines) {
    const [a, b] = source.lines;
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || b < a)
      fail("invalid", "source.lines must be 1-based [start,end]");
  }
}

/**
 * Job and evidence ledger. It records what dot and its executors did and judges the finish line from
 * readbacks; it never executes work, issues permissions, or schedules anything.
 */
export class Engine {
  readonly store: Store;

  constructor(
    home: string,
    readonly deps: Deps,
  ) {
    this.store = new Store(home, deps);
  }

  snapshot(): State {
    return this.store.snapshot();
  }

  /** Pure alias-aware lookup; returns undefined instead of creating. */
  lookupGoal(ref: string): Goal | undefined {
    const state = this.snapshot();
    const id = lookupGoal(state, ref);
    return id ? state.goals[id] : undefined;
  }

  createGoal(input: CreateGoalInput, by: SessionRef): Goal {
    return this.store.mutate("goal.create", (tx) => {
      if (input.alias !== undefined && lookupGoal(tx.state, input.alias))
        fail("conflict", `alias in use: ${input.alias}`);
      if (input.budget.maxTasks < 1 || input.budget.maxRunsTotal < 1)
        fail("invalid", "budget limits must be >= 1");
      const criteria = normalizeCriteria(input.criteria);
      const now = this.deps.now();
      const request = input.request === undefined ? undefined : requireText(input.request, "request");
      const goal: Goal = {
        id: this.deps.newId("goal"),
        title: requireText(input.title, "title"),
        scope: requireText(input.scope, "scope"),
        desiredOutcome: requireText(input.desiredOutcome, "desiredOutcome"),
        stopCriteria: input.stopCriteria,
        reporting: requireText(input.reporting, "reporting"),
        budget: input.budget,
        revisions: [
          {
            revision: 1,
            criteria,
            criteriaHash: criteriaHash(criteria),
            reason: "initial",
            at: now,
            proposedBy: by,
            decision:
              request === undefined
                ? undefined
                : { kind: "user_request", reference: request, recordedBy: by, at: now },
          },
        ],
        status: "open",
        cancelLatched: false,
        createdAt: now,
      };
      tx.put({ kind: "goal", value: goal });
      if (input.alias !== undefined)
        tx.put({ kind: "alias", key: aliasKey("goal", input.alias), canonical: goal.id });
      return goal;
    });
  }

  /** Proposes new criteria. They take effect only after `approveCriteria` records the user's decision. */
  proposeCriteria(
    goalRef: string,
    criteria: CriterionInput[],
    reason: string,
    by: SessionRef,
  ): CriteriaRevision {
    return this.store.mutate("goal.propose_criteria", (tx) => {
      const goal = this.openGoal(tx.state, goalRef);
      const normalized = normalizeCriteria(criteria);
      const revision: CriteriaRevision = {
        revision: (goal.revisions.at(-1)?.revision ?? 0) + 1,
        criteria: normalized,
        criteriaHash: criteriaHash(normalized),
        reason: requireText(reason, "reason"),
        at: this.deps.now(),
        proposedBy: by,
      };
      tx.put({ kind: "goal", value: { ...goal, revisions: [...goal.revisions, revision] } });
      return revision;
    });
  }

  /**
   * Records the user's decision on the newest proposed revision. The reply is caller-attested context:
   * the helper cannot authenticate the user, and the record grants no permission to execute anything.
   */
  approveCriteria(
    goalRef: string,
    revisionNumber: number,
    userReply: string,
    by: SessionRef,
  ): CriteriaRevision {
    return this.store.mutate("goal.approve_criteria", (tx) => {
      const goal = this.openGoal(tx.state, goalRef);
      const target =
        goal.revisions.find((r) => r.revision === revisionNumber) ??
        fail("not_found", `no revision ${revisionNumber}`);
      if (target.decision) fail("conflict", `revision ${revisionNumber} already decided`);
      if (target.revision !== goal.revisions.at(-1)?.revision)
        fail("conflict", "only the newest proposed revision can be decided");
      const approved: CriteriaRevision = {
        ...target,
        decision: {
          kind: "user_decision",
          reference: requireText(userReply, "user reply"),
          recordedBy: by,
          at: this.deps.now(),
        },
      };
      tx.put({
        kind: "goal",
        value: {
          ...goal,
          revisions: goal.revisions.map((r) => (r.revision === revisionNumber ? approved : r)),
        },
      });
      return approved;
    });
  }

  declareTarget(canonical: string): void {
    this.store.mutate("target.declare", (tx) => {
      requireText(canonical, "target");
      if (!tx.state.targets[canonical]) tx.put({ kind: "target", canonical });
    });
  }

  /** Binds or re-points an alias; gates always act on the canonical id it resolves to at that moment. */
  bindAlias(ns: "goal" | "task" | "target", alias: string, canonicalRef: string): string {
    return this.store.mutate("alias.bind", (tx) => {
      requireText(alias, "alias");
      const canonical =
        ns === "goal"
          ? resolveGoal(tx.state, canonicalRef)
          : ns === "task"
            ? resolveTask(tx.state, canonicalRef)
            : resolveTarget(tx.state, canonicalRef);
      if (ns === "target" && tx.state.targets[alias])
        fail("conflict", "a canonical target cannot become an alias");
      tx.put({ kind: "alias", key: aliasKey(ns, alias), canonical });
      return canonical;
    });
  }

  addTask(goalRef: string, input: AddTaskInput): Task {
    return this.store.mutate("task.add", (tx) => {
      const goal = this.openGoal(tx.state, goalRef);
      const existing = Object.values(tx.state.tasks).filter((t) => t.goalId === goal.id).length;
      if (existing >= goal.budget.maxTasks) fail("budget_exhausted", `goal ${goal.id} reached maxTasks`);
      if (input.budget.maxRuns < 1) fail("invalid", "task maxRuns must be >= 1");
      const dependsOn = (input.dependsOn ?? []).map((ref) => {
        const id = resolveTask(tx.state, ref);
        if (tx.state.tasks[id]?.goalId !== goal.id)
          fail("invalid", `dependency ${ref} belongs to another goal`);
        return id;
      });
      if (input.alias !== undefined && tx.state.aliases[aliasKey("task", input.alias)])
        fail("conflict", `alias in use: ${input.alias}`);
      const task: Task = {
        id: this.deps.newId("task"),
        goalId: goal.id,
        title: requireText(input.title, "title"),
        dependsOn,
        owner: input.owner,
        budget: input.budget,
        stopCriteria: input.stopCriteria ?? [],
        verify: input.verify ?? [],
        status: "pending",
        runs: [],
      };
      tx.put({ kind: "task", value: task });
      if (input.alias !== undefined)
        tx.put({ kind: "alias", key: aliasKey("task", input.alias), canonical: task.id });
      return task;
    });
  }

  claimTask(taskRef: string, owner: string): Task {
    return this.store.mutate("task.claim", (tx) => {
      const task = this.taskOf(tx.state, taskRef);
      if (task.owner !== undefined && task.owner !== owner)
        fail("not_owner", `task ${task.id} owned by ${task.owner}`);
      const next = { ...task, owner: requireText(owner, "owner") };
      tx.put({ kind: "task", value: next });
      return next;
    });
  }

  /** Completes a task that needed no handoff, only when its own readbacks pass. */
  async completeTask(taskRef: string, policy: ReadbackPolicy, by: SessionRef): Promise<Task> {
    const task = this.taskOf(this.snapshot(), taskRef);
    if (task.verify.length === 0)
      fail("invalid", `task ${task.id} has no readback probes; completion needs evidence`);
    const results = await Promise.all(task.verify.map((spec) => runReadback(spec, policy)));
    return this.store.mutate("task.complete", (tx) => {
      const fresh = this.taskOf(tx.state, task.id);
      if (TERMINAL_TASK[fresh.status]) fail("conflict", `task ${fresh.id} already ${fresh.status}`);
      const goal = this.openGoal(tx.state, fresh.goalId);
      this.assertDependencies(tx.state, fresh);
      const revision = this.revisionNumber(goal);
      for (const r of results) this.putReadback(tx, goal.id, revision, r, { taskId: fresh.id, by });
      const ok = results.every((r) => r.status === "supported");
      const next: Task = { ...fresh, status: ok ? "done" : fresh.status };
      if (ok) tx.put({ kind: "task", value: next });
      return next;
    });
  }

  recordEvidence(input: EvidenceInput, by: SessionRef): EvidenceReceipt {
    return this.store.mutate("evidence.record", (tx) => {
      const goalId = resolveGoal(tx.state, input.goal);
      const goal = tx.state.goals[goalId] as Goal;
      const effective = effectiveRevision(goal);
      if (!effective) fail("stale_criteria", "no criteria set by the user's request or decision yet");
      if (input.criteriaRevision !== effective.revision) {
        fail(
          "stale_criteria",
          `evidence targets criteria revision ${input.criteriaRevision}; current revision is ${effective.revision}`,
        );
      }
      let reuses: EvidenceId | undefined;
      if (input.reuses !== undefined) {
        const prior = isCanonicalId(input.reuses, "ev") ? tx.state.evidence[input.reuses] : undefined;
        if (!prior || prior.goalId !== goalId)
          fail("not_found", `unknown evidence ${input.reuses} for goal ${goalId}`);
        reuses = prior.id;
      }
      if (input.criterionId !== undefined && !effective.criteria.some((c) => c.id === input.criterionId)) {
        fail("invalid", `unknown criterion ${input.criterionId}`);
      }
      if (String(input.claimKind) === "readback")
        fail("invalid", "local readback receipts are produced only by the helper");
      if (input.level !== "claimed" && input.level !== "read_observed") {
        fail("invalid", "callers may assert only claimed/read_observed; stronger levels require validators");
      }
      if (!["supported", "contradicted", "inconclusive"].includes(input.status))
        fail("invalid", "bad status");
      validateSource(input.source);
      const runId = input.run;
      if (runId !== undefined && !(isCanonicalId(runId, "run") && tx.state.runs[runId]))
        fail("not_found", `unknown run ${runId}`);
      const receipt: EvidenceReceipt = {
        id: this.deps.newId("ev"),
        goalId,
        taskId: input.task === undefined ? undefined : resolveTask(tx.state, input.task),
        runId,
        criterionId: input.criterionId,
        criteriaRevision: effective.revision,
        source: input.source,
        claimKind: input.claimKind,
        claim: requireText(input.claim, "claim"),
        status: input.status,
        level: input.level,
        contentSha256: input.contentSha256,
        observed: input.observed,
        reuses,
        recordedAt: this.deps.now(),
        recordedBy: by,
      };
      tx.put({ kind: "evidence", value: receipt });
      return receipt;
    });
  }

  /** Records a receipt whose level was established by a deterministic validator (quote/anchor check). */
  recordValidatedEvidence(
    receipt: Omit<EvidenceReceipt, "id" | "recordedAt" | "criteriaRevision" | "goalId"> & { goal: string },
  ): EvidenceReceipt {
    return this.store.mutate("evidence.record_validated", (tx) => {
      const goalId = resolveGoal(tx.state, receipt.goal);
      const effective =
        effectiveRevision(tx.state.goals[goalId] as Goal) ??
        fail("stale_criteria", "no criteria set by the user's request or decision yet");
      validateSource(receipt.source);
      const { goal: _ref, ...rest } = receipt;
      const value: EvidenceReceipt = {
        ...rest,
        id: this.deps.newId("ev"),
        goalId,
        criteriaRevision: effective.revision,
        recordedAt: this.deps.now(),
      };
      tx.put({ kind: "evidence", value });
      return value;
    });
  }

  /**
   * Records that dot handed a task to an existing executor. Refuses when the goal is cancelled, the task
   * is blocked, the budget is spent, or a previous handoff is still unresolved (reconcile first).
   */
  recordHandoff(req: HandoffRequest): Run {
    return this.store.mutate("run.handoff", (tx) => {
      const s = tx.state;
      const task = this.taskOf(s, req.task);
      const goal = s.goals[task.goalId] as Goal;
      if (goal.cancelLatched || goal.status === "cancelled")
        fail("cancelled", `goal ${goal.id} is cancelled`);
      if (goal.status !== "open") fail("conflict", `goal ${goal.id} is ${goal.status}`);
      if (!effectiveRevision(goal))
        fail("conflict", "criteria not set by the user's request or decision yet");
      if (TERMINAL_TASK[task.status]) fail("conflict", `task ${task.id} is ${task.status}`);
      if (task.owner !== undefined && task.owner !== req.session.sessionId)
        fail("not_owner", `task ${task.id} owned by ${task.owner}`);
      this.assertDependencies(s, task);
      const pending = task.runs.map((id) => s.runs[id] as Run).find((r) => UNRESOLVED_RUN[r.status]);
      if (pending)
        fail(
          "reconcile_required",
          `run ${pending.id} is ${pending.status}; reconcile before another attempt`,
        );
      const now = this.deps.now();
      if (goal.budget.deadline !== undefined && now >= goal.budget.deadline)
        fail("budget_exhausted", "goal deadline passed");
      if (task.runs.length >= task.budget.maxRuns)
        fail("budget_exhausted", `task ${task.id} reached maxRuns`);
      const goalRuns = Object.values(s.runs).filter((r) => r.goalId === goal.id).length;
      if (goalRuns >= goal.budget.maxRunsTotal)
        fail("budget_exhausted", `goal ${goal.id} reached maxRunsTotal`);
      const target =
        lookupTarget(s, req.target) ?? fail("not_found", `unknown target ${req.target}; declare it first`);
      const run: Run = {
        id: this.deps.newId("run"),
        taskId: task.id,
        goalId: goal.id,
        attempt: task.runs.length + 1,
        executor: requireText(req.executor, "executor"),
        action: requireText(req.action, "action"),
        target,
        session: req.session,
        status: "handed_off",
        handedOffAt: now,
        lateObservations: [],
      };
      tx.put({ kind: "run", value: run });
      tx.put({ kind: "task", value: { ...task, status: "running", runs: [...task.runs, run.id] } });
      return run;
    });
  }

  /**
   * Records the executor's answer. `unknown` (timeout or lost answer after handoff) blocks further
   * attempts until reconciled. Answers arriving after a terminal state are kept as late observations.
   */
  recordOutcome(runId: RunId, outcome: RunOutcome): Run {
    return this.store.mutate("run.outcome", (tx) => {
      const run = tx.state.runs[runId] ?? fail("not_found", `unknown run ${runId}`);
      if (run.status !== "handed_off") {
        const late: Run = {
          ...run,
          lateObservations: [...run.lateObservations, `${outcome.kind}: ${outcome.detail}`],
        };
        tx.put({ kind: "run", value: late });
        return late;
      }
      const next: Run = { ...run, status: outcome.kind, finishedAt: this.deps.now(), detail: outcome.detail };
      tx.put({ kind: "run", value: next });
      const task = tx.state.tasks[run.taskId] as Task;
      if (!TERMINAL_TASK[task.status] && outcome.kind !== "unknown") {
        const goal = tx.state.goals[run.goalId] as Goal;
        const status: Task["status"] =
          outcome.kind === "succeeded"
            ? task.verify.length > 0
              ? "verifying"
              : "done"
            : goal.cancelLatched
              ? "cancelled"
              : "pending";
        tx.put({ kind: "task", value: { ...task, status } });
      }
      return next;
    });
  }

  /** Immediate post-success readback of the task's own probes (application + verification). */
  async verifyRun(runId: RunId, policy: ReadbackPolicy): Promise<Task> {
    const state = this.snapshot();
    const run = state.runs[runId] ?? fail("not_found", `unknown run ${runId}`);
    const task = state.tasks[run.taskId] as Task;
    const results = await Promise.all(task.verify.map((spec) => runReadback(spec, policy)));
    return this.store.mutate("run.verify", (tx) => {
      const fresh = tx.state.tasks[task.id] as Task;
      const freshRun = tx.state.runs[runId] as Run;
      if (freshRun.status !== "succeeded" && freshRun.status !== "reconciled_applied") {
        fail("conflict", `run ${runId} is ${freshRun.status}; nothing to verify`);
      }
      if (fresh.status !== "verifying") return fresh;
      const goal = tx.state.goals[fresh.goalId] as Goal;
      for (const r of results)
        this.putReadback(tx, goal.id, this.revisionNumber(goal), r, {
          taskId: fresh.id,
          runId,
          by: run.session,
        });
      const next: Task = {
        ...fresh,
        status: results.every((r) => r.status === "supported") ? "done" : "failed",
      };
      tx.put({ kind: "task", value: next });
      return next;
    });
  }

  reconcileRun(
    runId: RunId,
    observation: { applied: boolean; source: EvidenceSource; claim: string },
    by: SessionRef,
  ): Run {
    return this.store.mutate("run.reconcile", (tx) => {
      const run = tx.state.runs[runId] ?? fail("not_found", `unknown run ${runId}`);
      if (!UNRESOLVED_RUN[run.status])
        fail("conflict", `run ${runId} is ${run.status}; only handed_off/unknown runs reconcile`);
      validateSource(observation.source);
      const goal = tx.state.goals[run.goalId] as Goal;
      const ev: EvidenceReceipt = {
        id: this.deps.newId("ev"),
        goalId: goal.id,
        taskId: run.taskId,
        runId,
        criteriaRevision: this.revisionNumber(goal),
        source: observation.source,
        claimKind: "execution_result",
        claim: requireText(observation.claim, "claim"),
        status: "supported",
        level: "read_observed",
        observed: observation.applied ? "applied" : "not_applied",
        recordedAt: this.deps.now(),
        recordedBy: by,
      };
      tx.put({ kind: "evidence", value: ev });
      const next: Run = {
        ...run,
        status: observation.applied ? "reconciled_applied" : "reconciled_not_applied",
        finishedAt: this.deps.now(),
        detail: `reconciled via ${ev.id}`,
      };
      tx.put({ kind: "run", value: next });
      const task = tx.state.tasks[run.taskId] as Task;
      if (!TERMINAL_TASK[task.status]) {
        const status: Task["status"] = observation.applied
          ? task.verify.length > 0
            ? "verifying"
            : "done"
          : goal.cancelLatched
            ? "cancelled"
            : "pending";
        tx.put({ kind: "task", value: { ...task, status } });
      }
      return next;
    });
  }

  /** Latches cancellation: no new handoffs. Work already handed off may still change the world. */
  cancelGoal(goalRef: string, reason: string): { goal: Goal; inFlight: Run[] } {
    return this.store.mutate("goal.cancel", (tx) => {
      requireText(reason, "reason");
      const goalId = resolveGoal(tx.state, goalRef);
      const goal = tx.state.goals[goalId] as Goal;
      if (goal.status === "closed") fail("conflict", `goal ${goalId} already closed`);
      const next: Goal = { ...goal, cancelLatched: true, status: "cancelled" };
      tx.put({ kind: "goal", value: next });
      for (const task of Object.values(tx.state.tasks)) {
        if (task.goalId === goalId && task.status === "pending")
          tx.put({ kind: "task", value: { ...task, status: "cancelled" } });
      }
      return {
        goal: next,
        inFlight: Object.values(tx.state.runs).filter((r) => r.goalId === goalId && UNRESOLVED_RUN[r.status]),
      };
    });
  }

  /**
   * Finish line: judged only against the latest USER-APPROVED criteria. Local probes are executed now;
   * `receipt` criteria need a matching connector readback receipt and are reported as attested.
   */
  async closeGoal(goalRef: string, policy: ReadbackPolicy, by: SessionRef): Promise<CloseResult> {
    const state = this.snapshot();
    const goalId = resolveGoal(state, goalRef);
    const goal = state.goals[goalId] as Goal;
    if (goal.status !== "open") fail("conflict", `goal ${goalId} is ${goal.status}`);
    const effective =
      effectiveRevision(goal) ?? fail("conflict", "criteria not set by the user's request or decision yet");
    const local = await Promise.all(
      effective.criteria.map((c) =>
        c.readback.probe === "receipt" ? undefined : runReadback(c.readback, policy),
      ),
    );
    return this.store.mutate("goal.close", (tx) => {
      const fresh = tx.state.goals[goalId] as Goal;
      if (fresh.status !== "open") fail("conflict", `goal ${goalId} is ${fresh.status}`);
      if (effectiveRevision(fresh)?.revision !== effective.revision)
        fail("stale_criteria", "approved criteria changed during readback");
      const evidence: EvidenceReceipt[] = [];
      const checks: CloseCheck[] = effective.criteria.map((c, i) => {
        const result = local[i];
        if (result) {
          const ev = this.putReadback(tx, goalId, effective.revision, result, {
            criterionId: c.id,
            claim: c.text,
            by,
          });
          evidence.push(ev);
          return { criterionId: c.id, verification: "executed", status: ev.status, evidenceId: ev.id };
        }
        const attested = Object.values(tx.state.evidence)
          .filter(
            (e) =>
              e.goalId === goalId &&
              e.criterionId === c.id &&
              e.criteriaRevision === effective.revision &&
              e.claimKind === "connector_readback",
          )
          .sort((a, b) => a.recordedAt - b.recordedAt)
          .at(-1);
        return {
          criterionId: c.id,
          verification: "attested",
          status: attested?.status ?? "inconclusive",
          evidenceId: attested?.id ?? "",
        };
      });
      const blockers: string[] = [];
      const failing = checks.filter((c) => c.status !== "supported").map((c) => c.criterionId);
      if (failing.length > 0) blockers.push(`readback not supported: ${failing.join(", ")}`);
      const latest = fresh.revisions.at(-1) as CriteriaRevision;
      if (!latest.decision) blockers.push(`revision ${latest.revision} awaits the user's decision`);
      const openTasks = Object.values(tx.state.tasks).filter(
        (t) => t.goalId === goalId && !TERMINAL_TASK[t.status],
      );
      if (openTasks.length > 0) blockers.push(`open tasks: ${openTasks.map((t) => t.id).join(", ")}`);
      const unresolved = Object.values(tx.state.runs).filter(
        (r) => r.goalId === goalId && UNRESOLVED_RUN[r.status],
      );
      if (unresolved.length > 0)
        blockers.push(`unreconciled runs: ${unresolved.map((r) => r.id).join(", ")}`);
      if (blockers.length > 0)
        return {
          closed: false,
          goalId,
          revision: effective.revision,
          checks,
          evidence,
          reason: blockers.join("; "),
        };
      tx.put({
        kind: "goal",
        value: {
          ...fresh,
          status: "closed",
          closedAt: this.deps.now(),
          closureEvidence: checks
            .map((c) => c.evidenceId)
            .filter((id): id is EvidenceId => isCanonicalId(id, "ev")),
        },
      });
      return { closed: true, goalId, revision: effective.revision, checks, evidence };
    });
  }

  /** Evidence bound to the current revision; older receipts are kept for audit and can be re-bound. */
  currentEvidence(goalRef: string): { current: EvidenceReceipt[]; stale: EvidenceReceipt[] } {
    const state = this.snapshot();
    const goalId = resolveGoal(state, goalRef);
    const revision = effectiveRevision(state.goals[goalId] as Goal)?.revision ?? 0;
    const all = Object.values(state.evidence).filter((e) => e.goalId === goalId);
    return {
      current: all.filter((e) => e.criteriaRevision === revision),
      stale: all.filter((e) => e.criteriaRevision !== revision),
    };
  }

  /**
   * Records an upload reported by the delivering connector. The local sha256 fixes the exact source bytes;
   * a matching destination hash makes the upload verified, a confirmed receipt without one makes it accepted.
   */
  recordUpload(goalRef: string, artifactPath: string, destination: string, report: UploadReport): Delivery {
    const bytes = fs.readFileSync(artifactPath);
    const localSha256 = sha256Hex(bytes);
    return this.store.mutate("delivery.upload", (tx) => {
      const goalId = resolveGoal(tx.state, goalRef);
      const prior = Object.values(tx.state.deliveries).find(
        (d) =>
          d.goalId === goalId &&
          d.destination === destination &&
          d.localSha256 === localSha256 &&
          d.upload.phase === "unknown",
      );
      if (prior)
        fail("reconcile_required", `delivery ${prior.id} upload is UNKNOWN; reconcile before another upload`);
      let phase: Delivery["upload"]["phase"];
      if (report.status === "unknown") phase = "unknown";
      else if (report.status === "failed") phase = "failed";
      else if (report.serverSha256 === undefined) phase = "accepted";
      else phase = report.serverSha256.toLowerCase() === localSha256 ? "verified" : "failed";
      const value: Delivery = {
        id: this.deps.newId("dlv"),
        goalId,
        artifactPath,
        localSha256,
        bytes: bytes.length,
        destination: requireText(destination, "destination"),
        upload: {
          phase,
          remoteRef: report.remoteRef,
          serverSha256: report.serverSha256,
          detail:
            phase === "failed" && report.status === "succeeded"
              ? `server sha256 differs from source bytes; ${report.detail}`
              : report.detail,
        },
        attach: { phase: "not_started" },
      };
      tx.put({ kind: "delivery", value });
      return value;
    });
  }

  /** Attachment is a separate outcome after a verified or accepted upload; a fresh listing makes it listed. */
  recordAttach(deliveryId: DeliveryId, report: AttachReport): Delivery {
    return this.store.mutate("delivery.attach", (tx) => {
      const d = tx.state.deliveries[deliveryId] ?? fail("not_found", `unknown delivery ${deliveryId}`);
      if (d.upload.phase !== "verified" && d.upload.phase !== "accepted")
        fail(
          "conflict",
          `delivery ${deliveryId} upload is ${d.upload.phase}; attach needs a verified or accepted upload`,
        );
      if (d.attach.phase === "unknown")
        fail("reconcile_required", `delivery ${deliveryId} attach is UNKNOWN; reconcile first`);
      if (d.attach.phase === "listed" || d.attach.phase === "accepted")
        fail("conflict", `delivery ${deliveryId} already attached`);
      let phase: Delivery["attach"]["phase"];
      if (report.status === "unknown") phase = "unknown";
      else if (report.status === "failed") phase = "failed";
      else phase = report.listed ? "listed" : "accepted";
      const value: Delivery = {
        ...d,
        attach: { phase, container: requireText(report.container, "container"), detail: report.detail },
      };
      tx.put({ kind: "delivery", value });
      return value;
    });
  }

  /** Resolves an UNKNOWN upload or attach from a lookup; only then may another attempt be recorded. */
  reconcileDelivery(
    deliveryId: DeliveryId,
    readback:
      | { part: "upload"; found: boolean; serverSha256?: string; remoteRef?: string }
      | { part: "attach"; found: boolean; listed: boolean },
  ): Delivery {
    return this.store.mutate("delivery.reconcile", (tx) => {
      const d = tx.state.deliveries[deliveryId] ?? fail("not_found", `unknown delivery ${deliveryId}`);
      if (readback.part === "upload") {
        if (d.upload.phase !== "unknown") fail("conflict", `upload is ${d.upload.phase}`);
        const ok = readback.found && readback.serverSha256?.toLowerCase() === d.localSha256;
        const phase: Delivery["upload"]["phase"] = !readback.found
          ? "failed"
          : readback.serverSha256 === undefined
            ? "accepted"
            : ok
              ? "verified"
              : "failed";
        const value: Delivery = {
          ...d,
          upload: {
            phase,
            remoteRef: readback.remoteRef ?? d.upload.remoteRef,
            serverSha256: readback.serverSha256,
            detail: `reconciled: ${phase}`,
          },
        };
        tx.put({ kind: "delivery", value });
        return value;
      }
      if (d.attach.phase !== "unknown") fail("conflict", `attach is ${d.attach.phase}`);
      const value: Delivery = {
        ...d,
        attach: {
          ...d.attach,
          phase: !readback.found ? "failed" : readback.listed ? "listed" : "accepted",
          detail: "reconciled",
        },
      };
      tx.put({ kind: "delivery", value });
      return value;
    });
  }

  private revisionNumber(goal: Goal): number {
    return effectiveRevision(goal)?.revision ?? 0;
  }

  private putReadback(
    tx: Tx,
    goalId: GoalId,
    revision: number,
    r: ReadbackResult,
    meta: { criterionId?: string; taskId?: TaskId; runId?: RunId; claim?: string; by: SessionRef },
  ): EvidenceReceipt {
    const ev: EvidenceReceipt = {
      id: this.deps.newId("ev"),
      goalId,
      taskId: meta.taskId,
      runId: meta.runId,
      criterionId: meta.criterionId,
      criteriaRevision: revision,
      source: r.source,
      claimKind: "readback",
      claim: meta.claim ?? "task verification readback",
      status: r.status,
      level: "executed_test",
      contentSha256: r.contentSha256,
      observed: r.observed,
      recordedAt: this.deps.now(),
      recordedBy: meta.by,
    };
    tx.put({ kind: "evidence", value: ev });
    return ev;
  }

  private openGoal(state: State, ref: string): Goal {
    const goal = state.goals[resolveGoal(state, ref)] as Goal;
    if (goal.status !== "open" || goal.cancelLatched) fail("conflict", `goal ${goal.id} is ${goal.status}`);
    return goal;
  }

  private taskOf(state: State, ref: string): Task {
    return state.tasks[resolveTask(state, ref)] as Task;
  }

  private assertDependencies(state: State, task: Task): void {
    const unmet = task.dependsOn.filter((id) => state.tasks[id]?.status !== "done");
    if (unmet.length > 0) fail("dependency_unmet", `task ${task.id} waits on ${unmet.join(", ")}`);
  }
}

export function isAmazeError(err: unknown, code?: AmazeError["code"]): err is AmazeError {
  return err instanceof AmazeError && (code === undefined || err.code === code);
}
