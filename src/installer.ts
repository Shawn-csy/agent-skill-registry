import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAdapter, resolveDetectedTarget } from "./adapters.js";
import { readSkillFiles } from "./registry.js";
import type { AgentId, InstalledSkill, SkillSummary } from "./types.js";
import { fileExists, safeRelativePath, sha256 } from "./utils.js";

export interface InstallOptions {
  registryRef: string;
  skill: SkillSummary;
  target?: AgentId;
  customDir?: string;
  force?: boolean;
  existing?: InstalledSkill;
}

export async function resolveInstallTarget(target?: AgentId, customDir?: string): Promise<{ target: AgentId; installRoot: string }> {
  if (customDir) return { target: "custom", installRoot: path.resolve(customDir) };
  const resolvedTarget = target && target !== "custom" ? target : await resolveDetectedTarget();
  return { target: resolvedTarget, installRoot: getAdapter(resolvedTarget).installRoot() };
}

async function readChecksum(filePath: string): Promise<string | null> {
  if (!(await fileExists(filePath))) return null;
  return sha256(await readFile(filePath));
}

async function assertSafeToUpdate(targetDir: string, existing: InstalledSkill | undefined, force: boolean): Promise<void> {
  if (!existing || force) return;
  for (const relativeFile of existing.managedFiles) {
    const currentChecksum = await readChecksum(path.join(targetDir, relativeFile));
    const expectedChecksum = existing.checksums[relativeFile];
    if (currentChecksum !== expectedChecksum) {
      throw new Error(`Local modification detected in ${relativeFile}; use --force to overwrite`);
    }
  }
}

async function writeFilesWithRollback(targetDir: string, files: Map<string, string>): Promise<Record<string, string>> {
  const previous = new Map<string, Buffer | null>();
  const checksums: Record<string, string> = {};
  try {
    for (const [relativeFile, content] of files) {
      const safePath = safeRelativePath(relativeFile);
      const filePath = path.join(targetDir, safePath);
      previous.set(safePath, await fileExists(filePath) ? await readFile(filePath) : null);
      await mkdir(path.dirname(filePath), { recursive: true });
      const tempPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
      await writeFile(tempPath, content, "utf8");
      await rename(tempPath, filePath);
      checksums[safePath] = sha256(content);
    }
    return checksums;
  } catch (error) {
    for (const [relativeFile, content] of previous) {
      const filePath = path.join(targetDir, relativeFile);
      if (content === null) {
        try {
          await unlink(filePath);
        } catch {
          // Best effort cleanup; the original error is more useful to the user.
        }
      } else {
        await writeFile(filePath, content);
      }
    }
    throw error;
  }
}

export async function installSkill(options: InstallOptions): Promise<InstalledSkill> {
  const { target, installRoot } = await resolveInstallTarget(options.target, options.customDir);
  const targetDir = path.join(installRoot, options.skill.slug);
  await assertSafeToUpdate(targetDir, options.existing, Boolean(options.force));
  const files = await readSkillFiles(options.registryRef, options.skill);
  if (files.size === 0) throw new Error(`Skill ${options.skill.slug} has no files`);
  const checksums = await writeFilesWithRollback(targetDir, files);
  const now = new Date().toISOString();
  return {
    slug: options.skill.slug,
    version: options.skill.version,
    registry: options.registryRef,
    target,
    installPath: targetDir,
    managedFiles: [...files.keys()].map(safeRelativePath),
    checksums,
    installedAt: options.existing?.installedAt ?? now,
    updatedAt: now,
  };
}
