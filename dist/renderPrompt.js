/**
 * Renders a prompt template by replacing {{variable}} placeholders with values.
 *
 * Rules:
 * - Variables are wrapped in double curly braces: {{variableName}}
 * - Missing variables become empty string
 * - Whitespace inside braces is trimmed: {{ name }} works like {{name}}
 *
 * @param template - The prompt template string with {{variable}} placeholders
 * @param variables - Object containing variable values to substitute
 * @returns The rendered prompt string
 *
 * @example
 * ```typescript
 * const result = renderPrompt("Hello {{name}}!", { name: "Matt" });
 * console.log(result); // "Hello Matt!"
 * ```
 */
export function renderPrompt(template, variables = {}) {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
        const value = variables[key];
        if (value === undefined || value === null) {
            return "";
        }
        return String(value);
    });
}
//# sourceMappingURL=renderPrompt.js.map