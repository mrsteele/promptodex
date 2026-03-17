# promptodex

Load and render prompts from [Promptodex](https://promptodex.com) inside JavaScript applications.

This library **does NOT run AI models**. It only fetches prompts, renders templates, and returns prompt strings.

## Features

- Fetch prompts from the Promptodex registry
- Render templates with `{{variable}}` syntax
- Version support (`my-prompt@1`, `my-prompt@2`, etc.)
- Private prompts with API key authentication
- Zero dependencies
- TypeScript support
- Tiny footprint (<200 lines)

## Installation

```bash
npm install promptodex
```

## Quick Start

```javascript
import { pod } from "promptodex";

const prompt = await pod("make-a-soul", {
  name: "Matt"
});

console.log(prompt);
// "Create a soul named Matt"
```

## API

### `pod(slug, variables?, options?)`

The main function that fetches and renders a prompt in a single call.

```typescript
async function pod(
  slug: string,
  variables?: Variables,
  options?: PodOptions
): Promise<string>

interface PodOptions {
  apiKey?: string;  // For private prompts: "POD_live_XXXXXXX"
}
```

**Parameters:**
- `slug` - The unique identifier for the prompt (supports `@version` suffix)
- `variables` - Optional object containing variable values to substitute
- `options` - Optional options object with `apiKey` for private prompts

**Returns:** The rendered prompt string

**Examples:**

```javascript
import { pod } from "promptodex";

// Fetch latest version
const prompt = await pod("greeting", {
  name: "Alice",
  time: "morning"
});

// Fetch specific version
const v1 = await pod("greeting@1", { name: "Alice" });

// Fetch private prompt with API key
const privatePrompt = await pod(
  "my-private-prompt",
  { name: "Alice" },
  { apiKey: "POD_live_XXXXXXX" }
);
```

### `fetchPrompt(slug, options?)`

Fetches a prompt from the Promptodex registry without rendering.

```typescript
async function fetchPrompt(
  slug: string,
  options?: FetchOptions
): Promise<PromptResponse>

interface PromptResponse {
  slug: string;
  content: string;
}

interface FetchOptions {
  apiKey?: string;  // For private prompts: "POD_live_XXXXXXX"
}
```

**Examples:**

```javascript
import { fetchPrompt } from "promptodex";

// Fetch latest version
const response = await fetchPrompt("make-a-soul");
console.log(response.content);
// "Create a soul named {{name}}"

// Fetch specific version
const v1 = await fetchPrompt("make-a-soul@1");

// Fetch private prompt
const privateResponse = await fetchPrompt("my-private-prompt", {
  apiKey: "POD_live_XXXXXXX"
});
```

### `renderPrompt(template, variables?)`

Renders a template string with the provided variables. Useful when you already have the template content.

```typescript
function renderPrompt(template: string, variables?: Variables): string
```

**Rules:**
- Variables are wrapped in double curly braces: `{{variableName}}`
- Missing variables become empty strings
- Whitespace inside braces is trimmed: `{{ name }}` works like `{{name}}`

**Example:**

```javascript
import { renderPrompt } from "promptodex";

const result = renderPrompt("Hello {{name}}!", { name: "World" });
// "Hello World!"
```

## Template Syntax

Templates use double curly braces for variables:

```
Hello {{name}}, welcome to {{place}}!
```

With variables `{ name: "Matt", place: "Promptodex" }`, this renders to:

```
Hello Matt, welcome to Promptodex!
```

**Missing variables** are replaced with empty strings:

```javascript
renderPrompt("Hello {{name}}!", {});
// "Hello !"
```

## Versioning

Promptodex supports prompt versioning. Use the `@version` suffix to fetch a specific version:

```javascript
// Fetch latest version (default)
const latest = await pod("my-prompt", { name: "Matt" });

// Fetch specific versions
const v1 = await pod("my-prompt@1", { name: "Matt" });
const v2 = await pod("my-prompt@2", { name: "Matt" });
```

Without a version suffix, the latest version is always returned.

## Private Prompts

To access private prompts, use your API key from [Promptodex](https://promptodex.com):

```javascript
const prompt = await pod(
  "my-private-prompt",
  { name: "Matt" },
  { apiKey: "POD_live_XXXXXXX" }
);
```

The API key is sent via the `Authorization` header as a Bearer token.

## TypeScript

Full TypeScript support is included:

```typescript
import {
  pod,
  fetchPrompt,
  renderPrompt,
  Variables,
  PromptResponse,
  FetchOptions,
  PodOptions
} from "promptodex";

const variables: Variables = {
  name: "Matt",
  count: 42,
  active: true
};

const options: PodOptions = {
  apiKey: "POD_live_XXXXXXX"
};

const prompt: string = await pod("my-prompt@1", variables, options);
```

## Requirements

- Node.js >= 18 (uses native `fetch`)

## License

MIT
