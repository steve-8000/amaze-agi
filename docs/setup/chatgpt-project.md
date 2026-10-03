# Setup: ChatGPT Project sources and independent research (manual)

Registering Project sources is separate from installing the skill. Neither implies the other, and this repository cannot observe either; it prepares exact files and records what you observed.

## 1. Choose the task kind and files

```sh
bun <REPO_DIR>/bin/amaze-agi.ts research plan typescript
```

The plan lists exact filenames in `project-sources/`, their SHA-256, the pinned upstream commit and the nested documents. The same table is in the skill's `references/source-index.md`. `reasoningPreference` (`medium` for simple lookups, `extra-high` for code and research) is a suggestion for the setting you pick, not an API parameter.

## 2. Create a project-scoped workspace

1. Create a Project for one domain, for example `<PROJECT_LABEL>`.
2. Upload exactly the routed files, keeping their names.
3. Optional Project instructions: cite `filename > nested path:line`, say *inconclusive* when a source is missing or fails to load.

Use conversations in that Project for independent research or domain review: give each one question, the allowed sources and the expected output, and bring back only the answer with citations. Separate Projects keep unrelated sources out of each other's context.

## 3. Record the registration (user-local only)

Add each uploaded file to `.amaze-agi/profile.local.json` (see `examples/profile.example.json`) with the plan's `sha256` and `upstreamCommit` and a `proof` of what you saw and when. Never commit Project URLs, IDs or account names.

```sh
bun <REPO_DIR>/bin/amaze-agi.ts research status --task-kind typescript
```

- `needs_project_registration`: nothing recorded for the required files.
- `partial`: missing files, hash or revision mismatch, or no proof.
- `ready`: every file recorded with matching hash and revision plus proof. A recorded observation, not an automated check.

## 4. Check what an answer cites

A source list or a model's own claim does not prove a section was retrieved. Validate a quoted passage against the pinned bytes:

```sh
bun <REPO_DIR>/bin/amaze-agi.ts research excerpt 32-typescript-pro.md references/type-guards.md --lines 1-20
bun <REPO_DIR>/bin/amaze-agi.ts evidence quote <goal> --quote "<exact text>" --anchor anchor.json --scope attribution --claim "<attributed claim>"
```

`anchor.json` is `{"kind":"vendored","mappingId":"32-typescript-pro","path":"references/type-guards.md","lines":[N,M]}` (original lines) or `{"kind":"bundle",...}` (export lines). Real text cited under the wrong nested file is `wrong_path` and is downgraded to `claimed`/`contradicted`; a fetch error is `inconclusive`.
