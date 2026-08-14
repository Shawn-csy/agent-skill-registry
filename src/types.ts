export type AgentId = "codex" | "claude" | "gemini" | "custom";

export interface SkillPermissions {
  filesystem?: { read?: boolean; write?: boolean };
  shell?: boolean;
  network?: string[];
  [key: string]: unknown;
}

export interface SkillDependencies {
  skills?: string[];
  tools?: string[];
  mcp?: string[];
  [key: string]: unknown;
}

export interface SkillManifest {
  schemaVersion: number;
  name: string;
  version: string;
  description: string;
  tags: string[];
  entrypoint: string;
  compatibility: string[];
  permissions: SkillPermissions;
  requires: SkillDependencies;
  owner?: string;
  verified?: boolean;
}

export interface SkillSummary extends SkillManifest {
  slug: string;
  skill: string;
  manifest: string;
  files: string[];
}

export interface SkillContent {
  manifest: SkillManifest;
  files: string[];
  directory: string;
}

export interface RegistryDocument {
  registry: string;
  schemaVersion: number;
  generatedAt?: string;
  skills: SkillSummary[];
}

export interface LoadedRegistry {
  document: RegistryDocument;
  ref: string;
}

export interface InstalledSkill {
  slug: string;
  version: string;
  registry: string;
  target: AgentId;
  installPath: string;
  managedFiles: string[];
  checksums: Record<string, string>;
  installedAt: string;
  updatedAt: string;
}

export interface InstallState {
  schemaVersion: 1;
  installations: InstalledSkill[];
}
