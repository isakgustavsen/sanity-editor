import { mergeAttributes, Node } from '@tiptap/core'
import type { PortableTextBlock } from '@portabletext/types'
import { defineSanityEditorBlockComponent } from '../src/runtime/utils/define-sanity-editor-block-component'
import {
  sanityEditorFlattenTextInTiptapNode,
  sanityEditorGenerateKey,
  type TiptapJSONNode,
} from '../src/runtime/utils/sanity-editor-prosemirror'

/**
 * TipTap block node for the playground “custom block component” example.
 * Stored in Portable Text as `_type: 'callout'` with `variant` and `text`.
 */
export const SanityCallout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'paragraph',
  defining: true,
  addAttributes() {
    return {
      variant: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-variant') ?? 'info',
        renderHTML: (attributes) => {
          if (!attributes.variant) return {}
          return { 'data-variant': attributes.variant }
        },
      },
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-callout]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-callout': '' }), 0]
  },
})

function calloutParagraphPlainText(node: TiptapJSONNode): string {
  const first = node.content?.find(c => c.type === 'paragraph')
  if (!first) return ''
  return sanityEditorFlattenTextInTiptapNode(first)
}

export const calloutBlockExtension = defineSanityEditorBlockComponent({
  type: 'callout',
  tiptapNodeType: 'callout',
  schemaDefinition: {
    blockObjects: [
      {
        name: 'callout',
        fields: [
          { name: 'variant', type: 'string' },
          { name: 'text', type: 'string' },
        ],
      },
    ],
  },
  fromTiptapNode: (node, ctx) => {
    if (node.type !== 'callout') return null
    const variant = String(node.attrs?.variant ?? 'info')
    const text = calloutParagraphPlainText(node)
    return [
      {
        _type: 'callout',
        _key: sanityEditorGenerateKey(ctx),
        variant,
        text,
      } as unknown as PortableTextBlock,
    ]
  },
  toTiptapNode: (block) => {
    if (block._type !== 'callout') return null
    const b = block as PortableTextBlock & { variant?: string, text?: string }
    const variant = String(b.variant ?? 'info')
    const text = String(b.text ?? '')
    return {
      type: 'callout',
      attrs: { variant },
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text }],
        },
      ],
    }
  },
})
