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
Revision:      r1 (proposed) -> approved by the user's reply
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

- Every finish-line item names how it is read back (file hash, HTTP status, listing, receipt).
- A connector receipt is reported as *attested*, distinct from a check you ran.
- Revisions are proposed as `rN` with the full new text; they take effect only after the user replies with explicit approval. Evidence from an older revision is stale until re-checked.
