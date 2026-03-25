import type { Schema } from '@portabletext/schema'
import type {
  PortableTextBlock,
  PortableTextMarkDefinition,
  PortableTextSpan,
} from '@portabletext/types'
import type { SanityEditorBlockExtension } from '../types/sanityEditorBlockExtension'

/** TipTap / ProseMirror JSON document shape from `editor.getJSON()` */
export interface TiptapJSONDoc {
  type: 'doc'
  content?: TiptapJSONNode[]
}

export type TiptapJSONNode = {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapJSONNode[]
  text?: string
  marks?: TiptapJSONMark[]
}

export type TiptapJSONMark = {
  type: string
  attrs?: Record<string, unknown>
}

export interface SanityEditorTransformContext {
  schema: Schema
  /** Defaults to random base36 keys */
  keyGenerator?: () => string
  /** Optional custom block mappings for TipTap/ProseMirror ↔ block conversion. */
  blockExtensions?: SanityEditorBlockExtension[]
}

const defaultKeyGenerator = (): string =>
  `k${Math.random().toString(36).slice(2, 11)}`

function key(ctx: SanityEditorTransformContext): string {
  return (ctx.keyGenerator ?? defaultKeyGenerator)()
}

/** Block object for TipTap `horizontalRule` (StarterKit); matches schema `horizontal-rule`. */
function horizontalRulePortableBlock(
  ctx: SanityEditorTransformContext,
): PortableTextBlock {
  return {
    _type: 'horizontal-rule',
    _key: key(ctx),
  } as unknown as PortableTextBlock
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asDoc(node: unknown): TiptapJSONDoc | null {
  if (!isRecord(node)) return null
  if (node.type !== 'doc') return null
  return node as unknown as TiptapJSONDoc
}

export function sanityEditorProsemirrorJsonToBlocks(
  docJson: unknown,
  ctx: SanityEditorTransformContext,
): PortableTextBlock[] {
  const doc = asDoc(docJson)
  if (!doc) return []
  const out: PortableTextBlock[] = []
  for (const node of doc.content ?? []) {
    out.push(...topLevelNodeToBlocks(node, ctx))
  }
  return out
}

function topLevelNodeToBlocks(
  node: TiptapJSONNode,
  ctx: SanityEditorTransformContext,
): PortableTextBlock[] {
  switch (node.type) {
    case 'paragraph':
      return [blockFromParagraphLike(node, ctx, { style: 'normal' })]
    case 'heading': {
      const level = Number(node.attrs?.level ?? 1)
      const style = `h${Math.min(6, Math.max(1, level))}`
      return [blockFromParagraphLike(node, ctx, { style })]
    }
    case 'blockquote': {
      const inner = node.content?.[0] ?? { type: 'paragraph', content: [] }
      return [blockFromParagraphLike(inner, ctx, { style: 'blockquote' })]
    }
    case 'codeBlock': {
      const text = flattenTextInNode(node)
      return [
        blockFromParagraphLike(
          {
            type: 'paragraph',
            content: text
              ? [{ type: 'text', text, marks: [{ type: 'code' }] }]
              : [{ type: 'text', text: '', marks: [{ type: 'code' }] }],
          },
          ctx,
          { style: 'normal' },
        ),
      ]
    }
    case 'horizontalRule':
      return [horizontalRulePortableBlock(ctx)]
    case 'bulletList':
      return processList(node, 'bullet', 1, ctx)
    case 'orderedList':
      return processList(node, 'number', 1, ctx)
    default: {
      const exts = ctx.blockExtensions ?? []
      for (const ext of exts) {
        if (ext.mode === 'single') {
          if (ext.tiptapNodeTypes.includes(node.type)) {
            const blocks = ext.fromTiptapNode(node, ctx)
            if (blocks?.length) return blocks
          }
          continue
        }

        // runContainer
        if (ext.containerTiptapNodeType === node.type) {
          const blocks = ext.fromTiptapNode(node, ctx)
          if (blocks?.length) return blocks
        }
      }
      return []
    }
  }
}

function processList(
  list: TiptapJSONNode,
  listKind: 'bullet' | 'number',
  level: number,
  ctx: SanityEditorTransformContext,
): PortableTextBlock[] {
  const out: PortableTextBlock[] = []
  for (const li of list.content ?? []) {
    if (li.type !== 'listItem') continue
    out.push(...processListItem(li, listKind, level, ctx))
  }
  return out
}

function processListItem(
  li: TiptapJSONNode,
  listKind: 'bullet' | 'number',
  level: number,
  ctx: SanityEditorTransformContext,
): PortableTextBlock[] {
  const out: PortableTextBlock[] = []
  for (const child of li.content ?? []) {
    if (child.type === 'paragraph') {
      out.push(
        blockFromParagraphLike(child, ctx, {
          style: 'normal',
          listItem: listKind,
          level,
        }),
      )
    }
    else if (child.type === 'bulletList') {
      out.push(...processList(child, 'bullet', level + 1, ctx))
    }
    else if (child.type === 'orderedList') {
      out.push(...processList(child, 'number', level + 1, ctx))
    }
  }
  return out
}

function blockFromParagraphLike(
  node: TiptapJSONNode,
  ctx: SanityEditorTransformContext,
  opts: {
    style: string
    listItem?: 'bullet' | 'number'
    level?: number
  },
): PortableTextBlock {
  const markDefs: PortableTextMarkDefinition[] = []
  const children = inlineContentToSpans(node.content ?? [], ctx, markDefs)
  const block: PortableTextBlock = {
    _type: 'block',
    _key: key(ctx),
    style: opts.style as PortableTextBlock['style'],
    children,
    markDefs,
  }
  if (opts.listItem) {
    block.listItem = opts.listItem
    block.level = opts.level ?? 1
  }
  return block
}

function flattenTextInNode(node: TiptapJSONNode): string {
  if (node.type === 'text') return node.text ?? ''
  let t = ''
  for (const c of node.content ?? []) {
    t += flattenTextInNode(c)
    if (c.type === 'paragraph' || c.type === 'hardBreak') t += '\n'
  }
  return t.replace(/\n$/, '')
}

function inlineContentToSpans(
  nodes: TiptapJSONNode[],
  ctx: SanityEditorTransformContext,
  markDefs: PortableTextMarkDefinition[],
): PortableTextSpan[] {
  const spans: PortableTextSpan[] = []
  for (const n of nodes) {
    if (n.type === 'text') {
      spans.push(textNodeToSpan(n, ctx, markDefs))
    }
    else if (n.type === 'hardBreak') {
      spans.push({
        _type: 'span',
        _key: key(ctx),
        text: '\n',
        marks: [],
      })
    }
  }
  return spans
}

function textNodeToSpan(
  node: TiptapJSONNode,
  ctx: SanityEditorTransformContext,
  markDefs: PortableTextMarkDefinition[],
): PortableTextSpan {
  const marks: string[] = []
  for (const m of node.marks ?? []) {
    const mapped = tiptapMarkToPortable(m, ctx, markDefs)
    if (mapped) marks.push(mapped)
  }
  return {
    _type: 'span',
    _key: key(ctx),
    text: node.text ?? '',
    marks: marks.length ? marks : undefined,
  }
}

function tiptapMarkToPortable(
  mark: TiptapJSONMark,
  ctx: SanityEditorTransformContext,
  markDefs: PortableTextMarkDefinition[],
): string | undefined {
  switch (mark.type) {
    case 'bold':
      return 'strong'
    case 'italic':
      return 'em'
    case 'strike':
      return 'strike-through'
    case 'underline':
      return 'underline' // requires @tiptap/extension-underline when used
    case 'code':
      return 'code'
    case 'link': {
      const href = String(mark.attrs?.href ?? '')
      const mk: PortableTextMarkDefinition = {
        _type: 'link',
        _key: key(ctx),
        href,
      }
      markDefs.push(mk)
      return mk._key
    }
    default:
      return undefined
  }
}

/** Build TipTap `setContent` JSON from block array */
export function sanityEditorBlocksToTiptapJson(
  blocks: PortableTextBlock[],
  _ctx: SanityEditorTransformContext,
): TiptapJSONDoc {
  if (!blocks.length) {
    return {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    }
  }

  const content: TiptapJSONNode[] = []
  let i = 0
  while (i < blocks.length) {
    const b = blocks[i]!
    const exts = _ctx.blockExtensions ?? []
    let handled = false

    // 1) Prefer runContainer mappings (consume multiple PT blocks at once).
    for (const ext of exts) {
      if (ext.mode !== 'runContainer') continue
      if (b._type !== ext.type) continue

      const res = ext.toTiptapNodeRun(blocks, i, _ctx)
      if (!res) continue

      content.push(res.node as TiptapJSONNode)
      i = res.nextIndex
      handled = true
      break
    }

    if (handled) continue

    // 2) Single-node mappings.
    for (const ext of exts) {
      if (ext.mode !== 'single') continue
      if (b._type !== ext.type) continue

      const node = ext.toTiptapNode(b, _ctx)
      if (!node) continue

      content.push(node as TiptapJSONNode)
      i++
      handled = true
      break
    }

    if (handled) continue

    // 3) Built-in conversions (paragraph-like + lists).
    if (!b.listItem) {
      content.push(blockToTopLevelNode(b))
      i++
    }
    else {
      const { list, next } = consumeListRun(blocks, i)
      content.push(list)
      i = next
    }
  }
  return { type: 'doc', content }
}

/**
 * Turn a flat run of list blocks (listItem + level) into a nested TipTap list tree.
 * Assumes levels follow TipTap/PT conventions (1 = outermost).
 */
function consumeListRun(
  blocks: PortableTextBlock[],
  start: number,
): { list: TiptapJSONNode, next: number } {
  const first = blocks[start]!
  const rootKind = first.listItem === 'number' ? 'orderedList' : 'bulletList'
  const root: TiptapJSONNode = { type: rootKind, content: [] }
  /** Index = level - 1 → last listItem at that depth */
  const lastLiAtLevel: TiptapJSONNode[] = []

  let i = start
  while (i < blocks.length) {
    const b = blocks[i]
    if (!b?.listItem) {
      break
    }
    const level = b.level ?? 1
    const listType = b.listItem === 'number' ? 'orderedList' : 'bulletList'
    const li: TiptapJSONNode = {
      type: 'listItem',
      content: [blockToParagraphNode(b)],
    }

    if (level === 1) {
      root.content = root.content ?? []
      root.content.push(li)
      lastLiAtLevel[0] = li
      lastLiAtLevel.length = 1
    }
    else {
      const parentLi = lastLiAtLevel[level - 2]
      if (!parentLi) {
        i++
        continue
      }
      parentLi.content = parentLi.content ?? []
      const wantType = listType
      let nested = parentLi.content.find(
        n => n.type === 'bulletList' || n.type === 'orderedList',
      ) as TiptapJSONNode | undefined
      if (!nested || nested.type !== wantType) {
        nested = { type: wantType, content: [] }
        parentLi.content.push(nested)
      }
      nested.content = nested.content ?? []
      nested.content.push(li)
      lastLiAtLevel[level - 1] = li
      lastLiAtLevel.length = level
    }
    i++
  }

  return { list: root, next: i }
}

function blockToTopLevelNode(block: PortableTextBlock): TiptapJSONNode {
  if ((block as { _type?: string })._type === 'horizontal-rule') {
    return { type: 'horizontalRule' }
  }
  const style = block.style ?? 'normal'
  if (style === 'blockquote') {
    return {
      type: 'blockquote',
      content: [blockToParagraphNode(block)],
    }
  }
  if (style.startsWith('h')) {
    const n = Number(style.slice(1))
    const level = Number.isFinite(n) ? Math.min(6, Math.max(1, n)) : 1
    return {
      type: 'heading',
      attrs: { level },
      content: inlineFromBlock(block),
    }
  }
  return blockToParagraphNode(block)
}

function blockToParagraphNode(block: PortableTextBlock): TiptapJSONNode {
  const style = block.style ?? 'normal'
  if (style.startsWith('h')) {
    const n = Number(style.slice(1))
    const level = Number.isFinite(n) ? Math.min(6, Math.max(1, n)) : 1
    return {
      type: 'heading',
      attrs: { level },
      content: inlineFromBlock(block),
    }
  }
  return {
    type: 'paragraph',
    content: inlineFromBlock(block),
  }
}

function inlineFromBlock(block: PortableTextBlock): TiptapJSONNode[] {
  const markDefs = block.markDefs ?? []
  const out: TiptapJSONNode[] = []
  for (const child of block.children ?? []) {
    if (child._type !== 'span') continue
    const span = child as PortableTextSpan
    const marks = portableMarksToTiptap(span.marks, markDefs)
    const parts = span.text.split('\n')
    for (let p = 0; p < parts.length; p++) {
      if (p > 0) {
        out.push({ type: 'hardBreak' })
      }
      const t = parts[p] ?? ''
      if (t.length > 0 || (p === 0 && parts.length === 1)) {
        out.push({
          type: 'text',
          text: t,
          marks: marks?.length ? marks : undefined,
        })
      }
    }
  }
  return out.length ? out : [{ type: 'text', text: '' }]
}

function portableMarksToTiptap(
  marks: string[] | undefined,
  markDefs: PortableTextMarkDefinition[],
): TiptapJSONMark[] | undefined {
  if (!marks?.length) return undefined
  const out: TiptapJSONMark[] = []
  for (const m of marks) {
    const def = markDefs.find(d => d._key === m)
    if (def && def._type === 'link') {
      out.push({
        type: 'link',
        attrs: { href: String((def as { href?: string }).href ?? '') },
      })
      continue
    }
    switch (m) {
      case 'strong':
        out.push({ type: 'bold' })
        break
      case 'em':
        out.push({ type: 'italic' })
        break
      case 'strike-through':
        out.push({ type: 'strike' })
        break
      case 'underline':
        out.push({ type: 'underline' })
        break
      case 'code':
        out.push({ type: 'code' })
        break
      default:
        break
    }
  }
  return out.length ? out : undefined
}
