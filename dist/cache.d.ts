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
export declare function getProjectRoot(): string;
/**
 * Get the path to the cache directory for a specific prompt
 */
export declare function getCachePath(name: string, version: string): string;
/**
 * Get the path to the promptodex.json config file
 */
export declare function getConfigPath(): string;
/**
 * Read prompt data from cache
 * @returns The cached PromptResponse or null if not found
 */
export declare function readCache(name: string, version: string): PromptResponse | null;
/**
 * Write prompt data to cache
 */
export declare function writeCache(name: string, version: string, data: PromptResponse): void;
/**
 * Read the promptodex.json config file and get the version for a prompt name
 * @returns The version string or null if not configured
 */
export declare function getConfiguredVersion(name: string): string | null;
/**
 * Parse a slug to extract name and version
 * @example parseSlug("my-prompt@2") => { name: "my-prompt", version: "2" }
 * @example parseSlug("my-prompt") => { name: "my-prompt", version: null }
 */
export declare function parseSlug(slug: string): {
    name: string;
    version: string | null;
};
//# sourceMappingURL=cache.d.ts.map