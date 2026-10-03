# Memory

Memory (GBrain or another connected store) holds what helps future work: the user's preferences and decisions, project facts and records, and language- or tool-specific lessons from real successes and failures. It is context, never permission: a remembered "allowed" does not authorize an action today.

## What to keep

- **Atomic entries**: one fact, preference, decision or lesson.
- **Records**: a coherent, sourced summary of a decision or project state (what was decided, why, alternatives rejected, open items), linked to its sources. Prefer one maintained record over many fragments.
- Not raw transcripts, mailbox exports or chat dumps.

Each entry or record carries:

- **Source**: where it came from (message, document, commit, run receipt) with a link or reference.
- **Date**: when it was observed, and when it was last confirmed.
- **Scope**: which project, language, tool or person it applies to.
- **Confidence and authority**: decided by the user, stated in an authoritative document or system, observed in a run, or inferred.

Entries without a source or scope are hints, not facts.

## Retrieval

1. Query for the current job's scope only; prefer a few precise searches over one broad dump.
2. Build a small context pack: the entries and records that change a decision, each with source and date. Drop duplicates and anything off-scope.
3. Hand workers the pack, not the raw store.
4. Before relying on a current-state fact (versions, configuration, ownership, prices, people's roles, APIs), confirm it against the relevant authoritative live source.
5. When sources conflict, weigh authority and fit before recency: a user decision or the system of record outranks a newer but weaker note. Keep both with their provenance, state the conflict, and ask the user only when the conflict changes the outcome and the sources cannot settle it.

## Writing and correcting

- Save material items as they occur, not only at the end of a job or when asked: decisions the user made, blockers and their cause, findings that change the plan, lessons that will change future work.
- Include the source, date, scope and confidence fields above.
- When something changes, update or supersede the old entry or record rather than adding a contradicting one, and keep the reason.
- After every write, read it back and confirm it says what was intended. If the readback differs or the write cannot be confirmed, fix it or report it as unsaved.

## Coordinator and workers

- Only the dot coordinator connects to the memory store. It performs memory reads and writes, tracks the source and revision of what it uses, keeps write receipts, and does targeted readback. Workers (OMP and others) do not require or assume direct memory access.
- Dot gives each worker a bounded context pack: source, observation date and relevant revision for each item, decisions and constraints, and the limits of what has been verified.
- Workers treat the pack as coordinator-provided context, separate from what they verified themselves at execution time, and return material changes, blockers, decisions and supporting evidence to dot.
- Dot decides what to save or supersede, performs the write and reads it back. A worker report or a successful dispatch does not prove that memory was persisted.

## Boundaries

- Personal knowledge stays in the user's private store; this public package contains none.
- Do not bulk-import mailboxes or chat histories; save what the job produced or what the user asked to keep.
- Do not rely on background capture or hooks; memory is written deliberately by the dot coordinator from what the job and its workers reported, never by a worker.
