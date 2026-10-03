# Capabilities

Three kinds of guarantee are kept apart:

- **Procedural**: guidance dot follows from the skill. Useful, not enforceable here.
- **Deterministic helper**: behaviour of the local CLI, covered by tests in this repository.
- **Platform/connector**: enforced by ChatGPT, the workspace or the connector; outside this repository.

| Capability | Kind | Evidence in this repo |
| --- | --- | --- |
| Job binding, conditional multi-job plan, deduplicated parallel research | procedural | `SKILL.md`, `references/job-template.md` |
| Memory lifecycle (source/date/scope/confidence, conflicts, update + readback, bounded packs) | procedural | `references/memory.md` |
| Target and session confirmation, one writer, model role preferences | procedural | `references/execution.md`, `references/model-preferences.json` |
| Review of immutable results; evidence levels kept apart | procedural + helper | `references/evidence.md`; quote validator tests |
| Pinned sources: 18 folders, 150 files, licenses, exports, routing | helper | `bun run sources:verify`, `test/sources.test.ts` |
| Exact quote/path/span validation; wrong path, wrong span, fetch error never strong | helper | `test/quote.test.ts` |
| Pure lookups create nothing | helper | `test/regressions.test.ts`, doctor test, noncoding e2e |
| Alias resolved to canonical id before gates | helper | `test/regressions.test.ts` |
| Readback mismatch keeps goal open | helper | `test/regressions.test.ts` |
| Criteria revision needs exact user phrase; old evidence stale | helper | `test/regressions.test.ts`, noncoding e2e |
| UNKNOWN run/upload requires reconciliation; late replies kept as observations | helper | `test/regressions.test.ts`, coding e2e |
| Delivery upload/attach receipts with SHA-256 match | helper | `test/regressions.test.ts`, coding e2e |
| Plugin/skill package layout and generated source index | helper | `bun run plugin:verify` |
| Privacy scan of first-party files | helper | `bun run scan:privacy` |
| Skill installed/enabled in ChatGPT or dot | platform | manual ([setup](setup/dot-skill.md)) |
| Project sources uploaded and retrievable in a conversation | platform | manual observation ([setup](setup/chatgpt-project.md)) |
| Connector availability, permissions, execution | connector | the connector ([setup](setup/connectors.md)) |
| Exactly-once effects across hosts | none | not offered |

## Rehearsals, not live runs

`e2e/coding-handoff.test.ts` and `e2e/noncoding-lookup.test.ts` drive the real CLI over the example templates. The coding rehearsal replaces the connector with a scripted stand-in that edits the fixture and runs its existing check. Neither proves that dot loaded the skill, that a Project returned a source, or that OMP or a delivery store ran. Live acceptance is done by running the examples with dot and recording real receipts.
