import { fail } from "./errors.ts";
import { type GoalId, isCanonicalId, type TaskId } from "./ids.ts";
import type { State } from "./types.ts";

export type AliasNamespace = "goal" | "task" | "target";

export function aliasKey(ns: AliasNamespace, alias: string): string {
  return `${ns}:${alias}`;
}

/** Pure lookup: canonical id or alias -> canonical id. Never creates. */
export function lookupGoal(state: State, ref: string): GoalId | undefined {
  const id = isCanonicalId(ref, "goal") ? ref : state.aliases[aliasKey("goal", ref)];
  return id !== undefined && isCanonicalId(id, "goal") && state.goals[id] ? id : undefined;
}

export function lookupTask(state: State, ref: string): TaskId | undefined {
  const id = isCanonicalId(ref, "task") ? ref : state.aliases[aliasKey("task", ref)];
  return id !== undefined && isCanonicalId(id, "task") && state.tasks[id] ? id : undefined;
}

/** Targets are canonical only once declared; aliases may be re-pointed and are resolved at use time. */
export function lookupTarget(state: State, ref: string): string | undefined {
  if (state.targets[ref]) return ref;
  const canonical = state.aliases[aliasKey("target", ref)];
  return canonical && state.targets[canonical] ? canonical : undefined;
}

export function resolveGoal(state: State, ref: string): GoalId {
  return lookupGoal(state, ref) ?? fail("not_found", `unknown goal: ${ref}`);
}

export function resolveTask(state: State, ref: string): TaskId {
  return lookupTask(state, ref) ?? fail("not_found", `unknown task: ${ref}`);
}

export function resolveTarget(state: State, ref: string): string {
  return lookupTarget(state, ref) ?? fail("not_found", `unknown target: ${ref}`);
}
