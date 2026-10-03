import * as fs from "node:fs";
import * as path from "node:path";
import { loadProfile, type Profile } from "./config.ts";
import { JOURNAL_FILE, journalHasPartialTail, LOCK_FILE } from "./core/store.ts";
import { verifyPlugin } from "./plugin.ts";
import { type RegistrationStatus, registrationStatus } from "./research/project.ts";
import { verifySources } from "./sources/index.ts";

export type CheckState = "ok" | "warn" | "fail" | "absent";

export interface Check {
  name: string;
  state: CheckState;
  detail: string;
}

export type Overall = "ready" | "partial" | "needs_project_registration" | "broken";

export interface DoctorReport {
  overall: Overall;
  checks: Check[];
  research: RegistrationStatus | { state: "unavailable"; detail: string };
  /** What doctor cannot see: these states are confirmed in the hosts themselves. */
  notChecked: string[];
}

function probeBinary(argv: string[]): { found: boolean; out: string } {
  try {
    const proc = Bun.spawnSync(argv, { timeout: 10_000, stdin: "ignore" });
    const out = `${proc.stdout.toString()}${proc.stderr.toString()}`.trim().split("\n")[0] ?? "";
    return { found: proc.exitCode === 0, out };
  } catch (err) {
    return { found: false, out: String(err) };
  }
}

/** Read-only health report. Never creates the state directory, profile, lock or journal. */
export async function runDoctor(opts: {
  cwd: string;
  home: string;
  repoRoot: string;
  probeBinaries?: boolean;
}): Promise<DoctorReport> {
  const checks: Check[] = [{ name: "bun", state: "ok", detail: Bun.version }];

  let profile: Profile | undefined;
  try {
    const loaded = loadProfile(opts.home);
    profile = loaded.profile;
    checks.push({
      name: "profile",
      state: loaded.exists ? "ok" : "absent",
      detail: loaded.exists
        ? "user-local profile valid"
        : "no profile; defaults apply (run `amaze-agi init`)",
    });
  } catch (err) {
    checks.push({ name: "profile", state: "fail", detail: `invalid profile: ${String(err)}` });
  }

  if (opts.probeBinaries !== false && profile) {
    if (profile.gbrain.enabled) {
      const gb = probeBinary([profile.gbrain.binary, "--version"]);
      checks.push({
        name: "gbrain",
        state: gb.found ? "ok" : "fail",
        detail: gb.found ? gb.out : "enabled but binary not runnable",
      });
    } else checks.push({ name: "gbrain", state: "absent", detail: "disabled (optional)" });
  }

  if (!fs.existsSync(opts.home))
    checks.push({ name: "state", state: "absent", detail: "state directory not created yet" });
  else {
    const partial = journalHasPartialTail(opts.home);
    checks.push({
      name: "state",
      state: partial ? "warn" : "ok",
      detail: !fs.existsSync(path.join(opts.home, JOURNAL_FILE))
        ? "no journal yet"
        : partial
          ? "journal has a partial trailing line (crash mid-append); the next write truncates it"
          : "journal readable",
    });
    if (fs.existsSync(path.join(opts.home, LOCK_FILE)))
      checks.push({ name: "lock", state: "warn", detail: "writer lock present" });
  }

  const gitignore = path.join(opts.cwd, ".gitignore");
  const ignored = fs.existsSync(gitignore) && /^\.amaze-agi\/?$/m.test(fs.readFileSync(gitignore, "utf8"));
  const inside = path.resolve(opts.home).startsWith(path.resolve(opts.cwd) + path.sep);
  checks.push({
    name: "gitignore",
    state: !inside || ignored ? "ok" : "warn",
    detail: !inside
      ? "state lives outside the project"
      : ignored
        ? ".amaze-agi/ ignored"
        : "add `.amaze-agi/` to .gitignore",
  });

  for (const [name, run] of [
    ["sources", () => verifySources(opts.repoRoot)],
    ["plugin_package", () => verifyPlugin(opts.repoRoot)],
  ] as const) {
    try {
      const v = await run();
      checks.push({
        name,
        state: v.errors.length === 0 ? "ok" : "fail",
        detail: v.errors.length === 0 ? "verified" : v.errors.slice(0, 5).join("; "),
      });
    } catch (err) {
      checks.push({ name, state: "fail", detail: String(err) });
    }
  }

  let research: DoctorReport["research"];
  try {
    research = profile
      ? await registrationStatus(opts.repoRoot, profile)
      : { state: "unavailable", detail: "profile invalid" };
  } catch (err) {
    research = { state: "unavailable", detail: String(err) };
  }

  let overall: Overall;
  if (checks.some((c) => c.state === "fail")) overall = "broken";
  else if (research.state === "needs_project_registration") overall = "needs_project_registration";
  else if (research.state !== "ready" || checks.some((c) => c.state === "warn")) overall = "partial";
  else overall = "ready";
  return {
    overall,
    checks,
    research,
    notChecked: [
      "whether the amaze-agi skill is installed and enabled in ChatGPT/dot",
      "whether ChatGPT Project sources are actually retrievable in a conversation",
      "connector (OMP or app) availability, permissions and execution",
    ],
  };
}
