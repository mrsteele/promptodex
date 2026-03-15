import { describe, it } from "node:test";
import assert from "node:assert";
import { renderPrompt } from "./renderPrompt.ts";

describe("renderPrompt", () => {
  it("should replace single variable", () => {
    const result = renderPrompt("Hello {{name}}!", { name: "Matt" });
    assert.strictEqual(result, "Hello Matt!");
  });

  it("should replace multiple variables", () => {
    const result = renderPrompt("{{greeting}}, {{name}}!", {
      greeting: "Hello",
      name: "Matt",
    });
    assert.strictEqual(result, "Hello, Matt!");
  });

  it("should handle missing variables as empty string", () => {
    const result = renderPrompt("Hello {{name}}!", {});
    assert.strictEqual(result, "Hello !");
  });

  it("should handle undefined variables as empty string", () => {
    const result = renderPrompt("Hello {{name}}!", { name: undefined });
    assert.strictEqual(result, "Hello !");
  });

  it("should handle null variables as empty string", () => {
    const result = renderPrompt("Hello {{name}}!", { name: null });
    assert.strictEqual(result, "Hello !");
  });

  it("should handle whitespace inside braces", () => {
    const result = renderPrompt("Hello {{ name }}!", { name: "Matt" });
    assert.strictEqual(result, "Hello Matt!");
  });

  it("should convert numbers to strings", () => {
    const result = renderPrompt("Count: {{count}}", { count: 42 });
    assert.strictEqual(result, "Count: 42");
  });

  it("should convert booleans to strings", () => {
    const result = renderPrompt("Active: {{active}}", { active: true });
    assert.strictEqual(result, "Active: true");
  });

  it("should handle template with no variables", () => {
    const result = renderPrompt("Hello World!");
    assert.strictEqual(result, "Hello World!");
  });

  it("should handle empty template", () => {
    const result = renderPrompt("");
    assert.strictEqual(result, "");
  });

  it("should handle same variable multiple times", () => {
    const result = renderPrompt("{{name}} meets {{name}}", { name: "Matt" });
    assert.strictEqual(result, "Matt meets Matt");
  });

  it("should not replace malformed braces", () => {
    const result = renderPrompt("{name} and {{{name}}}", { name: "Matt" });
    assert.strictEqual(result, "{name} and {Matt}");
  });
});
