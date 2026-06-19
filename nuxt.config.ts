export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2026-06-06',
  devtools: { enabled: true },
  image: {
    domains: ['loremflickr.com']
  }
})
