import path from "node:path";
import type { LoadedRegistry, RegistryDocument, SkillSummary } from "./types.js";
import { readTextRef, resolveRef, safeRelativePath } from "./utils.js";

export async function loadRegistry(ref: string): Promise<LoadedRegistry> {
  const resolvedRef = ref.startsWith("http") ? ref : path.resolve(ref);
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readTextRef(resolvedRef));
  } catch (error) {
    throw new Error(`Unable to read registry ${resolvedRef}: ${error instanceof Error ? error.message : String(error)}`);
  }
  const document = parsed as Partial<RegistryDocument>;
  if (document.schemaVersion !== 1 || !Array.isArray(document.skills)) {
    throw new Error(`Invalid registry ${resolvedRef}: schemaVersion 1 and skills are required`);
  }
  return { document: document as RegistryDocument, ref: resolvedRef };
}

export function findSkill(document: RegistryDocument, slug: string): SkillSummary {
  const skill = document.skills.find((candidate) => candidate.slug === slug);
  if (!skill) throw new Error(`Skill not found: ${slug}`);
  return skill;
}

export async function readSkillFiles(registryRef: string, skill: SkillSummary): Promise<Map<string, string>> {
  const skillPath = resolveRef(registryRef, skill.skill);
  const skillDirectory = path.posix.dirname(skill.skill.replaceAll(path.sep, "/"));
  const files = skill.files.length > 0 ? skill.files : ["SKILL.md"];
  const content = new Map<string, string>();
  for (const file of files) {
    const relativeFile = safeRelativePath(file);
    const sourceRef = resolveRef(registryRef, `${skillDirectory}/${relativeFile}`);
    if (sourceRef === skillPath || relativeFile === "SKILL.md") {
      content.set(relativeFile, await readTextRef(sourceRef));
      continue;
    }
    content.set(relativeFile, await readTextRef(sourceRef));
  }
  return content;
}
