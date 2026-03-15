/**
 * Prompt response from the Promptodex API
 */
export interface PromptResponse {
    slug: string;
    content: string;
}
/**
 * Fetches a prompt from the Promptodex registry by slug.
 *
 * @param slug - The unique identifier for the prompt
 * @returns The prompt response containing slug and content
 * @throws Error if the fetch fails or prompt is not found
 *
 * @example
 * ```typescript
 * const prompt = await fetchPrompt("make-a-soul");
 * console.log(prompt.content); // "Create a soul named {{name}}"
 * ```
 */
export declare function fetchPrompt(slug: string): Promise<PromptResponse>;
//# sourceMappingURL=fetchPrompt.d.ts.map