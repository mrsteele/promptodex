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

  it("should support versioned slugs with @version suffix", async () => {
    const mockResponse = {
      slug: "make-a-soul@2",
      content: "Version 2: Create a soul named {{name}}",
    };

    let calledUrl = "";
    globalThis.fetch = mock.fn(async (url: string) => {
      calledUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => mockResponse,
      };
    }) as unknown as typeof fetch;

    const result = await pod("make-a-soul@2", { name: "Matt" });

    assert.strictEqual(result, "Version 2: Create a soul named Matt");
    assert.ok(calledUrl.includes("make-a-soul%402"));
  });

  it("should pass apiKey to fetch as Authorization header", async () => {
    const mockResponse = {
      slug: "private-prompt",
      content: "Private: Hello {{name}}",
    };

    let capturedHeaders: HeadersInit | undefined;
    globalThis.fetch = mock.fn(async (_url: string, options?: RequestInit) => {
      capturedHeaders = options?.headers;
      return {
        ok: true,
        status: 200,
        json: async () => mockResponse,
      };
    }) as unknown as typeof fetch;

    const result = await pod(
      "private-prompt",
      { name: "Matt" },
      { apiKey: "POD_live_xyz789" }
    );

    assert.strictEqual(result, "Private: Hello Matt");
    assert.deepStrictEqual(capturedHeaders, {
      Authorization: "Bearer POD_live_xyz789",
    });
  });

  it("should work with versioned private prompts", async () => {
    const mockResponse = {
      slug: "private-prompt@1",
      content: "Private V1: {{message}}",
    };

    let calledUrl = "";
    let capturedHeaders: HeadersInit | undefined;
    globalThis.fetch = mock.fn(async (url: string, options?: RequestInit) => {
      calledUrl = url;
      capturedHeaders = options?.headers;
      return {
        ok: true,
        status: 200,
        json: async () => mockResponse,
      };
    }) as unknown as typeof fetch;

    const result = await pod(
      "private-prompt@1",
      { message: "Hello" },
      { apiKey: "POD_live_secret" }
    );

    assert.strictEqual(result, "Private V1: Hello");
    assert.ok(calledUrl.includes("private-prompt%401"));
    assert.deepStrictEqual(capturedHeaders, {
      Authorization: "Bearer POD_live_secret",
    });
  });
});
