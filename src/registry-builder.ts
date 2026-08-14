import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { LocalSkillStore } from "./store.js";
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

function renderSite(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Agent Skills Registry</title>
  <style>
    :root { color-scheme: dark; font-family: ui-sans-serif, system-ui, sans-serif; background: #10131a; color: #edf1f7; }
    body { max-width: 960px; margin: 0 auto; padding: 48px 24px; }
    h1 { margin-bottom: 8px; }
    .muted { color: #9ba6b5; }
    input { width: 100%; box-sizing: border-box; margin: 24px 0; padding: 14px 16px; border: 1px solid #354052; border-radius: 10px; background: #191f2a; color: inherit; font-size: 16px; }
    .grid { display: grid; gap: 14px; }
    article { padding: 18px; border: 1px solid #2d3748; border-radius: 12px; background: #171c25; }
    article h2 { margin: 0 0 8px; }
    .tag { display: inline-block; margin: 8px 6px 0 0; padding: 3px 8px; border-radius: 999px; background: #283650; color: #b9d5ff; font-size: 12px; }
    a { color: #8dc2ff; }
  </style>
</head>
<body>
  <p class="muted">Personal Agent Skill Registry</p>
  <h1>Agent Skills</h1>
  <p class="muted">Search and inspect reusable skills for Codex, Claude Code and Gemini CLI.</p>
  <input id="search" type="search" placeholder="Search skills..." aria-label="Search skills">
  <main id="skills" class="grid"></main>
  <script>
    const search = document.querySelector('#search');
    const container = document.querySelector('#skills');
    let skills = [];
    const render = () => {
      const term = search.value.toLowerCase();
      const visible = skills.filter(skill => [skill.slug, skill.description, ...skill.tags, ...skill.compatibility].join(' ').toLowerCase().includes(term));
      container.innerHTML = visible.map(skill => '<article><h2>' + skill.name + ' <span class="muted">v' + skill.version + '</span></h2><p>' + skill.description + '</p><p class="muted">' + skill.compatibility.join(' / ') + '</p><p>' + skill.tags.map(tag => '<span class="tag">' + tag + '</span>').join('') + '</p><a href="' + skill.skill + '">Open SKILL.md</a> · <a href="' + skill.manifest + '">Manifest</a></article>').join('') || '<p class="muted">No skills found.</p>';
    };
    fetch('./registry.json').then(response => response.json()).then(registry => { skills = registry.skills; render(); });
    search.addEventListener('input', render);
  </script>
</body>
</html>
`;
}

function renderHeaders(): string {
  return `/registry.json
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=60

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
    await writeFile(path.join(outputRoot, "_headers"), renderHeaders(), "utf8");
  }
  console.log(`Built registry with ${skills.length} skills`);
}

build().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
