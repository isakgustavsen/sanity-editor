---
title: sanity-editor
seo:
  title: sanity-editor · Portable Text editor for Nuxt
  description: Edit Portable Text blocks in the browser using TipTap (via ProseMirror JSON) in Nuxt.
---

# Portable Text editing for Nuxt

`sanity-editor` is an **experimental Nuxt module** that lets you edit [Portable Text](https://portabletext.org/) in the browser using **TipTap**.

It bridges between:

- TipTap / ProseMirror JSON documents (`editor.getJSON()`)
- Portable Text blocks (`PortableTextBlock[]`)

## What you get

- **`<PortableTextEditor />`** client component with `v-model` for `PortableTextBlock[]` and an optional `#toolbar` slot.
- **`usePortableTextEditor()`** composable for custom UI.
- Conversion helpers:
  - `prosemirrorJsonToPortableText()`
  - `portableTextToTipTapJson()`
- A default Portable Text schema (styles, lists, decorators, `link` annotation, and `horizontal-rule` block object).

## Sections

- [Getting started](/1.getting-started/2.introduction)
- [API & details](/2.essentials/1-portable-text-editor)
- [Extensions & schema](/1.getting-started/5.extensions)
- [Troubleshooting](/1.getting-started/7.troubleshooting)

