---
title: sanity-editor
description: Portable Text editor for Nuxt with TipTap, typed model values, and extensible block mappings.
seo:
  title: sanity-editor — Portable Text editor for Nuxt
  description: Edit Portable Text in Nuxt with TipTap and keep `PortableTextBlock[]` as your model value using a ProseMirror JSON bridge and extensible schema mappings.
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
  to: /guide/block-components
  ---
  #title
  Extensible blocks

  #description
  `defineSanityEditorBlockComponent` plus `SanityEditorBlockExtension` mappings for custom block objects; run containers for list-like structures — see [Block extensions](/guide/block-extensions).
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
  Declares and registers `nuxt-tiptap-editor` as a module dependency. Pair with your Sanity or any workflow that stores Portable Text.
  :::
::
