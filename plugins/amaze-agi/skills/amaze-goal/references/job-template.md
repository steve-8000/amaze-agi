# Job template

Fill this in briefly before work starts. Keep the user's wording for the outcome and finish line.

```text
Outcome:       what the user will have when this is done
Scope:         included / explicitly excluded
Finish line:   observable checks that mean done (each one readable back)
Constraints:   deadlines, budget, approvals, things not to touch
Sources:       memory? routed task kind? web? independent review? none?
Execution:     connector and exact target, or "none (answer only)"
Reporting:     format, language, where it is delivered
Revision:      r1 = the user's request (quote or reference it); later revisions need the user's decision
```

## Choosing jobs

| Situation | Jobs |
| --- | --- |
| Answer from the conversation or one cited source | none; answer and cite |
| Depends on the user's past choices or project facts | memory lookup (bounded) |
| Task kind listed in the source index | read the routed files only |
| Current or external facts | public web research with links |
| Unfamiliar architecture, conflicting evidence, costly mistake | independent domain review before execution |
| Changes files, systems or accounts | execution through an existing connector on a confirmed target |

Each parallel job states: question, allowed sources, budget (sources, time), expected output shape and how its result will be checked. Do not start two jobs that answer the same question unless disagreement itself is what you need to measure.

## Finish line rules

- When the request is unambiguous, record it as r1 with where it came from (the user's message, quoted or referenced) and start. Ask only when outcome, scope or finish line is genuinely open.
- Every finish-line item names how it is read back (file hash, HTTP status, listing, receipt).
- A connector receipt is reported as *attested*, distinct from a check you ran.
- A material change to outcome or finish line (dropping, weakening or replacing an item) is proposed with the full new text and takes effect only after the user decides. Wording fixes that do not change what counts as done need no new revision.
- Record who decided and in which message. That record is context you attest to; it is not authentication and not permission to execute anything.
- After a revision, re-bind evidence that still applies and re-check only what the change affects ([evidence](evidence.md)).
