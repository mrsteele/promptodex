/**
 * Prompt response from the Promptodex API
 */
export interface PromptResponse {
  slug: string;
  content: string;
}

/**
 * Promptodex API base URL
 */
const API_BASE = "https://promptodex.com/api/v1/prompts";

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
export async function fetchPrompt(slug: string): Promise<PromptResponse> {
  const url = `${API_BASE}/${encodeURIComponent(slug)}`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Prompt not found: ${slug}`);
    }
    throw new Error(`Failed to fetch prompt: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as PromptResponse;
  return data;
}
