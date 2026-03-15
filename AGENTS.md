# AGENTS.md

## Purpose

This file provides guidance for AI agents working with this codebase.

## Keep Knowledge Up-to-Date

When working on this project:

1. **Stay current with the Promptodex API** - The library fetches from `https://promptodex.com/api/v1/prompts/{slug}`. If the API changes, update `fetchPrompt.ts` accordingly.

2. **Maintain TypeScript types** - Ensure all exports have proper TypeScript types. Update type definitions when adding new features.

3. **Run tests before merging** - All changes must pass unit tests. Run `npm test` to verify.

4. **Keep it minimal** - This library aims to be <200 lines of code. Avoid adding dependencies.

## Project Structure

```
promptodex/
  package.json          # Package configuration
  README.md             # Documentation
  AGENTS.md             # This file
  tsconfig.json         # TypeScript config (CommonJS)
  tsconfig.esm.json     # TypeScript config (ESM)
  src/
    index.ts            # Main entry, exports pod()
    fetchPrompt.ts      # Fetches prompts from API
    renderPrompt.ts     # Renders template variables
    *.test.ts           # Unit tests
```

## Key Functions

- `pod(slug, variables)` - Main API, fetches and renders
- `fetchPrompt(slug)` - Fetches raw prompt from API
- `renderPrompt(template, variables)` - Renders `{{variable}}` templates

## Testing

Tests use Node.js built-in test runner:

```bash
npm test
```

Tests are required to pass on every merge into GitHub.

## Design Principles

1. **Zero dependencies** - Use native `fetch` (Node >= 18)
2. **Tiny footprint** - Keep total code <200 lines
3. **Simple API** - One main function `pod()` for common use case
4. **TypeScript first** - Full type safety out of the box
