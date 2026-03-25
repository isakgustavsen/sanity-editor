import type { SchemaDefinition } from '@portabletext/schema'
import type { PortableTextBlock } from '@portabletext/types'

/**
 * User-extensible mapping between TipTap/ProseMirror JSON nodes and
 * Portable Text blocks.
 *
 * `type` refers to the Portable Text block `_type` produced/consumed by the
 * extension.
 */
export type PortableTextBlockExtension
  = PortableTextSingleNodeBlockExtension
    | PortableTextRunContainerBlockExtension

export interface PortableTextSingleNodeBlockExtension {
  /**
   * Portable Text block `_type` (e.g. `task`).
   * The editor will use this `_type` to route conversion.
   */
  type: string
  /**
   * Optional schema fragment that contributes `blockObjects` etc.
   */
  schemaDefinition?: SchemaDefinition

  mode: 'single'
  /**
   * TipTap/ProseMirror top-level node types that this extension can convert from.
   * Example: `['taskItem']`.
   */
  tiptapNodeTypes: string[]

  /**
   * Convert a TipTap/ProseMirror node into one or more Portable Text blocks.
   */
  fromTiptapNode: (node: unknown, ctx: unknown) => PortableTextBlock[] | null

  /**
   * Convert a single Portable Text block into a TipTap/ProseMirror node.
   */
  toTiptapNode: (block: PortableTextBlock, ctx: unknown) => unknown | null
}

export interface PortableTextRunContainerBlockExtension {
  /**
   * Portable Text block `_type` for each item in the run.
   * Example: each `task` item block corresponds to one `taskItem`.
   */
  type: string
  /**
   * Optional schema fragment that contributes `blockObjects` etc.
   */
  schemaDefinition?: SchemaDefinition

  mode: 'runContainer'
  /**
   * TipTap/ProseMirror container node type that holds the run items.
   * Example: `taskList`.
   */
  containerTiptapNodeType: string
  /**
   * TipTap/ProseMirror item node type inside the container.
   * Example: `taskItem`.
   */
  itemTiptapNodeType: string

  /**
   * Convert a container node into one or more Portable Text blocks (the run).
   */
  fromTiptapNode: (node: unknown, ctx: unknown) => PortableTextBlock[] | null

  /**
   * Convert a run of Portable Text blocks into a container node.
   *
   * `startIndex` points at the first block in the run.
   */
  toTiptapNodeRun: (
    blocks: PortableTextBlock[],
    startIndex: number,
    ctx: unknown,
  ) => { node: unknown, nextIndex: number } | null
}
