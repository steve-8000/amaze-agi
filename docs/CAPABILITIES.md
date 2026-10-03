# Capabilities

Three kinds of guarantee are kept apart:

- **Procedural**: guidance dot follows from the skill. Useful, not enforceable here.
- **Deterministic helper**: behaviour of the local CLI, covered by tests in this repository.
- **Platform/connector**: enforced by ChatGPT, the workspace or the connector; outside this repository.

| Capability | Kind | Evidence in this repo |
| --- | --- | --- |
| Job binding, conditional multi-job plan, deduplicated parallel research | procedural | `SKILL.md`, `references/job-template.md` |
| Memory lifecycle (sourced entries and records, authority over recency, live confirmation of current state, timely writes with readback, bounded packs) | procedural | `references/memory.md` |
| Target and session confirmation, one writer, phase handoffs, model changes with readback, closing finished owned workers | procedural | `references/execution.md`, `references/model-preferences.json` |
| Evidence reuse by applicability review instead of re-running unchanged checks | procedural + helper | `references/evidence.md`; `evidence record` with `reuses` |
| Review of immutable results; evidence levels kept apart | procedural + helper | `references/evidence.md`; quote validator tests |
| Pinned sources: 18 folders, 150 files, licenses, exports, routing | helper | `bun run sources:verify`, `test/sources.test.ts` |
| Exact quote/path/span validation; wrong path, wrong span, fetch error never strong | helper | `test/quote.test.ts` |
| Pure lookups create nothing | helper | `test/regressions.test.ts`, doctor test, noncoding e2e |
| Alias resolved to canonical id before gates | helper | `test/regressions.test.ts` |
| Readback mismatch keeps goal open | helper | `test/regressions.test.ts` |
| Request binds revision 1; later revisions need a recorded user decision (caller-attested); old evidence stale until re-bound with `reuses` | helper | `test/regressions.test.ts`, both e2e flows |
| UNKNOWN run/upload requires reconciliation; late replies kept as observations | helper | `test/regressions.test.ts`, coding e2e |
| Delivery levels: source hash, destination hash verified, connector-accepted upload/attach, listed attach | helper | `test/regressions.test.ts`, coding e2e |
| Plugin/skill package layout and generated source index | helper | `bun run plugin:verify` |
| Privacy scan of first-party files | helper | `bun run scan:privacy` |
| Skill installed/enabled in ChatGPT or dot | platform | user, workspace admin, or host-assisted where supported ([setup](setup/dot-skill.md)) |
| Project sources uploaded and retrievable in a conversation | platform | user or host-assisted registration, then observation ([setup](setup/chatgpt-project.md)) |
| Connector availability, permissions, execution | connector | the connector ([setup](setup/connectors.md)) |
| Exactly-once effects across hosts | none | not offered |

## Rehearsals, not live runs

`e2e/coding-handoff.test.ts` and `e2e/noncoding-lookup.test.ts` drive the real CLI over the example templates. The coding rehearsal replaces the connector with a scripted stand-in that edits the fixture and runs its existing check. Neither proves that dot loaded the skill, that a Project returned a source, or that OMP or a delivery store ran. Live acceptance is done by running the examples with dot and recording real receipts.
