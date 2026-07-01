<script setup lang="ts">
const route = useRoute()
const { signUp, user } = useSupabaseAuth()

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

watchEffect(() => {
  if (user.value) {
    navigateTo(String(route.query.redirect || '/'))
  }
})

async function submitRegister(): Promise<void> {
  errorMessage.value = ''

  if (!email.value || password.value.length < 6) {
    errorMessage.value = 'E-posta ve en az 6 karakterli sifre gerekli.'
    return
  }

  isSubmitting.value = true

  try {
    await signUp(email.value, password.value)
    await navigateTo(String(route.query.redirect || '/'))
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Kayit olusturulamadi.'
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
              Kayit ol
            </h1>
            <p class="mt-2 text-sm text-meal-muted dark:text-alabaster_grey-700">
              Kendi yemeklerini ve haftalik planlarini kaydetmeye başla.
            </p>
          </div>
        </template>

        <form
          class="space-y-4"
          @submit.prevent="submitRegister"
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
              autocomplete="new-password"
              placeholder="En az 6 karakter"
            />
          </label>

          <UButton
            block
            type="submit"
            color="primary"
            :loading="isSubmitting"
          >
            Kayit Ol
          </UButton>
        </form>

        <template #footer>
          <p class="text-center text-sm text-meal-muted dark:text-alabaster_grey-700">
            Zaten hesabin var mi?
            <NuxtLink
              class="font-semibold text-pine_teal-600 hover:underline dark:text-mint_leaf-700"
              to="/login"
            >
              Giris yap
            </NuxtLink>
          </p>
        </template>
      </UCard>
    </div>
  </main>
</template>
