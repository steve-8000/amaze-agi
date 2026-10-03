# amaze-agi

Operating skills for **dot** (the ChatGPT agent you already use as a control tower). amaze-agi is content, not a runtime: one original skill, task-routed reference sources, templates, and a small optional helper for evidence checks. Dot keeps doing the coordination; existing connectors (for coding, an existing OMP connector) keep doing the execution.

What the skill asks dot to do:

1. **Bind the job**: outcome, scope, finish line, constraints, source needs, reporting.
2. **Plan only useful jobs**: bounded memory lookup (GBrain), exact routed sources, public web research, independent domain review, or direct execution, alone or combined; parallel only when independent.
3. **Execute on a verified target**: confirm repo/branch/worktree and session/model first, one writer per resource, UNKNOWN outcomes reconciled before retry.
4. **Review, deliver, learn**: judge immutable results against the finish line the user set, reuse evidence that still applies, keep separate upload/attach receipts, save material findings to memory as they occur and read them back.

## What is in the repository

| Path | What it is |
| --- | --- |
| `plugins/amaze-agi/skills/amaze-goal/` | the skill: `SKILL.md` plus `references/` (job template, memory, execution, evidence, delivery, model preferences, source index) |
| `plugins/amaze-agi/plugin.json`, `.agents/plugins/marketplace.json` | Agent Plugins manifest and repository marketplace entry |
| `project-sources/` | 18 Markdown exports for ChatGPT Project sources, one per pinned upstream skill |
| `third_party/` | the 18 upstream skill folders (150 files) byte-for-byte, licenses, lock with commits and hashes |
| `config/research-routing.json` | task kind to exact export filename routing |
| `examples/` | a fixed-fixture coding handoff and a source-based non-coding decision |
| `src/`, `bin/` | optional helper CLI: job ledger, readbacks, quote/anchor validation, source and package checks |

## Capability boundaries

| Capability | Kind | Proven here by |
| --- | --- | --- |
| Job binding, conditional planning, memory lifecycle, review, delivery steps | procedural guidance for dot | reading the skill; not enforceable by this repo |
| Source integrity, licenses, routing, exact quote/path/span checks | deterministic local helper | `bun run check` |
| Request-bound criteria, caller-attested revisions, stale evidence and re-binding, readback-gated closure, UNKNOWN reconciliation, delivery receipt levels | deterministic local helper | focused tests and two rehearsal e2e flows |
| Skill installed and enabled in ChatGPT / dot | platform state | by the user, a workspace admin, or the host where it supports skill writes; see setup |
| Project sources uploaded and retrievable | platform state | user or host-assisted registration; confirmed by observation |
| Connector permissions and execution (OMP, Drive, GBrain, apps) | connector/platform enforcement | the connector itself |

Nothing here intercepts tools, grants permissions or guarantees exactly-once effects. Details: [docs/CAPABILITIES.md](docs/CAPABILITIES.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Quickstart

Prerequisites: [Bun](https://bun.sh) 1.3 or newer and git. Optional: an existing GBrain, OMP or Drive connector.

```sh
git clone https://github.com/steve-8000/amaze-agi.git
cd amaze-agi
bun install       # dev dependencies only
bun run check     # typecheck, lint, tests, e2e rehearsals, build, source + package verify, privacy scan
```

Then make the skill available to dot (pick one that your plan, workspace role and host support; see [docs/setup/dot-skill.md](docs/setup/dot-skill.md)):

- let your dot host write it as a personal skill, where that is supported,
- upload `plugins/amaze-agi/skills/amaze-goal/` as a skill,
- upload a ZIP of `plugins/amaze-agi/` as a workspace plugin, or
- import this GitHub repository as a plugin marketplace.

Optional next steps: register the routed sources in a ChatGPT Project ([chatgpt-project.md](docs/setup/chatgpt-project.md)), connect memory ([gbrain.md](docs/setup/gbrain.md)) and execution/delivery connectors ([connectors.md](docs/setup/connectors.md)). Each is a separate state; doing one does not imply another.

Try it with [examples/noncoding-lookup](examples/noncoding-lookup/README.md) (no executor) and [examples/coding-handoff](examples/coding-handoff/README.md) (existing coding connector).

## Uninstall and recovery

- Remove the skill or plugin in ChatGPT where you added it; delete the cloned folder.
- Helper state lives in `<project>/.amaze-agi/` (gitignored, user-local); delete it to reset. A crash mid-write leaves a partial last journal line that `doctor` reports and the next write truncates.
- `bun run sources:verify` detects any changed vendored byte; restore with `git checkout -- third_party project-sources`.

## License

MIT ([LICENSE](LICENSE)). Vendored files keep their original licenses; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
