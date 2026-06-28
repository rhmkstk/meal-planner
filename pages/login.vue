<script setup lang="ts">
const route = useRoute()
const { signIn, user } = useSupabaseAuth()

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

watchEffect(() => {
  if (user.value) {
    navigateTo(String(route.query.redirect || '/'))
  }
})

async function submitLogin(): Promise<void> {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'E-posta ve sifre gerekli.'
    return
  }

  isSubmitting.value = true

  try {
    await signIn(email.value, password.value)
    await navigateTo(String(route.query.redirect || '/'))
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Giris yapilamadi.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="app-shell">
    <div class="page-container flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <UCard class="w-full max-w-md">
        <template #header>
          <div>
            <p class="section-title">
              Hesap
            </p>
            <h1 class="mt-1 text-2xl font-semibold text-meal-ink dark:text-white">
              Giris yap
            </h1>
            <p class="mt-2 text-sm text-meal-muted dark:text-alabaster_grey-700">
              Planlarini ve yemeklerini Supabase hesabindan yukle.
            </p>
          </div>
        </template>

        <form
          class="space-y-4"
          @submit.prevent="submitLogin"
        >
          <UAlert
            v-if="errorMessage"
            color="red"
            variant="soft"
            :title="errorMessage"
          />

          <label class="block space-y-2">
            <span class="text-sm font-medium text-meal-ink dark:text-white">E-posta</span>
            <UInput
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="ornek@mail.com"
            />
          </label>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-meal-ink dark:text-white">Sifre</span>
            <UInput
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
            />
          </label>

          <UButton
            block
            type="submit"
            color="primary"
            :loading="isSubmitting"
          >
            Giris Yap
          </UButton>
        </form>

        <template #footer>
          <p class="text-center text-sm text-meal-muted dark:text-alabaster_grey-700">
            Hesabin yok mu?
            <NuxtLink
              class="font-semibold text-pine_teal-600 hover:underline dark:text-mint_leaf-700"
              to="/register"
            >
              Kayit ol
            </NuxtLink>
          </p>
        </template>
      </UCard>
    </div>
  </main>
</template>
