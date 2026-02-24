import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Profile } from '@/types'

/**
 * Creates an untyped Supabase client for Server Components, Server Actions, and Route Handlers.
 * Use explicit `as TypeName` casts on query results for type safety.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — safe to ignore
          }
        },
      },
    }
  )
}

/**
 * Gets the current authenticated user safely. Returns null if invalid.
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
 * Gets the user's profile from the profiles table. Returns null on any error.
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
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
    return data as Profile
  } catch (err) {
    console.error('[Profile] Unexpected error:', err)
    return null
  }
}
