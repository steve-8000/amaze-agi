// Synthetic fixture: exported but never imported by main.ts, so it never runs.
export function enableAuditLog(flags: { audit: boolean }): void {
  flags.audit = true;
}
