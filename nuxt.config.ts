export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Weakly Meal Planner',
      htmlAttrs: {
        lang: 'tr'
      },
      meta: [
        { name: 'description', content: 'Haftalik yemek planlarini, tarifleri ve alisveris listelerini yonetin.' },
        { name: 'application-name', content: 'Weakly Meal Planner' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'Weakly Meal Planner' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'theme-color', content: '#29b592', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#082b24', media: '(prefers-color-scheme: dark)' }
      ],
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/icon-32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/icons/apple-touch-icon.png' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY
    }
  },
  nitro: {
    serveStatic: 'inline'
  },
  compatibilityDate: '2026-06-06',
  devtools: { enabled: true },
  image: {
    domains: ['loremflickr.com']
  }
})
