import * as fs from "node:fs";
import { isRecord } from "../core/guards.ts";
import { sha256Hex } from "../core/hash.ts";
import type { EvidenceLevel, EvidenceStatus } from "../core/types.ts";
import { type ExportSection, exportSectionMap, loadLock, vendoredFilePath } from "../sources/index.ts";

export type Anchor =
  | { kind: "vendored"; mappingId: string; path?: string; lines?: [number, number] }
  | { kind: "bundle"; mappingId: string; lines?: [number, number]; path?: string }
  | { kind: "git"; repoDir: string; sha: string; path?: string; lines?: [number, number] };

/** Boundary parse for anchors from tools/CLI. Returns undefined (missing anchor) rather than guessing. */
export function parseAnchor(raw: unknown): Anchor | undefined {
  if (!isRecord(raw)) return undefined;
  const lines =
    Array.isArray(raw.lines) && raw.lines.length === 2 && raw.lines.every((n) => typeof n === "number")
      ? ([raw.lines[0], raw.lines[1]] as [number, number])
      : undefined;
  const p = typeof raw.path === "string" ? raw.path : undefined;
  if ((raw.kind === "vendored" || raw.kind === "bundle") && typeof raw.mappingId === "string") {
    return { kind: raw.kind, mappingId: raw.mappingId, path: p, lines };
  }
  if (raw.kind === "git" && typeof raw.repoDir === "string" && typeof raw.sha === "string") {
    return { kind: "git", repoDir: raw.repoDir, sha: raw.sha, path: p, lines };
  }
  return undefined;
}

export type Provenance =
  | "verified"
  | "wrong_path"
  | "wrong_span"
  | "not_found"
  | "missing_anchor"
  | "invalid_anchor"
  | "fetch_error";

export interface Location {
  path: string;
  lines: [number, number];
}

export interface ProvenanceResult {
  provenance: Provenance;
  /** Where the anchor resolved (bundle anchors resolve to the original nested file). */
  resolved?: Location;
  /** Where the quote actually occurs when the cited location is wrong. */
  actual: Location[];
  matchMode?: "exact" | "whitespace_normalized";
  /** Cited span widened by CONTEXT_LINES on both sides, numbered, for reviewers. */
  context?: string[];
  sourceSha256?: string;
  detail: string;
}

/** What the quote is offered to support. Only `text_present`/`attribution` can be settled by provenance. */
export type ClaimScope = "text_present" | "attribution" | "defect" | "runtime_behavior" | "reasoning";

export interface Assessment {
  level: EvidenceLevel;
  status: EvidenceStatus;
  notes: string[];
}

const CONTEXT_LINES = 5;
const MAX_SCAN_FILES = 2000;
const MAX_SCAN_BYTES = 1_000_000;

function normalizeWithLines(text: string): { norm: string; lineAt: number[] } {
  let norm = "";
  const lineAt: number[] = [];
  let line = 1;
  let pendingSpace = false;
  for (const ch of text) {
    if (/\s/.test(ch)) {
      if (norm.length > 0) pendingSpace = true;
    } else {
      if (pendingSpace) {
        norm += " ";
        lineAt.push(line);
        pendingSpace = false;
      }
      norm += ch;
      for (let i = 0; i < ch.length; i++) lineAt.push(line);
    }
    if (ch === "\n") line++;
  }
  return { norm, lineAt };
}

function normalizeQuote(quote: string): string {
  return quote.replace(/\s+/g, " ").trim();
}

function findAll(text: string, quote: string): Array<[number, number]> {
  const q = normalizeQuote(quote);
  if (q.length === 0) return [];
  const { norm, lineAt } = normalizeWithLines(text);
  const out: Array<[number, number]> = [];
  let from = 0;
  for (;;) {
    const idx = norm.indexOf(q, from);
    if (idx < 0) break;
    out.push([lineAt[idx] as number, lineAt[idx + q.length - 1] as number]);
    from = idx + 1;
  }
  return out;
}

function toLines(text: string): string[] {
  const lines = text.replaceAll("\r\n", "\n").split("\n");
  if (lines.at(-1) === "") lines.pop();
  return lines;
}

interface Corpus {
  /** Text of the anchored file. */
  text: string;
  path: string;
  sha256: string;
  /** Other files to search when the quote is not in the anchored file. */
  others(): Iterable<{ path: string; text: string }>;
  /** Maps a cited span in the anchor's coordinate space to the original file's lines. */
  span: [number, number];
}

function checkSpan(
  text: string,
  quote: string,
  span: [number, number],
): ProvenanceResult["matchMode"] | "out_of_range" | undefined {
  const lines = toLines(text);
  const [a, b] = span;
  if (a < 1 || b < a || b > lines.length) return "out_of_range";
  const spanText = lines.slice(a - 1, b).join("\n");
  if (spanText.includes(quote)) return "exact";
  return normalizeQuote(spanText).includes(normalizeQuote(quote)) ? "whitespace_normalized" : undefined;
}

function contextOf(text: string, span: [number, number]): string[] {
  const lines = toLines(text);
  const start = Math.max(1, span[0] - CONTEXT_LINES);
  const end = Math.min(lines.length, span[1] + CONTEXT_LINES);
  const out: string[] = [];
  for (let n = start; n <= end; n++)
    out.push(`${String(n).padStart(5)}${n >= span[0] && n <= span[1] ? ">" : " "} ${lines[n - 1]}`);
  return out;
}

function evaluate(corpus: Corpus, quote: string): ProvenanceResult {
  const base = { resolved: { path: corpus.path, lines: corpus.span }, sourceSha256: corpus.sha256 };
  const mode = checkSpan(corpus.text, quote, corpus.span);
  if (mode === "out_of_range") {
    return {
      ...base,
      provenance: "invalid_anchor",
      actual: [],
      detail: `span ${corpus.span.join("-")} outside ${corpus.path}`,
    };
  }
  if (mode) {
    return {
      ...base,
      provenance: "verified",
      actual: [],
      matchMode: mode,
      context: contextOf(corpus.text, corpus.span),
      detail: `quote found in ${corpus.path}:${corpus.span.join("-")}`,
    };
  }
  const sameFile = findAll(corpus.text, quote).map((lines) => ({ path: corpus.path, lines }));
  if (sameFile.length > 0) {
    return {
      ...base,
      provenance: "wrong_span",
      actual: sameFile,
      detail: `quote is in ${corpus.path} but not at the cited lines`,
    };
  }
  const elsewhere: Location[] = [];
  for (const other of corpus.others()) {
    for (const lines of findAll(other.text, quote)) elsewhere.push({ path: other.path, lines });
  }
  if (elsewhere.length > 0) {
    return {
      ...base,
      provenance: "wrong_path",
      actual: elsewhere,
      detail: `quote exists but in ${elsewhere.map((l) => l.path).join(", ")}, not ${corpus.path}`,
    };
  }
  return {
    ...base,
    provenance: "not_found",
    actual: [],
    detail: "quote not present in the pinned source scope",
  };
}

async function vendoredCorpus(
  root: string,
  mappingId: string,
  rel: string,
  span: [number, number],
): Promise<Corpus | string> {
  const lock = await loadLock(root);
  const entry = lock.skills.find((s) => s.mapping_id === mappingId);
  if (!entry) return `unknown mapping_id ${mappingId}`;
  const file = entry.files.find((f) => f.path === rel);
  if (!file) return `${rel} is not a file of ${mappingId}`;
  let bytes: Buffer;
  try {
    bytes = fs.readFileSync(vendoredFilePath(root, mappingId, rel));
  } catch (err) {
    return `cannot read vendored file: ${String(err)}`;
  }
  const sha = sha256Hex(bytes);
  if (sha !== file.sha256) return `vendored ${mappingId}/${rel} does not match lock sha256`;
  return {
    text: bytes.toString("utf8"),
    path: rel,
    sha256: sha,
    span,
    *others() {
      for (const f of entry.files) {
        if (f.path === rel) continue;
        const p = vendoredFilePath(root, mappingId, f.path);
        if (fs.existsSync(p)) yield { path: f.path, text: fs.readFileSync(p, "utf8") };
      }
    },
  };
}

function git(repoDir: string, args: string[]): { ok: boolean; out: Buffer; err: string } {
  const proc = Bun.spawnSync(["git", "-C", repoDir, ...args], { timeout: 20_000 });
  return { ok: proc.exitCode === 0, out: proc.stdout, err: proc.stderr.toString() };
}

/**
 * Deterministically checks that `quote` occurs at the anchored pinned source path and span.
 * It validates provenance only; it does not judge whether the surrounding reasoning is true.
 */
export async function validateQuote(
  quote: string,
  anchor: Anchor | undefined,
  root = ".",
): Promise<ProvenanceResult> {
  if (!anchor || anchor.lines === undefined || (anchor.kind !== "bundle" && !anchor.path)) {
    return {
      provenance: "missing_anchor",
      actual: [],
      detail: "quote needs a source path and a 1-based line span",
    };
  }
  if (normalizeQuote(quote).length === 0)
    return { provenance: "invalid_anchor", actual: [], detail: "empty quote" };
  const [a, b] = anchor.lines;
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || b < a) {
    return { provenance: "invalid_anchor", actual: [], detail: "lines must be a 1-based [start,end] span" };
  }

  if (anchor.kind === "vendored") {
    const corpus = await vendoredCorpus(root, anchor.mappingId, anchor.path as string, anchor.lines);
    if (typeof corpus === "string") return { provenance: "fetch_error", actual: [], detail: corpus };
    return evaluate(corpus, quote);
  }

  if (anchor.kind === "bundle") {
    let sections: ExportSection[];
    try {
      sections = await exportSectionMap(root, anchor.mappingId);
    } catch (err) {
      return { provenance: "fetch_error", actual: [], detail: `cannot map bundle: ${String(err)}` };
    }
    const section = sections.find((s) => a >= s.bundleStartLine && b <= s.bundleEndLine);
    if (!section) {
      return {
        provenance: "invalid_anchor",
        actual: [],
        detail: "bundle span does not lie inside one embedded file",
      };
    }
    const original: [number, number] = [a - section.bundleStartLine + 1, b - section.bundleStartLine + 1];
    const corpus = await vendoredCorpus(root, anchor.mappingId, section.path, original);
    if (typeof corpus === "string") return { provenance: "fetch_error", actual: [], detail: corpus };
    const result = evaluate(corpus, quote);
    if (anchor.path !== undefined && anchor.path !== section.path) {
      return {
        ...result,
        provenance: result.provenance === "verified" ? "wrong_path" : result.provenance,
        actual: result.provenance === "verified" ? [{ path: section.path, lines: original }] : result.actual,
        detail: `cited ${anchor.path} but bundle lines ${a}-${b} belong to ${section.path}`,
      };
    }
    return result;
  }

  const rel = anchor.path as string;
  if (!/^[0-9a-f]{40}$/.test(anchor.sha))
    return { provenance: "invalid_anchor", actual: [], detail: "git anchor needs a full SHA" };
  const show = git(anchor.repoDir, ["show", `${anchor.sha}:${rel}`]);
  if (!show.ok) {
    const missingPath = /does not exist in|exists on disk, but not in/.test(show.err);
    if (!missingPath)
      return { provenance: "fetch_error", actual: [], detail: `git show failed: ${show.err.trim()}` };
  }
  const listing = git(anchor.repoDir, ["ls-tree", "-r", "--name-only", anchor.sha]);
  if (!listing.ok)
    return { provenance: "fetch_error", actual: [], detail: `git ls-tree failed: ${listing.err.trim()}` };
  const files = listing.out.toString().split("\n").filter(Boolean).slice(0, MAX_SCAN_FILES);
  const others = function* () {
    for (const f of files) {
      if (f === rel) continue;
      const blob = git(anchor.repoDir, ["show", `${anchor.sha}:${f}`]);
      if (blob.ok && blob.out.length <= MAX_SCAN_BYTES && !blob.out.includes(0))
        yield { path: f, text: blob.out.toString("utf8") };
    }
  };
  if (!show.ok) {
    // Cited path does not exist at that revision: the anchor is wrong, but the quote may exist elsewhere.
    const elsewhere: Location[] = [];
    for (const o of others())
      for (const lines of findAll(o.text, quote)) elsewhere.push({ path: o.path, lines });
    return {
      provenance: elsewhere.length > 0 ? "wrong_path" : "not_found",
      actual: elsewhere,
      detail: `${rel} does not exist at ${anchor.sha}`,
    };
  }
  return evaluate(
    { text: show.out.toString("utf8"), path: rel, sha256: sha256Hex(show.out), span: anchor.lines, others },
    quote,
  );
}

/**
 * Maps provenance to evidence strength. Provenance can only settle that text exists where cited.
 * Defect, runtime and reasoning claims stay below verified unless an executed test supports them.
 */
export function assessClaim(
  result: ProvenanceResult,
  scope: ClaimScope,
  executedTest?: { status: EvidenceStatus },
): Assessment {
  switch (result.provenance) {
    case "fetch_error":
      return {
        level: "claimed",
        status: "inconclusive",
        notes: [`source could not be read: ${result.detail}`],
      };
    case "missing_anchor":
    case "invalid_anchor":
      return { level: "claimed", status: "inconclusive", notes: [`no usable anchor: ${result.detail}`] };
    case "wrong_path":
    case "wrong_span":
    case "not_found":
      return { level: "claimed", status: "contradicted", notes: [`attribution failed: ${result.detail}`] };
    case "verified":
      break;
  }
  if (scope === "text_present" || scope === "attribution") {
    return { level: "source_verified", status: "supported", notes: [result.detail] };
  }
  if (executedTest) {
    return {
      level: "executed_test",
      status: executedTest.status,
      notes: [result.detail, "claim settled by executed test"],
    };
  }
  const why: Record<string, string> = {
    defect:
      "a quoted line alone does not establish a defect; surrounding guards and callers were not evaluated",
    runtime_behavior: "static presence in source does not show the code is wired, reachable or executed",
    reasoning: "provenance does not validate the reasoning built on the quote",
  };
  return { level: "read_observed", status: "inconclusive", notes: [result.detail, why[scope] as string] };
}
