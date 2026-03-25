# Contributing

## Feedback

This project is early-stage. Useful feedback includes:

- How you use Portable Text with Sanity (or without) and what this module should guarantee
- Missing node types (images, embeds) and how you expect them in JSON
- SSR / Nuxt edge cases

Use [GitHub Issues](https://github.com/isakgustavsen/sanity-editor/issues) for bugs and small proposals. Use [Discussions](https://github.com/isakgustavsen/sanity-editor/discussions) for open-ended questions if enabled on the repo.

## Development

```bash
pnpm install
pnpm run dev:prepare
pnpm dev
```

Before a PR:

```bash
pnpm run lint
pnpm run test:types
pnpm test
```

The release script (`pnpm run release`) runs lint, tests, builds the module, and uses `changelogen`; maintainers run it when cutting npm releases.

## Pull requests

Keep changes focused. Match existing style (ESLint). Add or extend tests in `test/` when behavior changes.
