import {
  addComponent,
  addImports,
  addPlugin,
  createResolver,
  defineNuxtModule,
  installModule,
} from '@nuxt/kit'
import type { Schema } from '@portabletext/schema'

export interface ModuleOptions {
  /** Optional compiled schema; defaults are applied in runtime utils */
  schema?: Schema
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'sanity-editor',
    configKey: 'sanityEditor',
  },
  defaults: {},
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    await installModule('nuxt-tiptap-editor', {}, nuxt)

    addComponent({
      name: 'SanityEditor',
      filePath: resolver.resolve('./runtime/components/SanityEditor.vue'),
    })

    addImports([
      {
        name: 'useSanityEditor',
        as: 'useSanityEditor',
        from: resolver.resolve('./runtime/composables/useSanityEditor'),
      },
      {
        name: 'sanityEditorProsemirrorJsonToBlocks',
        as: 'sanityEditorProsemirrorJsonToBlocks',
        from: resolver.resolve('./runtime/utils/sanity-editor-prosemirror'),
      },
      {
        name: 'sanityEditorBlocksToTiptapJson',
        as: 'sanityEditorBlocksToTiptapJson',
        from: resolver.resolve('./runtime/utils/sanity-editor-prosemirror'),
      },
      {
        name: 'sanityEditorDefaultCompiledSchema',
        as: 'sanityEditorDefaultCompiledSchema',
        from: resolver.resolve('./runtime/utils/default-sanity-editor-schema'),
      },
      {
        name: 'sanityEditorDefaultSchemaDefinition',
        as: 'sanityEditorDefaultSchemaDefinition',
        from: resolver.resolve('./runtime/utils/default-sanity-editor-schema'),
      },
      {
        name: 'createSanityEditorContext',
        as: 'createSanityEditorContext',
        from: resolver.resolve('./runtime/utils/create-sanity-editor-context'),
      },
    ])

    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})
