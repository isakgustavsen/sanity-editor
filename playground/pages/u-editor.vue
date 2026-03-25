<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        <code class="rounded bg-gray-100 px-1.5 py-0.5 text-lg dark:bg-gray-800">UEditor</code> + Portable Text
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Nuxt UI's <code>UEditor</code> bound to <code>PortableTextBlock[]</code> via
        <code>createSanityEditorContext</code> and the conversion helpers.
      </p>
    </div>

    <UCard class="overflow-hidden p-0!">
      <UEditor
        ref="editorRef"
        v-slot="{ editor }"
        content-type="json"
        :model-value="tiptapJson"
        :extensions="editorExtensions"
        placeholder="Write, type '/' for commands..."
        :ui="{ base: 'p-6 sm:p-8 min-h-64' }"
        class="w-full"
        @update:model-value="handleUpdate"
      >
        <div
          class="flex flex-wrap gap-2 border-b border-gray-200 bg-gray-50/80 px-4 py-2 dark:border-gray-800 dark:bg-gray-900/50"
        >
          <UButton
            size="xs"
            color="neutral"
            variant="soft"
            icon="i-lucide-megaphone"
            label="Insert callout"
            @click="insertCallout(editor)"
          />
        </div>
        <UEditorToolbar
          :editor="editor"
          :items="fixedToolbarItems"
          class="sticky top-14 z-10 overflow-x-auto border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-900"
        />

        <UEditorToolbar
          :editor="editor"
          :items="bubbleToolbarItems"
          layout="bubble"
          :should-show="({ editor: e, view, state }) => {
            if (e.isActive('image')) return false
            return view.hasFocus() && !state.selection.empty
          }"
        />

        <UEditorSuggestionMenu
          :editor="editor"
          :items="suggestionItems"
        />

        <UEditorMentionMenu
          :editor="editor"
          :items="mentionItems"
        />

        <UEditorDragHandle
          v-slot="{ ui, onClick }"
          :editor="editor"
          @node-change="selectedNode = $event"
        >
          <UButton
            icon="i-lucide-plus"
            color="neutral"
            variant="ghost"
            size="sm"
            :class="ui.handle()"
            @click="(e) => {
              e.stopPropagation()
              const selected = onClick()
              editor.chain().insertContentAt((selected?.pos ?? 0) + 1, { type: 'paragraph' }).focus().run()
            }"
          />

          <UDropdownMenu
            v-slot="{ open }"
            :modal="false"
            :items="handleItems(editor)"
            :content="{ side: 'left' }"
            :ui="{ content: 'w-48', label: 'text-xs' }"
            @update:open="editor.chain().setMeta('lockDragHandle', $event).run()"
          >
            <UButton
              color="neutral"
              variant="ghost"
              active-variant="soft"
              size="sm"
              icon="i-lucide-grip-vertical"
              :active="open"
              :class="ui.handle()"
            />
          </UDropdownMenu>
        </UEditorDragHandle>
      </UEditor>
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
import type { EditorToolbarItem, EditorSuggestionMenuItem, EditorMentionMenuItem, DropdownMenuItem } from '@nuxt/ui'
import type { Editor, JSONContent } from '@tiptap/vue-3'
import type { PortableTextBlock } from '@portabletext/types'
import { upperFirst } from 'scule'
import { mapEditorItems } from '@nuxt/ui/utils/editor'
import { TextAlign } from '@tiptap/extension-text-align'
import { calloutBlockExtension, SanityCallout } from '../calloutExtension'

const editorRef = useTemplateRef('editorRef')

const blocks = ref<PortableTextBlock[]>([])
const ctx = createSanityEditorContext({
  blockExtensions: [calloutBlockExtension],
})

const tiptapJson = computed(() => sanityEditorBlocksToTiptapJson(blocks.value, ctx))

const editorExtensions = [
  SanityCallout,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
]

const json = computed(() => JSON.stringify(blocks.value, null, 2))

function handleUpdate(value: JSONContent) {
  blocks.value = sanityEditorProsemirrorJsonToBlocks(value, ctx)
}

function insertCallout(editor: Editor) {
  editor
    .chain()
    .focus()
    .insertContent({
      type: 'callout',
      attrs: { variant: 'warning' },
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Portable Text callout from UEditor.' }],
        },
      ],
    })
    .run()
}

const selectedNode = ref<{ node: JSONContent, pos: number }>()

const fixedToolbarItems = [[{
  kind: 'undo',
  icon: 'i-lucide-undo',
  tooltip: { text: 'Undo' },
}, {
  kind: 'redo',
  icon: 'i-lucide-redo',
  tooltip: { text: 'Redo' },
}], [{
  icon: 'i-lucide-heading',
  tooltip: { text: 'Headings' },
  content: { align: 'start' },
  items: [{
    kind: 'heading', level: 1, icon: 'i-lucide-heading-1', label: 'Heading 1',
  }, {
    kind: 'heading', level: 2, icon: 'i-lucide-heading-2', label: 'Heading 2',
  }, {
    kind: 'heading', level: 3, icon: 'i-lucide-heading-3', label: 'Heading 3',
  }, {
    kind: 'heading', level: 4, icon: 'i-lucide-heading-4', label: 'Heading 4',
  }],
}, {
  icon: 'i-lucide-list',
  tooltip: { text: 'Lists' },
  content: { align: 'start' },
  items: [{
    kind: 'bulletList', icon: 'i-lucide-list', label: 'Bullet List',
  }, {
    kind: 'orderedList', icon: 'i-lucide-list-ordered', label: 'Ordered List',
  }],
}, {
  kind: 'blockquote', icon: 'i-lucide-text-quote', tooltip: { text: 'Blockquote' },
}, {
  kind: 'codeBlock', icon: 'i-lucide-square-code', tooltip: { text: 'Code Block' },
}], [{
  kind: 'mark', mark: 'bold', icon: 'i-lucide-bold', tooltip: { text: 'Bold' },
}, {
  kind: 'mark', mark: 'italic', icon: 'i-lucide-italic', tooltip: { text: 'Italic' },
}, {
  kind: 'mark', mark: 'underline', icon: 'i-lucide-underline', tooltip: { text: 'Underline' },
}, {
  kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough', tooltip: { text: 'Strikethrough' },
}, {
  kind: 'mark', mark: 'code', icon: 'i-lucide-code', tooltip: { text: 'Code' },
}], [{
  icon: 'i-lucide-align-justify',
  tooltip: { text: 'Text Align' },
  content: { align: 'end' },
  items: [{
    kind: 'textAlign', align: 'left', icon: 'i-lucide-align-left', label: 'Align Left',
  }, {
    kind: 'textAlign', align: 'center', icon: 'i-lucide-align-center', label: 'Align Center',
  }, {
    kind: 'textAlign', align: 'right', icon: 'i-lucide-align-right', label: 'Align Right',
  }, {
    kind: 'textAlign', align: 'justify', icon: 'i-lucide-align-justify', label: 'Align Justify',
  }],
}]] satisfies EditorToolbarItem[][]

const bubbleToolbarItems = [[{
  label: 'Turn into',
  trailingIcon: 'i-lucide-chevron-down',
  activeColor: 'neutral',
  activeVariant: 'ghost',
  tooltip: { text: 'Turn into' },
  content: { align: 'start' },
  ui: { label: 'text-xs' },
  items: [{
    type: 'label', label: 'Turn into',
  }, {
    kind: 'paragraph', label: 'Paragraph', icon: 'i-lucide-type',
  }, {
    kind: 'heading', level: 1, icon: 'i-lucide-heading-1', label: 'Heading 1',
  }, {
    kind: 'heading', level: 2, icon: 'i-lucide-heading-2', label: 'Heading 2',
  }, {
    kind: 'heading', level: 3, icon: 'i-lucide-heading-3', label: 'Heading 3',
  }, {
    kind: 'bulletList', icon: 'i-lucide-list', label: 'Bullet List',
  }, {
    kind: 'orderedList', icon: 'i-lucide-list-ordered', label: 'Ordered List',
  }, {
    kind: 'blockquote', icon: 'i-lucide-text-quote', label: 'Blockquote',
  }, {
    kind: 'codeBlock', icon: 'i-lucide-square-code', label: 'Code Block',
  }],
}], [{
  kind: 'mark', mark: 'bold', icon: 'i-lucide-bold', tooltip: { text: 'Bold' },
}, {
  kind: 'mark', mark: 'italic', icon: 'i-lucide-italic', tooltip: { text: 'Italic' },
}, {
  kind: 'mark', mark: 'underline', icon: 'i-lucide-underline', tooltip: { text: 'Underline' },
}, {
  kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough', tooltip: { text: 'Strikethrough' },
}, {
  kind: 'mark', mark: 'code', icon: 'i-lucide-code', tooltip: { text: 'Code' },
}], [{
  icon: 'i-lucide-align-justify',
  tooltip: { text: 'Text Align' },
  content: { align: 'end' },
  items: [{
    kind: 'textAlign', align: 'left', icon: 'i-lucide-align-left', label: 'Align Left',
  }, {
    kind: 'textAlign', align: 'center', icon: 'i-lucide-align-center', label: 'Align Center',
  }, {
    kind: 'textAlign', align: 'right', icon: 'i-lucide-align-right', label: 'Align Right',
  }, {
    kind: 'textAlign', align: 'justify', icon: 'i-lucide-align-justify', label: 'Align Justify',
  }],
}]] satisfies EditorToolbarItem[][]

const suggestionItems = [[{
  type: 'label', label: 'Style',
}, {
  kind: 'paragraph', label: 'Paragraph', icon: 'i-lucide-type',
}, {
  kind: 'heading', level: 1, label: 'Heading 1', icon: 'i-lucide-heading-1',
}, {
  kind: 'heading', level: 2, label: 'Heading 2', icon: 'i-lucide-heading-2',
}, {
  kind: 'heading', level: 3, label: 'Heading 3', icon: 'i-lucide-heading-3',
}, {
  kind: 'bulletList', label: 'Bullet List', icon: 'i-lucide-list',
}, {
  kind: 'orderedList', label: 'Numbered List', icon: 'i-lucide-list-ordered',
}, {
  kind: 'blockquote', label: 'Blockquote', icon: 'i-lucide-text-quote',
}, {
  kind: 'codeBlock', label: 'Code Block', icon: 'i-lucide-square-code',
}], [{
  type: 'label', label: 'Insert',
}, {
  kind: 'mention', label: 'Mention', icon: 'i-lucide-at-sign',
}, {
  kind: 'horizontalRule', label: 'Horizontal Rule', icon: 'i-lucide-separator-horizontal',
}]] satisfies EditorSuggestionMenuItem[][]

const mentionItems: EditorMentionMenuItem[] = [{
  label: 'benjamincanac',
  avatar: { src: 'https://avatars.githubusercontent.com/u/739984?v=4', loading: 'lazy' as const },
}, {
  label: 'HugoRCD',
  avatar: { src: 'https://avatars.githubusercontent.com/u/71938701?v=4', loading: 'lazy' as const },
}, {
  label: 'romhml',
  avatar: { src: 'https://avatars.githubusercontent.com/u/25613751?v=4', loading: 'lazy' as const },
}]

function handleItems(editor: Editor): DropdownMenuItem[][] {
  if (!selectedNode.value?.node?.type) return []

  return mapEditorItems(editor, [[{
    type: 'label',
    label: upperFirst(selectedNode.value.node.type),
  }, {
    label: 'Turn into',
    icon: 'i-lucide-repeat-2',
    children: [
      { kind: 'paragraph', label: 'Paragraph', icon: 'i-lucide-type' },
      { kind: 'heading', level: 1, label: 'Heading 1', icon: 'i-lucide-heading-1' },
      { kind: 'heading', level: 2, label: 'Heading 2', icon: 'i-lucide-heading-2' },
      { kind: 'heading', level: 3, label: 'Heading 3', icon: 'i-lucide-heading-3' },
      { kind: 'bulletList', label: 'Bullet List', icon: 'i-lucide-list' },
      { kind: 'orderedList', label: 'Ordered List', icon: 'i-lucide-list-ordered' },
      { kind: 'blockquote', label: 'Blockquote', icon: 'i-lucide-text-quote' },
      { kind: 'codeBlock', label: 'Code Block', icon: 'i-lucide-square-code' },
    ],
  }, {
    kind: 'clearFormatting',
    pos: selectedNode.value?.pos,
    label: 'Reset formatting',
    icon: 'i-lucide-rotate-ccw',
  }], [{
    kind: 'duplicate',
    pos: selectedNode.value?.pos,
    label: 'Duplicate',
    icon: 'i-lucide-copy',
  }], [{
    kind: 'moveUp',
    pos: selectedNode.value?.pos,
    label: 'Move up',
    icon: 'i-lucide-arrow-up',
  }, {
    kind: 'moveDown',
    pos: selectedNode.value?.pos,
    label: 'Move down',
    icon: 'i-lucide-arrow-down',
  }], [{
    kind: 'delete',
    pos: selectedNode.value?.pos,
    label: 'Delete',
    icon: 'i-lucide-trash',
  }]]) as DropdownMenuItem[][]
}
</script>
