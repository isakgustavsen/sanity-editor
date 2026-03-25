import type { Schema } from '@portabletext/schema'
import type { SanityEditorBlockExtension } from '../types/sanityEditorBlockExtension'
import { sanityEditorDefaultCompiledSchema } from './default-sanity-editor-schema'
import type { SanityEditorTransformContext } from './sanity-editor-prosemirror'

export interface CreateSanityEditorContextOptions {
  /** Defaults to `sanityEditorDefaultCompiledSchema` */
  schema?: Schema
  keyGenerator?: () => string
  blockExtensions?: SanityEditorBlockExtension[]
}

/**
 * Builds a {@link SanityEditorTransformContext} for `sanityEditorBlocksToTiptapJson` and
 * `sanityEditorProsemirrorJsonToBlocks` when you wire your own editor (e.g. Nuxt UI `UEditor`)
 * instead of `useSanityEditor`.
 */
export function createSanityEditorContext(
  options: CreateSanityEditorContextOptions = {},
): SanityEditorTransformContext {
  return {
    schema: options.schema ?? sanityEditorDefaultCompiledSchema,
    keyGenerator: options.keyGenerator,
    blockExtensions: options.blockExtensions,
  }
}
