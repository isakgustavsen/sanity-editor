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
  /** Optional compiled Portable Text schema; defaults are applied in runtime utils */
  schema?: Schema
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'sanity-editor',
    configKey: 'portableTextEditor',
  },
  defaults: {},
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    await installModule('nuxt-tiptap-editor', {}, nuxt)

    addComponent({
      name: 'PortableTextEditor',
      filePath: resolver.resolve('./runtime/components/PortableTextEditor.vue'),
    })

    addImports([
      {
        name: 'usePortableTextEditor',
        as: 'usePortableTextEditor',
        from: resolver.resolve('./runtime/composables/usePortableTextEditor'),
      },
      {
        name: 'prosemirrorJsonToPortableText',
        as: 'prosemirrorJsonToPortableText',
        from: resolver.resolve('./runtime/utils/prosemirror-portable-text'),
      },
      {
        name: 'portableTextToTipTapJson',
        as: 'portableTextToTipTapJson',
        from: resolver.resolve('./runtime/utils/prosemirror-portable-text'),
      },
      {
        name: 'defaultCompiledPortableTextSchema',
        as: 'defaultCompiledPortableTextSchema',
        from: resolver.resolve('./runtime/utils/default-portable-text-schema'),
      },
      {
        name: 'defaultPortableTextSchemaDefinition',
        as: 'defaultPortableTextSchemaDefinition',
        from: resolver.resolve('./runtime/utils/default-portable-text-schema'),
      },
      {
        name: 'createPortableTextContext',
        as: 'createPortableTextContext',
        from: resolver.resolve('./runtime/utils/create-portable-text-context'),
      },
    ])

    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})
