import type { Schema } from '@portabletext/schema'

/**
 * Context passed to Portable Text ↔ TipTap JSON conversion and block extension callbacks.
 */
export interface SanityEditorTransformContext {
  schema: Schema
  /** Defaults to random base36 keys when omitted */
  keyGenerator?: () => string
  blockExtensions?: import('./sanityEditorBlockExtension').SanityEditorBlockExtension[]
}
