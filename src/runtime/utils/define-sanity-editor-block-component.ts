import type { SchemaDefinition } from '@portabletext/schema'
import type { PortableTextBlock } from '@portabletext/types'
import type { SanityEditorSingleNodeBlockExtension } from '../types/sanityEditorBlockExtension'
import type { SanityEditorTransformContext } from '../types/sanity-editor-transform-context'
import type { TiptapJSONNode } from './sanity-editor-prosemirror'

/**
 * Configuration for a **single** top-level TipTap block node mapped to one Portable Text
 * block object (or multiple blocks if you return more than one from `fromTiptapNode`).
 *
 * For list-like containers (e.g. task lists), use a `runContainer` {@link SanityEditorBlockExtension}
 * instead of this helper.
 */
export interface DefineSanityEditorBlockComponentOptions {
  /** Portable Text block object `_type` stored in your dataset */
  type: string
  /**
   * TipTap node type name(s) at the document root that this mapping handles
   * (e.g. `'callout'`).
   */
  tiptapNodeType: string | readonly string[]
  /** Optional fragment merged into the default schema (`blockObjects`, etc.) */
  schemaDefinition?: SchemaDefinition
  /** TipTap JSON node → Portable Text blocks */
  fromTiptapNode: (
    node: TiptapJSONNode,
    ctx: SanityEditorTransformContext,
  ) => PortableTextBlock[] | null
  /** One Portable Text block → TipTap JSON node */
  toTiptapNode: (
    block: PortableTextBlock,
    ctx: SanityEditorTransformContext,
  ) => TiptapJSONNode | null
}

/**
 * Wraps a single-node block mapping as a {@link SanityEditorSingleNodeBlockExtension}.
 * Pair with a TipTap `Node` extension and pass the result in `blockExtensions`.
 */
export function defineSanityEditorBlockComponent(
  options: DefineSanityEditorBlockComponentOptions,
): SanityEditorSingleNodeBlockExtension {
  const tiptapNodeTypes = Array.isArray(options.tiptapNodeType)
    ? [...options.tiptapNodeType]
    : [options.tiptapNodeType]

  return {
    type: options.type,
    mode: 'single',
    tiptapNodeTypes,
    schemaDefinition: options.schemaDefinition,
    fromTiptapNode: (node, ctx) =>
      options.fromTiptapNode(node as TiptapJSONNode, ctx),
    toTiptapNode: (block, ctx) => options.toTiptapNode(block, ctx),
  }
}
