# Source-based decision (no executor)

A short lookup-and-decide job that needs no coding connector. It shows the light path of the `amaze-goal` skill: bind the job, read one routed source, quote it exactly, decide, read the result back.

## Steps

1. **Bind.** Outcome: a one-line decision with a citation. Finish line: the two readbacks in `goal.json`. Reporting: two sentences.
2. **Choose jobs.** Task kind `web-performance` routes to `19-performance.md`. No memory lookup, web research, independent review or execution is needed; skip them.
3. **Read and quote.** Open the Project source `19-performance.md` and find the section for `SKILL.md`. Quote line 390 exactly and keep the nested path (`19-performance.md > SKILL.md:390`).
4. **Decide.** Write the decision with the quote and its scope (see `decision.example.md`). The quote supports *what the guidance says*; it does not measure any site.
5. **Read back and report.** Check the decision text and citation, then report.

If the source were missing from the Project, or the fetch failed, the outcome is *inconclusive*; say so rather than answering from memory.

## Optional helper commands

```sh
amaze-agi research plan web-performance           # exact filename, SHA-256, upstream commit
amaze-agi goal create --file goal.json            # prints the approval phrase
amaze-agi goal approve report-basis 1 --confirmation "<user reply containing the phrase>"
amaze-agi evidence quote report-basis --anchor anchor.json --scope attribution \
  --quote "| LCP, INP, CLS at p75 | Field | User-outcome Core Web Vitals; use for pass/fail prioritization |" \
  --claim "field p75 is the pass/fail basis"
amaze-agi goal close report-basis
```

`e2e/noncoding-lookup.test.ts` runs these commands against the pinned sources, including a wrong-path quote that must not count as support.
