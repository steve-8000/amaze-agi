export function errnoCode(err: unknown): string | undefined {
  if (err && typeof err === "object" && "code" in err && typeof err.code === "string") return err.code;
  return undefined;
}
