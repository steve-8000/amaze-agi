import * as fs from "node:fs";
import * as path from "node:path";
import { GBrainContext } from "./adapters/gbrain.ts";
import { defaultProfile, loadProfile, PROFILE_FILE, resolveHome } from "./config.ts";
import { approvalPhrase, Engine, effectiveRevision } from "./core/engine.ts";
import { AmazeError, fail } from "./core/errors.ts";
import { lookupGoal, lookupTarget, lookupTask } from "./core/identity.ts";
import { defaultDeps, isCanonicalId, type SessionRef } from "./core/ids.ts";
import {
  parseAddTask,
  parseCreateGoal,
  parseCriteria,
  parseEvidenceInput,
  parseSource,
} from "./core/parse.ts";
import type { ReadbackPolicy } from "./core/readback.ts";
import { readState } from "./core/store.ts";
import { runDoctor } from "./doctor.ts";
import { REPO_ROOT } from "./paths.ts";
import { verifyPlugin } from "./plugin.ts";
import { excerpt, planResearch, registrationStatus } from "./research/project.ts";
import { parseAnchor } from "./research/quote.ts";
import { parseScope, recordQuoteEvidence } from "./research/record.ts";
import { verifySources } from "./sources/index.ts";

const USAGE = `amaze-agi — evidence helper for dot jobs (it records and checks; it never executes work)

  init | doctor [--no-probe] | status [ref]
  goal create --file goal.json | goal show <ref> | goal cancel <ref> --reason R
  goal propose <ref> --file criteria.json --reason R      (proposed criteria do not take effect)
  goal approve <ref> <revision> --confirmation "<user reply containing 'approve rN hash8'>"
  goal close <ref>                                        (exit 3 while the finish line is not met)
  task add <goal> --file task.json | task claim <task> --owner O | task complete <task>
  target declare <canonical> | alias bind <goal|task|target> <alias> <canonical>
  run handoff <task> --executor E --action A --target T
  run outcome <run> --status succeeded|failed|unknown --detail D | run verify <run>
  run reconcile <run> (--applied|--not-applied) --source source.json --claim C
  evidence record <goal> --file receipt.json
  evidence quote <goal> --quote Q --anchor anchor.json --claim C [--scope text_present|attribution|defect|runtime_behavior|reasoning]
  delivery upload <goal> <file> --dest D --status succeeded|failed|unknown --detail D [--remote-ref R] [--server-sha256 H]
  delivery attach <id> --container C --status succeeded|failed|unknown --detail D [--listed]
  delivery reconcile <id> --part upload (--found [--server-sha256 H] | --not-found) | --part attach (--listed | --not-listed)
  research plan <taskKind> | research excerpt <file> <section> [--lines A-B] | research status [--task-kind K]
  context gbrain (search|get) <query>
  sources verify | plugin verify

State: $AMAZE_AGI_HOME or ./.amaze-agi.  Acting session: $AMAZE_AGI_SESSION as host:id (default cli:<pid>).`;

interface Args {
  pos: string[];
  flags: Record<string, string | true>;
}

function parseArgs(argv: string[]): Args {
  const pos: string[] = [];
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] as string;
    if (!a.startsWith("--")) {
      pos.push(a);
      continue;
    }
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith("--")) {
      flags[a.slice(2)] = next;
      i++;
    } else flags[a.slice(2)] = true;
  }
  return { pos, flags };
}

function flag(args: Args, name: string): string {
  const v = args.flags[name];
  if (typeof v !== "string") fail("invalid", `--${name} is required`);
  return v;
}

function optFlag(args: Args, name: string): string | undefined {
  const v = args.flags[name];
  return typeof v === "string" ? v : undefined;
}

function arg(args: Args, i: number, name: string): string {
  return args.pos[i] ?? fail("invalid", `missing <${name}>`);
}

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function sessionFrom(env: Record<string, string | undefined>): SessionRef {
  const raw = env.AMAZE_AGI_SESSION;
  const i = raw?.indexOf(":") ?? -1;
  if (raw && i > 0 && i < raw.length - 1) return { host: raw.slice(0, i), sessionId: raw.slice(i + 1) };
  return { host: "cli", sessionId: `cli-${process.pid}` };
}

function outcomeStatus(v: string): "succeeded" | "failed" | "unknown" {
  if (v !== "succeeded" && v !== "failed" && v !== "unknown")
    fail("invalid", "--status must be succeeded|failed|unknown");
  return v;
}

export async function main(
  argv: string[],
  cwd = process.cwd(),
  env: Record<string, string | undefined> = process.env,
): Promise<number> {
  const args = parseArgs(argv);
  const [cmd, sub] = args.pos;
  const home = resolveHome(cwd, env);
  const by = sessionFrom(env);
  const out = (v: unknown) => process.stdout.write(`${JSON.stringify(v, null, 2)}\n`);
  const engine = () => new Engine(home, defaultDeps());
  const policy = (): ReadbackPolicy => ({
    cwd,
    allowedCommandPrefixes: loadProfile(home).profile.readback.allowedCommandPrefixes,
  });
  try {
    switch (cmd) {
      case undefined:
      case "help":
        process.stdout.write(`${USAGE}\n`);
        return 0;
      case "init": {
        const file = path.join(home, PROFILE_FILE);
        if (fs.existsSync(file)) fail("conflict", `${file} already exists`);
        fs.mkdirSync(home, { recursive: true });
        fs.writeFileSync(file, `${JSON.stringify(defaultProfile(), null, 2)}\n`, { flag: "wx", mode: 0o600 });
        out({ created: file, note: "user-local; keep .amaze-agi/ out of git" });
        return 0;
      }
      case "doctor": {
        const report = await runDoctor({
          cwd,
          home,
          repoRoot: REPO_ROOT,
          probeBinaries: args.flags["no-probe"] !== true,
        });
        out(report);
        return report.overall === "broken" ? 1 : 0;
      }
      case "status": {
        const state = readState(home);
        const ref = args.pos[1];
        if (!ref) {
          out(
            Object.values(state.goals).map((g) => ({
              id: g.id,
              title: g.title,
              status: g.status,
              approvedRevision: effectiveRevision(g)?.revision ?? null,
              latestRevision: g.revisions.at(-1)?.revision,
            })),
          );
          return 0;
        }
        const g = lookupGoal(state, ref);
        const t = lookupTask(state, ref);
        const target = lookupTarget(state, ref);
        if (g) out({ kind: "goal", value: state.goals[g] });
        else if (t) out({ kind: "task", value: state.tasks[t] });
        else if (isCanonicalId(ref, "run") && state.runs[ref]) out({ kind: "run", value: state.runs[ref] });
        else if (isCanonicalId(ref, "dlv") && state.deliveries[ref])
          out({ kind: "delivery", value: state.deliveries[ref] });
        else if (target) out({ kind: "target", canonical: target });
        else out({ kind: "none" });
        return 0;
      }
      case "goal": {
        const e = engine();
        if (sub === "create") {
          const goal = e.createGoal(parseCreateGoal(readJson(flag(args, "file"))), by);
          out({ goal, approve: goal.revisions.map(approvalPhrase)[0] });
        } else if (sub === "show") {
          const goal = e.lookupGoal(arg(args, 2, "ref"));
          out(goal ? { found: true, goal, evidence: e.currentEvidence(goal.id) } : { found: false });
        } else if (sub === "propose") {
          const revision = e.proposeCriteria(
            arg(args, 2, "ref"),
            parseCriteria(readJson(flag(args, "file"))),
            flag(args, "reason"),
            by,
          );
          out({ revision, approve: approvalPhrase(revision) });
        } else if (sub === "approve") {
          const rev = Number(arg(args, 3, "revision"));
          if (!Number.isInteger(rev)) fail("invalid", "revision must be an integer");
          out(e.approveCriteria(arg(args, 2, "ref"), rev, flag(args, "confirmation")));
        } else if (sub === "cancel") out(e.cancelGoal(arg(args, 2, "ref"), flag(args, "reason")));
        else if (sub === "close") {
          const result = await e.closeGoal(arg(args, 2, "ref"), policy(), by);
          out(result);
          return result.closed ? 0 : 3;
        } else fail("invalid", `unknown goal subcommand ${sub}`);
        return 0;
      }
      case "task": {
        const e = engine();
        if (sub === "add") out(e.addTask(arg(args, 2, "goal"), parseAddTask(readJson(flag(args, "file")))));
        else if (sub === "claim") out(e.claimTask(arg(args, 2, "task"), flag(args, "owner")));
        else if (sub === "complete") {
          const task = await e.completeTask(arg(args, 2, "task"), policy(), by);
          out(task);
          return task.status === "done" ? 0 : 3;
        } else fail("invalid", `unknown task subcommand ${sub}`);
        return 0;
      }
      case "target":
        if (sub !== "declare") fail("invalid", "usage: target declare <canonical>");
        engine().declareTarget(arg(args, 2, "canonical"));
        out({ declared: args.pos[2] });
        return 0;
      case "alias": {
        const ns = arg(args, 2, "namespace");
        if (sub !== "bind" || (ns !== "goal" && ns !== "task" && ns !== "target"))
          fail("invalid", "usage: alias bind <ns> <alias> <canonical>");
        out({ canonical: engine().bindAlias(ns, arg(args, 3, "alias"), arg(args, 4, "canonical")) });
        return 0;
      }
      case "run": {
        const e = engine();
        if (sub === "handoff") {
          out(
            e.recordHandoff({
              task: arg(args, 2, "task"),
              executor: flag(args, "executor"),
              action: flag(args, "action"),
              target: flag(args, "target"),
              session: by,
            }),
          );
          return 0;
        }
        const runId = arg(args, 2, "run");
        if (!isCanonicalId(runId, "run")) fail("invalid", "run must be a run_ id");
        if (sub === "outcome")
          out(
            e.recordOutcome(runId, {
              kind: outcomeStatus(flag(args, "status")),
              detail: flag(args, "detail"),
            }),
          );
        else if (sub === "verify") {
          const task = await e.verifyRun(runId, policy());
          out(task);
          return task.status === "done" ? 0 : 3;
        } else if (sub === "reconcile") {
          const applied =
            args.flags.applied === true
              ? true
              : args.flags["not-applied"] === true
                ? false
                : fail("invalid", "--applied or --not-applied");
          out(
            e.reconcileRun(
              runId,
              { applied, source: parseSource(readJson(flag(args, "source"))), claim: flag(args, "claim") },
              by,
            ),
          );
        } else fail("invalid", `unknown run subcommand ${sub}`);
        return 0;
      }
      case "evidence": {
        const goal = arg(args, 2, "goal");
        if (sub === "quote") {
          out(
            await recordQuoteEvidence(
              engine(),
              {
                goal,
                quote: flag(args, "quote"),
                anchor: parseAnchor(readJson(flag(args, "anchor"))),
                scope: parseScope(args.flags.scope),
                claim: flag(args, "claim"),
                by,
              },
              REPO_ROOT,
            ),
          );
          return 0;
        }
        if (sub !== "record") fail("invalid", "usage: evidence record|quote ...");
        out(engine().recordEvidence(parseEvidenceInput(goal, readJson(flag(args, "file"))), by));
        return 0;
      }
      case "delivery": {
        const e = engine();
        if (sub === "upload") {
          out(
            e.recordUpload(
              arg(args, 2, "goal"),
              path.resolve(cwd, arg(args, 3, "file")),
              flag(args, "dest"),
              {
                status: outcomeStatus(flag(args, "status")),
                remoteRef: optFlag(args, "remote-ref"),
                serverSha256: optFlag(args, "server-sha256"),
                detail: flag(args, "detail"),
              },
            ),
          );
          return 0;
        }
        const id = arg(args, 2, "id");
        if (!isCanonicalId(id, "dlv")) fail("invalid", "id must be a dlv_ id");
        if (sub === "attach") {
          out(
            e.recordAttach(id, {
              status: outcomeStatus(flag(args, "status")),
              container: flag(args, "container"),
              readbackListed: args.flags.listed === true,
              detail: flag(args, "detail"),
            }),
          );
        } else if (sub === "reconcile") {
          const part = flag(args, "part");
          if (part === "upload") {
            const found =
              args.flags.found === true
                ? true
                : args.flags["not-found"] === true
                  ? false
                  : fail("invalid", "--found or --not-found");
            out(
              e.reconcileDelivery(id, {
                part: "upload",
                found,
                serverSha256: optFlag(args, "server-sha256"),
                remoteRef: optFlag(args, "remote-ref"),
              }),
            );
          } else if (part === "attach") {
            const listed =
              args.flags.listed === true
                ? true
                : args.flags["not-listed"] === true
                  ? false
                  : fail("invalid", "--listed or --not-listed");
            out(e.reconcileDelivery(id, { part: "attach", listed }));
          } else fail("invalid", "--part upload|attach");
        } else fail("invalid", `unknown delivery subcommand ${sub}`);
        return 0;
      }
      case "research":
        if (sub === "plan") out(await planResearch(REPO_ROOT, arg(args, 2, "taskKind")));
        else if (sub === "excerpt") {
          const lines = optFlag(args, "lines")?.split("-").map(Number);
          const span: [number, number] | undefined =
            lines && lines.length === 2 ? [lines[0] as number, lines[1] as number] : undefined;
          out(await excerpt(REPO_ROOT, arg(args, 2, "file"), arg(args, 3, "section"), span));
        } else if (sub === "status")
          out(await registrationStatus(REPO_ROOT, loadProfile(home).profile, optFlag(args, "task-kind")));
        else fail("invalid", `unknown research subcommand ${sub}`);
        return 0;
      case "context": {
        if (sub !== "gbrain") fail("invalid", "usage: context gbrain search|get <query>");
        const profile = loadProfile(home).profile;
        if (!profile.gbrain.enabled) fail("invalid", "gbrain is disabled in the user-local profile");
        const gb = new GBrainContext(profile.gbrain);
        const verb = arg(args, 2, "verb");
        out(
          verb === "get"
            ? gb.get(arg(args, 3, "slug"))
            : verb === "search"
              ? gb.search(arg(args, 3, "query"))
              : fail("invalid", "search|get"),
        );
        return 0;
      }
      case "sources": {
        if (sub !== "verify") fail("invalid", "usage: sources verify");
        const v = await verifySources(REPO_ROOT);
        out(v);
        return v.errors.length === 0 ? 0 : 1;
      }
      case "plugin": {
        if (sub !== "verify") fail("invalid", "usage: plugin verify");
        const v = verifyPlugin(REPO_ROOT);
        out(v);
        return v.errors.length === 0 ? 0 : 1;
      }
      default:
        process.stderr.write(`${USAGE}\n`);
        return 2;
    }
  } catch (err) {
    if (err instanceof AmazeError) {
      process.stderr.write(
        `${JSON.stringify({ error: err.code, message: err.message, details: err.details })}\n`,
      );
      return 1;
    }
    throw err;
  }
}
