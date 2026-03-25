<template>
  <div class="playground">
    <h1>Portable Text + TipTap</h1>
    <p class="hint">
      <code>PortableTextEditor</code> is a <code>.client.vue</code> component (no
      <code>ClientOnly</code> wrapper needed). TipTap uses
      <code>immediatelyRender: false</code> for Nuxt SSR.
    </p>

    <PortableTextEditor
      v-model="model"
      class="editor-root"
      :extensions="extensions"
      :portable-text-block-extensions="portableTextBlockExtensions"
    >
      <template #toolbar="{ editor }">
        <button
          :disabled="!editor.can().chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
          @click="editor.chain().focus().toggleBold().run()"
        >
          bold
        </button>
        <button
          :disabled="!editor.can().chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          italic
        </button>
        <button
          :disabled="!editor.can().chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor.isActive('strike') }"
          @click="editor.chain().focus().toggleStrike().run()"
        >
          strike
        </button>
        <button
          :disabled="!editor.can().chain().focus().toggleCode().run()"
          :class="{ 'is-active': editor.isActive('code') }"
          @click="editor.chain().focus().toggleCode().run()"
        >
          code
        </button>
        <button
          @click="editor.chain().focus().unsetAllMarks().run()"
        >
          clear marks
        </button>
        <button
          @click="editor.chain().focus().clearNodes().run()"
        >
          clear nodes
        </button>
        <button
          :class="{ 'is-active': editor.isActive('paragraph') }"
          @click="editor.chain().focus().setParagraph().run()"
        >
          paragraph
        </button>
        <button
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          h1
        </button>
        <button
          :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          h2
        </button>
        <button
          :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          h3
        </button>
        <button
          :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
        >
          h4
        </button>
        <button
          :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
        >
          h5
        </button>
        <button
          :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
        >
          h6
        </button>
        <button
          :class="{ 'is-active': editor.isActive('bulletList') }"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          bullet list
        </button>
        <button
          :class="{ 'is-active': editor.isActive('orderedList') }"
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          ordered list
        </button>
        <button
          :class="{ 'is-active': editor.isActive('codeBlock') }"
          @click="editor.chain().focus().toggleCodeBlock().run()"
        >
          code block
        </button>
        <button
          :class="{ 'is-active': editor.isActive('blockquote') }"
          @click="editor.chain().focus().toggleBlockquote().run()"
        >
          blockquote
        </button>
        <button
          @click="editor.chain().focus().setHorizontalRule().run()"
        >
          horizontal rule
        </button>
        <button
          @click="editor.chain().focus().setHardBreak().run()"
        >
          hard break
        </button>
        <button
          :disabled="!editor.can().chain().focus().toggleTaskList().run()"
          :class="{ 'is-active': editor.isActive('taskList') }"
          @click="editor.chain().focus().toggleTaskList().run()"
        >
          task list
        </button>
        <button
          :disabled="!editor.can().chain().focus().undo().run()"
          @click="editor.chain().focus().undo().run()"
        >
          undo
        </button>
        <button
          :disabled="!editor.can().chain().focus().redo().run()"
          @click="editor.chain().focus().redo().run()"
        >
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
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { taskBlockExtension } from './taskBlockExtension'

const model = ref<PortableTextBlock[]>([])

const json = computed(() => JSON.stringify(model.value, null, 2))

const portableTextBlockExtensions = [taskBlockExtension]

const extensions = [
  TaskList.configure({
    HTMLAttributes: {
      class: 'pte-taskList',
    },
  }),
  TaskItem.configure({
    // Ensure the task item belongs to the task list we register.
    taskListTypeName: 'taskList',
    HTMLAttributes: {
      class: 'pte-taskItem',
    },
  }),
]
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

/* Task list styling (matches TipTap's TaskList demo layout):
   TipTap renders TaskItem as:
     <li data-type="taskItem">
       <label><input type="checkbox" /><span /></label>
       <div>...item text...</div>
     </li>

   We use flex to ensure the item text/nested content is laid out to the right
   of the checkbox label (so it doesn't appear "under" the checkbox).
*/
:global(.portable-text-editor .ProseMirror ul[data-type='taskList']) {
  list-style: none;
  margin-left: 0;
  padding: 0;
}

:global(.portable-text-editor .ProseMirror ul[data-type='taskList'] li[data-type='taskItem']) {
  align-items: flex-start;
  display: flex;
  list-style: none;
}

:global(.portable-text-editor .ProseMirror ul[data-type='taskList'] li[data-type='taskItem'] > label) {
  flex: 0 0 auto;
  margin-right: 0.5rem;
  user-select: none;
}

:global(.portable-text-editor .ProseMirror ul[data-type='taskList'] li[data-type='taskItem'] > div) {
  flex: 1 1 auto;
}

:global(.portable-text-editor .ProseMirror ul[data-type='taskList'] input[type='checkbox']) {
  cursor: pointer;
}

:global(.portable-text-editor .ProseMirror ul[data-type='taskList'] ul[data-type='taskList']) {
  margin: 0;
}
</style>
