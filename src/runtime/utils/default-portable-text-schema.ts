import { compileSchema, defineSchema } from '@portabletext/schema'
import type { Schema } from '@portabletext/schema'

/**
 * Default Portable Text definition for standard block content (blog-style body).
 * Matches TipTap StarterKit + Link features we map in the JSON transformers.
 */
export const defaultPortableTextSchemaDefinition = defineSchema({
  styles: [
    { name: 'normal' },
    { name: 'h1' },
    { name: 'h2' },
    { name: 'h3' },
    { name: 'h4' },
    { name: 'h5' },
    { name: 'h6' },
    { name: 'blockquote' },
  ],
  lists: [{ name: 'bullet' }, { name: 'number' }],
  decorators: [
    { name: 'strong' },
    { name: 'em' },
    { name: 'strike-through' },
    { name: 'code' },
  ],
  annotations: [{ name: 'link', fields: [{ name: 'href', type: 'string' }] }],
  blockObjects: [],
  inlineObjects: [],
})

export const defaultCompiledPortableTextSchema: Schema = compileSchema(
  defaultPortableTextSchemaDefinition,
)
