import { access } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { SkillManifest } from "./types.js";

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export function parseManifest(text: string): SkillManifest {
  const parsed = parseYaml(text) as Partial<SkillManifest> | null;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Manifest must contain a YAML object");
  }
  return {
    schemaVersion: parsed.schemaVersion ?? 0,
    name: parsed.name ?? "",
    version: parsed.version ?? "",
    description: parsed.description ?? "",
    tags: parsed.tags ?? [],
    entrypoint: parsed.entrypoint ?? "SKILL.md",
    compatibility: parsed.compatibility ?? [],
    permissions: parsed.permissions ?? {},
    requires: parsed.requires ?? {},
    owner: parsed.owner,
    verified: parsed.verified,
  };
}

export async function validateManifest(
  manifest: SkillManifest,
  expectedSlug?: string,
  skillDir?: string,
): Promise<string[]> {
  const errors: string[] = [];
  if (manifest.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (!manifest.name || typeof manifest.name !== "string") errors.push("name is required");
  if (!manifest.version || !VERSION_PATTERN.test(manifest.version)) errors.push("version must use SemVer");
  if (!manifest.description || typeof manifest.description !== "string") errors.push("description is required");
  if (!Array.isArray(manifest.tags) || manifest.tags.some((tag) => typeof tag !== "string")) errors.push("tags must be a string array");
  if (!manifest.entrypoint || typeof manifest.entrypoint !== "string") errors.push("entrypoint is required");
  if (!Array.isArray(manifest.compatibility) || manifest.compatibility.some((item) => typeof item !== "string")) errors.push("compatibility must be a string array");
  if (!manifest.permissions || typeof manifest.permissions !== "object") errors.push("permissions must be an object");
  if (!manifest.requires || typeof manifest.requires !== "object") errors.push("requires must be an object");
  if (expectedSlug && (!SLUG_PATTERN.test(expectedSlug) || manifest.name !== expectedSlug)) {
    errors.push(`manifest name must match slug ${expectedSlug}`);
  }
  if (skillDir) {
    try {
      await access(path.join(skillDir, manifest.entrypoint));
    } catch {
      errors.push(`entrypoint does not exist: ${manifest.entrypoint}`);
    }
    try {
      await access(path.join(skillDir, "SKILL.md"));
    } catch {
      errors.push("SKILL.md is required");
    }
  }
  return errors;
}
