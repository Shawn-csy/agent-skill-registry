import { createHash } from "node:crypto";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export const DEFAULT_REGISTRY_URL = "https://skill.shawnup.com/registry.json";

export function isRemoteRef(ref: string): boolean {
  return /^https?:\/\//.test(ref);
}

export async function readTextRef(ref: string): Promise<string> {
  if (isRemoteRef(ref)) {
    const response = await fetch(ref);
    if (!response.ok) {
      throw new Error(`Unable to fetch ${ref}: ${response.status} ${response.statusText}`);
    }
    return response.text();
  }
  return readFile(path.resolve(ref), "utf8");
}

export function resolveRef(baseRef: string, relativeRef: string): string {
  if (isRemoteRef(baseRef)) {
    return new URL(relativeRef.replaceAll(path.sep, "/"), baseRef).toString();
  }
  return path.resolve(path.dirname(path.resolve(baseRef)), relativeRef);
}

export async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function writeJsonAtomic(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  await writeJson(tempPath, value);
  await rename(tempPath, filePath);
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function sha256(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

export function defaultStateDir(): string {
  return path.join(os.homedir(), ".skill-registry");
}

export function defaultRegistryRef(): string {
  return DEFAULT_REGISTRY_URL;
}

export function compareVersions(left: string, right: string): number {
  const normalize = (version: string) => version.replace(/^v/, "").split("-")[0].split(".").map(Number);
  const a = normalize(left);
  const b = normalize(right);
  for (let index = 0; index < 3; index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

export function safeRelativePath(relativePath: string): string {
  const normalized = path.posix.normalize(relativePath.replaceAll(path.sep, "/"));
  if (normalized === "." || normalized.startsWith("../") || normalized.includes("/../") || path.posix.isAbsolute(normalized)) {
    throw new Error(`Unsafe skill file path: ${relativePath}`);
  }
  return normalized;
}
