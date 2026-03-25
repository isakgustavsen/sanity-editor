import type { Schema, SchemaDefinition } from '@portabletext/schema'
import { compileSchema } from '@portabletext/schema'
import type { PortableTextBlock } from '@portabletext/types'
import type { AnyExtension } from '@tiptap/core'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import { useEditor } from '@tiptap/vue-3'
import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'
import type { SanityEditorBlockExtension } from '../types/sanityEditorBlockExtension'
import {
  sanityEditorDefaultCompiledSchema,
  sanityEditorDefaultSchemaDefinition,
} from '../utils/default-sanity-editor-schema'
import {
  sanityEditorBlocksToTiptapJson,
  sanityEditorProsemirrorJsonToBlocks,
  type SanityEditorTransformContext,
} from '../utils/sanity-editor-prosemirror'

export interface UseSanityEditorOptions {
  /** Defaults to `sanityEditorDefaultCompiledSchema` */
  schema?: Schema
  extensions?: AnyExtension[]
  blockExtensions?: SanityEditorBlockExtension[]
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
 * TipTap + block-array bridge for Nuxt. Pass a ref to your `v-model` array and a setter
 * (e.g. from `defineEmits`) to push updates upstream.
 */
export function useSanityEditor(
  modelValue: Ref<PortableTextBlock[]>,
  emitUpdate: (value: PortableTextBlock[]) => void,
  options: UseSanityEditorOptions = {},
) {
  const schema
    = options.schema
      ?? (options.blockExtensions?.length
        ? compileSchema(
            mergeSchemaDefinitions(
              sanityEditorDefaultSchemaDefinition as unknown as SchemaDefinition,
              options.blockExtensions.map(e => e.schemaDefinition),
            ),
          )
        : sanityEditorDefaultCompiledSchema)
  const ctx: SanityEditorTransformContext = {
    schema,
    keyGenerator: options.keyGenerator,
    blockExtensions: options.blockExtensions,
  }

  let syncing = false
  let lastEmitted = serializePt(modelValue.value)

  const editor = useEditor({
    content: sanityEditorBlocksToTiptapJson(modelValue.value, ctx),
    extensions: [...defaultExtensions, ...(options.extensions ?? [])],
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      if (syncing) return
      const next = sanityEditorProsemirrorJsonToBlocks(ed.getJSON(), ctx)
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
      ed.commands.setContent(sanityEditorBlocksToTiptapJson(next ?? [], ctx))
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
