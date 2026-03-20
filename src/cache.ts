import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { PromptResponse } from "./fetchPrompt.ts";

/**
 * Structure of the promptodex.json configuration file
 */
export interface PromptoConfig {
  prompts?: Record<string, string>;
}

/**
 * Get the project root directory (where node_modules lives).
 * This module is installed at node_modules/promptodex/dist/,
 * so we need to traverse up to find the project root.
 */
export function getProjectRoot(): string {
  // Get the directory of this file
  const currentDir = dirname(fileURLToPath(import.meta.url));

  // Traverse up to find node_modules, then get its parent
  let dir = currentDir;
  while (dir !== "/" && dir !== dirname(dir)) {
    const parentName = dirname(dir);
    if (dir.endsWith("node_modules/promptodex/dist")) {
      // We're at node_modules/promptodex/dist, go up 3 levels
      return resolve(dir, "../../..");
    }
    if (dir.endsWith("node_modules/promptodex")) {
      // We're at node_modules/promptodex, go up 2 levels
      return resolve(dir, "../..");
    }
    // Check if current directory's parent is node_modules
    const parts = dir.split("/");
    const nodeModulesIndex = parts.lastIndexOf("node_modules");
    if (nodeModulesIndex !== -1) {
      // Return the directory containing node_modules
      return parts.slice(0, nodeModulesIndex).join("/") || "/";
    }
    dir = dirname(dir);
  }

  // Fallback: use current working directory
  return process.cwd();
}

/**
 * Get the path to the cache directory for a specific prompt
 */
export function getCachePath(name: string, version: string): string {
  const projectRoot = getProjectRoot();
  return join(projectRoot, ".promptodex", "cache", name, version, "data.json");
}

/**
 * Get the path to the promptodex.json config file
 */
export function getConfigPath(): string {
  const projectRoot = getProjectRoot();
  return join(projectRoot, "promptodex.json");
}

/**
 * Read prompt data from cache
 * @returns The cached PromptResponse or null if not found
 */
export function readCache(name: string, version: string): PromptResponse | null {
  const cachePath = getCachePath(name, version);

  if (!existsSync(cachePath)) {
    return null;
  }

  try {
    const data = readFileSync(cachePath, "utf-8");
    return JSON.parse(data) as PromptResponse;
  } catch {
    return null;
  }
}

/**
 * Write prompt data to cache
 */
export function writeCache(name: string, version: string, data: PromptResponse): void {
  const cachePath = getCachePath(name, version);
  const cacheDir = dirname(cachePath);
  const projectRoot = getProjectRoot();
  const promptodexDir = join(projectRoot, ".promptodex");

  // Check if .promptodex directory exists, if not, create it and log info
  if (!existsSync(promptodexDir)) {
    console.info(
      `[promptodex] Creating cache directory at ${promptodexDir}\n` +
        `[promptodex] Recommendation: Add ".promptodex" to your .gitignore file to avoid committing cached prompts.`
    );
  }

  // Create the full cache directory path if it doesn't exist
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }

  writeFileSync(cachePath, JSON.stringify(data, null, 2));
}

/**
 * Read the promptodex.json config file and get the version for a prompt name
 * @returns The version string or null if not configured
 */
export function getConfiguredVersion(name: string): string | null {
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const data = readFileSync(configPath, "utf-8");
    const config = JSON.parse(data) as PromptoConfig;
    return config.prompts?.[name] ?? null;
  } catch {
    return null;
  }
}

/**
 * Parse a slug to extract name and version
 * @example parseSlug("my-prompt@2") => { name: "my-prompt", version: "2" }
 * @example parseSlug("my-prompt") => { name: "my-prompt", version: null }
 */
export function parseSlug(slug: string): { name: string; version: string | null } {
  const atIndex = slug.lastIndexOf("@");
  if (atIndex === -1) {
    return { name: slug, version: null };
  }

  const name = slug.substring(0, atIndex);
  const version = slug.substring(atIndex + 1);

  // Handle edge case where @ is at the start (invalid but safe)
  if (name === "") {
    return { name: slug, version: null };
  }

  return { name, version };
}
