import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes
  const protectedPaths = ['/dashboard', '/onboarding', '/minority-report', '/maestro', '/planner', '/settings', '/admin', '/ideas', '/piezas', '/arbol', '/espejo', '/rutas', '/piramide', '/tour', '/entrevistador', '/reto']
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // Pages that bypass access control (user can see them even if blocked)
  const accessControlBypass = ['/cuenta-bloqueada', '/settings']
  const isBypassed = accessControlBypass.some(path => request.nextUrl.pathname.startsWith(path))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/acceso-buena-vida'
    return NextResponse.redirect(url)
  }

  // Access control: check is_active and expires_at for authenticated users on protected routes
  if (isProtected && user && !isBypassed) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_active, expires_at, role')
      .eq('id', user.id)
      .single()

    if (profile) {
      // Admin always passes
      if (profile.role === 'admin') {
        return supabaseResponse
      }

      // Check if account is deactivated
      if (profile.is_active === false) {
        const url = request.nextUrl.clone()
        url.pathname = '/cuenta-bloqueada'
        url.searchParams.set('reason', 'inactive')
        return NextResponse.redirect(url)
      }

      // Check if access has expired
      if (profile.expires_at && new Date(profile.expires_at) < new Date()) {
        const url = request.nextUrl.clone()
        url.pathname = '/cuenta-bloqueada'
        url.searchParams.set('reason', 'expired')
        return NextResponse.redirect(url)
      }
    }
  }

  // Redirect old /login to home
  if (request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users from acceso page to dashboard
  if (request.nextUrl.pathname === '/acceso-buena-vida' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
