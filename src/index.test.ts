import { describe, it, mock, afterEach, beforeEach } from "node:test";
import assert from "node:assert";
import { existsSync, rmSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { pod, parseSlug, getProjectRoot } from "./index.ts";

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

describe("pod caching", () => {
  const originalFetch = globalThis.fetch;
  const projectRoot = getProjectRoot();
  const cacheDir = join(projectRoot, ".promptodex");
  const configPath = join(projectRoot, "promptodex.json");

  beforeEach(() => {
    // Clean up any existing cache directory before each test
    if (existsSync(cacheDir)) {
      rmSync(cacheDir, { recursive: true, force: true });
    }
    if (existsSync(configPath)) {
      rmSync(configPath, { force: true });
    }
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    // Clean up cache directory after each test
    if (existsSync(cacheDir)) {
      rmSync(cacheDir, { recursive: true, force: true });
    }
    if (existsSync(configPath)) {
      rmSync(configPath, { force: true });
    }
  });

  it("should cache response after fetching versioned prompt", async () => {
    const mockResponse = {
      slug: "test-prompt@1",
      content: "Hello {{name}}",
    };

    let fetchCount = 0;
    globalThis.fetch = mock.fn(async () => {
      fetchCount++;
      return {
        ok: true,
        status: 200,
        json: async () => mockResponse,
      };
    }) as unknown as typeof fetch;

    // First call should fetch from network
    const result1 = await pod("test-prompt@1", { name: "Matt" });
    assert.strictEqual(result1, "Hello Matt");
    assert.strictEqual(fetchCount, 1);

    // Second call should use cache (fetch should not be called again)
    const result2 = await pod("test-prompt@1", { name: "World" });
    assert.strictEqual(result2, "Hello World");
    assert.strictEqual(fetchCount, 1); // Still 1, cache was used
  });

  it("should use version from promptodex.json when slug has no version", async () => {
    // Create promptodex.json with version config
    writeFileSync(configPath, JSON.stringify({
      prompts: {
        "config-prompt": "3"
      }
    }));

    const mockResponse = {
      slug: "config-prompt@3",
      content: "Version 3: {{message}}",
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

    const result = await pod("config-prompt", { message: "Hello" });

    assert.strictEqual(result, "Version 3: Hello");
    // Should have fetched with version from config
    assert.ok(calledUrl.includes("config-prompt%403"));
  });

  it("should skip cache when skipCache option is true", async () => {
    const mockResponse = {
      slug: "test-prompt@1",
      content: "Hello {{name}}",
    };

    let fetchCount = 0;
    globalThis.fetch = mock.fn(async () => {
      fetchCount++;
      return {
        ok: true,
        status: 200,
        json: async () => mockResponse,
      };
    }) as unknown as typeof fetch;

    // First call to populate cache
    await pod("test-prompt@1", { name: "Matt" });
    assert.strictEqual(fetchCount, 1);

    // Second call with skipCache should fetch again
    await pod("test-prompt@1", { name: "World" }, { skipCache: true });
    assert.strictEqual(fetchCount, 2);
  });

  it("should not cache prompts without explicit version", async () => {
    const mockResponse = {
      slug: "latest-prompt",
      content: "Latest: {{name}}",
    };

    let fetchCount = 0;
    globalThis.fetch = mock.fn(async () => {
      fetchCount++;
      return {
        ok: true,
        status: 200,
        json: async () => mockResponse,
      };
    }) as unknown as typeof fetch;

    // Fetch without version - should not be cached
    await pod("latest-prompt", { name: "Matt" });
    assert.strictEqual(fetchCount, 1);

    // Second call should still fetch (no caching for non-versioned)
    await pod("latest-prompt", { name: "World" });
    assert.strictEqual(fetchCount, 2);
  });

  it("should create cache file in correct location", async () => {
    const mockResponse = {
      slug: "location-test@5",
      content: "Test content",
    };

    globalThis.fetch = mock.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    })) as unknown as typeof fetch;

    await pod("location-test@5", {});

    const expectedCachePath = join(cacheDir, "cache", "location-test", "5", "data.json");
    assert.ok(existsSync(expectedCachePath), `Cache file should exist at ${expectedCachePath}`);

    const cachedData = JSON.parse(readFileSync(expectedCachePath, "utf-8"));
    assert.deepStrictEqual(cachedData, mockResponse);
  });
});
