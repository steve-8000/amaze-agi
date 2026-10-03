# Memory

Memory (GBrain or another connected store) holds what helps future work: the user's decisions and preferences, project facts, and language- or tool-specific lessons from real successes and failures. It is context, never permission: a remembered "allowed" does not authorize an action today.

## What a memory entry carries

- **Claim**: one fact, decision or lesson in a sentence.
- **Source**: where it came from (message, document, commit, run receipt) with a link or reference.
- **Date**: when it was observed, and when it was last confirmed.
- **Scope**: which project, language, tool or person it applies to.
- **Confidence**: stated by the user, observed in a run, or inferred.

Entries without a source or scope are hints, not facts.

## Retrieval

1. Query for the current job's scope only; prefer a few precise searches over one broad dump.
2. Build a small context pack: the entries that change a decision, each with source and date. Drop duplicates and anything off-scope.
3. Hand workers the pack, not the raw store.
4. When an entry conflicts with a current source, the current source wins; note the conflict.
5. Old entries about fast-moving things (versions, prices, people's roles, APIs) are checked against a live source before use.

## Writing and correcting

- Save only material items: a decision the user made, a failure with its cause, a lesson that will change future work. Not chat summaries.
- Include the source, date, scope and confidence fields above.
- When something changes, update or supersede the old entry rather than adding a contradicting one, and keep the reason.
- After every write, read the entry back and confirm it says what was intended. If the readback differs, fix it before reporting done.

## Boundaries

- Personal knowledge stays in the user's private store; this public package contains none.
- Do not bulk-import mailboxes or chat histories; save what the job produced or the user asked to keep.
- Do not rely on background capture or hooks; memory is written deliberately at the end of a job or when the user asks.
