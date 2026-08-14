import { readFile } from "node:fs/promises";
import path from "node:path";
import type { InstallState, InstalledSkill } from "./types.js";
import { defaultStateDir, writeJsonAtomic } from "./utils.js";

export function statePath(stateDir = defaultStateDir()): string {
  return path.join(stateDir, "installed.json");
}

export async function readState(stateDir = defaultStateDir()): Promise<InstallState> {
  try {
    const parsed = JSON.parse(await readFile(statePath(stateDir), "utf8")) as Partial<InstallState>;
    return {
      schemaVersion: 1,
      installations: Array.isArray(parsed.installations) ? parsed.installations : [],
    };
  } catch {
    return { schemaVersion: 1, installations: [] };
  }
}

export async function writeState(state: InstallState, stateDir = defaultStateDir()): Promise<void> {
  await writeJsonAtomic(statePath(stateDir), state);
}

export function installationKey(record: Pick<InstalledSkill, "slug" | "target" | "installPath">): string {
  return `${record.slug}:${record.target}:${record.installPath}`;
}
