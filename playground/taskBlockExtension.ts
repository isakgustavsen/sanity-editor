import type { PortableTextBlock } from '@portabletext/types'
import type { PortableTextBlockExtension } from '../src/runtime/types/portableTextBlockExtension'

const defaultKeyGenerator = (): string => `k${Math.random().toString(36).slice(2, 11)}`

type Ctx = { keyGenerator?: () => string }

function ptKey(ctx: unknown): string {
  const maybe = ctx as Ctx
  return typeof maybe?.keyGenerator === 'function' ? maybe.keyGenerator() : defaultKeyGenerator()
}

type TiptapNode = {
  type?: string
  attrs?: Record<string, unknown>
  content?: unknown
  text?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function extractTaskItemText(taskItemNode: unknown): string {
  // TipTap stores task items as a `taskItem` node containing paragraph(s).
  if (!isRecord(taskItemNode)) return ''

  const tiptapNode = taskItemNode as TiptapNode
  const content = tiptapNode.content
  if (!Array.isArray(content)) return ''

  const paragraphs = content as TiptapNode[]
  const firstParagraph
    = paragraphs.find(n => n?.type === 'paragraph') ?? paragraphs[0] ?? undefined

  const inlineContent = firstParagraph?.content
  const inlineNodes = Array.isArray(inlineContent) ? inlineContent : []

  let out = ''
  for (const n of inlineNodes as TiptapNode[]) {
    if (n?.type === 'text') out += String(n?.text ?? '')
    else if (n?.type === 'hardBreak') out += '\n'
  }

  return out
}

// Example extension for PT `types.task` blocks.
// Intentionally kept in the playground so it is not shipped as part of the module.
export const taskBlockExtension: PortableTextBlockExtension = {
  type: 'task',
  mode: 'runContainer',
  containerTiptapNodeType: 'taskList',
  itemTiptapNodeType: 'taskItem',
  schemaDefinition: {
    blockObjects: [
      {
        name: 'task',
        fields: [
          { name: 'checked', type: 'boolean' },
          { name: 'text', type: 'string' },
        ],
      },
    ],
  },
  fromTiptapNode: (node: unknown, ctx: unknown): PortableTextBlock[] | null => {
    if (!isRecord(node)) return null

    const tiptapNode = node as TiptapNode
    if (tiptapNode?.type !== 'taskList') return null

    const content = tiptapNode.content
    if (!Array.isArray(content)) return []

    const items = content as TiptapNode[]
    const out: PortableTextBlock[] = []

    for (const item of items) {
      if (item?.type !== 'taskItem') continue
      const checked = Boolean((item.attrs?.checked as boolean | undefined) ?? false)
      const text = extractTaskItemText(item)

      out.push({
        _type: 'task',
        _key: ptKey(ctx),
        checked,
        text,
      } as unknown as PortableTextBlock)
    }

    return out
  },
  toTiptapNodeRun: (
    blocks: PortableTextBlock[],
    startIndex: number,
    _ctx: unknown,
  ) => {
    if (startIndex < 0 || startIndex >= blocks.length) return null

    let i = startIndex
    const items: TiptapNode[] = []

    while (i < blocks.length && blocks[i]?._type === 'task') {
      const b = blocks[i] as PortableTextBlock & { checked?: boolean, text?: string }
      const checked = Boolean(b?.checked ?? false)
      const text = String(b?.text ?? '')

      items.push({
        type: 'taskItem',
        attrs: { checked },
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text,
              },
            ],
          },
        ],
      })
      i++
    }

    if (!items.length) return null

    return {
      node: {
        type: 'taskList',
        content: items,
      },
      nextIndex: i,
    }
  },
}
