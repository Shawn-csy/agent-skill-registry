import { access } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { AgentId } from "./types.js";

export interface AgentAdapter {
  id: Exclude<AgentId, "custom">;
  displayName: string;
  installRoot(): string;
  detect(): Promise<boolean>;
}

const adapters: AgentAdapter[] = [
  {
    id: "codex",
    displayName: "Codex",
    installRoot: () => path.join(process.env.CODEX_HOME ?? path.join(os.homedir(), ".codex"), "skills"),
    detect: async () => Boolean(process.env.CODEX_HOME) || exists(path.join(os.homedir(), ".codex")),
  },
  {
    id: "claude",
    displayName: "Claude Code",
    installRoot: () => path.join(os.homedir(), ".claude", "skills"),
    detect: async () => exists(path.join(os.homedir(), ".claude")),
  },
  {
    id: "gemini",
    displayName: "Gemini CLI",
    installRoot: () => path.join(os.homedir(), ".gemini", "skills"),
    detect: async () => exists(path.join(os.homedir(), ".gemini")),
  },
];

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function getAdapter(id: Exclude<AgentId, "custom">): AgentAdapter {
  const adapter = adapters.find((candidate) => candidate.id === id);
  if (!adapter) throw new Error(`Unknown Agent target: ${id}`);
  return adapter;
}

export function supportedAdapters(): AgentAdapter[] {
  return adapters;
}

export async function resolveDetectedTarget(): Promise<Exclude<AgentId, "custom">> {
  const detected = [] as AgentAdapter[];
  for (const adapter of adapters) {
    if (await adapter.detect()) detected.push(adapter);
  }
  if (detected.length === 1) return detected[0].id;
  if (detected.length > 1) {
    throw new Error(`Multiple Agents detected (${detected.map((item) => item.id).join(", ")}); use --target explicitly`);
  }
  throw new Error("No Agent detected; use --target codex|claude|gemini or provide --dir");
}
