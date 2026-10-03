import { expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { sha256Hex } from "../src/core/hash.ts";
import { cli, REPO, writeArtifact } from "./artifact.ts";

const EX = path.join(REPO, "examples", "noncoding-lookup");
const QUOTE =
  "| LCP, INP, CLS at p75 | Field | User-outcome Core Web Vitals; use for pass/fail prioritization |";

// Rehearses examples/noncoding-lookup through the real CLI with pinned sources; no executor involved.
test("noncoding lookup: routed source, exact quote, request-bound criteria, readback closure", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "amaze-e2e-lookup-"));
  fs.writeFileSync(path.join(project, ".gitignore"), ".amaze-agi/\n");

  const doctor = cli(project, ["doctor", "--no-probe"]).json as { overall: string };
  const plan = cli(project, ["research", "plan", "web-performance"]).json as {
    sources: Array<{ filename: string; sha256: string; upstreamCommit: string }>;
  };
  const status = cli(project, ["status", "report-basis"]).json;
  expect(fs.existsSync(path.join(project, ".amaze-agi"))).toBe(false);
  expect(doctor.overall).toBe("needs_project_registration");
  expect(status).toEqual({ kind: "none" });
  expect(plan.sources.map((s) => [s.filename, s.sha256])).toEqual([
    [
      "19-performance.md",
      sha256Hex(fs.readFileSync(path.join(REPO, "project-sources", "19-performance.md"))),
    ],
  ]);

  const created = cli(project, ["goal", "create", "--file", path.join(EX, "goal.json")]).json as {
    inEffect: number | null;
  };
  expect(created.inEffect).toBe(1);
  fs.copyFileSync(path.join(EX, "decision.example.md"), path.join(project, "decision.md"));
  const quote = (anchor: string) =>
    cli(project, [
      "evidence",
      "quote",
      "report-basis",
      "--quote",
      QUOTE,
      "--anchor",
      anchor,
      "--scope",
      "attribution",
      "--claim",
      "field p75 is the pass/fail basis",
    ]).json as { provenance: { provenance: string }; assessment: { level: string; status: string } };
  const right = quote(path.join(EX, "anchor.json"));
  const wrongAnchor = path.join(project, "wrong-anchor.json");
  fs.writeFileSync(
    wrongAnchor,
    JSON.stringify({
      kind: "vendored",
      mappingId: "19-performance",
      path: "references/MEASUREMENT.md",
      lines: [390, 390],
    }),
  );
  const wrong = quote(wrongAnchor);
  expect(right.assessment).toMatchObject({ level: "source_verified", status: "supported" });
  expect(wrong.provenance.provenance).not.toBe("verified");
  expect(wrong.assessment.level).not.toBe("source_verified");

  const close = cli(project, ["goal", "close", "report-basis"]);
  const closed = close.json as {
    closed: boolean;
    checks: Array<{ criterionId: string; verification: string; status: string }>;
  };
  expect(close.code).toBe(0);

  const artifact = {
    demo: "noncoding-lookup",
    route: plan.sources.map((s) => [s.filename, s.sha256, s.upstreamCommit]),
    rightQuote: [right.provenance.provenance, right.assessment.level, right.assessment.status],
    wrongQuote: [wrong.provenance.provenance, wrong.assessment.level, wrong.assessment.status],
    closure: closed.checks.map((c) => [c.criterionId, c.verification, c.status]),
    decisionSha256: sha256Hex(fs.readFileSync(path.join(project, "decision.md"))),
  };
  expect(artifact.closure).toEqual([
    ["decision", "executed", "supported"],
    ["citation", "executed", "supported"],
  ]);
  const out = writeArtifact("noncoding-lookup", artifact);
  expect(sha256Hex(fs.readFileSync(out.path))).toBe(out.sha256);
});
