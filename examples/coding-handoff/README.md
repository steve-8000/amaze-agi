# Coding handoff (fixed fixture)

A small, repeatable job for trying the `amaze-goal` skill with dot and an existing coding connector such as OMP. This folder is a template: nothing here is evidence that a live run happened. Fill the receipt only from what the connector actually returned.

## Contents

| File | Purpose |
| --- | --- |
| `fixture/` | tiny TypeScript repo; `check.ts` is its existing check and fails until the task is done |
| `goal.json` | outcome, finish line (one local readback, one connector receipt), reporting |
| `task.json` | the single task and its readback |
| `anchor.json` | source anchor: `32-typescript-pro.md > references/type-guards.md` line 7 |
| `receipt.template.json` | connector readback to fill from the real run |

## Steps

1. **Bind the job.** Give dot the request and `goal.json`. Dot restates outcome, scope, finish line and reporting; you approve the criteria by replying with the phrase the helper prints (`approve r1 <hash8>`).
2. **Route sources.** Task kind `typescript` routes to exactly `32-typescript-pro.md` (see the skill's source index). Dot reads only that file and cites `references/type-guards.md` line 7. No web research, memory lookup or extra review is needed for this job.
3. **Confirm the target.** Copy `fixture/` into a scratch git repository the connector can reach, commit it, and have dot confirm the folder, branch and current session/model before any write.
4. **Hand off.** One self-contained message to the connector:
   > In `<scratch repo>` on branch `<branch>`, change only `src/port.ts` so `parsePort` uses a type predicate (`value is number`) and throws for non-integers and values outside 0-65535. Do not edit `check.ts`. Run `bun check.ts` unchanged, commit, and report the commit SHA, exit code and first output line.
5. **Read back.** Dot reads the commit's `src/port.ts` and the reported check result. A timeout or lost reply is UNKNOWN: inspect the repository before any retry.
6. **Record and close.** Fill `receipt.template.json` from the actual reply and record it; the `check` criterion is reported as *attested* (connector receipt), the `guard` criterion as *executed* (local readback).
7. **Deliver.** Report the SHA, the check output line and evidence ids; save any lesson worth keeping to memory and read it back.

## Optional helper commands

Run from the scratch repository with this repo's CLI (`bun <repo>/bin/amaze-agi.ts ...`):

```sh
amaze-agi goal create --file goal.json            # prints the approval phrase
amaze-agi goal approve ports 1 --confirmation "<user reply containing the phrase>"
amaze-agi task add ports --file task.json
amaze-agi evidence quote ports --quote "function isString(value: unknown): value is string {" \
  --anchor anchor.json --claim "type predicates narrow unknown input" --scope attribution
amaze-agi target declare <scratch-repo-path>
amaze-agi run handoff port-guard --executor omp --action "edit src/port.ts; run bun check.ts" --target <scratch-repo-path>
amaze-agi run outcome <run_id> --status succeeded --detail "<connector reply summary>"
amaze-agi run verify <run_id>
amaze-agi evidence record ports --file receipt.json   # filled from receipt.template.json
amaze-agi goal close ports
```

`e2e/coding-handoff.test.ts` rehearses these ledger steps locally with a scripted stand-in for the connector; it proves the templates and helper behave, not that dot or OMP ran.
