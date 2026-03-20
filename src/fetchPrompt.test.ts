import { describe, it, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { fetchPrompt } from "./fetchPrompt.ts";

describe("fetchPrompt", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should fetch a prompt by slug", async () => {
    const mockResponse = {
      slug: "make-a-soul",
      content: "Create a soul named {{name}}",
    };

    globalThis.fetch = mock.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    })) as unknown as typeof fetch;

    const result = await fetchPrompt("make-a-soul");

    assert.deepStrictEqual(result, mockResponse);
    assert.strictEqual((globalThis.fetch as ReturnType<typeof mock.fn>).mock.calls.length, 1);
  });

  it("should encode the slug in the URL", async () => {
    const mockResponse = { slug: "test-slug", content: "test" };

    let calledUrl = "";
    globalThis.fetch = mock.fn(async (url: string) => {
      calledUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => mockResponse,
      };
    }) as unknown as typeof fetch;

    await fetchPrompt("slug with spaces");

    assert.ok(calledUrl.includes("slug%20with%20spaces"));
  });

  it("should throw error for 404 response", async () => {
    globalThis.fetch = mock.fn(async () => ({
      ok: false,
      status: 404,
      statusText: "Not Found",
    })) as unknown as typeof fetch;

    await assert.rejects(
      async () => fetchPrompt("unknown-slug"),
      /Prompt not found: unknown-slug/
    );
  });

  it("should throw error for non-OK response", async () => {
    globalThis.fetch = mock.fn(async () => ({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    })) as unknown as typeof fetch;

    await assert.rejects(
      async () => fetchPrompt("some-slug"),
      /Failed to fetch prompt: 500 Internal Server Error/
    );
  });

  it("should support versioned slugs with @version suffix", async () => {
    const mockResponse = { slug: "make-a-soul@1", content: "Version 1 content" };

    let calledUrl = "";
    globalThis.fetch = mock.fn(async (url: string) => {
      calledUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => mockResponse,
      };
    }) as unknown as typeof fetch;

    const result = await fetchPrompt("make-a-soul@1");

    assert.deepStrictEqual(result, mockResponse);
    // URL should be /prompts/make-a-soul/1 (not /prompts/make-a-soul@1)
    assert.ok(calledUrl.includes("make-a-soul/1"), `Expected URL to contain 'make-a-soul/1', got: ${calledUrl}`);
  });

  it("should include Authorization header when apiKey is provided", async () => {
    const mockResponse = { slug: "private-prompt", content: "Secret content" };

    let capturedHeaders: HeadersInit | undefined;
    globalThis.fetch = mock.fn(async (_url: string, options?: RequestInit) => {
      capturedHeaders = options?.headers;
      return {
        ok: true,
        status: 200,
        json: async () => mockResponse,
      };
    }) as unknown as typeof fetch;

    await fetchPrompt("private-prompt", { apiKey: "POD_live_abc123" });

    assert.deepStrictEqual(capturedHeaders, {
      Authorization: "Bearer POD_live_abc123",
    });
  });

  it("should not include headers when no apiKey is provided", async () => {
    const mockResponse = { slug: "public-prompt", content: "Public content" };

    let capturedHeaders: HeadersInit | undefined;
    globalThis.fetch = mock.fn(async (_url: string, options?: RequestInit) => {
      capturedHeaders = options?.headers;
      return {
        ok: true,
        status: 200,
        json: async () => mockResponse,
      };
    }) as unknown as typeof fetch;

    await fetchPrompt("public-prompt");

    assert.strictEqual(capturedHeaders, undefined);
  });

  it("should throw error for 401 Unauthorized response", async () => {
    globalThis.fetch = mock.fn(async () => ({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    })) as unknown as typeof fetch;

    await assert.rejects(
      async () => fetchPrompt("private-prompt"),
      /Unauthorized: Invalid or missing API key for prompt: private-prompt/
    );
  });

  it("should throw error for 403 Forbidden response", async () => {
    globalThis.fetch = mock.fn(async () => ({
      ok: false,
      status: 403,
      statusText: "Forbidden",
    })) as unknown as typeof fetch;

    await assert.rejects(
      async () => fetchPrompt("restricted-prompt"),
      /Forbidden: Access denied to prompt: restricted-prompt/
    );
  });
});
