import { describe, expect, it } from 'vitest'
import { defaultCompiledPortableTextSchema } from '../../src/runtime/utils/default-portable-text-schema'
import {
  portableTextToTipTapJson,
  prosemirrorJsonToPortableText,
  type TiptapJSONDoc,
} from '../../src/runtime/utils/prosemirror-portable-text'

const ctx = {
  schema: defaultCompiledPortableTextSchema,
  keyGenerator: (() => {
    let n = 0
    return () => `k${++n}`
  })(),
}

describe('prosemirrorJsonToPortableText', () => {
  it('includes markDefs as an empty array when there are no link annotations', () => {
    const doc: TiptapJSONDoc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] },
      ],
    }
    const blocks = prosemirrorJsonToPortableText(doc, ctx)
    expect(blocks[0]!.markDefs).toEqual([])
  })

  it('maps paragraph with bold', () => {
    const doc: TiptapJSONDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello', marks: [{ type: 'bold' }] }],
        },
      ],
    }
    const blocks = prosemirrorJsonToPortableText(doc, ctx)
    expect(blocks).toHaveLength(1)
    expect(blocks[0]!.style).toBe('normal')
    expect(blocks[0]!.children?.[0]).toMatchObject({
      _type: 'span',
      text: 'Hello',
      marks: ['strong'],
    })
  })

  it('maps heading level', () => {
    const doc: TiptapJSONDoc = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Title' }],
        },
      ],
    }
    const blocks = prosemirrorJsonToPortableText(doc, ctx)
    expect(blocks[0]!.style).toBe('h2')
  })
})

describe('portableTextToTipTapJson', () => {
  it('round-trips simple paragraph', () => {
    const doc: TiptapJSONDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hi', marks: [{ type: 'italic' }] }],
        },
      ],
    }
    const pt = prosemirrorJsonToPortableText(doc, ctx)
    const back = portableTextToTipTapJson(pt, ctx)
    expect(back.type).toBe('doc')
    expect(back.content?.[0]!.type).toBe('paragraph')
    expect(back.content?.[0]!.content?.[0]).toMatchObject({
      type: 'text',
      text: 'Hi',
      marks: [{ type: 'italic' }],
    })
  })

  it('round-trips flat bullet list', () => {
    const doc: TiptapJSONDoc = {
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'One' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Two' }],
                },
              ],
            },
          ],
        },
      ],
    }
    const pt = prosemirrorJsonToPortableText(doc, ctx)
    const back = portableTextToTipTapJson(pt, ctx)
    const pt2 = prosemirrorJsonToPortableText(back, ctx)
    expect(pt2).toHaveLength(2)
    expect(pt2[0]!.listItem).toBe('bullet')
    expect(pt2[1]!.listItem).toBe('bullet')
  })
})
