import type { Schema, SchemaDefinition } from '@portabletext/schema'
import { compileSchema } from '@portabletext/schema'
import type { SanityEditorBlockExtension } from '../types/sanityEditorBlockExtension'
import {
  sanityEditorDefaultCompiledSchema,
  sanityEditorDefaultSchemaDefinition,
} from './default-sanity-editor-schema'

function dedupeByName<T extends { name: string }>(items: T[]): T[] {
  const out: T[] = []
  const seen = new Set<string>()
  for (const i of items) {
    if (seen.has(i.name)) continue
    seen.add(i.name)
    out.push(i)
  }
  return out
}

/**
 * Merges Portable Text schema definition fragments (deduped by field `name`).
 * Use when composing `schemaDefinition` from several block extensions.
 */
export function mergeSchemaDefinitions(
  base: SchemaDefinition,
  additions: Array<SchemaDefinition | undefined>,
): SchemaDefinition {
  const add = additions.filter(Boolean) as SchemaDefinition[]
  return {
    styles: dedupeByName([...(base.styles ?? []), ...add.flatMap(s => s.styles ?? [])]),
    lists: dedupeByName([...(base.lists ?? []), ...add.flatMap(s => s.lists ?? [])]),
    decorators: dedupeByName([
      ...(base.decorators ?? []),
      ...add.flatMap(s => s.decorators ?? []),
    ]),
    annotations: dedupeByName([
      ...(base.annotations ?? []),
      ...add.flatMap(s => s.annotations ?? []),
    ]),
    blockObjects: dedupeByName([
      ...(base.blockObjects ?? []),
      ...add.flatMap(s => s.blockObjects ?? []),
    ]),
    inlineObjects: dedupeByName([
      ...(base.inlineObjects ?? []),
      ...add.flatMap(s => s.inlineObjects ?? []),
    ]),
  }
}

export interface ResolveSanityEditorCompiledSchemaOptions {
  /** When set, used as-is (no merge from `blockExtensions`). */
  schema?: Schema
  blockExtensions?: SanityEditorBlockExtension[]
}

/**
 * Resolves the compiled `@portabletext/schema` instance for an editor or transform context.
 * Matches {@link useSanityEditor}: explicit `schema` wins; otherwise merges default definition
 * with each extension’s `schemaDefinition` when `blockExtensions` is non-empty.
 */
export function resolveSanityEditorCompiledSchema(
  options: ResolveSanityEditorCompiledSchemaOptions = {},
): Schema {
  if (options.schema) return options.schema
  if (options.blockExtensions?.length) {
    return compileSchema(
      mergeSchemaDefinitions(
        sanityEditorDefaultSchemaDefinition as unknown as SchemaDefinition,
        options.blockExtensions.map(e => e.schemaDefinition),
      ),
    )
  }
  return sanityEditorDefaultCompiledSchema
}
