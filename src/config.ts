import * as fs from "node:fs";
import * as path from "node:path";
import { fail } from "./core/errors.ts";
import { errnoCode } from "./core/fsutil.ts";
import { isRecord } from "./core/guards.ts";

export const PROFILE_FILE = "profile.local.json";

export interface SourceRegistration {
  filename: string;
  sha256: string;
  upstreamCommit: string;
  proof?: { kind: "human_observation" | "host_ui_readback"; observedAt: string; note: string };
}

/** User-local settings. Never committed; public examples use placeholders only. */
export interface Profile {
  schema_version: 1;
  chatgptProject: { label: string; registeredSources: SourceRegistration[] };
  gbrain: {
    enabled: boolean;
    binary: string;
    sourceId?: string;
    maxResults: number;
    snippetChars: number;
    maxBytes: number;
  };
  readback: { allowedCommandPrefixes: string[][] };
}

export function defaultProfile(): Profile {
  return {
    schema_version: 1,
    chatgptProject: { label: "<PROJECT_LABEL>", registeredSources: [] },
    gbrain: { enabled: false, binary: "gbrain", maxResults: 5, snippetChars: 300, maxBytes: 8000 },
    readback: { allowedCommandPrefixes: [] },
  };
}

export function resolveHome(cwd: string, env: Record<string, string | undefined> = process.env): string {
  return env.AMAZE_AGI_HOME ? path.resolve(env.AMAZE_AGI_HOME) : path.join(cwd, ".amaze-agi");
}

function section(raw: Record<string, unknown>, key: string): Record<string, unknown> {
  const v = raw[key];
  if (v === undefined) return {};
  if (!isRecord(v)) fail("invalid", `profile.${key} must be an object`);
  return v;
}

function str(v: unknown, field: string, fallback: string): string {
  if (v === undefined) return fallback;
  if (typeof v !== "string") fail("invalid", `${field} must be a string`);
  return v;
}

function num(v: unknown, field: string, fallback: number): number {
  if (v === undefined) return fallback;
  if (typeof v !== "number" || !Number.isFinite(v) || v <= 0)
    fail("invalid", `${field} must be a positive number`);
  return v;
}

function registration(v: unknown, i: number): SourceRegistration {
  const at = `chatgptProject.registeredSources[${i}]`;
  if (!isRecord(v)) fail("invalid", `${at} must be an object`);
  const out: SourceRegistration = {
    filename: str(v.filename, `${at}.filename`, ""),
    sha256: str(v.sha256, `${at}.sha256`, ""),
    upstreamCommit: str(v.upstreamCommit, `${at}.upstreamCommit`, ""),
  };
  if (v.proof !== undefined) {
    if (!isRecord(v.proof)) fail("invalid", `${at}.proof must be an object`);
    const kind = v.proof.kind;
    if (kind !== "human_observation" && kind !== "host_ui_readback")
      fail("invalid", `${at}.proof.kind invalid`);
    out.proof = {
      kind,
      observedAt: str(v.proof.observedAt, `${at}.proof.observedAt`, ""),
      note: str(v.proof.note, `${at}.proof.note`, ""),
    };
  }
  return out;
}

/** Validates a parsed profile; unknown keys are rejected so typos cannot silently change behavior. */
export function parseProfile(raw: unknown): Profile {
  if (!isRecord(raw)) fail("invalid", "profile must be a JSON object");
  const base = defaultProfile();
  for (const key of Object.keys(raw))
    if (!Object.hasOwn(base, key)) fail("invalid", `unknown profile key: ${key}`);
  if (raw.schema_version !== undefined && raw.schema_version !== 1)
    fail("invalid", "schema_version must be 1");
  const cp = section(raw, "chatgptProject");
  const regs = cp.registeredSources ?? [];
  if (!Array.isArray(regs)) fail("invalid", "chatgptProject.registeredSources must be an array");
  const gb = section(raw, "gbrain");
  if (gb.enabled !== undefined && typeof gb.enabled !== "boolean")
    fail("invalid", "gbrain.enabled must be a boolean");
  const rb = section(raw, "readback");
  const prefixes = rb.allowedCommandPrefixes ?? [];
  if (
    !Array.isArray(prefixes) ||
    !prefixes.every((p) => Array.isArray(p) && p.length > 0 && p.every((s) => typeof s === "string"))
  ) {
    fail("invalid", "readback.allowedCommandPrefixes must be non-empty string arrays");
  }
  return {
    schema_version: 1,
    chatgptProject: {
      label: str(cp.label, "chatgptProject.label", base.chatgptProject.label),
      registeredSources: regs.map(registration),
    },
    gbrain: {
      enabled: gb.enabled === true,
      binary: str(gb.binary, "gbrain.binary", base.gbrain.binary),
      sourceId: gb.sourceId === undefined ? undefined : str(gb.sourceId, "gbrain.sourceId", ""),
      maxResults: num(gb.maxResults, "gbrain.maxResults", base.gbrain.maxResults),
      snippetChars: num(gb.snippetChars, "gbrain.snippetChars", base.gbrain.snippetChars),
      maxBytes: num(gb.maxBytes, "gbrain.maxBytes", base.gbrain.maxBytes),
    },
    readback: { allowedCommandPrefixes: prefixes },
  };
}

/** Pure read; a missing profile yields defaults without creating anything. */
export function loadProfile(home: string): { profile: Profile; path: string; exists: boolean } {
  const p = path.join(home, PROFILE_FILE);
  let text: string;
  try {
    text = fs.readFileSync(p, "utf8");
  } catch (err) {
    if (errnoCode(err) === "ENOENT") return { profile: defaultProfile(), path: p, exists: false };
    throw err;
  }
  return { profile: parseProfile(JSON.parse(text)), path: p, exists: true };
}
