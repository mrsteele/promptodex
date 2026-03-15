import { describe, it, mock, afterEach } from "node:test";
import assert from "node:assert";
import { pod } from "./index.ts";

describe("pod", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should fetch and render a prompt", async () => {
    const mockResponse = {
      slug: "make-a-soul",
      content: "Create a soul named {{name}}",
    };

    globalThis.fetch = mock.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    })) as unknown as typeof fetch;

    const result = await pod("make-a-soul", { name: "Matt" });

    assert.strictEqual(result, "Create a soul named Matt");
  });

  it("should handle prompts with no variables", async () => {
    const mockResponse = {
      slug: "simple",
      content: "This is a simple prompt",
    };

    globalThis.fetch = mock.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    })) as unknown as typeof fetch;

    const result = await pod("simple");

    assert.strictEqual(result, "This is a simple prompt");
  });

  it("should handle multiple variables", async () => {
    const mockResponse = {
      slug: "greeting",
      content: "{{greeting}}, {{name}}! Welcome to {{place}}.",
    };

    globalThis.fetch = mock.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    })) as unknown as typeof fetch;

    const result = await pod("greeting", {
      greeting: "Hello",
      name: "Matt",
      place: "Promptodex",
    });

    assert.strictEqual(result, "Hello, Matt! Welcome to Promptodex.");
  });

  it("should propagate fetch errors", async () => {
    globalThis.fetch = mock.fn(async () => ({
      ok: false,
      status: 404,
      statusText: "Not Found",
    })) as unknown as typeof fetch;

    await assert.rejects(
      async () => pod("unknown-slug"),
      /Prompt not found: unknown-slug/
    );
  });
});
