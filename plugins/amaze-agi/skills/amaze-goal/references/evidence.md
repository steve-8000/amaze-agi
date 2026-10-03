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

## Closing

Close only when every finish-line item has current evidence under the latest user-approved revision, no task is open and no unknown outcome is unreconciled. Report verified, attested and unverified items separately.
