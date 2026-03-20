import { describe, it, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import {
  parseSlug,
  getConfiguredVersion,
  readCache,
  writeCache,
  getProjectRoot,
} from "./cache.ts";

describe("parseSlug", () => {
  it("should parse a slug without version", () => {
    const result = parseSlug("my-prompt");
    assert.deepStrictEqual(result, { name: "my-prompt", version: null });
  });

  it("should parse a slug with version", () => {
    const result = parseSlug("my-prompt@2");
    assert.deepStrictEqual(result, { name: "my-prompt", version: "2" });
  });

  it("should handle slug with multiple @ symbols", () => {
    const result = parseSlug("my@prompt@3");
    assert.deepStrictEqual(result, { name: "my@prompt", version: "3" });
  });

  it("should handle slug starting with @", () => {
    const result = parseSlug("@invalid");
    assert.deepStrictEqual(result, { name: "@invalid", version: null });
  });

  it("should handle version with multiple digits", () => {
    const result = parseSlug("my-prompt@123");
    assert.deepStrictEqual(result, { name: "my-prompt", version: "123" });
  });
});

describe("getProjectRoot", () => {
  it("should return a valid directory path", () => {
    const root = getProjectRoot();
    assert.ok(typeof root === "string");
    assert.ok(root.length > 0);
  });
});

describe("cache operations", () => {
  const testDir = join(process.cwd(), ".promptodex-test");
  const testCacheDir = join(testDir, "cache", "test-prompt", "1");
  const testConfigPath = join(process.cwd(), "promptodex-test.json");

  beforeEach(() => {
    // Clean up any existing test directories
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    if (existsSync(testConfigPath)) {
      rmSync(testConfigPath);
    }
  });

  afterEach(() => {
    // Clean up test directories
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    if (existsSync(testConfigPath)) {
      rmSync(testConfigPath);
    }
  });

  it("readCache should return null for non-existent cache", () => {
    const result = readCache("non-existent", "1");
    assert.strictEqual(result, null);
  });

  it("writeCache and readCache should work together", () => {
    const testData = { slug: "test-prompt@1", content: "Hello {{name}}" };

    // Write to cache
    writeCache("test-prompt", "1", testData);

    // Read from cache
    const result = readCache("test-prompt", "1");
    assert.deepStrictEqual(result, testData);
  });
});

describe("getConfiguredVersion", () => {
  it("should return null when promptodex.json does not exist", () => {
    const result = getConfiguredVersion("non-existent-prompt");
    assert.strictEqual(result, null);
  });
});
