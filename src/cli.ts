#!/usr/bin/env node
import path from "node:path";
import { getAdapter, supportedAdapters } from "./adapters.js";
import { installSkill } from "./installer.js";
import { findSkill, loadRegistry } from "./registry.js";
import { installationKey, readState, writeState } from "./state.js";
import type { AgentId, InstalledSkill, SkillSummary } from "./types.js";
import { compareVersions, defaultRegistryRef, defaultStateDir } from "./utils.js";

interface ParsedArgs {
  command: string;
  positional: string[];
  options: Record<string, string | boolean>;
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command = "help", ...rest] = argv;
  const positional: string[] = [];
  const options: Record<string, string | boolean> = {};
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }
    const name = token.slice(2);
    const next = rest[index + 1];
    if (next && !next.startsWith("--")) {
      options[name] = next;
      index += 1;
    } else {
      options[name] = true;
    }
  }
  return { command, positional, options };
}

function optionString(args: ParsedArgs, name: string): string | undefined {
  const value = args.options[name];
  return typeof value === "string" ? value : undefined;
}

function hasOption(args: ParsedArgs, name: string): boolean {
  return args.options[name] === true;
}

function registryRef(args: ParsedArgs): string {
  return optionString(args, "registry") ?? process.env.SKILL_REGISTRY ?? defaultRegistryRef();
}

function stateDir(args: ParsedArgs): string {
  return optionString(args, "state-dir") ?? process.env.SKILL_STATE_DIR ?? defaultStateDir();
}

function printUsage(): void {
  console.log(`Personal Agent Skill Registry CLI

Usage:
  skill search <term>
  skill info <slug>
  skill install <slug[@version]> [--target codex|claude|gemini] [--dir <path>]
  skill list
  skill outdated
  skill update [slug] [--to <version>] [--force]

Options:
  --registry <path-or-url>  Registry JSON source (default: https://skill.shawnup.com/registry.json)
  --state-dir <path>       Local install metadata directory
  --target <agent>         codex, claude, gemini, or all
  --dir <path>              Custom installation root
  --force                   Overwrite locally modified managed files
  --json                    Print machine-readable output where supported
`);
}

function printSkill(skill: SkillSummary): void {
  console.log(`${skill.slug} v${skill.version}`);
  console.log(`  ${skill.description}`);
  console.log(`  tags: ${skill.tags.join(", ") || "none"}`);
  console.log(`  compatibility: ${skill.compatibility.join(", ") || "none"}`);
  console.log(`  files: ${skill.files.join(", ")}`);
  if (skill.owner) console.log(`  owner: ${skill.owner}`);
  if (skill.verified) console.log("  verified: yes");
}

function extractSlugAndVersion(value: string): { slug: string; version?: string } {
  const separator = value.lastIndexOf("@");
  if (separator > 0) return { slug: value.slice(0, separator), version: value.slice(separator + 1) };
  return { slug: value };
}

function assertVersion(skill: SkillSummary, requestedVersion: string | undefined): void {
  if (requestedVersion && requestedVersion !== skill.version) {
    throw new Error(`Registry only exposes ${skill.slug}@${skill.version}; requested ${requestedVersion}`);
  }
}

async function search(args: ParsedArgs): Promise<void> {
  const term = args.positional.join(" ").toLowerCase();
  const loaded = await loadRegistry(registryRef(args));
  const matches = loaded.document.skills.filter((skill) => {
    if (!term) return true;
    return [skill.slug, skill.name, skill.description, ...skill.tags, ...skill.compatibility]
      .join(" ")
      .toLowerCase()
      .includes(term);
  });
  if (hasOption(args, "json")) {
    console.log(JSON.stringify(matches, null, 2));
    return;
  }
  if (matches.length === 0) {
    console.log("No skills found.");
    return;
  }
  for (const skill of matches) console.log(`${skill.slug}\tv${skill.version}\t${skill.description}`);
}

async function info(args: ParsedArgs): Promise<void> {
  const slug = args.positional[0];
  if (!slug) throw new Error("Usage: skill info <slug>");
  const loaded = await loadRegistry(registryRef(args));
  const skill = findSkill(loaded.document, slug);
  if (hasOption(args, "json")) console.log(JSON.stringify(skill, null, 2));
  else printSkill(skill);
}

async function install(args: ParsedArgs): Promise<void> {
  const input = args.positional[0];
  if (!input) throw new Error("Usage: skill install <slug[@version]>");
  const { slug, version } = extractSlugAndVersion(input);
  const loaded = await loadRegistry(registryRef(args));
  const skill = findSkill(loaded.document, slug);
  assertVersion(skill, version);
  const requestedTarget = optionString(args, "target") as AgentId | "all" | undefined;
  const targets: Array<{ target?: AgentId; customDir?: string }> = requestedTarget === "all"
    ? supportedAdapters().map((adapter) => ({ target: adapter.id }))
    : [{ target: requestedTarget, customDir: optionString(args, "dir") }];
  const state = await readState(stateDir(args));
  const results: InstalledSkill[] = [];
  for (const target of targets) {
    const existing = state.installations.find((record) =>
      record.slug === slug && record.target === (target.target ?? "custom") &&
      (!target.customDir || path.resolve(record.installPath) === path.join(path.resolve(target.customDir), slug)),
    );
    const record = await installSkill({
      registryRef: loaded.ref,
      skill,
      target: target.target,
      customDir: target.customDir,
      force: hasOption(args, "force"),
      existing,
    });
    state.installations = state.installations.filter((candidate) => installationKey(candidate) !== installationKey(record));
    state.installations.push(record);
    results.push(record);
  }
  await writeState(state, stateDir(args));
  for (const record of results) console.log(`Installed ${record.slug}@${record.version} → ${record.installPath}`);
}

async function listInstalled(args: ParsedArgs): Promise<void> {
  const state = await readState(stateDir(args));
  if (hasOption(args, "json")) {
    console.log(JSON.stringify(state.installations, null, 2));
    return;
  }
  if (state.installations.length === 0) {
    console.log("No installed skills.");
    return;
  }
  for (const record of state.installations) {
    console.log(`${record.slug}\tv${record.version}\t${record.target}\t${record.installPath}`);
  }
}

async function findUpdates(args: ParsedArgs): Promise<Array<{ record: InstalledSkill; latest: SkillSummary; registry: string }>> {
  const state = await readState(stateDir(args));
  const requestedSlug = args.positional[0];
  const requestedVersion = optionString(args, "to");
  const updates: Array<{ record: InstalledSkill; latest: SkillSummary; registry: string }> = [];
  for (const record of state.installations) {
    if (requestedSlug && record.slug !== requestedSlug) continue;
    const ref = optionString(args, "registry") ?? record.registry;
    const loaded = await loadRegistry(ref);
    const latest = findSkill(loaded.document, record.slug);
    if (requestedVersion && latest.version !== requestedVersion) {
      throw new Error(`Registry only exposes ${record.slug}@${latest.version}; requested ${requestedVersion}`);
    }
    if (compareVersions(latest.version, record.version) > 0) updates.push({ record, latest, registry: loaded.ref });
  }
  return updates;
}

async function outdated(args: ParsedArgs): Promise<void> {
  const updates = await findUpdates(args);
  if (hasOption(args, "json")) {
    console.log(JSON.stringify(updates, null, 2));
    return;
  }
  if (updates.length === 0) {
    console.log("All installed skills are up to date.");
    return;
  }
  for (const update of updates) {
    console.log(`${update.record.slug}\t${update.record.version} → ${update.latest.version}\t${update.record.target}`);
  }
}

async function update(args: ParsedArgs): Promise<void> {
  const updates = await findUpdates(args);
  if (updates.length === 0) {
    console.log("All installed skills are up to date.");
    return;
  }
  const state = await readState(stateDir(args));
  for (const updateCandidate of updates) {
    const record = await installSkill({
      registryRef: updateCandidate.registry,
      skill: updateCandidate.latest,
      target: updateCandidate.record.target === "custom" ? "custom" : updateCandidate.record.target,
      customDir: updateCandidate.record.target === "custom"
        ? path.dirname(updateCandidate.record.installPath)
        : undefined,
      force: hasOption(args, "force"),
      existing: updateCandidate.record,
    });
    state.installations = state.installations.filter((candidate) => installationKey(candidate) !== installationKey(updateCandidate.record));
    state.installations.push(record);
    console.log(`Updated ${record.slug} ${updateCandidate.record.version} → ${record.version}`);
  }
  await writeState(state, stateDir(args));
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  switch (args.command) {
    case "search":
      await search(args);
      break;
    case "info":
      await info(args);
      break;
    case "install":
    case "add":
      await install(args);
      break;
    case "list":
      await listInstalled(args);
      break;
    case "outdated":
      await outdated(args);
      break;
    case "update":
      await update(args);
      break;
    case "help":
    case "--help":
    case "-h":
      printUsage();
      break;
    default:
      throw new Error(`Unknown command: ${args.command}`);
  }
}

main().catch((error: unknown) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
