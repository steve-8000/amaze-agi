import * as fs from "node:fs";
import * as path from "node:path";
import type { Profile } from "../config.ts";
import { fail } from "../core/errors.ts";
import { sha256Hex } from "../core/hash.ts";
import type { EvidenceReceipt } from "../core/types.ts";
import { exportSectionMap, loadLock, type Routing, vendoredFilePath } from "../sources/index.ts";

export const ROUTING_FILE = "config/research-routing.json";

export interface PlannedSource {
  filename: string;
  mappingId: string;
  sha256: string;
  bytes: number;
  upstreamRepository: string;
  upstreamCommit: string;
}

export interface ResearchPlan {
  taskKind: string;
  description: string;
  /** Example preference for the human/host choosing a ChatGPT reasoning setting; not an API parameter. */
  reasoningPreference: string;
  sources: PlannedSource[];
  nestedDocuments: string[];
}

export function loadRouting(root: string): Routing {
  const parsed: Routing = JSON.parse(fs.readFileSync(path.join(root, ROUTING_FILE), "utf8"));
  if (parsed.schema_version !== 1 || !Array.isArray(parsed.routes))
    fail("invalid", "unsupported routing registry");
  return parsed;
}

async function plannedSources(root: string, filenames: string[]): Promise<PlannedSource[]> {
  const lock = await loadLock(root);
  return filenames.map((filename) => {
    if (path.basename(filename) !== filename || !filename.endsWith(".md"))
      fail("invalid", `bad source filename ${filename}`);
    const mappingId = filename.slice(0, -3);
    const entry =
      lock.skills.find((s) => s.mapping_id === mappingId) ??
      fail("not_found", `no locked source for ${filename}`);
    const bytes = fs.readFileSync(path.join(root, "project-sources", filename));
    return {
      filename,
      mappingId,
      sha256: sha256Hex(bytes),
      bytes: bytes.length,
      upstreamRepository: entry.upstream_repository,
      upstreamCommit: entry.upstream_commit,
    };
  });
}

/** Exact-filename routing: the task kind selects specific project-source files, nothing fuzzy. */
export async function planResearch(root: string, taskKind: string): Promise<ResearchPlan> {
  const routing = loadRouting(root);
  const route =
    routing.routes.find((r) => r.task_kind === taskKind) ??
    fail("not_found", `no route for task kind ${taskKind}`);
  return {
    taskKind,
    description: route.description,
    reasoningPreference: route.reasoning_preference,
    sources: await plannedSources(root, route.sources),
    nestedDocuments: route.nested_documents ?? [],
  };
}

export interface ExcerptLine {
  originalLine: number;
  bundleLine: number;
  text: string;
}

export interface Excerpt {
  manifest: {
    filename: string;
    bundleSha256: string;
    mappingId: string;
    upstreamRepository: string;
    upstreamCommit: string;
    sectionPath: string;
    sectionSha256: string;
  };
  lines: ExcerptLine[];
}

/** Numbered excerpt of one nested file in a project-source bundle, for a host adapter to cite exactly. */
export async function excerpt(
  root: string,
  filename: string,
  sectionPath: string,
  span?: [number, number],
): Promise<Excerpt> {
  const [planned] = await plannedSources(root, [filename]);
  const source = planned as PlannedSource;
  const sections = await exportSectionMap(root, source.mappingId);
  const sec =
    sections.find((s) => s.path === sectionPath) ??
    fail("not_found", `${sectionPath} not embedded in ${filename}`);
  const lock = await loadLock(root);
  const file = lock.skills
    .find((s) => s.mapping_id === source.mappingId)
    ?.files.find((f) => f.path === sectionPath);
  const bytes = fs.readFileSync(vendoredFilePath(root, source.mappingId, sectionPath));
  const sectionSha256 = sha256Hex(bytes);
  if (!file || file.sha256 !== sectionSha256) fail("conflict", `${sectionPath} does not match lock`);
  const all = bytes.toString("utf8").replaceAll("\r\n", "\n").split("\n");
  if (all.at(-1) === "") all.pop();
  const [a, b] = span ?? [1, all.length];
  if (a < 1 || b < a || b > all.length) fail("invalid", `span ${a}-${b} outside 1-${all.length}`);
  return {
    manifest: {
      filename,
      bundleSha256: source.sha256,
      mappingId: source.mappingId,
      upstreamRepository: source.upstreamRepository,
      upstreamCommit: source.upstreamCommit,
      sectionPath,
      sectionSha256,
    },
    lines: all.slice(a - 1, b).map((text, i) => ({
      originalLine: a + i,
      bundleLine: sec.bundleStartLine + a - 1 + i,
      text,
    })),
  };
}

export type RegistrationState = "ready" | "partial" | "needs_project_registration";

export interface RegistrationStatus {
  state: RegistrationState;
  expected: string[];
  missing: string[];
  mismatched: string[];
  unproven: string[];
  note: string;
}

/**
 * Compares the user-recorded ChatGPT Project registration with the exact files the routing requires.
 * `ready` means a human/host recorded matching filename, sha256, revision and proof; it is not an API check.
 */
export async function registrationStatus(
  root: string,
  profile: Profile,
  taskKind?: string,
): Promise<RegistrationStatus> {
  const routing = loadRouting(root);
  const routes = taskKind ? routing.routes.filter((r) => r.task_kind === taskKind) : routing.routes;
  if (taskKind && routes.length === 0) fail("not_found", `no route for task kind ${taskKind}`);
  const expected = [...new Set(routes.flatMap((r) => r.sources))].sort();
  const planned = await plannedSources(root, expected);
  const regs = profile.chatgptProject.registeredSources;
  const missing: string[] = [];
  const mismatched: string[] = [];
  const unproven: string[] = [];
  for (const p of planned) {
    const reg = regs.find((r) => r.filename === p.filename);
    if (!reg) missing.push(p.filename);
    else if (reg.sha256 !== p.sha256 || reg.upstreamCommit !== p.upstreamCommit) mismatched.push(p.filename);
    else if (!reg.proof || !reg.proof.observedAt) unproven.push(p.filename);
  }
  const anyRegistered = planned.some((p) => regs.some((r) => r.filename === p.filename));
  const state: RegistrationState =
    expected.length > 0 && !anyRegistered
      ? "needs_project_registration"
      : missing.length + mismatched.length + unproven.length > 0
        ? "partial"
        : "ready";
  return {
    state,
    expected,
    missing,
    mismatched,
    unproven,
    note: "ChatGPT Project has no public API here; registration is recorded by a human or host UI readback.",
  };
}

export interface ResearchClaims {
  appInstalled: boolean;
  appSelected: boolean;
  dataFetched: boolean;
}

/** Installed app, selected app and fetched data are independent; each needs its own supported receipt. */
export function researchClaims(evidence: EvidenceReceipt[]): ResearchClaims {
  const has = (kind: EvidenceReceipt["claimKind"]) =>
    evidence.some((e) => e.claimKind === kind && e.status === "supported");
  return {
    appInstalled: has("app_installed"),
    appSelected: has("app_selected"),
    dataFetched: has("data_fetched"),
  };
}
