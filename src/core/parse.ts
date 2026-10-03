import type { AddTaskInput, CreateGoalInput, CriterionInput, EvidenceInput } from "./engine.ts";
import { fail } from "./errors.ts";
import { isRecord } from "./guards.ts";
import type { EvidenceSource, ReadbackSpec, SourceKind } from "./types.ts";

function str(v: unknown, field: string): string {
  if (typeof v !== "string" || v.length === 0) fail("invalid", `${field} must be a non-empty string`);
  return v;
}

function optStr(v: unknown, field: string): string | undefined {
  return v === undefined ? undefined : str(v, field);
}

function posInt(v: unknown, field: string): number {
  if (typeof v !== "number" || !Number.isInteger(v) || v < 1)
    fail("invalid", `${field} must be a positive integer`);
  return v;
}

function strArray(v: unknown, field: string): string[] {
  if (v === undefined) return [];
  if (!Array.isArray(v) || !v.every((s) => typeof s === "string"))
    fail("invalid", `${field} must be a string array`);
  return v;
}

export function parseReadbackSpec(v: unknown, field = "readback"): ReadbackSpec {
  if (!isRecord(v)) fail("invalid", `${field} must be an object`);
  switch (v.probe) {
    case "file_sha256": {
      const sha256 = str(v.sha256, `${field}.sha256`);
      if (!/^[0-9a-fA-F]{64}$/.test(sha256)) fail("invalid", `${field}.sha256 must be 64 hex chars`);
      return { probe: "file_sha256", path: str(v.path, `${field}.path`), sha256 };
    }
    case "file_contains":
      return {
        probe: "file_contains",
        path: str(v.path, `${field}.path`),
        text: str(v.text, `${field}.text`),
      };
    case "json_pointer_equals":
      if (typeof v.pointer !== "string") fail("invalid", `${field}.pointer must be a string`);
      if (!("value" in v)) fail("invalid", `${field}.value is required`);
      return {
        probe: "json_pointer_equals",
        path: str(v.path, `${field}.path`),
        pointer: v.pointer,
        value: v.value,
      };
    case "http": {
      const url = str(v.url, `${field}.url`);
      if (!/^https?:\/\//.test(url)) fail("invalid", `${field}.url must be http(s)`);
      return {
        probe: "http",
        url,
        expectStatus: posInt(v.expectStatus, `${field}.expectStatus`),
        bodyIncludes: optStr(v.bodyIncludes, `${field}.bodyIncludes`),
        timeoutMs: v.timeoutMs === undefined ? undefined : posInt(v.timeoutMs, `${field}.timeoutMs`),
      };
    }
    case "command": {
      const argv = strArray(v.argv, `${field}.argv`);
      if (argv.length === 0) fail("invalid", `${field}.argv must be non-empty`);
      if (typeof v.expectExitCode !== "number" || !Number.isInteger(v.expectExitCode))
        fail("invalid", `${field}.expectExitCode must be an integer`);
      return {
        probe: "command",
        argv,
        expectExitCode: v.expectExitCode,
        stdoutIncludes: optStr(v.stdoutIncludes, `${field}.stdoutIncludes`),
        timeoutMs: v.timeoutMs === undefined ? undefined : posInt(v.timeoutMs, `${field}.timeoutMs`),
      };
    }
    case "receipt":
      return { probe: "receipt", expect: str(v.expect, `${field}.expect`) };
    default:
      return fail(
        "invalid",
        `${field}.probe must be file_sha256|file_contains|json_pointer_equals|http|command|receipt`,
      );
  }
}

export function parseCriteria(v: unknown): CriterionInput[] {
  if (!Array.isArray(v)) fail("invalid", "criteria must be an array");
  return v.map((c, i) => {
    if (!isRecord(c)) fail("invalid", `criteria[${i}] must be an object`);
    return {
      id: optStr(c.id, `criteria[${i}].id`),
      text: str(c.text, `criteria[${i}].text`),
      readback: parseReadbackSpec(c.readback, `criteria[${i}].readback`),
    };
  });
}

export function parseCreateGoal(v: unknown): CreateGoalInput {
  if (!isRecord(v)) fail("invalid", "goal must be an object");
  const budget = v.budget;
  if (!isRecord(budget)) fail("invalid", "budget is required (maxTasks, maxRunsTotal)");
  return {
    title: str(v.title, "title"),
    scope: str(v.scope, "scope"),
    desiredOutcome: str(v.desiredOutcome, "desiredOutcome"),
    criteria: parseCriteria(v.criteria),
    stopCriteria: strArray(v.stopCriteria, "stopCriteria"),
    reporting: str(v.reporting, "reporting"),
    budget: {
      maxTasks: posInt(budget.maxTasks, "budget.maxTasks"),
      maxRunsTotal: posInt(budget.maxRunsTotal, "budget.maxRunsTotal"),
      deadline: budget.deadline === undefined ? undefined : posInt(budget.deadline, "budget.deadline"),
    },
    request: optStr(v.request, "request"),
    alias: optStr(v.alias, "alias"),
  };
}

export function parseAddTask(v: unknown): AddTaskInput {
  if (!isRecord(v)) fail("invalid", "task must be an object");
  const budget = v.budget;
  if (!isRecord(budget)) fail("invalid", "task budget is required (maxRuns)");
  const verify = v.verify === undefined ? [] : v.verify;
  if (!Array.isArray(verify)) fail("invalid", "verify must be an array");
  return {
    title: str(v.title, "title"),
    dependsOn: strArray(v.dependsOn, "dependsOn"),
    owner: optStr(v.owner, "owner"),
    budget: { maxRuns: posInt(budget.maxRuns, "budget.maxRuns") },
    stopCriteria: strArray(v.stopCriteria, "stopCriteria"),
    verify: verify.map((s, i) => parseReadbackSpec(s, `verify[${i}]`)),
    alias: optStr(v.alias, "alias"),
  };
}

const SOURCE_KINDS: Record<SourceKind, true> = {
  repo_file: true,
  url: true,
  readback: true,
  gbrain: true,
  chatgpt_project: true,
  connector: true,
  vendored_source: true,
  human_observation: true,
};

function isSourceKind(v: unknown): v is SourceKind {
  return typeof v === "string" && Object.hasOwn(SOURCE_KINDS, v);
}

export function parseSource(v: unknown): EvidenceSource {
  if (!isRecord(v)) fail("invalid", "source must be an object");
  if (!isSourceKind(v.kind)) fail("invalid", "unknown source.kind");
  let lines: [number, number] | undefined;
  if (v.lines !== undefined) {
    if (!Array.isArray(v.lines) || v.lines.length !== 2) fail("invalid", "source.lines must be [start,end]");
    lines = [posInt(v.lines[0], "source.lines[0]"), posInt(v.lines[1], "source.lines[1]")];
  }
  return {
    kind: v.kind,
    uri: str(v.uri, "source.uri"),
    repoSha: optStr(v.repoSha, "source.repoSha"),
    path: optStr(v.path, "source.path"),
    lines,
    revision: optStr(v.revision, "source.revision"),
  };
}

const RECORDABLE: Record<EvidenceInput["claimKind"], true> = {
  source_available: true,
  app_installed: true,
  app_selected: true,
  data_fetched: true,
  reasoning: true,
  execution_result: true,
  connector_readback: true,
};

function isRecordable(v: unknown): v is EvidenceInput["claimKind"] {
  return typeof v === "string" && Object.hasOwn(RECORDABLE, v);
}

/** Receipt input from dot or an executor. Only weak levels can be asserted this way. */
export function parseEvidenceInput(goal: string, v: unknown): EvidenceInput {
  if (!isRecord(v)) fail("invalid", "receipt must be an object");
  if (!isRecordable(v.claimKind))
    fail("invalid", `claimKind must be one of ${Object.keys(RECORDABLE).join("|")}`);
  const status = v.status;
  if (status !== "supported" && status !== "contradicted" && status !== "inconclusive")
    fail("invalid", "status invalid");
  if (typeof v.criteriaRevision !== "number") fail("invalid", "criteriaRevision is required");
  if (v.level !== undefined && v.level !== "claimed" && v.level !== "read_observed") {
    fail("invalid", "level may only be claimed or read_observed");
  }
  return {
    goal,
    task: optStr(v.task, "task"),
    run: optStr(v.run, "run"),
    criterionId: optStr(v.criterionId, "criterionId"),
    criteriaRevision: v.criteriaRevision,
    source: parseSource(v.source),
    claimKind: v.claimKind,
    claim: str(v.claim, "claim"),
    status,
    level: v.level === "read_observed" ? "read_observed" : "claimed",
    observed: optStr(v.observed, "observed"),
    reuses: optStr(v.reuses, "reuses"),
  };
}
