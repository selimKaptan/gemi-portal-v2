import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase client for Server Components, Server Actions, and Route Handlers.
 * Uses cookies() for session management (cookie-based auth).
 * 
 * IMPORTANT: This must be called inside a Server Component or Route Handler.
 * Never call this in Client Components.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

/**
 * Gets the current user session safely.
 * Returns null if no session or if session is invalid.
 * Never throws - always fails gracefully.
 */
export async function getUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('[Auth] getUser error:', error.message)
      return null
    }
    return user
  } catch (err) {
    console.error('[Auth] Unexpected error getting user:', err)
    return null
  }
}

/**
 * Gets the user's profile from the profiles table.
 * Returns null if profile doesn't exist or on any error.
 */
export async function getUserProfile(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('[Profile] Error fetching profile:', error.message)
      return null
    }
    return data
  } catch (err) {
    console.error('[Profile] Unexpected error:', err)
    return null
  }
}
