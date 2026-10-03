import * as fs from "node:fs";
import * as path from "node:path";
import { sha256Hex } from "./hash.ts";
import type { EvidenceSource, EvidenceStatus, ReadbackSpec } from "./types.ts";

export interface ReadbackPolicy {
  /** Base directory for relative paths. */
  cwd: string;
  /** Exact argv prefixes that `command` probes may run; empty means command probes are refused. */
  allowedCommandPrefixes: string[][];
}

export interface ReadbackResult {
  status: EvidenceStatus;
  observed: string;
  source: EvidenceSource;
  contentSha256?: string;
}

const MAX_OBSERVED = 2000;

function clip(text: string): string {
  return text.length > MAX_OBSERVED ? `${text.slice(0, MAX_OBSERVED)}…[truncated]` : text;
}

function jsonPointer(doc: unknown, pointer: string): { found: boolean; value?: unknown } {
  if (pointer === "") return { found: true, value: doc };
  if (!pointer.startsWith("/")) return { found: false };
  let cur: unknown = doc;
  for (const raw of pointer.slice(1).split("/")) {
    const key = raw.replaceAll("~1", "/").replaceAll("~0", "~");
    if (cur === null || typeof cur !== "object" || !Object.hasOwn(cur, key)) return { found: false };
    cur = Reflect.get(cur, key);
  }
  return { found: true, value: cur };
}

function isAllowedArgv(argv: string[], allowed: string[][]): boolean {
  return allowed.some((prefix) => prefix.length > 0 && prefix.every((part, i) => argv[i] === part));
}

/** Performs an actual readback of current external state; never trusts a caller's claim. */
export async function runReadback(spec: ReadbackSpec, policy: ReadbackPolicy): Promise<ReadbackResult> {
  switch (spec.probe) {
    case "file_sha256":
    case "file_contains":
    case "json_pointer_equals": {
      const abs = path.resolve(policy.cwd, spec.path);
      const source: EvidenceSource = { kind: "readback", uri: `file://${abs}`, path: spec.path };
      let bytes: Buffer;
      try {
        bytes = fs.readFileSync(abs);
      } catch (err) {
        return { status: "contradicted", observed: `unreadable: ${String(err)}`, source };
      }
      const contentSha256 = sha256Hex(bytes);
      if (spec.probe === "file_sha256") {
        const ok = contentSha256 === spec.sha256.toLowerCase();
        return {
          status: ok ? "supported" : "contradicted",
          observed: `sha256=${contentSha256}`,
          source,
          contentSha256,
        };
      }
      const text = bytes.toString("utf8");
      if (spec.probe === "file_contains") {
        const ok = text.includes(spec.text);
        return { status: ok ? "supported" : "contradicted", observed: clip(text), source, contentSha256 };
      }
      let doc: unknown;
      try {
        doc = JSON.parse(text);
      } catch {
        return { status: "contradicted", observed: "invalid JSON", source, contentSha256 };
      }
      const hit = jsonPointer(doc, spec.pointer);
      const ok = hit.found && Bun.deepEquals(hit.value, spec.value, true);
      return {
        status: ok ? "supported" : "contradicted",
        observed: hit.found ? clip(JSON.stringify(hit.value)) : `missing ${spec.pointer}`,
        source,
        contentSha256,
      };
    }
    case "http": {
      const source: EvidenceSource = { kind: "readback", uri: spec.url };
      try {
        const res = await fetch(spec.url, {
          method: "GET",
          redirect: "manual",
          signal: AbortSignal.timeout(spec.timeoutMs ?? 5000),
        });
        const body = await res.text();
        const ok =
          res.status === spec.expectStatus &&
          (spec.bodyIncludes === undefined || body.includes(spec.bodyIncludes));
        return {
          status: ok ? "supported" : "contradicted",
          observed: clip(`status=${res.status} body=${body}`),
          source: { ...source, revision: res.headers.get("etag") ?? undefined },
          contentSha256: sha256Hex(Buffer.from(body, "utf8")),
        };
      } catch (err) {
        return { status: "inconclusive", observed: `request failed: ${String(err)}`, source };
      }
    }
    case "command": {
      const source: EvidenceSource = { kind: "readback", uri: `argv:${JSON.stringify(spec.argv)}` };
      if (!isAllowedArgv(spec.argv, policy.allowedCommandPrefixes)) {
        return { status: "inconclusive", observed: "command probe not in user-local allowlist", source };
      }
      const proc = Bun.spawnSync(spec.argv, { cwd: policy.cwd, timeout: spec.timeoutMs ?? 10_000 });
      const stdout = proc.stdout.toString();
      const ok =
        proc.exitCode === spec.expectExitCode &&
        (spec.stdoutIncludes === undefined || stdout.includes(spec.stdoutIncludes));
      return {
        status: proc.exitCode === null ? "inconclusive" : ok ? "supported" : "contradicted",
        observed: clip(`exit=${proc.exitCode} stdout=${stdout}`),
        source,
        contentSha256: sha256Hex(proc.stdout),
      };
    }
    case "receipt":
      return {
        status: "inconclusive",
        observed: "receipt criteria are satisfied only by a recorded connector readback",
        source: { kind: "readback", uri: "receipt:" },
      };
  }
}
