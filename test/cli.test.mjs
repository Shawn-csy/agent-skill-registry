import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const cli = path.join(root, "dist", "cli.js");

function run(args) {
  const registry = path.join(root, "generated", "registry.json");
  const commandArgs = args.includes("--registry") ? args : [...args, "--registry", registry];
  return execFileSync(process.execPath, [cli, ...commandArgs], { cwd: root, encoding: "utf8" });
}

function runFailure(args) {
  const registry = path.join(root, "generated", "registry.json");
  const commandArgs = args.includes("--registry") ? args : [...args, "--registry", registry];
  return spawnSync(process.execPath, [cli, ...commandArgs], { cwd: root, encoding: "utf8" });
}

test("search and info expose registry metadata", () => {
  const search = run(["search", "cloudflare"]);
  assert.match(search, /cloudflare-deploy/);

  const info = run(["info", "cloudflare-deploy", "--json"]);
  const parsed = JSON.parse(info);
  assert.equal(parsed.version, "1.0.0");
  assert.deepEqual(parsed.compatibility, ["claude-code", "codex", "gemini-cli"]);
});

test("install, list and outdated manage local state", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "skill-registry-test-"));
  const skillDir = path.join(tempRoot, "skills");
  const stateDir = path.join(tempRoot, "state");

  const installed = run([
    "install",
    "cloudflare-deploy",
    "--target",
    "custom",
    "--dir",
    skillDir,
    "--state-dir",
    stateDir,
  ]);
  assert.match(installed, /Installed cloudflare-deploy@1\.0\.0/);
  assert.match(await readFile(path.join(skillDir, "cloudflare-deploy", "SKILL.md"), "utf8"), /Cloudflare Deploy/);

  const list = run(["list", "--state-dir", stateDir]);
  assert.match(list, /cloudflare-deploy\tv1\.0\.0\tcustom/);

  const outdated = run(["outdated", "--state-dir", stateDir]);
  assert.match(outdated, /up to date/);
});

test("update detects local edits and supports force", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "skill-registry-update-"));
  const registryRoot = path.join(tempRoot, "registry");
  await cp(path.join(root, "generated"), registryRoot, { recursive: true });
  const registryPath = path.join(registryRoot, "registry.json");

  const skillDir = path.join(tempRoot, "installed");
  const stateDir = path.join(tempRoot, "state");
  run(["install", "cloudflare-deploy", "--registry", registryPath, "--target", "custom", "--dir", skillDir, "--state-dir", stateDir]);
  await writeFile(path.join(skillDir, "cloudflare-deploy", "SKILL.md"), "# Local edit\n");

  const registry = JSON.parse(await readFile(registryPath, "utf8"));
  const cloudflare = registry.skills.find((skill) => skill.slug === "cloudflare-deploy");
  cloudflare.version = "1.1.0";
  await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  await writeFile(
    path.join(registryRoot, "skills", "cloudflare-deploy", "SKILL.md"),
    "# Cloudflare Deploy 1.1\n\nUpdated content.\n",
  );

  const rejected = runFailure(["update", "cloudflare-deploy", "--registry", registryPath, "--state-dir", stateDir]);
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /Local modification detected/);

  const updated = run(["update", "cloudflare-deploy", "--registry", registryPath, "--force", "--state-dir", stateDir]);
  assert.match(updated, /Updated cloudflare-deploy 1\.0\.0 → 1\.1\.0/);
  assert.match(await readFile(path.join(skillDir, "cloudflare-deploy", "SKILL.md"), "utf8"), /Updated content/);
});

test("build publishes distinct human and agent surfaces", async () => {
  const humanPage = await readFile(path.join(root, "site", "index.html"), "utf8");
  assert.match(humanPage, /Shawnup Skill Index/);
  assert.match(humanPage, /Machine-readable by default/);
  assert.match(humanPage, /application\/json/);
  assert.match(humanPage, /id="hero-count"/);
  assert.match(humanPage, /id="generated-at"/);
  assert.doesNotMatch(humanPage, /Agent Skill Registry/);

  const discovery = JSON.parse(await readFile(path.join(root, "site", ".well-known", "agent-skill-registry.json"), "utf8"));
  assert.equal(discovery.type, "agent-skill-registry");
  assert.equal(discovery.catalog, "/registry.json");
  assert.equal(discovery.skill, "/skills/{slug}/SKILL.md");
  assert.equal(discovery.retrieval.catalog, "GET /registry.json");
  assert.equal(discovery.crud.transport, "git");
  assert.match(discovery.crud.publish, /npm test.*npm run build.*git push -u origin <branch>/);
  assert.match(discovery.crud.pullRequest, /<branch> to main/);
  assert.match(discovery.crud.merge, /CI passes/);

  const agentGuide = await readFile(path.join(root, "site", "llms.txt"), "utf8");
  assert.match(agentGuide, /static and read-only over HTTP/);
  assert.match(agentGuide, /Create: add skills\/\{slug\}\/manifest\.yaml/);
  assert.match(agentGuide, /open a pull request to main/);
  assert.match(agentGuide, /GET \/skills\/\{slug\}\/SKILL\.md/);
  assert.match(agentGuide, /skill install <slug> --target codex/);
});
