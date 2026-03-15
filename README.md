# promptodex

Load and render prompts from [Promptodex](https://promptodex.com) inside JavaScript applications.

This library **does NOT run AI models**. It only fetches prompts, renders templates, and returns prompt strings.

## Features

- Fetch prompts from the Promptodex registry
- Render templates with `{{variable}}` syntax
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

### `pod(slug, variables?)`

The main function that fetches and renders a prompt in a single call.

```typescript
async function pod(slug: string, variables?: Variables): Promise<string>
```

**Parameters:**
- `slug` - The unique identifier for the prompt in Promptodex
- `variables` - Optional object containing variable values to substitute

**Returns:** The rendered prompt string

**Example:**

```javascript
import { pod } from "promptodex";

const prompt = await pod("greeting", {
  name: "Alice",
  time: "morning"
});
```

### `fetchPrompt(slug)`

Fetches a prompt from the Promptodex registry without rendering.

```typescript
async function fetchPrompt(slug: string): Promise<PromptResponse>

interface PromptResponse {
  slug: string;
  content: string;
}
```

**Example:**

```javascript
import { fetchPrompt } from "promptodex";

const response = await fetchPrompt("make-a-soul");
console.log(response.content);
// "Create a soul named {{name}}"
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

## TypeScript

Full TypeScript support is included:

```typescript
import { pod, fetchPrompt, renderPrompt, Variables, PromptResponse } from "promptodex";

const variables: Variables = {
  name: "Matt",
  count: 42,
  active: true
};

const prompt: string = await pod("my-prompt", variables);
```

## Requirements

- Node.js >= 18 (uses native `fetch`)

## License

MIT
