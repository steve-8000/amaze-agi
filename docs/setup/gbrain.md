# Setup: GBrain memory (optional)

[GBrain](https://github.com/garrytan/gbrain) can hold your sourced decisions, project facts and lessons. How dot should use memory (what to save, source/date/scope/confidence, conflicts, readback after writes, bounded context packs) is in the skill's `references/memory.md`.

Memory is context, never permission. Personal content stays in your own GBrain; nothing from it belongs in this repository or in public issues. Do not bulk-import mailboxes or chat histories for this skill; save what jobs produce or what you ask to keep.

## Reading from dot

Use whatever GBrain connection dot already has. Reads and writes go through that connection and its permissions.

## Reading from the helper (local, read-only)

1. Install and initialise GBrain yourself, following its README. Account and database setup stay outside this repository.
2. Confirm read access: `gbrain search "<a known term>" --limit 3`.
3. Enable it in the user-local profile `<project>/.amaze-agi/profile.local.json`:

   ```json
   { "gbrain": { "enabled": true, "binary": "gbrain", "sourceId": "<GBRAIN_SOURCE_ID>", "maxResults": 5, "snippetChars": 300, "maxBytes": 8000 } }
   ```

4. `amaze-agi doctor` checks the binary runs; `amaze-agi context gbrain search "<query>"` returns bounded results.

Behaviour:

- Only `search` and `get` run; output is truncated to `maxBytes`.
- A failed read is `inconclusive`, never "no history".
- Each result carries the SHA-256 of the returned text and `authority: "none"`.
- The helper never writes to GBrain; writes happen through your memory connector, followed by an immediate readback.
