import { describe, expect, it } from 'vitest'
import { sanityEditorDefaultCompiledSchema } from '../../src/runtime/utils/default-sanity-editor-schema'
import {
  sanityEditorBlocksToTiptapJson,
  sanityEditorProsemirrorJsonToBlocks,
  type TiptapJSONDoc,
} from '../../src/runtime/utils/sanity-editor-prosemirror'
import { calloutBlockExtension } from '../../playground/calloutExtension'
import { taskBlockExtension } from '../../playground/taskBlockExtension'
import type { PortableTextBlock } from '@portabletext/types'

type TaskPTBlock = PortableTextBlock & {
  _type: 'task'
  checked: boolean
  text: string
}

const ctx = {
  schema: sanityEditorDefaultCompiledSchema,
  keyGenerator: (() => {
    let n = 0
    return () => `k${++n}`
  })(),
}

const taskCtx = {
  ...ctx,
  blockExtensions: [taskBlockExtension],
}

const calloutCtx = {
  ...ctx,
  blockExtensions: [calloutBlockExtension],
}

describe('sanityEditorProsemirrorJsonToBlocks', () => {
  it('includes markDefs as an empty array when there are no link annotations', () => {
    const doc: TiptapJSONDoc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] },
      ],
    }
    const blocks = sanityEditorProsemirrorJsonToBlocks(doc, ctx)
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
    const blocks = sanityEditorProsemirrorJsonToBlocks(doc, ctx)
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
    const blocks = sanityEditorProsemirrorJsonToBlocks(doc, ctx)
    expect(blocks[0]!.style).toBe('h2')
  })

  it('maps horizontalRule to horizontal-rule block object', () => {
    const doc: TiptapJSONDoc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'A' }] },
        { type: 'horizontalRule' },
        { type: 'paragraph', content: [{ type: 'text', text: 'B' }] },
      ],
    }
    const blocks = sanityEditorProsemirrorJsonToBlocks(doc, ctx)
    expect(blocks).toHaveLength(3)
    expect((blocks[1] as { _type: string })._type).toBe('horizontal-rule')
  })

  it('maps callout node to callout block object', () => {
    const doc: TiptapJSONDoc = {
      type: 'doc',
      content: [
        {
          type: 'callout',
          attrs: { variant: 'warning' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Hello callout' }],
            },
          ],
        },
      ],
    }
    const blocks = sanityEditorProsemirrorJsonToBlocks(doc, calloutCtx)
    expect(blocks).toHaveLength(1)
    const c = blocks[0] as PortableTextBlock & { variant?: string, text?: string }
    expect(c._type).toBe('callout')
    expect(c.variant).toBe('warning')
    expect(c.text).toBe('Hello callout')
  })

  it('maps taskList/taskItem to task blocks', () => {
    const doc: TiptapJSONDoc = {
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Buy milk' }],
                },
              ],
            },
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Walk dog' }],
                },
              ],
            },
          ],
        },
      ],
    }

    const blocks = sanityEditorProsemirrorJsonToBlocks(doc, taskCtx)
    expect(blocks).toHaveLength(2)

    const task0 = blocks[0] as unknown as TaskPTBlock
    expect(task0._type).toBe('task')
    expect(task0.checked).toBe(true)
    expect(task0.text).toBe('Buy milk')

    const task1 = blocks[1] as unknown as TaskPTBlock
    expect(task1._type).toBe('task')
    expect(task1.checked).toBe(false)
    expect(task1.text).toBe('Walk dog')
  })
})

describe('sanityEditorBlocksToTiptapJson', () => {
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
    const pt = sanityEditorProsemirrorJsonToBlocks(doc, ctx)
    const back = sanityEditorBlocksToTiptapJson(pt, ctx)
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
    const pt = sanityEditorProsemirrorJsonToBlocks(doc, ctx)
    const back = sanityEditorBlocksToTiptapJson(pt, ctx)
    const pt2 = sanityEditorProsemirrorJsonToBlocks(back, ctx)
    expect(pt2).toHaveLength(2)
    expect(pt2[0]!.listItem).toBe('bullet')
    expect(pt2[1]!.listItem).toBe('bullet')
  })

  it('round-trips horizontal rule', () => {
    const doc: TiptapJSONDoc = {
      type: 'doc',
      content: [{ type: 'horizontalRule' }],
    }
    const pt = sanityEditorProsemirrorJsonToBlocks(doc, ctx)
    const back = sanityEditorBlocksToTiptapJson(pt, ctx)
    expect(back.content?.[0]?.type).toBe('horizontalRule')
    const pt2 = sanityEditorProsemirrorJsonToBlocks(back, ctx)
    expect((pt2[0] as { _type: string })._type).toBe('horizontal-rule')
  })

  it('groups consecutive task blocks into a taskList', () => {
    const pt = [
      { _type: 'task', _key: 't1', checked: true, text: 'A' },
      { _type: 'task', _key: 't2', checked: false, text: 'B' },
    ] as unknown as TaskPTBlock[]

    const back = sanityEditorBlocksToTiptapJson(pt, taskCtx)
    expect(back.content?.[0]?.type).toBe('taskList')

    const items = back.content?.[0]?.content ?? []
    expect(items).toHaveLength(2)
    expect(items[0]?.type).toBe('taskItem')
    expect(items[0]?.attrs?.checked).toBe(true)
    expect(items[0]?.content?.[0]?.content?.[0]?.text).toBe('A')
  })

  it('round-trips callout block <-> callout node', () => {
    const pt = [
      {
        _type: 'callout',
        _key: 'c1',
        variant: 'info',
        text: 'Note',
      },
    ] as unknown as PortableTextBlock[]

    const tip = sanityEditorBlocksToTiptapJson(pt, calloutCtx)
    expect(tip.content?.[0]?.type).toBe('callout')
    expect(tip.content?.[0]?.attrs?.variant).toBe('info')

    const roundTrip = sanityEditorProsemirrorJsonToBlocks(tip, calloutCtx)
    expect(roundTrip).toHaveLength(1)
    const c = roundTrip[0] as PortableTextBlock & { variant?: string, text?: string }
    expect(c._type).toBe('callout')
    expect(c.variant).toBe('info')
    expect(c.text).toBe('Note')
  })

  it('round-trips task blocks <-> taskList', () => {
    const pt = [
      { _type: 'task', _key: 't1', checked: true, text: 'Do thing' },
      { _type: 'task', _key: 't2', checked: false, text: 'Do other' },
    ] as unknown as TaskPTBlock[]

    const tip = sanityEditorBlocksToTiptapJson(pt, taskCtx)
    const roundTrip = sanityEditorProsemirrorJsonToBlocks(tip, taskCtx)

    expect(roundTrip).toHaveLength(2)
    const rt0 = roundTrip[0] as unknown as TaskPTBlock
    const rt1 = roundTrip[1] as unknown as TaskPTBlock
    expect(rt0._type).toBe('task')
    expect(rt0.checked).toBe(true)
    expect(rt0.text).toBe('Do thing')
    expect(rt1.checked).toBe(false)
    expect(rt1.text).toBe('Do other')
  })
})
