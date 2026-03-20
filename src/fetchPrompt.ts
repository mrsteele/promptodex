/**
 * Prompt response from the Promptodex API
 */
export interface PromptResponse {
  slug: string;
  content: string;
}

/**
 * Options for fetching prompts
 */
export interface FetchOptions {
  /**
   * API key for accessing private prompts.
   * Format: POD_live_XXXXXXX
   */
  apiKey?: string;
}

/**
 * Promptodex API base URL
 */
const API_BASE = "https://promptodex.com/api/v1/prompts";

/**
 * Parse a slug to extract name and version
 * @example parseSlugInternal("my-prompt@2") => { name: "my-prompt", version: "2" }
 * @example parseSlugInternal("my-prompt") => { name: "my-prompt", version: null }
 */
function parseSlugInternal(slug: string): { name: string; version: string | null } {
  const atIndex = slug.lastIndexOf("@");
  if (atIndex === -1 || atIndex === 0) {
    return { name: slug, version: null };
  }
  return {
    name: slug.substring(0, atIndex),
    version: slug.substring(atIndex + 1),
  };
}

/**
 * Fetches a prompt from the Promptodex registry by slug.
 *
 * Supports versioned prompts using the @version suffix (e.g., "my-prompt@1").
 * Without a version, the latest version is returned.
 *
 * @param slug - The unique identifier for the prompt (optionally with @version suffix)
 * @param options - Optional fetch options including apiKey for private prompts
 * @returns The prompt response containing slug and content
 * @throws Error if the fetch fails or prompt is not found
 *
 * @example
 * ```typescript
 * // Fetch latest version
 * const prompt = await fetchPrompt("make-a-soul");
 * 
 * // Fetch specific version
 * const v1 = await fetchPrompt("make-a-soul@1");
 * 
 * // Fetch private prompt with API key
 * const privatePrompt = await fetchPrompt("my-private-prompt", {
 *   apiKey: "POD_live_XXXXXXX"
 * });
 * ```
 */
export async function fetchPrompt(slug: string, options: FetchOptions = {}): Promise<PromptResponse> {
  const { name, version } = parseSlugInternal(slug);
  
  // Build URL: /prompts/{name} or /prompts/{name}/{version}
  const url = version
    ? `${API_BASE}/${encodeURIComponent(name)}/${encodeURIComponent(version)}`
    : `${API_BASE}/${encodeURIComponent(name)}`;

  const headers: Record<string, string> = {};
  if (options.apiKey) {
    headers["Authorization"] = `Bearer ${options.apiKey}`;
  }

  const response = await fetch(url, {
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Prompt not found: ${slug}`);
    }
    if (response.status === 401) {
      throw new Error(`Unauthorized: Invalid or missing API key for prompt: ${slug}`);
    }
    if (response.status === 403) {
      throw new Error(`Forbidden: Access denied to prompt: ${slug}`);
    }
    throw new Error(`Failed to fetch prompt: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as PromptResponse;
  return data;
}
