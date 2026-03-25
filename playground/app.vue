<template>
  <UApp>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header class="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div class="mx-auto flex h-14 max-w-4xl items-center gap-6 px-6">
          <span class="text-sm font-semibold text-gray-900 dark:text-white">sanity-editor</span>
          <nav class="flex gap-1">
            <UButton
              as-child
              color="neutral"
              variant="ghost"
              size="sm"
            >
              <NuxtLink
                to="/"
                exact-active-class="bg-gray-100 dark:bg-gray-800"
              >
                Unstyled
              </NuxtLink>
            </UButton>
            <UButton
              as-child
              color="neutral"
              variant="ghost"
              size="sm"
            >
              <NuxtLink
                to="/u-editor"
                exact-active-class="bg-gray-100 dark:bg-gray-800"
              >
                UEditor
              </NuxtLink>
            </UButton>
          </nav>
        </div>
      </header>
      <main class="mx-auto max-w-4xl px-6 py-8">
        <NuxtPage />
      </main>
    </div>
  </UApp>
</template>
