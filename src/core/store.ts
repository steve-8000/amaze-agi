import * as fs from "node:fs";
import * as path from "node:path";
import { fail } from "./errors.ts";
import { errnoCode } from "./fsutil.ts";
import type { Deps } from "./ids.ts";
import { applyPut, applyRecord, type JournalRecord, type Put } from "./journal.ts";
import { emptyState, type State } from "./types.ts";

export const JOURNAL_FILE = "journal.jsonl";
export const LOCK_FILE = "writer.lock";

export interface Tx {
  readonly state: State;
  put(put: Put): void;
}

interface Loaded {
  state: State;
  offset: number;
  partialTail: boolean;
}

function loadFrom(journal: string, base: Loaded): Loaded {
  let fd: number;
  try {
    fd = fs.openSync(journal, "r");
  } catch (err) {
    if (errnoCode(err) === "ENOENT") return base;
    throw err;
  }
  try {
    const size = fs.fstatSync(fd).size;
    if (size <= base.offset) return { ...base, partialTail: false };
    const buf = Buffer.alloc(size - base.offset);
    fs.readSync(fd, buf, 0, buf.length, base.offset);
    const lastNl = buf.lastIndexOf(0x0a);
    if (lastNl < 0) return { ...base, partialTail: true };
    const text = buf.subarray(0, lastNl).toString("utf8");
    for (const line of text.split("\n")) {
      if (line.length === 0) continue;
      const record: JournalRecord = JSON.parse(line);
      applyRecord(base.state, record);
    }
    return { state: base.state, offset: base.offset + lastNl + 1, partialTail: lastNl + 1 < buf.length };
  } finally {
    fs.closeSync(fd);
  }
}

function freshLoad(home: string): Loaded {
  return loadFrom(path.join(home, JOURNAL_FILE), { state: emptyState(), offset: 0, partialTail: false });
}

/** Pure read: never creates directories, files or locks. */
export function readState(home: string): State {
  return freshLoad(home).state;
}

export function journalHasPartialTail(home: string): boolean {
  return freshLoad(home).partialTail;
}

function pidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return errnoCode(err) === "EPERM";
  }
}

/**
 * Serialized single-writer store over an append-only journal. Every mutation holds an
 * exclusive lock, refreshes from disk, validates against the fresh state, then appends.
 */
export class Store {
  private loaded: Loaded = { state: emptyState(), offset: 0, partialTail: false };

  constructor(
    readonly home: string,
    private readonly deps: Deps,
    private readonly lockTimeoutMs = 3000,
  ) {}

  get journalPath(): string {
    return path.join(this.home, JOURNAL_FILE);
  }

  /** Read-only snapshot; does not create anything. */
  snapshot(): State {
    this.loaded = loadFrom(this.journalPath, this.loaded);
    return structuredClone(this.loaded.state);
  }

  mutate<T>(op: string, fn: (tx: Tx) => T): T {
    fs.mkdirSync(this.home, { recursive: true });
    const release = this.acquire();
    try {
      this.loaded = loadFrom(this.journalPath, this.loaded);
      if (this.loaded.partialTail) {
        fs.truncateSync(this.journalPath, this.loaded.offset);
        this.loaded.partialTail = false;
      }
      const draft = structuredClone(this.loaded.state);
      const puts: Put[] = [];
      const tx: Tx = {
        state: draft,
        put(p) {
          applyPut(draft, p);
          puts.push(p);
        },
      };
      const result = fn(tx);
      if (puts.length === 0) return result;
      const record: JournalRecord = { seq: this.loaded.state.seq + 1, at: this.deps.now(), op, puts };
      const line = Buffer.from(`${JSON.stringify(record)}\n`, "utf8");
      const fd = fs.openSync(this.journalPath, "a");
      try {
        fs.writeSync(fd, line);
        fs.fsyncSync(fd);
      } finally {
        fs.closeSync(fd);
      }
      draft.seq = record.seq;
      this.loaded = { state: draft, offset: this.loaded.offset + line.length, partialTail: false };
      return result;
    } finally {
      release();
    }
  }

  private acquire(): () => void {
    const lockPath = path.join(this.home, LOCK_FILE);
    const deadline = Date.now() + this.lockTimeoutMs;
    for (;;) {
      try {
        const fd = fs.openSync(lockPath, "wx");
        fs.writeSync(fd, JSON.stringify({ pid: process.pid }));
        fs.closeSync(fd);
        return () => fs.rmSync(lockPath, { force: true });
      } catch (err) {
        if (errnoCode(err) !== "EEXIST") throw err;
      }
      let holder: unknown;
      try {
        const parsed: unknown = JSON.parse(fs.readFileSync(lockPath, "utf8"));
        if (parsed && typeof parsed === "object" && "pid" in parsed) holder = parsed.pid;
      } catch {
        holder = undefined;
      }
      if (typeof holder === "number" && holder !== process.pid && !pidAlive(holder)) {
        fs.rmSync(lockPath, { force: true });
        continue;
      }
      if (Date.now() > deadline) fail("lock_timeout", `writer lock held: ${lockPath}`, { holder });
      Bun.sleepSync(5);
    }
  }
}
