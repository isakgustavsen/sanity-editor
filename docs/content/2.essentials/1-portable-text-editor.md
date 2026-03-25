---
title: PortableTextEditor
description: Component API for editing Portable Text blocks in Nuxt
navigation:
  icon: i-lucide-edit-3
seo:
  title: PortableTextEditor · sanity-editor
  description: Edit Portable Text blocks in Nuxt using a TipTap-based editor.
---

The module registers a single client component:

- `<PortableTextEditor v-model="PortableTextBlock[]" />`

## Props

`PortableTextEditor` accepts these props:

- `schema?: Schema`  
  Portable Text schema used to compile/validate the editor mapping. If omitted, a default schema is used (or an extended schema when you provide block extensions).

- `extensions?: AnyExtension[]`  
  Additional TipTap extensions to append to the built-in defaults.

- `portableTextBlockExtensions?: PortableTextBlockExtension[]`  
  Custom Portable Text block mappings (TipTap/ProseMirror JSON <-> Portable Text).

- `editorProps?: Record<string, unknown>`  
  Extra options passed to TipTap’s `useEditor` (for example: editor attributes, disabling UI, etc).

- `keyGenerator?: () => string`  
  Override the default block/span key generator.

## v-model

`v-model` is a `PortableTextBlock[]`.

Internally the module:

1. converts Portable Text blocks to TipTap JSON (`portableTextToTipTapJson`)
2. renders TipTap
3. on editor updates, converts back (`prosemirrorJsonToPortableText`)

## Toolbar slot

You can override the default toolbar via a `#toolbar` slot:

```vue
<template>
  <PortableTextEditor v-model="blocks">
    <template #toolbar="{ editor }">
      <button
        type="button"
        :disabled="!editor.can().chain().focus().toggleBold().run()"
        @click="editor.chain().focus().toggleBold().run()"
      >
        Bold
      </button>
    </template>
  </PortableTextEditor>
</template>
```

