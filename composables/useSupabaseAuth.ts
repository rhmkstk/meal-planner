import type { Session, User } from '@supabase/supabase-js'

const authInitialized = ref(false)

export function useSupabaseAuth() {
  const user = useState<User | null>('supabase-user', () => null)
  const session = useState<Session | null>('supabase-session', () => null)
  const loading = useState<boolean>('supabase-auth-loading', () => true)

  async function ensureProfile(currentUser: User): Promise<void> {
    const supabase = useSupabaseClient()

    await supabase
      .from('profiles')
      .upsert({
        id: currentUser.id,
        email: currentUser.email,
        updated_at: new Date().toISOString()
      })
  }

  async function initAuth(): Promise<void> {
    const supabase = useSupabaseClient()

    if (authInitialized.value) {
      return
    }

    authInitialized.value = true
    loading.value = true

    const { data } = await supabase.auth.getSession()
    session.value = data.session
    user.value = data.session?.user ?? null

    if (user.value) {
      await ensureProfile(user.value)
    }

    loading.value = false

    supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      session.value = nextSession
      user.value = nextSession?.user ?? null

      if (user.value) {
        await ensureProfile(user.value)
      }
    })
  }

  async function signIn(email: string, password: string): Promise<void> {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      throw error
    }

    session.value = data.session
    user.value = data.user

    if (data.user) {
      await ensureProfile(data.user)
    }
  }

  async function signUp(email: string, password: string): Promise<void> {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      throw error
    }

    session.value = data.session
    user.value = data.user

    if (data.user) {
      await ensureProfile(data.user)
    }
  }

  async function signOut(): Promise<void> {
    const supabase = useSupabaseClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    session.value = null
    user.value = null
    await navigateTo('/login')
  }

  return {
    user,
    session,
    loading,
    initAuth,
    signIn,
    signUp,
    signOut
  }
}
