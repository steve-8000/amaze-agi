import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { Engine, isAmazeError } from "../src/core/engine.ts";
import { sequentialDeps } from "../src/core/ids.ts";
import type { ReadbackPolicy } from "../src/core/readback.ts";
import { readState } from "../src/core/store.ts";
import { assessClaim, validateQuote } from "../src/research/quote.ts";
import { AGENT, fsSnapshot, goalSpec, HUMAN, tmpDir } from "./helpers.ts";

function setup() {
  const dir = tmpDir();
  const engine = new Engine(path.join(dir, "state"), sequentialDeps());
  const policy: ReadbackPolicy = { cwd: dir, allowedCommandPrefixes: [] };
  return { dir, engine, policy };
}

function code(fn: () => unknown): string | undefined {
  try {
    fn();
  } catch (err) {
    if (isAmazeError(err)) return err.code;
    throw err;
  }
  return undefined;
}

describe("focused regressions", () => {
  test("pure lookups create no state directory, lock or journal", () => {
    const { dir, engine } = setup();
    const before = fsSnapshot(dir);
    expect(engine.lookupGoal("trip")).toBeUndefined();
    expect(Object.keys(readState(path.join(dir, "state")).goals)).toEqual([]);
    expect(fsSnapshot(dir)).toEqual(before);
  });

  test("gates act on the canonical task an alias resolves to at that moment", () => {
    const { dir, engine } = setup();
    const goal = engine.createGoal(goalSpec(dir), HUMAN);
    const mine = engine.addTask(goal.id, {
      title: "mine",
      budget: { maxRuns: 2 },
      stopCriteria: [],
      verify: [],
      owner: HUMAN.sessionId,
    });
    const theirs = engine.addTask(goal.id, {
      title: "theirs",
      budget: { maxRuns: 2 },
      stopCriteria: [],
      verify: [],
      owner: AGENT.sessionId,
    });
    engine.declareTarget("repo");
    engine.bindAlias("task", "next", mine.id);
    engine.bindAlias("task", "next", theirs.id);
    expect(
      code(() =>
        engine.recordHandoff({
          task: "next",
          executor: "omp",
          action: "edit",
          target: "repo",
          session: HUMAN,
        }),
      ),
    ).toBe("not_owner");
    expect(
      engine.recordHandoff({ task: "next", executor: "omp", action: "edit", target: "repo", session: AGENT })
        .taskId,
    ).toBe(theirs.id);
  });

  test("a readback mismatch keeps the goal open", async () => {
    const { dir, engine, policy } = setup();
    const goal = engine.createGoal(goalSpec(dir), HUMAN);
    fs.writeFileSync(path.join(dir, "itinerary.md"), "Hotel: somewhere\n");
    const result = await engine.closeGoal(goal.id, policy, HUMAN);
    expect(result.closed).toBe(false);
    expect(result.checks).toMatchObject([{ criterionId: "itinerary", status: "contradicted" }]);
    expect(engine.lookupGoal(goal.id)?.status).toBe("open");
  });

  test("an unambiguous request binds r1; open scope and later material changes wait for a recorded user decision", async () => {
    const { dir, engine, policy } = setup();
    const source = { kind: "human_observation" as const, uri: "note:itinerary" };
    const evidence = (criteriaRevision: number, reuses?: string) =>
      engine.recordEvidence(
        {
          goal: "trip",
          criteriaRevision,
          source,
          claimKind: "reasoning",
          claim: "lodging chosen",
          status: "supported",
          level: "claimed",
          reuses,
        },
        AGENT,
      );

    const open = engine.createGoal(goalSpec(dir, { request: undefined, alias: "open" }), HUMAN);
    expect(
      code(() =>
        engine.recordEvidence(
          {
            goal: open.id,
            criteriaRevision: 1,
            source,
            claimKind: "reasoning",
            claim: "x",
            status: "supported",
            level: "claimed",
          },
          AGENT,
        ),
      ),
    ).toBe("stale_criteria");
    expect(code(() => engine.approveCriteria(open.id, 1, " ", AGENT))).toBe("invalid");
    expect(engine.approveCriteria(open.id, 1, "user: yes, that scope", AGENT).decision).toMatchObject({
      kind: "user_decision",
    });

    const goal = engine.createGoal(goalSpec(dir, { alias: "trip" }), HUMAN);
    expect(goal.revisions[0]?.decision).toMatchObject({ kind: "user_request", recordedBy: HUMAN });
    const first = evidence(1);

    fs.writeFileSync(path.join(dir, "itinerary.md"), "Lodging: inn\n");
    const r2 = engine.proposeCriteria(
      goal.id,
      [
        {
          id: "easy",
          text: "anything",
          readback: { probe: "file_contains", path: path.join(dir, "itinerary.md"), text: "" },
        },
      ],
      "agent wants an easier bar",
      AGENT,
    );
    const pending = await engine.closeGoal(goal.id, policy, AGENT);
    expect(pending).toMatchObject({ closed: false, revision: 1 });
    expect(pending.reason).toContain("awaits the user's decision");
    expect(code(() => engine.approveCriteria(goal.id, 1, "user: ok", AGENT))).toBe("conflict");

    engine.approveCriteria(goal.id, r2.revision, "user: fine, use the easier bar", AGENT);
    expect(engine.currentEvidence(goal.id).current).toEqual([]);
    expect(code(() => evidence(1))).toBe("stale_criteria");
    expect(code(() => evidence(2, "ev_999999"))).toBe("not_found");
    expect(evidence(2, first.id)).toMatchObject({ criteriaRevision: 2, reuses: first.id });
  });

  test("an UNKNOWN outcome blocks retries until reconciled; late replies do not overwrite it", () => {
    const { dir, engine } = setup();
    const goal = engine.createGoal(goalSpec(dir), HUMAN);
    const task = engine.addTask(goal.id, {
      title: "book",
      budget: { maxRuns: 3 },
      stopCriteria: [],
      verify: [],
    });
    engine.declareTarget("calendar");
    const req = {
      task: task.id,
      executor: "app",
      action: "create event",
      target: "calendar",
      session: HUMAN,
    };
    const first = engine.recordHandoff(req);
    engine.recordOutcome(first.id, { kind: "unknown", detail: "timeout" });
    expect(code(() => engine.recordHandoff(req))).toBe("reconcile_required");
    engine.reconcileRun(
      first.id,
      { applied: false, source: { kind: "connector", uri: "calendar:list" }, claim: "no event found" },
      HUMAN,
    );
    expect(engine.recordOutcome(first.id, { kind: "succeeded", detail: "late" })).toMatchObject({
      status: "reconciled_not_applied",
      lateObservations: ["succeeded: late"],
    });
    expect(engine.recordHandoff(req).attempt).toBe(2);
  });

  test("delivery: unknown reconciles first, a hash mismatch fails, a connector receipt is accepted and can be attached", () => {
    const { dir, engine } = setup();
    const goal = engine.createGoal(goalSpec(dir), HUMAN);
    const file = path.join(dir, "out.md");
    fs.writeFileSync(file, "result\n");
    const unknown = engine.recordUpload(goal.id, file, "drive", { status: "unknown", detail: "timeout" });
    expect(
      code(() => engine.recordUpload(goal.id, file, "drive", { status: "succeeded", detail: "retry" })),
    ).toBe("reconcile_required");
    expect(
      code(() =>
        engine.recordAttach(unknown.id, {
          status: "succeeded",
          container: "thread",
          listed: true,
          detail: "x",
        }),
      ),
    ).toBe("conflict");
    expect(
      engine.reconcileDelivery(unknown.id, { part: "upload", found: true, serverSha256: "f".repeat(64) })
        .upload.phase,
    ).toBe("failed");

    const accepted = engine.recordUpload(goal.id, file, "chat", {
      status: "succeeded",
      remoteRef: "file-1",
      detail: "connector receipt",
    });
    expect(accepted.upload.phase).toBe("accepted");
    const attachUnknown = engine.recordAttach(accepted.id, {
      status: "unknown",
      container: "thread",
      listed: false,
      detail: "lost",
    });
    expect(
      code(() =>
        engine.recordAttach(accepted.id, {
          status: "succeeded",
          container: "thread",
          listed: false,
          detail: "retry",
        }),
      ),
    ).toBe("reconcile_required");
    expect(
      engine.reconcileDelivery(attachUnknown.id, { part: "attach", found: true, listed: false }).attach.phase,
    ).toBe("accepted");
  });

  test("reasoning built on a verified quote stays qualified", async () => {
    const quoted = await validateQuote("x", undefined);
    expect(assessClaim(quoted, "reasoning")).toMatchObject({ status: "inconclusive" });
    expect(assessClaim({ provenance: "verified", actual: [], detail: "ok" }, "reasoning")).toMatchObject({
      level: "read_observed",
      status: "inconclusive",
    });
  });
});
