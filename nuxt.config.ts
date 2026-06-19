export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY
    }
  },
  compatibilityDate: '2026-06-06',
  devtools: { enabled: true },
  image: {
    domains: ['loremflickr.com']
  }
})
