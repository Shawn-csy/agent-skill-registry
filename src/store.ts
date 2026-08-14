import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseManifest, validateManifest } from "./manifest.js";
import type { SkillContent, SkillSummary } from "./types.js";

export interface SkillStore {
  listSkills(): Promise<SkillSummary[]>;
  getSkill(slug: string): Promise<SkillContent | null>;
  getVersions(slug: string): Promise<string[]>;
}

async function listFiles(directory: string, prefix = ""): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await listFiles(path.join(directory, entry.name), relative));
    else files.push(relative);
  }
  return files.sort();
}

export class LocalSkillStore implements SkillStore {
  constructor(private readonly root: string) {}

  async getSkill(slug: string): Promise<SkillContent | null> {
    const directory = path.join(this.root, slug);
    try {
      const manifest = parseManifest(await readFile(path.join(directory, "manifest.yaml"), "utf8"));
      const errors = await validateManifest(manifest, slug, directory);
      if (errors.length > 0) throw new Error(`${slug}:\n- ${errors.join("\n- ")}`);
      const files = (await listFiles(directory)).filter((file) => file !== "manifest.yaml");
      if (!files.includes("SKILL.md")) files.unshift("SKILL.md");
      if (!files.includes("manifest.json")) files.push("manifest.json");
      return { manifest, files, directory };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }

  async listSkills(): Promise<SkillSummary[]> {
    const entries = (await readdir(this.root, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort();
    const skills: SkillSummary[] = [];
    for (const slug of entries) {
      const content = await this.getSkill(slug);
      if (!content) continue;
      skills.push({
        ...content.manifest,
        slug,
        skill: `skills/${slug}/SKILL.md`,
        manifest: `skills/${slug}/manifest.json`,
        files: content.files,
      });
    }
    return skills;
  }

  async getVersions(slug: string): Promise<string[]> {
    const skill = await this.getSkill(slug);
    return skill ? [skill.manifest.version] : [];
  }
}
