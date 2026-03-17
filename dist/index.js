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
 * Supports versioned prompts using the @version suffix (e.g., "my-prompt@1").
 * Without a version, the latest version is returned.
 *
 * @param slug - The unique identifier for the prompt in Promptodex (optionally with @version suffix)
 * @param variables - Optional object containing variable values to substitute
 * @param options - Optional options including apiKey for private prompts
 * @returns The rendered prompt string
 * @throws Error if the prompt cannot be fetched
 *
 * @example
 * ```typescript
 * import { pod } from "promptodex";
 *
 * // Fetch and render latest version
 * const prompt = await pod("make-a-soul", { name: "Matt" });
 * console.log(prompt); // "Create a soul named Matt"
 *
 * // Fetch specific version
 * const v1 = await pod("make-a-soul@1", { name: "Matt" });
 *
 * // Fetch private prompt with API key
 * const privatePrompt = await pod("my-private-prompt", { name: "Matt" }, {
 *   apiKey: "POD_live_XXXXXXX"
 * });
 * ```
 */
export async function pod(slug, variables = {}, options = {}) {
    const response = await fetchPrompt(slug, options);
    return renderPrompt(response.content, variables);
}
//# sourceMappingURL=index.js.map