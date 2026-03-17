/**
 * Promptodex API base URL
 */
const API_BASE = "https://promptodex.com/api/v1/prompts";
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
export async function fetchPrompt(slug, options = {}) {
    const url = `${API_BASE}/${encodeURIComponent(slug)}`;
    const headers = {};
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
    const data = (await response.json());
    return data;
}
//# sourceMappingURL=fetchPrompt.js.map