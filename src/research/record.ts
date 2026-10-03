import type { Engine } from "../core/engine.ts";
import { fail } from "../core/errors.ts";
import type { SessionRef } from "../core/ids.ts";
import type { EvidenceReceipt } from "../core/types.ts";
import {
  type Anchor,
  type Assessment,
  assessClaim,
  type ClaimScope,
  type ProvenanceResult,
  validateQuote,
} from "./quote.ts";

const SCOPES: Record<ClaimScope, true> = {
  text_present: true,
  attribution: true,
  defect: true,
  runtime_behavior: true,
  reasoning: true,
};

export function parseScope(raw: unknown): ClaimScope {
  if (raw === undefined) return "text_present";
  if (typeof raw !== "string" || !Object.hasOwn(SCOPES, raw))
    fail("invalid", `scope must be one of ${Object.keys(SCOPES).join("|")}`);
  return raw as ClaimScope;
}

export interface QuoteEvidence {
  provenance: ProvenanceResult;
  assessment: Assessment;
  receipt: EvidenceReceipt;
}

/**
 * Validates provenance deterministically and records the resulting receipt. A failed anchor lowers the
 * claim's level and is recorded; it never throws, so unrelated work is not blocked.
 */
export async function recordQuoteEvidence(
  engine: Engine,
  input: {
    goal: string;
    quote: string;
    anchor: Anchor | undefined;
    scope: ClaimScope;
    claim: string;
    criterionId?: string;
    by: SessionRef;
  },
  root: string,
): Promise<QuoteEvidence> {
  const provenance = await validateQuote(input.quote, input.anchor, root);
  const assessment = assessClaim(provenance, input.scope);
  const anchor = input.anchor;
  const resolved = provenance.resolved;
  const gitResolved = anchor?.kind === "git" && resolved !== undefined;
  const receipt = engine.recordValidatedEvidence({
    goal: input.goal,
    criterionId: input.criterionId,
    source: {
      kind: gitResolved ? "repo_file" : "vendored_source",
      uri: !anchor
        ? "amaze-source:unanchored"
        : anchor.kind === "git"
          ? `git:${anchor.sha}`
          : `amaze-source:${anchor.mappingId}`,
      repoSha: anchor?.kind === "git" ? anchor.sha : undefined,
      path: resolved?.path,
      lines: resolved?.lines,
      revision: provenance.sourceSha256 ? `sha256:${provenance.sourceSha256}` : undefined,
    },
    claimKind: input.scope === "runtime_behavior" ? "execution_result" : "reasoning",
    claim: input.claim,
    status: assessment.status,
    level: assessment.level,
    contentSha256: provenance.sourceSha256,
    observed: [provenance.detail, ...assessment.notes].join(" | "),
    recordedBy: input.by,
  });
  return { provenance, assessment, receipt };
}
