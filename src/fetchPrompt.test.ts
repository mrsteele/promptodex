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
});
