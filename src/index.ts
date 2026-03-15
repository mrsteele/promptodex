export { fetchPrompt } from "./fetchPrompt.ts";
export type { PromptResponse } from "./fetchPrompt.ts";
export { renderPrompt } from "./renderPrompt.ts";
export type { Variables } from "./renderPrompt.ts";

import { fetchPrompt } from "./fetchPrompt.ts";
import { renderPrompt } from "./renderPrompt.ts";
import type { Variables } from "./renderPrompt.ts";

/**
 * Fetches and renders a prompt from Promptodex in a single call.
 *
 * This is the main entry point for the library. It:
 * 1. Fetches the prompt template from the Promptodex registry
 * 2. Renders the template with the provided variables
 * 3. Returns the final prompt string
 *
 * @param slug - The unique identifier for the prompt in Promptodex
 * @param variables - Optional object containing variable values to substitute
 * @returns The rendered prompt string
 * @throws Error if the prompt cannot be fetched
 *
 * @example
 * ```typescript
 * import { pod } from "promptodex";
 *
 * const prompt = await pod("make-a-soul", { name: "Matt" });
 * console.log(prompt); // "Create a soul named Matt"
 * ```
 */
export async function pod(slug: string, variables: Variables = {}): Promise<string> {
  const response = await fetchPrompt(slug);
  return renderPrompt(response.content, variables);
}
