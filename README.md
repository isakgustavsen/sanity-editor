# sanity-editor

**Experimental** Nuxt module: edit [Portable Text](https://portabletext.org/) in the browser with [TipTap](https://tiptap.dev/), bridged via ProseMirror JSON (not HTML). It declares [`nuxt-tiptap-editor`](https://github.com/modbender/nuxt-tiptap-editor) as a **module dependency** and registers it during setup.

We are **looking for feedback** on API shape, schema coverage, and real-world Sanity workflows. Please open [Issues](https://github.com/isakgustavsen/sanity-editor/issues) or use **Feedback** in the issue chooser. Enable [Discussions](https://github.com/isakgustavsen/sanity-editor/discussions) on the repo if you want open-ended threads.

If you fork or rename the GitHub remote, update `repository` / `bugs` / `homepage` in [`package.json`](package.json) and links in this README.

## Features

- `SanityEditor` client component with `v-model` for `PortableTextBlock[]` (and optional `#toolbar` slot)
- `useSanityEditor` composable for custom UI
- `sanityEditorProsemirrorJsonToBlocks` / `sanityEditorBlocksToTiptapJson` for TipTap JSON ↔ blocks
- Default schema from `@portabletext/schema` (styles, lists, decorators, link, block objects such as horizontal rule)

Public APIs are prefixed with **`sanityEditor`** / **`SanityEditor`** per [Nuxt module best practices](https://nuxt.com/docs/4.x/guide/modules/best-practices) (components, composables, and auto-imports).

## Requirements

- Nuxt 4
- `sanity-editor` — `nuxt-tiptap-editor` is resolved via `moduleDependencies` (see [`src/module.ts`](src/module.ts))

## Installation

```bash
pnpm add sanity-editor
# or: npm install sanity-editor
```

Add the module in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['sanity-editor'],
})
```

Optional module options use the **`sanityEditor`** key (not `portableTextEditor`).

## Usage

```vue
<script setup lang="ts">
import type { PortableTextBlock } from '@portabletext/types'

const content = ref<PortableTextBlock[]>([])
</script>

<template>
  <SanityEditor v-model="content" />
</template>
```

Auto-imports include `useSanityEditor`, `SanityEditor`, and the conversion helpers—see the module’s `addImports` in [`src/module.ts`](src/module.ts).

## Local development

```bash
pnpm install
pnpm run dev:prepare
pnpm dev
```

Then open the playground app. Other commands: `pnpm run lint`, `pnpm test`, `pnpm run test:types`, `pnpm run dev:build`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to propose changes and give feedback.

## License

MIT

## Badges

[![CI](https://github.com/isakgustavsen/sanity-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/isakgustavsen/sanity-editor/actions/workflows/ci.yml)

[npm](https://www.npmjs.com/package/sanity-editor) (after first publish)
