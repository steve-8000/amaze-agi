import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { CreateGoalInput } from "../src/core/engine.ts";
import type { SessionRef } from "../src/core/ids.ts";

export const REPO_ROOT = path.resolve(import.meta.dir, "..");
export const HUMAN: SessionRef = { host: "dot", sessionId: "session-human" };
export const AGENT: SessionRef = { host: "dot", sessionId: "session-agent" };

export function tmpDir(prefix = "amaze-test-"): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

/** Recursive listing with sizes and mtimes, used to prove an operation wrote nothing. */
export function fsSnapshot(root: string): string[] {
  if (!fs.existsSync(root)) return ["<absent>"];
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir).sort()) {
      const p = path.join(dir, name);
      const st = fs.statSync(p);
      out.push(`${path.relative(root, p)}:${st.isDirectory() ? "d" : st.size}:${st.mtimeMs}`);
      if (st.isDirectory()) walk(p);
    }
  };
  walk(root);
  return out;
}

export function goalSpec(dir: string, overrides: Partial<CreateGoalInput> = {}): CreateGoalInput {
  return {
    title: "Plan a weekend trip",
    scope: "Two-day itinerary for two people; no bookings made by the agent",
    desiredOutcome: "An itinerary file listing lodging, transport and a budget under the cap",
    criteria: [
      {
        id: "itinerary",
        text: "itinerary names the lodging",
        readback: { probe: "file_contains", path: path.join(dir, "itinerary.md"), text: "Lodging:" },
      },
    ],
    stopCriteria: ["stop when the itinerary readback passes", "stop if the budget cap cannot be met"],
    reporting: "Short summary in the conversation with the itinerary path",
    budget: { maxTasks: 5, maxRunsTotal: 5 },
    request: "user: plan a two-day trip for two with lodging named in itinerary.md",
    ...overrides,
  };
}

/** Builds a git tree (no commit, so no identity is needed) from fixture files and returns its SHA. */
export function makeTreeRepo(files: Record<string, string>): { dir: string; tree: string } {
  const dir = tmpDir("amaze-git-");
  const run = (args: string[]) => {
    const p = Bun.spawnSync(["git", "-C", dir, ...args]);
    if (p.exitCode !== 0) throw new Error(`git ${args.join(" ")}: ${p.stderr.toString()}`);
    return p.stdout.toString().trim();
  };
  run(["init", "-q"]);
  for (const [rel, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), content);
  }
  run(["add", "-A"]);
  return { dir, tree: run(["write-tree"]) };
}

export function syntheticRepoFiles(): Record<string, string> {
  const base = path.join(import.meta.dir, "fixtures", "synthetic-repo");
  const out: Record<string, string> = {};
  for (const name of fs.readdirSync(path.join(base, "src")))
    out[`src/${name}`] = fs.readFileSync(path.join(base, "src", name), "utf8");
  return out;
}
