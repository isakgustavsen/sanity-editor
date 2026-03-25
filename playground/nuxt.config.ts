import SanityEditor from '../src/module'

export default defineNuxtConfig({
  modules: [SanityEditor, '@nuxt/ui'],
  devtools: { enabled: true },
  css: ['~/assets/main.css'],
  compatibilityDate: 'latest',
  vite: {
    optimizeDeps: {
      include: [
        '@tiptap/extension-list',
        '@portabletext/schema',
        '@nuxt/ui > prosemirror-state',
        '@nuxt/ui > prosemirror-transform',
        '@nuxt/ui > prosemirror-model',
        '@nuxt/ui > prosemirror-view',
        '@nuxt/ui > prosemirror-gapcursor',
      ],
    },
  },
})
