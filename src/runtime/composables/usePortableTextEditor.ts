import type { Schema } from '@portabletext/schema'
import type { PortableTextBlock } from '@portabletext/types'
import type { AnyExtension } from '@tiptap/core'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import { useEditor } from '@tiptap/vue-3'
import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'
import { defaultCompiledPortableTextSchema } from '../utils/default-portable-text-schema'
import {
  portableTextToTipTapJson,
  prosemirrorJsonToPortableText,
  type PortableTextTransformContext,
} from '../utils/prosemirror-portable-text'

export interface UsePortableTextEditorOptions {
  /** Defaults to `defaultCompiledPortableTextSchema` */
  schema?: Schema
  extensions?: AnyExtension[]
  /** Merged last; do not set `immediatelyRender` or `onUpdate` */
  editorProps?: Record<string, unknown>
  keyGenerator?: () => string
}

const defaultExtensions: AnyExtension[] = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5, 6] },
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      rel: 'noopener noreferrer',
    },
  }),
]

function serializePt(blocks: PortableTextBlock[]): string {
  return JSON.stringify(blocks)
}

/**
 * TipTap + Portable Text bridge for Nuxt. Pass a ref to your `v-model` array and a setter
 * (e.g. from `defineEmits`) to push updates upstream.
 */
export function usePortableTextEditor(
  modelValue: Ref<PortableTextBlock[]>,
  emitUpdate: (value: PortableTextBlock[]) => void,
  options: UsePortableTextEditorOptions = {},
) {
  const schema = options.schema ?? defaultCompiledPortableTextSchema
  const ctx: PortableTextTransformContext = {
    schema,
    keyGenerator: options.keyGenerator,
  }

  let syncing = false
  let lastEmitted = serializePt(modelValue.value)

  const editor = useEditor({
    content: portableTextToTipTapJson(modelValue.value, ctx),
    extensions: [...(options.extensions ?? defaultExtensions)],
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      if (syncing) return
      const next = prosemirrorJsonToPortableText(ed.getJSON(), ctx)
      const s = serializePt(next)
      if (s === lastEmitted) return
      lastEmitted = s
      emitUpdate(next)
    },
    ...(options.editorProps ?? {}),
  } as Parameters<typeof useEditor>[0])

  watch(
    modelValue,
    (next) => {
      const s = serializePt(next ?? [])
      if (s === lastEmitted) return
      lastEmitted = s
      const ed = editor.value
      if (!ed) return
      syncing = true
      ed.commands.setContent(portableTextToTipTapJson(next ?? [], ctx))
      void nextTick(() => {
        syncing = false
      })
    },
    { deep: true },
  )

  onBeforeUnmount(() => {
    editor.value?.destroy()
  })

  return { editor }
}
