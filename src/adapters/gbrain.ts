import { fail } from "../core/errors.ts";
import { sha256Hex } from "../core/hash.ts";
import type { EvidenceSource, EvidenceStatus } from "../core/types.ts";

export type CommandRunner = (argv: string[]) => { exitCode: number | null; stdout: string; stderr: string };

export const spawnRunner: CommandRunner = (argv) => {
  const proc = Bun.spawnSync(argv, { timeout: 60_000 });
  return { exitCode: proc.exitCode, stdout: proc.stdout.toString(), stderr: proc.stderr.toString() };
};

export interface GBrainConfig {
  binary: string;
  sourceId?: string;
  maxResults: number;
  snippetChars: number;
  maxBytes: number;
}

/**
 * Bounded decision-history context. It is advisory input to choices and can never authorize an action;
 * its receipts are at most `read_observed`/`inconclusive`.
 */
export interface DecisionContext {
  text: string;
  truncated: boolean;
  source: EvidenceSource;
  contentSha256: string;
  status: EvidenceStatus;
  level: "read_observed";
  claimKind: "data_fetched";
  authority: "none";
}

const READ_VERBS: Record<string, true> = { search: true, get: true };

function bounded(stdout: string, maxBytes: number): { text: string; truncated: boolean } {
  const buf = Buffer.from(stdout, "utf8");
  if (buf.length <= maxBytes) return { text: stdout, truncated: false };
  return { text: buf.subarray(0, maxBytes).toString("utf8"), truncated: true };
}

export class GBrainContext {
  constructor(
    private readonly config: GBrainConfig,
    private readonly run: CommandRunner = spawnRunner,
  ) {}

  private exec(verb: "search" | "get", args: string[], uri: string): DecisionContext {
    if (!READ_VERBS[verb]) fail("invalid", `gbrain verb ${verb} is not an allowed read`);
    const argv = [this.config.binary, verb, ...args];
    if (this.config.sourceId) argv.push("--source-id", this.config.sourceId);
    const res = this.run(argv);
    const source: EvidenceSource = { kind: "gbrain", uri };
    if (res.exitCode !== 0) {
      // A failed fetch is inconclusive, never negative evidence and never success.
      return {
        text: "",
        truncated: false,
        source,
        contentSha256: sha256Hex(new Uint8Array()),
        status: "inconclusive",
        level: "read_observed",
        claimKind: "data_fetched",
        authority: "none",
      };
    }
    const { text, truncated } = bounded(res.stdout, this.config.maxBytes);
    return {
      text,
      truncated,
      source: { ...source, revision: `sha256:${sha256Hex(Buffer.from(res.stdout, "utf8"))}` },
      contentSha256: sha256Hex(Buffer.from(text, "utf8")),
      status: text.trim().length > 0 ? "supported" : "inconclusive",
      level: "read_observed",
      claimKind: "data_fetched",
      authority: "none",
    };
  }

  search(query: string): DecisionContext {
    if (query.trim().length === 0) fail("invalid", "empty query");
    const args = [
      query,
      "--limit",
      String(this.config.maxResults),
      "--snippet-chars",
      String(this.config.snippetChars),
    ];
    const uri = `gbrain:search?q=${encodeURIComponent(query)}${this.config.sourceId ? "&source=<configured>" : ""}`;
    return this.exec("search", args, uri);
  }

  get(slug: string): DecisionContext {
    if (!/^[\w./-]+$/.test(slug) || slug.includes("..")) fail("invalid", `unsafe slug ${slug}`);
    return this.exec("get", [slug], `gbrain:page/${slug}`);
  }
}
