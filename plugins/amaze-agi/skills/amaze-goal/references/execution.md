# Execution

Execution happens only through connectors and tools that already exist (for coding, the existing OMP connector). Their permissions are the real boundary; this file is procedure.

## Before the first write

1. Confirm the target from the system, not from memory: folder or repository root, remote, branch, worktree, account or environment.
2. Confirm the session that will act and its model and thinking level. Do not change settings of a live session unless the user asked.
3. Name the single writer for each shared resource. Side work (read-only research, review) may run in parallel; writes to the same target do not.
4. Prefer the existing session over creating new ones; create extra workers only when the work is independent and worth the overhead.

## Model roles

[model-preferences.json](model-preferences.json) holds editable defaults: a strong model for core design and complex decisions, lighter models for supporting research, review and routine implementation from a settled handoff, and an escalation model used only when specifically justified. A model being listed by a provider does not prove it is available to this account, nor anything about its price or quality. Replace the defaults with your own.

## Handoff

A handoff is self-contained: goal and finish line, exact target, inputs and sources, constraints, the existing check to run, and the expected report (result, readback, commit or artifact hash). Record what was sent, to which executor, and when.

## Outcomes

| Outcome | Next step |
| --- | --- |
| Succeeded with readback | record evidence |
| Failed | record the failure; fix or re-plan |
| Unknown (timeout, lost reply) | read the target back to learn whether it applied; do not retry first |
| Cancelled by the user | stop dependent dispatch; report the state |

No connector here offers exactly-once delivery across hosts. A late reply after reconciliation is recorded as an observation, not a new result.
