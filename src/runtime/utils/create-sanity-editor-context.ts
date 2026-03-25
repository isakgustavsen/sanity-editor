import type { Schema } from '@portabletext/schema'
import type { SanityEditorBlockExtension } from '../types/sanityEditorBlockExtension'
import type { SanityEditorTransformContext } from './sanity-editor-prosemirror'
import { resolveSanityEditorCompiledSchema } from './resolve-sanity-editor-schema'

export interface CreateSanityEditorContextOptions {
  /**
   * Compiled schema; when omitted, defaults match {@link useSanityEditor}:
   * `sanityEditorDefaultCompiledSchema`, or merged + compiled when `blockExtensions` is non-empty.
   */
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
    schema: resolveSanityEditorCompiledSchema({
      schema: options.schema,
      blockExtensions: options.blockExtensions,
    }),
    keyGenerator: options.keyGenerator,
    blockExtensions: options.blockExtensions,
  }
}
