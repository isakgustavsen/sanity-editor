<template>
  <div class="playground">
    <h1>Portable Text + TipTap</h1>
    <p class="hint">
      <code>PortableTextEditor</code> is a <code>.client.vue</code> component (no
      <code>ClientOnly</code> wrapper needed). TipTap uses
      <code>immediatelyRender: false</code> for Nuxt SSR.
    </p>

    <PortableTextEditor v-model="model" class="editor-root">
      <template #toolbar="{ editor }">
        <button @click="editor.chain().focus().toggleBold().run()"
          :disabled="!editor.can().chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }">
          bold
        </button>
        <button @click="editor.chain().focus().toggleItalic().run()"
          :disabled="!editor.can().chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }">
          italic
        </button>
        <button @click="editor.chain().focus().toggleStrike().run()"
          :disabled="!editor.can().chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor.isActive('strike') }">
          strike
        </button>
        <button @click="editor.chain().focus().toggleCode().run()"
          :disabled="!editor.can().chain().focus().toggleCode().run()"
          :class="{ 'is-active': editor.isActive('code') }">
          code
        </button>
        <button @click="editor.chain().focus().unsetAllMarks().run()">
          clear marks
        </button>
        <button @click="editor.chain().focus().clearNodes().run()">
          clear nodes
        </button>
        <button @click="editor.chain().focus().setParagraph().run()"
          :class="{ 'is-active': editor.isActive('paragraph') }">
          paragraph
        </button>
        <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
          h1
        </button>
        <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
          h2
        </button>
        <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
          h3
        </button>
        <button @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }">
          h4
        </button>
        <button @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }">
          h5
        </button>
        <button @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }">
          h6
        </button>
        <button @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'is-active': editor.isActive('bulletList') }">
          bullet list
        </button>
        <button @click="editor.chain().focus().toggleOrderedList().run()"
          :class="{ 'is-active': editor.isActive('orderedList') }">
          ordered list
        </button>
        <button @click="editor.chain().focus().toggleCodeBlock().run()"
          :class="{ 'is-active': editor.isActive('codeBlock') }">
          code block
        </button>
        <button @click="editor.chain().focus().toggleBlockquote().run()"
          :class="{ 'is-active': editor.isActive('blockquote') }">
          blockquote
        </button>
        <button @click="editor.chain().focus().setHorizontalRule().run()">
          horizontal rule
        </button>
        <button @click="editor.chain().focus().setHardBreak().run()">
          hard break
        </button>
        <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().chain().focus().undo().run()">
          undo
        </button>
        <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().chain().focus().redo().run()">
          redo
        </button>
      </template>
    </PortableTextEditor>

    <h2>Portable Text (JSON)</h2>
    <pre class="json">{{ json }}</pre>
  </div>
</template>

<script setup lang="ts">
import type { PortableTextBlock } from '@portabletext/types'
import { computed, ref } from 'vue'

const model = ref<PortableTextBlock[]>([])

const json = computed(() => JSON.stringify(model.value, null, 2))
</script>

<style scoped>
.playground {
  max-width: 52rem;
  margin: 0 auto;
  padding: 1.5rem;
  font-family:
    system-ui,
    sans-serif;
}

.hint {
  color: #444;
  font-size: 0.9rem;
}

.editor-root {
  display: block;
}

.json {
  background: #f6f6f6;
  border-radius: 6px;
  padding: 1rem;
  overflow: auto;
  font-size: 0.8rem;
}
</style>
