---
name: amaze-goal
description: Run a request as a bounded job in dot - bind the outcome and finish line, plan only the research, memory, review and execution jobs that help, execute through existing connectors on a verified target, and close only on recorded evidence. Use for multi-step work, coding handoffs, source-based decisions and anything that must be delivered or remembered.
---

# amaze-goal

Dot is the control tower. This skill is procedure, not authority: it never grants a permission, and platform, workspace and connector rules always win. It adds no runtime, scheduler or hook; use the connectors and dot features that already exist.

## 1. Light intent, conditional plan

1. Bind the job before acting, in the user's words: outcome, scope, finish line, constraints, source needs and how to report. Use [the job template](references/job-template.md). When the request already settles these, it is the first revision of the finish line; do not ask the user to approve it again. Ask only about scope that is actually unresolved.
2. Pick only the jobs that earn their cost:
   - **Memory lookup** (GBrain or other connected memory) when past decisions, preferences, project records or lessons matter. Follow [memory](references/memory.md).
   - **Routed sources** when the task kind appears in [the source index](references/source-index.md). Read only the listed files.
   - **Public web research** for current or external facts.
   - **Independent domain review** in a separate project-scoped conversation when the architecture is unfamiliar, evidence conflicts or a mistake is expensive.
   - **Execution** through an existing connector (for code: the existing OMP connector).
   Simple grounded work skips research. Run jobs in parallel only when they are independent; give each a stated output, a source/time budget and provenance; deduplicate what you hand them.
3. Merge results by evidence. Agreement between models is not verification; weigh sources by authority and fit, not by count or recency alone.

## 2. Verified execution

Follow [execution](references/execution.md): confirm the actual target (folder, repo, branch, worktree or account) and the current session, model and thinking level before any write. Keep one writer per shared resource. Hand each phase off with a settled, self-contained brief; record what was sent, to whom and when. An UNKNOWN external effect is reconciled by readback before any retry. A user cancellation stops dependent work; it is not a failure to repair. Close worker sessions you started once their results are secured.

## 3. Review, delivery, learning

1. Review the immutable result (commit SHA, artifact hash, exported revision), not a moving file or a worker's claim. Record evidence per [evidence](references/evidence.md); reuse evidence that still applies instead of re-running unchanged checks.
2. A material change to the outcome or finish line is the user's decision: propose it and wait for their reply; never decide it yourself to reach completion. Re-check only the evidence the change affects.
3. Deliver with separate upload and attachment receipts and keep the exact source bytes and SHA-256 ([delivery](references/delivery.md)).
4. Save material decisions, blockers and findings to memory when they happen and read each write back. Stop at the finish line and report what was verified, what a connector attested, and what remains unverified.

## Optional local helper

The repository ships `amaze-agi`, a small CLI that records the job ledger and checks quotes, anchors, readbacks and source integrity. It runs only where a connector can run it; dot does not need it to follow this skill.
