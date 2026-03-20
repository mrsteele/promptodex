export { fetchPrompt } from "./fetchPrompt.ts";
export type { PromptResponse, FetchOptions } from "./fetchPrompt.ts";
export { renderPrompt } from "./renderPrompt.ts";
export type { Variables } from "./renderPrompt.ts";
export {
  parseSlug,
  getConfiguredVersion,
  readCache,
  writeCache,
  getProjectRoot,
} from "./cache.ts";
export type { PromptoConfig } from "./cache.ts";

import { fetchPrompt } from "./fetchPrompt.ts";
import type { FetchOptions, PromptResponse } from "./fetchPrompt.ts";
import { renderPrompt } from "./renderPrompt.ts";
import type { Variables } from "./renderPrompt.ts";
import {
  parseSlug,
  getConfiguredVersion,
  readCache,
  writeCache,
} from "./cache.ts";

/**
 * Options for the pod function
 */
export interface PodOptions extends FetchOptions {
  /**
   * Skip cache lookup and always fetch from the registry.
   * The response will still be cached for future use.
   */
  skipCache?: boolean;
}

/**
 * Fetches and renders a prompt from Promptodex in a single call.
 *
 * This is the main entry point for the library. It:
 * 1. Checks for a cached version of the prompt (if version specified or configured)
 * 2. Fetches the prompt template from the Promptodex registry (if not cached)
 * 3. Caches the response for future use
 * 4. Renders the template with the provided variables
 * 5. Returns the final prompt string
 *
 * Supports versioned prompts using the @version suffix (e.g., "my-prompt@1").
 * Without a version, checks promptodex.json for a configured version,
 * otherwise fetches the latest version from the registry.
 *
 * Cache is stored at .promptodex/cache/{name}/{version}/data.json relative
 * to the project root (sibling to node_modules).
 *
 * @param slug - The unique identifier for the prompt in Promptodex (optionally with @version suffix)
 * @param variables - Optional object containing variable values to substitute
 * @param options - Optional options including apiKey for private prompts and skipCache
 * @returns The rendered prompt string
 * @throws Error if the prompt cannot be fetched
 *
 * @example
 * ```typescript
 * import { pod } from "promptodex";
 *
 * // Fetch and render latest version (or configured version from promptodex.json)
 * const prompt = await pod("make-a-soul", { name: "Matt" });
 * console.log(prompt); // "Create a soul named Matt"
 *
 * // Fetch specific version (uses cache if available)
 * const v1 = await pod("make-a-soul@1", { name: "Matt" });
 *
 * // Fetch private prompt with API key
 * const privatePrompt = await pod("my-private-prompt", { name: "Matt" }, {
 *   apiKey: "POD_live_XXXXXXX"
 * });
 *
 * // Skip cache and fetch fresh from registry
 * const fresh = await pod("make-a-soul@1", { name: "Matt" }, { skipCache: true });
 * ```
 */
export async function pod(
  slug: string,
  variables: Variables = {},
  options: PodOptions = {}
): Promise<string> {
  const { skipCache = false, ...fetchOptions } = options;
  const { name, version: slugVersion } = parseSlug(slug);

  // Determine the version to use:
  // 1. Use version from slug if provided
  // 2. Otherwise, check promptodex.json for configured version
  // 3. If neither, version remains null and we fetch latest from registry
  const version = slugVersion ?? getConfiguredVersion(name);

  let response: PromptResponse;

  if (version && !skipCache) {
    // Try to read from cache first
    const cached = readCache(name, version);
    if (cached) {
      return renderPrompt(cached.content, variables);
    }
  }

  // Fetch from registry
  // If we have a version (from slug or config), fetch with that version
  const fetchSlug = version ? `${name}@${version}` : slug;
  response = await fetchPrompt(fetchSlug, fetchOptions);

  // Cache the response if we have a specific version
  if (version) {
    writeCache(name, version, response);
  }

  return renderPrompt(response.content, variables);
}
