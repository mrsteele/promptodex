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
export declare function fetchPrompt(slug: string, options?: FetchOptions): Promise<PromptResponse>;
//# sourceMappingURL=fetchPrompt.d.ts.map