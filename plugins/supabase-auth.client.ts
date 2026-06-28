export default defineNuxtPlugin(async () => {
  const { initAuth } = useSupabaseAuth()
  await initAuth()
})
