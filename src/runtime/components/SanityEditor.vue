<template>
  <div class="sanity-editor">
    <div v-if="editor" class="sanity-editor__toolbar">
      <slot name="toolbar" :editor="editor">
        <button type="button" @click="editor.chain().focus().toggleBold().run()">
          Bold
        </button>
        <button type="button" @click="editor.chain().focus().toggleItalic().run()">
          Italic
        </button>
        <button type="button" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">
          H2
        </button>
        <button type="button" @click="editor.chain().focus().toggleBulletList().run()">
          List
        </button>
      </slot>
    </div>
    <TiptapEditorContent v-if="editor" class="sanity-editor__content" :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import type { Schema } from '@portabletext/schema'
import type { PortableTextBlock } from '@portabletext/types'
import type { AnyExtension } from '@tiptap/core'
import type { SanityEditorBlockExtension } from '../types/sanityEditorBlockExtension'
import {
  useSanityEditor,
  type UseSanityEditorOptions,
} from '../composables/useSanityEditor'

const model = defineModel<PortableTextBlock[]>({ default: () => [] })

const props = defineProps<{
  schema?: Schema
  extensions?: AnyExtension[]
  blockExtensions?: SanityEditorBlockExtension[]
  editorProps?: UseSanityEditorOptions['editorProps']
  keyGenerator?: UseSanityEditorOptions['keyGenerator']
}>()

const { editor } = useSanityEditor(
  model,
  (v: PortableTextBlock[]) => {
    model.value = v
  },
  {
    schema: props.schema,
    extensions: props.extensions,
    blockExtensions: props.blockExtensions,
    editorProps: props.editorProps,
    keyGenerator: props.keyGenerator,
  },
)
</script>
