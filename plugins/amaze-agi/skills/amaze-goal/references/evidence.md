# Evidence

## Record

Each item records: source, revision (commit, version or export hash), path and line span, observation time, scope, the claim, and an outcome of **supported**, **contradicted** or **inconclusive**.

## Keep these levels apart

1. **Available**: a source or app exists in the workspace.
2. **Selected**: it was chosen for this job.
3. **Fetched**: content was actually retrieved (a fetch error means nothing was learned).
4. **Quoted**: the quoted text matches the source at that path and span exactly.
5. **Interpreted**: what the quote is taken to mean; a reasoning step, stated as such.
6. **Executed**: behavior observed by running something on the actual target.

A higher level never follows from a lower one. A correct quote of unused code says nothing about runtime behavior; reasoning without a run stays qualified.

## Review

- Review the immutable thing: a commit SHA, an artifact hash, an exported source revision.
- A worker's "done" is a claim; the readback is the evidence.
- Several models agreeing is not a check. Resolve disagreement with a source or a run.
- Use the smallest checks that cover the real risk, plus the actual user flow when one exists.

## Reuse instead of re-running

Evidence stays valid while the immutable artifact, the criterion it supports, the scope and the relevant environment are unchanged. After a revision or a new phase:

1. List each existing item with its ID and ask whether those four still apply.
2. If they do, re-bind it: reference the earlier evidence ID and note why it still applies. Do not re-run an unchanged broad check.
3. If one changed, re-check only the claims it affects.

With the helper, re-binding is `evidence record` with `"reuses": "<ev_id>"` under the current revision. The helper checks the ID exists for this goal; judging applicability is the caller's review, not something it computes.

## Closing

Close only when every finish-line item has current evidence under the latest revision the user set, the tasks this goal needs (including its dependencies) are finished, and no unknown outcome of this goal is unreconciled. Unrelated jobs do not block closure. Report verified, attested and unverified items separately.
