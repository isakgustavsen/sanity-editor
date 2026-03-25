import { compileSchema, defineSchema } from '@portabletext/schema'
import type { Schema } from '@portabletext/schema'

/**
 * Default block definition for standard body content (blog-style).
 * Matches TipTap StarterKit + Link features we map in the JSON transformers.
 */
export const sanityEditorDefaultSchemaDefinition = defineSchema({
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
  blockObjects: [{ name: 'horizontal-rule' }],
  inlineObjects: [],
})

export const sanityEditorDefaultCompiledSchema: Schema = compileSchema(
  sanityEditorDefaultSchemaDefinition,
)
