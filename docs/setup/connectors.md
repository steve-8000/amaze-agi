# Setup: execution and delivery connectors (optional)

amaze-agi uses connectors you already have. It adds no connector, server or hook, and it does not change connector configuration. The connector's own permissions are the enforcement boundary.

## Coding: existing OMP connector

Use your existing OMP integration as a normal executor; nothing in this repository is loaded into OMP. Dot hands off one self-contained task (see `references/execution.md` in the skill and `examples/coding-handoff/`), and the connector reports back the commit SHA, the check it ran and the output.

Before the first write, dot confirms the target the connector will act on (repository root, branch, worktree) and the acting session's model and thinking level. If the reply is lost or times out, the outcome is UNKNOWN: read the repository back before any retry.

Optional helper ledger for the same flow:

```sh
amaze-agi target declare <repo-path>
amaze-agi run handoff <task> --executor omp --action "<what was asked>" --target <repo-path>
amaze-agi run outcome <run_id> --status succeeded|failed|unknown --detail "<reply summary>"
amaze-agi run reconcile <run_id> --applied|--not-applied --source source.json --claim "<what the readback showed>"
amaze-agi run verify <run_id>
```

## Delivery: Drive or another file store

Upload and attachment are recorded separately from what the delivering connector reports:

```sh
amaze-agi delivery upload <goal> report.md --dest "<DESTINATION_LABEL>" --status succeeded --detail "<reply>" --server-sha256 <hash reported by the store>
amaze-agi delivery attach <dlv_id> --container "<CONTAINER_LABEL>" --status succeeded --detail "<reply>" --listed
amaze-agi delivery reconcile <dlv_id> --part upload --found --server-sha256 <hash>
```

- Upload is `verified` only when the store's SHA-256 equals the local bytes; no hash means `unverified`; a different hash means `failed`.
- Attach is `verified` only with `--listed` (a fresh listing showed the item) and only after a verified upload.
- `unknown` upload or attach must be reconciled before another attempt is recorded.
- Keep folder IDs, account names and links out of committed files; use labels.
