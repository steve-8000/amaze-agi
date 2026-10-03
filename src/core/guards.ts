/** Canonical object guard for this dependency-free package; callers still check each field they use. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
