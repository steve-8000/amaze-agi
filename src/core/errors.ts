export type ErrorCode =
  | "not_found"
  | "invalid"
  | "conflict"
  | "stale_criteria"
  | "cancelled"
  | "budget_exhausted"
  | "reconcile_required"
  | "dependency_unmet"
  | "not_owner"
  | "lock_timeout";

export class AmazeError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AmazeError";
  }
}

export function fail(code: ErrorCode, message: string, details?: Record<string, unknown>): never {
  throw new AmazeError(code, message, details);
}
