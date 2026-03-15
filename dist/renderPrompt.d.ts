/**
 * Variables object for template rendering
 */
export type Variables = Record<string, string | number | boolean | undefined | null>;
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
export declare function renderPrompt(template: string, variables?: Variables): string;
//# sourceMappingURL=renderPrompt.d.ts.map