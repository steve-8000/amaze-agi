import * as fs from "node:fs";
import * as path from "node:path";
import { sha256Hex } from "../src/core/hash.ts";

export const REPO = path.resolve(import.meta.dir, "..");
export const CLI = path.join(REPO, "bin", "amaze-agi.ts");

/**
 * Writes a deterministic, repeatable e2e artifact (no timestamps or random ids) and returns its sha256.
 * Re-running the demo must reproduce the same bytes; the test asserts that against an in-memory render.
 */
export function writeArtifact(name: string, value: unknown): { path: string; sha256: string } {
  const dir = path.join(REPO, "artifacts", "e2e");
  fs.mkdirSync(dir, { recursive: true });
  const bytes = Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
  const file = path.join(dir, `${name}.json`);
  fs.writeFileSync(file, bytes);
  return { path: file, sha256: sha256Hex(bytes) };
}

export function cli(cwd: string, args: string[], env: Record<string, string> = {}) {
  const proc = Bun.spawnSync(["bun", CLI, ...args], {
    cwd,
    env: { ...process.env, ...env, AMAZE_AGI_HOME: "" },
  });
  const stdout = proc.stdout.toString();
  let json: unknown;
  try {
    json = JSON.parse(stdout);
  } catch {
    json = undefined;
  }
  return { code: proc.exitCode, stdout, stderr: proc.stderr.toString(), json };
}
