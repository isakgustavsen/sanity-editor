<template>
  <div class="portable-text-editor">
    <div
      v-if="editor"
      class="portable-text-editor__toolbar"
    >
      <slot
        name="toolbar"
        :editor="editor"
      >
        <button
          type="button"
          @click="editor.chain().focus().toggleBold().run()"
        >
          Bold
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          Italic
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          H2
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          List
        </button>
      </slot>
    </div>
    <TiptapEditorContent
      v-if="editor"
      class="portable-text-editor__content"
      :editor="editor"
    />
  </div>
</template>

<script setup lang="ts">
import type { Schema } from '@portabletext/schema'
import type { PortableTextBlock } from '@portabletext/types'
import type { AnyExtension } from '@tiptap/core'
import {
  usePortableTextEditor,
  type UsePortableTextEditorOptions,
} from '../composables/usePortableTextEditor'

const model = defineModel<PortableTextBlock[]>({ default: () => [] })

const props = defineProps<{
  schema?: Schema
  extensions?: AnyExtension[]
  editorProps?: UsePortableTextEditorOptions['editorProps']
  keyGenerator?: UsePortableTextEditorOptions['keyGenerator']
}>()

const { editor } = usePortableTextEditor(
  model,
  (v: PortableTextBlock[]) => {
    model.value = v
  },
  {
    schema: props.schema,
    extensions: props.extensions,
    editorProps: props.editorProps,
    keyGenerator: props.keyGenerator,
  },
)
</script>
