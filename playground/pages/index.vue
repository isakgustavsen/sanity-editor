<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Unstyled <code class="rounded bg-gray-100 px-1.5 py-0.5 text-lg dark:bg-gray-800">SanityEditor</code>
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        The component bundled with the module. Bring your own styles and override the <code>#toolbar</code> slot.
      </p>
    </div>

    <UCard>
      <SanityEditor v-model="blocks" :extensions="extensions" :block-extensions="blockExtensions">
        <template #toolbar="{ editor }">
          <div class="flex flex-wrap gap-1 border-b border-gray-200 pb-2 dark:border-gray-700">
            <button class="rounded px-2 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('bold') }"
              :disabled="!editor.can().chain().focus().toggleBold().run()"
              @click="editor.chain().focus().toggleBold().run()">
              Bold
            </button>
            <button class="rounded px-2 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('italic') }"
              :disabled="!editor.can().chain().focus().toggleItalic().run()"
              @click="editor.chain().focus().toggleItalic().run()">
              Italic
            </button>
            <button class="rounded px-2 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('strike') }"
              :disabled="!editor.can().chain().focus().toggleStrike().run()"
              @click="editor.chain().focus().toggleStrike().run()">
              Strike
            </button>
            <button class="rounded px-2 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('heading', { level: 1 }) }"
              @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">
              H1
            </button>
            <button class="rounded px-2 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('heading', { level: 2 }) }"
              @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">
              H2
            </button>
            <button class="rounded px-2 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('bulletList') }"
              @click="editor.chain().focus().toggleBulletList().run()">
              List
            </button>
            <button class="rounded px-2 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('orderedList') }"
              @click="editor.chain().focus().toggleOrderedList().run()">
              Ordered
            </button>
            <button class="rounded px-2 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('taskList') }"
              :disabled="!editor.can().chain().focus().toggleTaskList().run()"
              @click="editor.chain().focus().toggleTaskList().run()">
              Tasks
            </button>
            <button class="rounded px-2 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800" type="button"
              @click="insertCallout(editor)">
              Callout
            </button>
            <button class="rounded px-2 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('blockquote') }"
              @click="editor.chain().focus().toggleBlockquote().run()">
              Quote
            </button>
            <button class="ml-auto rounded px-2 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              :disabled="!editor.can().chain().focus().undo().run()" @click="editor.chain().focus().undo().run()">
              Undo
            </button>
            <button class="rounded px-2 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              :disabled="!editor.can().chain().focus().redo().run()" @click="editor.chain().focus().redo().run()">
              Redo
            </button>
          </div>
        </template>
      </SanityEditor>
    </UCard>

    <UCard>
      <template #header>
        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Portable Text output</span>
      </template>
      <pre class="overflow-auto text-xs text-gray-700 dark:text-gray-300">{{ json }}</pre>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { Editor } from '@tiptap/core'
import type { PortableTextBlock } from '@portabletext/types'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { calloutBlockExtension, SanityCallout } from '../calloutExtension'
import { taskBlockExtension } from '../taskBlockExtension'

const blocks = ref<PortableTextBlock[]>([])
const json = computed(() => JSON.stringify(blocks.value, null, 2))

const blockExtensions = [taskBlockExtension, calloutBlockExtension]

const extensions = [
  SanityCallout,
  TaskList.configure({
    HTMLAttributes: { class: 'pte-taskList' },
  }),
  TaskItem.configure({
    taskListTypeName: 'taskList',
    HTMLAttributes: { class: 'pte-taskItem' },
  }),
]

function insertCallout(editor: Editor) {
  editor
    .chain()
    .focus()
    .insertContent({
      type: 'callout',
      attrs: { variant: 'info' },
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Custom block component (callout).' }],
        },
      ],
    })
    .run()
}
</script>

<style>
.sanity-editor .ProseMirror {
  min-height: 8rem;
  outline: none;
  padding: 0.5rem 0;
}

.sanity-editor .ProseMirror ul[data-type='taskList'] {
  list-style: none;
  margin-left: 0;
  padding: 0;
}

.sanity-editor .ProseMirror ul[data-type='taskList'] li[data-type='taskItem'] {
  align-items: flex-start;
  display: flex;
  list-style: none;
}

.sanity-editor .ProseMirror ul[data-type='taskList'] li[data-type='taskItem']>label {
  flex: 0 0 auto;
  margin-right: 0.5rem;
  user-select: none;
}

.sanity-editor .ProseMirror ul[data-type='taskList'] li[data-type='taskItem']>div {
  flex: 1 1 auto;
}

.sanity-editor .ProseMirror div[data-callout] {
  border-left: 3px solid rgb(59 130 246);
  margin: 0.5rem 0;
  padding: 0.5rem 0.75rem;
  background: rgb(239 246 255 / 0.6);
}

.dark .sanity-editor .ProseMirror div[data-callout] {
  background: rgb(30 58 138 / 0.25);
  border-left-color: rgb(96 165 250);
}
</style>
