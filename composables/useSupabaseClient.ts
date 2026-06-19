import { createClient } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createClient> | null = null

export function useSupabaseClient() {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = config.public.supabaseKey

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase runtime config is missing. Check SUPABASE_URL and SUPABASE_KEY.')
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseKey)
  }

  return supabaseClient
}
