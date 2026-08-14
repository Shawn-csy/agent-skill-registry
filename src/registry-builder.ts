import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { LocalSkillStore } from "./store.js";
import { createAgentDiscovery, renderAgentGuide, renderSite } from "./site.js";
import type { RegistryDocument, SkillManifest } from "./types.js";
import { writeJson } from "./utils.js";

const projectRoot = process.cwd();
const sourceSkillsRoot = path.join(projectRoot, "skills");
const outputRoots = [path.join(projectRoot, "generated"), path.join(projectRoot, "site")];

async function copySkillArtifact(
  outputRoot: string,
  slug: string,
  manifest: SkillManifest,
  files: string[],
  sourceDirectory: string,
): Promise<void> {
  const destination = path.join(outputRoot, "skills", slug);
  await mkdir(destination, { recursive: true });
  for (const file of files) {
    if (file === "manifest.json") {
      await writeJson(path.join(destination, file), manifest);
      continue;
    }
    const source = path.join(sourceDirectory, file);
    const target = path.join(destination, file);
    await mkdir(path.dirname(target), { recursive: true });
    await cp(source, target);
  }
}

function renderHeaders(): string {
  return `/.well-known/*
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=300
  X-Robots-Tag: noindex

/agent.json
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=300
  X-Robots-Tag: noindex

/llms.txt
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=300
  X-Robots-Tag: noindex

/registry.json
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=60
  X-Robots-Tag: noindex

/skills/*
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=300
`;
}

async function build(): Promise<void> {
  const store = new LocalSkillStore(sourceSkillsRoot);
  const skills = await store.listSkills();
  if (skills.length === 0) throw new Error("No skills found under skills/");

  const artifacts: Array<{ slug: string; manifest: SkillManifest; files: string[]; directory: string }> = [];
  for (const skill of skills) {
    const artifact = await store.getSkill(skill.slug);
    if (!artifact) throw new Error(`Unable to load skill: ${skill.slug}`);
    artifacts.push({ slug: skill.slug, ...artifact });
  }
  const seen = new Set<string>();
  for (const skill of skills) {
    if (seen.has(skill.slug)) throw new Error(`Duplicate slug: ${skill.slug}`);
    seen.add(skill.slug);
  }

  for (const outputRoot of outputRoots) {
    await rm(outputRoot, { recursive: true, force: true });
    await mkdir(outputRoot, { recursive: true });
    for (const artifact of artifacts) {
      await copySkillArtifact(outputRoot, artifact.slug, artifact.manifest, artifact.files, artifact.directory);
    }
    const registry: RegistryDocument = {
      registry: "personal",
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      skills,
    };
    await writeJson(path.join(outputRoot, "registry.json"), registry);
    await writeFile(path.join(outputRoot, "index.html"), renderSite(), "utf8");
    await writeJson(path.join(outputRoot, ".well-known", "agent-skill-registry.json"), createAgentDiscovery());
    await writeJson(path.join(outputRoot, "agent.json"), createAgentDiscovery());
    await writeFile(path.join(outputRoot, "llms.txt"), renderAgentGuide(), "utf8");
    await writeFile(path.join(outputRoot, "_headers"), renderHeaders(), "utf8");
  }
  console.log(`Built registry with ${skills.length} skills`);
}

build().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
