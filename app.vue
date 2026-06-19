<script setup lang="ts">
const route = useRoute()

const isPlansActive = computed(() => route.path === '/' || route.path.startsWith('/plans'))
const isFoodsActive = computed(() => route.path.startsWith('/foods'))
</script>

<template>
  <div class="app-shell min-h-screen pb-24 sm:pb-0">
    <header class="z-40 border-b border-meal-line bg-meal-paper/95 backdrop-blur dark:border-carbon_black-300 dark:bg-carbon_black-400/95 sm:sticky sm:top-0">
      <div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <NuxtLink
          to="/"
          class="inline-flex min-w-0 items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-mint_leaf-500"
          aria-label="Weakly Meal Planner ana sayfa"
        >
          <img
            src="/logo/WMP-logo.png"
            alt="Weakly Meal Planner"
            class="h-10 w-10 rounded-lg object-contain"
          >
          <span class="hidden truncate text-base font-semibold text-meal-ink dark:text-white md:inline">
            Weakly Meal Planner
          </span>
        </NuxtLink>

        <nav class="hidden items-center gap-1 sm:flex sm:gap-2">
          <NuxtLink
            to="/"
            :class="[
              'rounded-md px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mint_leaf-500',
              isPlansActive
                ? 'bg-mint_leaf-900 text-pine_teal-500 dark:bg-mint_leaf-100 dark:text-mint_leaf-900'
                : 'text-meal-muted hover:bg-alabaster_grey-900 hover:text-meal-ink dark:text-alabaster_grey-700 dark:hover:bg-carbon_black-300 dark:hover:text-white'
            ]"
          >
            Planlar
          </NuxtLink>
          <NuxtLink
            to="/foods"
            :class="[
              'rounded-md px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mint_leaf-500',
              isFoodsActive
                ? 'bg-mint_leaf-900 text-pine_teal-500 dark:bg-mint_leaf-100 dark:text-mint_leaf-900'
                : 'text-meal-muted hover:bg-alabaster_grey-900 hover:text-meal-ink dark:text-alabaster_grey-700 dark:hover:bg-carbon_black-300 dark:hover:text-white'
            ]"
          >
            Yemekler
          </NuxtLink>
        </nav>
      </div>
    </header>

    <NuxtPage />

    <nav class="fixed inset-x-0 bottom-0 z-50 border-t border-meal-line bg-meal-paper/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_28px_-24px_rgb(34_34_34_/_0.45)] backdrop-blur sm:hidden dark:border-carbon_black-300 dark:bg-carbon_black-400/95">
      <div class="grid w-full grid-cols-3 items-stretch">
        <NuxtLink
          to="/"
          :class="[
            'flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold transition focus:outline-none focus-visible:bg-mint_leaf-900 dark:focus-visible:bg-mint_leaf-100',
            isPlansActive
              ? 'bg-mint_leaf-500 text-pine_teal-100 dark:bg-mint_leaf-600 dark:text-carbon_black-100'
              : 'text-meal-muted hover:bg-alabaster_grey-900 hover:text-meal-ink dark:text-alabaster_grey-700 dark:hover:bg-carbon_black-300 dark:hover:text-white'
          ]"
          aria-label="Planlar"
        >
          <UIcon
            name="i-heroicons-calendar-days"
            class="h-5 w-5"
          />
          <span>Planlar</span>
        </NuxtLink>

        <UButton
          to="/?createPlan=1"
          color="primary"
          size="sm"
          square
          class="self-center justify-self-center flex h-11 w-11 items-center justify-center rounded-full p-0 shadow-sm"
          aria-label="Haftalık Plan Yap"
        >
          <UIcon
            name="i-heroicons-plus"
            class="mx-auto h-5 w-5"
          />
        </UButton>

        <NuxtLink
          to="/foods"
          :class="[
            'flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold transition focus:outline-none focus-visible:bg-mint_leaf-900 dark:focus-visible:bg-mint_leaf-100',
            isFoodsActive
              ? 'bg-mint_leaf-500 text-pine_teal-100 dark:bg-mint_leaf-600 dark:text-carbon_black-100'
              : 'text-meal-muted hover:bg-alabaster_grey-900 hover:text-meal-ink dark:text-alabaster_grey-700 dark:hover:bg-carbon_black-300 dark:hover:text-white'
          ]"
          aria-label="Yemekler"
        >
          <UIcon
            name="i-heroicons-book-open"
            class="h-5 w-5"
          />
          <span>Yemekler</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
