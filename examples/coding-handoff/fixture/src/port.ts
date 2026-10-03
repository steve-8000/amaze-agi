// Fixed fixture for the coding handoff example: the cast below accepts anything.
export function parsePort(value: unknown): number {
  return value as number;
}
