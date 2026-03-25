import type { Schema } from '@portabletext/schema'
import type { PortableTextBlockExtension } from '../types/portableTextBlockExtension'
import { defaultCompiledPortableTextSchema } from './default-portable-text-schema'
import type { PortableTextTransformContext } from './prosemirror-portable-text'

export interface CreatePortableTextContextOptions {
  /** Defaults to `defaultCompiledPortableTextSchema` */
  schema?: Schema
  keyGenerator?: () => string
  portableTextBlockExtensions?: PortableTextBlockExtension[]
}

/**
 * Builds a {@link PortableTextTransformContext} for `portableTextToTipTapJson` and
 * `prosemirrorJsonToPortableText` when you wire your own editor (e.g. Nuxt UI `UEditor`)
 * instead of `usePortableTextEditor`.
 */
export function createPortableTextContext(
  options: CreatePortableTextContextOptions = {},
): PortableTextTransformContext {
  return {
    schema: options.schema ?? defaultCompiledPortableTextSchema,
    keyGenerator: options.keyGenerator,
    portableTextBlockExtensions: options.portableTextBlockExtensions,
  }
}
