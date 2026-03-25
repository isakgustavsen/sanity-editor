import type { Schema, SchemaDefinition } from '@portabletext/schema'
import { compileSchema } from '@portabletext/schema'
import type { PortableTextBlock } from '@portabletext/types'
import type { AnyExtension } from '@tiptap/core'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import { useEditor } from '@tiptap/vue-3'
import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'
import {
  defaultCompiledPortableTextSchema,
  defaultPortableTextSchemaDefinition,
} from '../utils/default-portable-text-schema'
import {
  portableTextToTipTapJson,
  prosemirrorJsonToPortableText,
  type PortableTextTransformContext,
} from '../utils/prosemirror-portable-text'
import type { PortableTextBlockExtension } from '../types/portableTextBlockExtension'

export interface UsePortableTextEditorOptions {
  /** Defaults to `defaultCompiledPortableTextSchema` */
  schema?: Schema
  extensions?: AnyExtension[]
  portableTextBlockExtensions?: PortableTextBlockExtension[]
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

function dedupeByName<T extends { name: string }>(items: T[]): T[] {
  const out: T[] = []
  const seen = new Set<string>()
  for (const i of items) {
    if (seen.has(i.name)) continue
    seen.add(i.name)
    out.push(i)
  }
  return out
}

function mergeSchemaDefinitions(
  base: SchemaDefinition,
  additions: Array<SchemaDefinition | undefined>,
): SchemaDefinition {
  const add = additions.filter(Boolean) as SchemaDefinition[]
  return {
    styles: dedupeByName([...(base.styles ?? []), ...add.flatMap(s => s.styles ?? [])]),
    lists: dedupeByName([...(base.lists ?? []), ...add.flatMap(s => s.lists ?? [])]),
    decorators: dedupeByName([
      ...(base.decorators ?? []),
      ...add.flatMap(s => s.decorators ?? []),
    ]),
    annotations: dedupeByName([
      ...(base.annotations ?? []),
      ...add.flatMap(s => s.annotations ?? []),
    ]),
    blockObjects: dedupeByName([
      ...(base.blockObjects ?? []),
      ...add.flatMap(s => s.blockObjects ?? []),
    ]),
    inlineObjects: dedupeByName([
      ...(base.inlineObjects ?? []),
      ...add.flatMap(s => s.inlineObjects ?? []),
    ]),
  }
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
  const schema
    = options.schema
      ?? (options.portableTextBlockExtensions?.length
        ? compileSchema(
            mergeSchemaDefinitions(
              defaultPortableTextSchemaDefinition as unknown as SchemaDefinition,
              options.portableTextBlockExtensions.map(e => e.schemaDefinition),
            ),
          )
        : defaultCompiledPortableTextSchema)
  const ctx: PortableTextTransformContext = {
    schema,
    keyGenerator: options.keyGenerator,
    portableTextBlockExtensions: options.portableTextBlockExtensions,
  }

  let syncing = false
  let lastEmitted = serializePt(modelValue.value)

  const editor = useEditor({
    content: portableTextToTipTapJson(modelValue.value, ctx),
    // Always include our base Portable Text editor extensions (document/parsing),
    // then append user-provided extensions (e.g. task list).
    extensions: [...defaultExtensions, ...(options.extensions ?? [])],
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
