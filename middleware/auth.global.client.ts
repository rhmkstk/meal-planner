export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ['/login', '/register']

  if (publicRoutes.includes(to.path)) {
    return
  }

  const { initAuth, user, loading } = useSupabaseAuth()
  await initAuth()

  if (!loading.value && !user.value) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    })
  }
})
