import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/', '/about']
const AUTH_ROUTES = ['/auth/login', '/auth/register']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))
  const isDashboardRoute = pathname.startsWith('/dashboard')

  let user = null
  let authError = false

  // CRITICAL: Always try-catch getUser to handle invalid refresh tokens
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      // Handle auth errors: Invalid Refresh Token, JWT expired, etc.
      console.error('[Middleware] Auth error:', error.message, '| Status:', error.status)
      authError = true
      user = null
    } else {
      user = data.user
    }
  } catch (unexpectedError) {
    console.error('[Middleware] Unexpected auth error:', unexpectedError)
    authError = true
    user = null
  }

  // If there was an auth error, nuke all auth cookies and redirect to login
  if (authError) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('error', 'session_expired')

    const redirectResponse = NextResponse.redirect(redirectUrl)

    // Clear ALL Supabase auth cookies
    const allCookies = request.cookies.getAll()
    const authCookies = allCookies.filter(
      cookie =>
        cookie.name.startsWith('sb-') ||
        cookie.name.includes('supabase') ||
        cookie.name.includes('auth-token')
    )

    authCookies.forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, '', {
        maxAge: 0,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    })

    return redirectResponse
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  // Protect dashboard routes - redirect to login if not authenticated
  if (!user && isDashboardRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
