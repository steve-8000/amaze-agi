import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { Engine } from "../src/core/engine.ts";
import { sequentialDeps } from "../src/core/ids.ts";
import { assessClaim, validateQuote } from "../src/research/quote.ts";
import { recordQuoteEvidence } from "../src/research/record.ts";
import { exportSectionMap, vendoredFilePath } from "../src/sources/index.ts";
import {
  approveInitial,
  goalSpec,
  HUMAN,
  makeTreeRepo,
  REPO_ROOT,
  syntheticRepoFiles,
  tmpDir,
} from "./helpers.ts";

const repo = makeTreeRepo(syntheticRepoFiles());
const git = (p: string, lines: [number, number]) => ({
  kind: "git" as const,
  repoDir: repo.dir,
  sha: repo.tree,
  path: p,
  lines,
});

describe("deterministic provenance on synthetic code", () => {
  test("correct quote, path and span verify; text_present becomes source_verified", async () => {
    const r = await validateQuote("export const RETRY_LIMIT = 3;", git("src/config.ts", [2, 2]));
    expect(r.provenance).toBe("verified");
    expect(r.matchMode).toBe("exact");
    expect(assessClaim(r, "text_present")).toMatchObject({ level: "source_verified", status: "supported" });
  });

  test("real text attributed to the wrong file is wrong_path and reports the actual location", async () => {
    const r = await validateQuote("export const RETRY_LIMIT = 3;", git("src/guarded.ts", [2, 2]));
    expect(r.provenance).toBe("wrong_path");
    expect(r.actual).toEqual([{ path: "src/config.ts", lines: [2, 2] }]);
    expect(assessClaim(r, "attribution")).toMatchObject({ level: "claimed", status: "contradicted" });
  });

  test("right file, wrong lines is wrong_span", async () => {
    const r = await validateQuote("export const TIMEOUT_MS = 5000;", git("src/config.ts", [1, 2]));
    expect(r.provenance).toBe("wrong_span");
    expect(r.actual).toEqual([{ path: "src/config.ts", lines: [3, 3] }]);
  });

  test("a path missing at the revision is a wrong anchor even if the quote exists elsewhere", async () => {
    const r = await validateQuote("export const RETRY_LIMIT = 3;", git("src/settings.ts", [2, 2]));
    expect(r.provenance).toBe("wrong_path");
    expect(assessClaim(r, "text_present").level).toBe("claimed");
  });

  test("fabricated quote is not_found", async () => {
    const r = await validateQuote("export const RETRY_LIMIT = 30;", git("src/config.ts", [2, 2]));
    expect(r.provenance).toBe("not_found");
  });

  test("missing or partial anchors prevent a strong claim without throwing", async () => {
    for (const anchor of [
      undefined,
      { ...git("src/config.ts", [2, 2]), lines: undefined },
      { ...git("src/config.ts", [2, 2]), path: undefined },
    ]) {
      const r = await validateQuote("export const RETRY_LIMIT = 3;", anchor);
      expect(r.provenance).toBe("missing_anchor");
      expect(assessClaim(r, "text_present")).toMatchObject({ level: "claimed", status: "inconclusive" });
    }
  });

  test("source fetch errors are inconclusive, never negative evidence or success", async () => {
    const badDir = await validateQuote("x", {
      kind: "git",
      repoDir: path.join(tmpDir(), "nope"),
      sha: repo.tree,
      path: "a",
      lines: [1, 1],
    });
    expect(badDir.provenance).toBe("fetch_error");
    const badSha = await validateQuote("x", {
      kind: "git",
      repoDir: repo.dir,
      sha: "0".repeat(40),
      path: "a",
      lines: [1, 1],
    });
    expect(badSha.provenance).toBe("fetch_error");
    expect(assessClaim(badSha, "defect")).toMatchObject({ level: "claimed", status: "inconclusive" });
  });

  test("a quoted line cannot establish a defect when a nearby guard was not evaluated", async () => {
    const r = await validateQuote(
      "return order.items.reduce((sum, n) => sum + n, 0);",
      git("src/guarded.ts", [6, 6]),
    );
    expect(r.provenance).toBe("verified");
    const a = assessClaim(r, "defect");
    expect(a).toMatchObject({ level: "read_observed", status: "inconclusive" });
    expect(a.notes.join(" ")).toContain("does not establish a defect");
    expect(r.context?.some((l) => l.includes("if (!order || !order.items)"))).toBe(true);
  });

  test("static presence in an unwired module is not verified runtime behavior", async () => {
    const r = await validateQuote("flags.audit = true;", git("src/unwired.ts", [3, 3]));
    expect(r.provenance).toBe("verified");
    expect(assessClaim(r, "runtime_behavior")).toMatchObject({
      level: "read_observed",
      status: "inconclusive",
    });
    expect(assessClaim(r, "runtime_behavior", { status: "contradicted" })).toMatchObject({
      level: "executed_test",
      status: "contradicted",
    });
  });

  test("recording keeps the lowered level and does not block other work", async () => {
    const dir = tmpDir();
    const engine = new Engine(path.join(dir, "s"), sequentialDeps());
    const goal = engine.createGoal(goalSpec(dir), HUMAN);
    approveInitial(engine, goal);
    const bad = await recordQuoteEvidence(
      engine,
      {
        goal: goal.id,
        quote: "export const RETRY_LIMIT = 3;",
        anchor: git("src/guarded.ts", [2, 2]),
        scope: "attribution",
        claim: "retry limit lives in guarded.ts",
        by: HUMAN,
      },
      REPO_ROOT,
    );
    expect(bad.receipt).toMatchObject({ level: "claimed", status: "contradicted" });
    const good = await recordQuoteEvidence(
      engine,
      {
        goal: goal.id,
        quote: "export const RETRY_LIMIT = 3;",
        anchor: git("src/config.ts", [2, 2]),
        scope: "attribution",
        claim: "retry limit lives in config.ts",
        by: HUMAN,
      },
      REPO_ROOT,
    );
    expect(good.receipt).toMatchObject({ level: "source_verified", status: "supported" });
    expect(good.receipt.source).toMatchObject({
      kind: "repo_file",
      repoSha: repo.tree,
      path: "src/config.ts",
      lines: [2, 2],
    });
  });
});

describe("pinned vendored sources and bundles", () => {
  const mappingId = "18-accessibility";
  const wcag = fs
    .readFileSync(vendoredFilePath(REPO_ROOT, mappingId, "references/WCAG.md"), "utf8")
    .split("\n");
  const skill = fs.readFileSync(vendoredFilePath(REPO_ROOT, mappingId, "SKILL.md"), "utf8");
  const a11y = fs.readFileSync(vendoredFilePath(REPO_ROOT, mappingId, "references/A11Y-PATTERNS.md"), "utf8");
  const idx = wcag.findIndex(
    (l) => l.trim().length > 40 && !skill.includes(l.trim()) && !a11y.includes(l.trim()),
  );
  const line = idx + 1;
  const quote = (wcag[idx] as string).trim();

  test("vendored anchor verifies only at the real nested path", async () => {
    expect(idx).toBeGreaterThanOrEqual(0);
    const ok = await validateQuote(
      quote,
      { kind: "vendored", mappingId, path: "references/WCAG.md", lines: [line, line] },
      REPO_ROOT,
    );
    expect(ok.provenance).toBe("verified");
    const wrong = await validateQuote(
      quote,
      { kind: "vendored", mappingId, path: "SKILL.md", lines: [1, 3] },
      REPO_ROOT,
    );
    expect(wrong.provenance).toBe("wrong_path");
    expect(wrong.actual[0]?.path).toBe("references/WCAG.md");
  });

  test("bundle line spans map back to the nested original and catch false path attribution", async () => {
    const sections = await exportSectionMap(REPO_ROOT, mappingId);
    const sec = sections.find((s) => s.path === "references/WCAG.md");
    expect(sec).toBeDefined();
    const bundleLine = (sec?.bundleStartLine as number) + line - 1;
    const bundle = fs
      .readFileSync(path.join(REPO_ROOT, "project-sources", `${mappingId}.md`), "utf8")
      .split("\n");
    expect(bundle[bundleLine - 1]).toBe(wcag[idx]);
    const ok = await validateQuote(
      quote,
      { kind: "bundle", mappingId, lines: [bundleLine, bundleLine], path: "references/WCAG.md" },
      REPO_ROOT,
    );
    expect(ok.provenance).toBe("verified");
    expect(ok.resolved).toEqual({ path: "references/WCAG.md", lines: [line, line] });
    const misattributed = await validateQuote(
      quote,
      { kind: "bundle", mappingId, lines: [bundleLine, bundleLine], path: "SKILL.md" },
      REPO_ROOT,
    );
    expect(misattributed.provenance).toBe("wrong_path");
    expect(misattributed.actual).toEqual([{ path: "references/WCAG.md", lines: [line, line] }]);
  });

  test("a tampered vendored file is a fetch error, not evidence", async () => {
    const root = tmpDir();
    fs.cpSync(path.join(REPO_ROOT, "third_party"), path.join(root, "third_party"), { recursive: true });
    const p = vendoredFilePath(root, mappingId, "references/WCAG.md");
    fs.appendFileSync(p, "tampered\n");
    const r = await validateQuote(
      quote,
      { kind: "vendored", mappingId, path: "references/WCAG.md", lines: [line, line] },
      root,
    );
    expect(r.provenance).toBe("fetch_error");
  });
});
