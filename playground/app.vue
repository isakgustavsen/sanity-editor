<template>
  <div class="playground">
    <h1>Portable Text + TipTap</h1>
    <p class="hint">
      <code>PortableTextEditor</code> is a <code>.client.vue</code> component (no
      <code>ClientOnly</code> wrapper needed). TipTap uses
      <code>immediatelyRender: false</code> for Nuxt SSR.
    </p>

    <PortableTextEditor
      v-model="model"
      class="editor-root"
    />

    <h2>Portable Text (JSON)</h2>
    <pre class="json">{{ json }}</pre>
  </div>
</template>

<script setup lang="ts">
import type { PortableTextBlock } from '@portabletext/types'
import { computed, ref } from 'vue'

const model = ref<PortableTextBlock[]>([])

const json = computed(() => JSON.stringify(model.value, null, 2))
</script>

<style scoped>
.playground {
  max-width: 52rem;
  margin: 0 auto;
  padding: 1.5rem;
  font-family:
    system-ui,
    sans-serif;
}

.hint {
  color: #444;
  font-size: 0.9rem;
}

.editor-root {
  display: block;
}

.json {
  background: #f6f6f6;
  border-radius: 6px;
  padding: 1rem;
  overflow: auto;
  font-size: 0.8rem;
}
</style>
