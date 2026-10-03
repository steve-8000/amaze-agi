import { expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { sha256Hex } from "../src/core/hash.ts";
import { cli, REPO, writeArtifact } from "./artifact.ts";

const EX = path.join(REPO, "examples", "coding-handoff");
const SESSION = { AMAZE_AGI_SESSION: "dot:rehearsal" };
const SOLUTION = `function isPort(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 65535;
}

export function parsePort(value: unknown): number {
  if (!isPort(value)) throw new Error(\`invalid port: \${String(value)}\`);
  return value;
}
`;

function sh(cwd: string, argv: string[]): { code: number; out: string } {
  const p = Bun.spawnSync(argv, { cwd, stdin: "ignore" });
  return { code: p.exitCode, out: `${p.stdout.toString()}${p.stderr.toString()}`.trim() };
}

// Rehearses examples/coding-handoff. The connector is a scripted stand-in; this proves the templates and
// ledger semantics, not that dot or OMP ran.
test("coding handoff: routed quote, unknown outcome reconciled, readback, attested receipt, delivery", () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "amaze-e2e-coding-"));
  fs.cpSync(path.join(EX, "fixture"), repo, { recursive: true });
  fs.writeFileSync(path.join(repo, ".gitignore"), ".amaze-agi/\n");
  expect(sh(repo, ["git", "init", "-q"]).code).toBe(0);
  const run = (args: string[]) => cli(repo, args, SESSION);

  const before = sh(repo, ["bun", "check.ts"]);
  expect(before.code).toBe(1);

  const created = run(["goal", "create", "--file", path.join(EX, "goal.json")]).json as {
    inEffect: number | null;
  };
  expect(created.inEffect).toBe(1);
  expect(run(["task", "add", "ports", "--file", path.join(EX, "task.json")]).code).toBe(0);
  const quote = run([
    "evidence",
    "quote",
    "ports",
    "--quote",
    "function isString(value: unknown): value is string {",
    "--anchor",
    path.join(EX, "anchor.json"),
    "--scope",
    "attribution",
    "--claim",
    "type predicates narrow unknown input",
  ]).json as { assessment: { level: string; status: string } };
  expect(quote.assessment).toMatchObject({ level: "source_verified", status: "supported" });

  expect(run(["target", "declare", repo]).code).toBe(0);
  const handoff = [
    "run",
    "handoff",
    "port-guard",
    "--executor",
    "omp",
    "--action",
    "edit src/port.ts; run bun check.ts",
    "--target",
    repo,
  ];
  const runId = (run(handoff).json as { id: string }).id;
  expect(
    run(["run", "outcome", runId, "--status", "unknown", "--detail", "reply lost after handoff"]).code,
  ).toBe(0);
  const retry = run(handoff);
  expect(retry.code).toBe(1);
  expect(retry.stderr).toContain("reconcile_required");

  // Stand-in connector: applies the change and runs the fixture's existing check unchanged.
  fs.writeFileSync(path.join(repo, "src", "port.ts"), SOLUTION);
  const after = sh(repo, ["bun", "check.ts"]);
  expect(sh(repo, ["git", "add", "src", "check.ts", ".gitignore"]).code).toBe(0);
  const tree = sh(repo, ["git", "write-tree"]).out;
  expect(after).toEqual({ code: 0, out: "check passed" });

  const sourceFile = path.join(repo, "readback-source.json");
  fs.writeFileSync(
    sourceFile,
    JSON.stringify({ kind: "connector", uri: "rehearsal://stand-in", repoSha: tree, path: "src/port.ts" }),
  );
  expect(
    run([
      "run",
      "reconcile",
      runId,
      "--applied",
      "--source",
      sourceFile,
      "--claim",
      "src/port.ts changed at tree",
    ]).code,
  ).toBe(0);
  const verified = run(["run", "verify", runId]).json as { status: string };
  const late = run(["run", "outcome", runId, "--status", "succeeded", "--detail", "late reply"]).json as {
    status: string;
    lateObservations: string[];
  };
  expect(verified.status).toBe("done");
  expect(late).toMatchObject({ status: "reconciled_applied", lateObservations: ["succeeded: late reply"] });

  const early = run(["goal", "close", "ports"]);
  expect(early.code).toBe(3);

  const template = fs.readFileSync(path.join(EX, "receipt.template.json"), "utf8");
  fs.writeFileSync(path.join(repo, "unfilled.json"), template);
  expect(run(["evidence", "record", "ports", "--file", path.join(repo, "unfilled.json")]).code).toBe(1);
  const filled = template
    .replace("<RUN_ID_FROM_run_handoff>", runId)
    .replace("<FIRST_OUTPUT_LINE> at <OBSERVED_AT_ISO8601>", after.out)
    .replace("<EXECUTOR_RUN_REFERENCE>", "rehearsal://stand-in")
    .replace("<FULL_40_CHAR_COMMIT_SHA>", tree);
  fs.writeFileSync(path.join(repo, "receipt.json"), filled);
  expect(run(["evidence", "record", "ports", "--file", path.join(repo, "receipt.json")]).code).toBe(0);

  const close = run(["goal", "close", "ports"]);
  const closed = close.json as {
    closed: boolean;
    checks: Array<{ criterionId: string; verification: string; status: string }>;
  };
  expect(close.code).toBe(0);

  fs.writeFileSync(path.join(repo, "report.md"), `parsePort guarded at tree ${tree}; check passed\n`);
  const local = sha256Hex(fs.readFileSync(path.join(repo, "report.md")));
  const upload = (sha: string) =>
    run([
      "delivery",
      "upload",
      "ports",
      "report.md",
      "--dest",
      "rehearsal-drive",
      "--status",
      "succeeded",
      "--detail",
      "stand-in",
      "--server-sha256",
      sha,
    ]).json as {
      id: string;
      upload: { phase: string };
    };
  const mismatch = upload("0".repeat(64));
  const good = upload(local);
  const attached = run([
    "delivery",
    "attach",
    good.id,
    "--container",
    "rehearsal-thread",
    "--status",
    "succeeded",
    "--detail",
    "listed",
    "--listed",
  ]).json as {
    attach: { phase: string };
  };

  const artifact = {
    demo: "coding-handoff",
    checkBefore: before.code,
    checkAfter: [after.code, after.out],
    tree,
    quote: [quote.assessment.level, quote.assessment.status],
    retryWhileUnknown: "reconcile_required",
    closure: closed.checks.map((c) => [c.criterionId, c.verification, c.status]),
    delivery: {
      mismatch: mismatch.upload.phase,
      upload: good.upload.phase,
      attach: attached.attach.phase,
      sha256: local,
    },
  };
  expect(artifact.closure).toEqual([
    ["guard", "executed", "supported"],
    ["check", "attested", "supported"],
  ]);
  expect(artifact.delivery).toMatchObject({ mismatch: "failed", upload: "verified", attach: "listed" });
  const out = writeArtifact("coding-handoff", artifact);
  expect(sha256Hex(fs.readFileSync(out.path))).toBe(out.sha256);
});
