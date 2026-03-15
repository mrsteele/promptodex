export { fetchPrompt } from "./fetchPrompt.js";
export { renderPrompt } from "./renderPrompt.js";
import { fetchPrompt } from "./fetchPrompt.js";
import { renderPrompt } from "./renderPrompt.js";
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
export async function pod(slug, variables = {}) {
    const response = await fetchPrompt(slug);
    return renderPrompt(response.content, variables);
}
//# sourceMappingURL=index.js.map