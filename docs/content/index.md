---
seo:
  title: sanity-editor — Portable Text editor for Nuxt
  description: Edit Portable Text in the browser with TipTap. Nuxt 4 module with v-model for PortableTextBlock[], ProseMirror JSON bridge, and extensible schema.
---

::u-page-hero
#title
Portable Text editor for Nuxt

#description
Edit [Portable Text](https://portabletext.org/) in the browser with [TipTap](https://tiptap.dev/). Use `v-model` with `PortableTextBlock[]` and keep your data model aligned with `@portabletext/schema`—bridged via ProseMirror JSON, not HTML.

#links
  :::u-button
  ---
  color: neutral
  size: xl
  to: /getting-started/installation
  trailing-icon: i-lucide-arrow-right
  ---
  Get started
  :::

  :::u-button
  ---
  color: neutral
  icon: simple-icons-github
  size: xl
  to: https://github.com/isakgustavsen/sanity-editor
  variant: outline
  ---
  View on GitHub
  :::
::

::u-page-section
#title
What you get

#features
  :::u-page-feature
  ---
  icon: i-lucide-square-pen
  to: /api/sanity-editor
  ---
  #title
  [SanityEditor]{.text-primary} component

  #description
  Drop-in editor with `v-model` for `PortableTextBlock[]` and an optional `#toolbar` slot for custom controls.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-braces
  to: /api/composable
  ---
  #title
  [useSanityEditor]{.text-primary} composable

  #description
  Build your own UI while reusing the same TipTap ↔ block sync, extensions, and schema handling.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-arrow-left-right
  to: /api/utilities
  ---
  #title
  Bidirectional JSON conversion

  #description
  `sanityEditorBlocksToTiptapJson` and `sanityEditorProsemirrorJsonToBlocks` map between TipTap/ProseMirror JSON and `PortableTextBlock[]`.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-list-tree
  to: /guide/using-the-editor
  ---
  #title
  Default schema

  #description
  Styles, lists, decorators, link annotation, and block objects such as horizontal rule—compiled with `@portabletext/schema`.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-puzzle
  to: /guide/block-extensions
  ---
  #title
  Extensible blocks

  #description
  Add TipTap extensions and `SanityEditorBlockExtension` mappings for custom block types (single node or run containers).
  :::

  :::u-page-feature
  ---
  icon: i-simple-icons-nuxtdotjs
  to: /guide/nuxt-ui-editor
  ---
  #title
  [Nuxt UI editor]{.text-primary}

  #description
  Bind `UEditor` with `createSanityEditorContext` and the JSON converters, or use `useSanityEditor` with `UEditorToolbar` and `TiptapEditorContent`.
  :::

  :::u-page-feature
  ---
  icon: i-simple-icons-nuxt
  target: _blank
  to: https://nuxt.com
  ---
  #title
  Built for [Nuxt 4]{.text-primary}

  #description
  Registers `nuxt-tiptap-editor` for you. Pair with your Sanity or any workflow that stores Portable Text.
  :::
::
