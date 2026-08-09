import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PROTECTED_PATHS = ['/dashboard', '/labs', '/practice', '/progress', '/settings', '/admin', '/preview', '/parent-dashboard', '/school-admin', '/partner-admin']
const AUTH_PATHS = ['/login', '/signup']

// Dedicated portal logins — school admins/franchise partners never touch
// the shared /login page. Both sit under an otherwise-protected prefix
// (/school-admin, /partner-admin), so they're carved out of the
// protected-prefix check below, and unauthenticated-vs-protected-path
// resolution is routed to the RIGHT login page, not the generic one.
const PORTAL_LOGIN_PATHS = ['/school-admin/login', '/partner-admin/login']

function loginPathFor(pathname: string): string {
  if (pathname.startsWith('/school-admin')) return '/school-admin/login'
  if (pathname.startsWith('/partner-admin')) return '/partner-admin/login'
  return '/login'
}

function portalHomeFor(pathname: string): string {
  return pathname.startsWith('/partner-admin') ? '/partner-admin' : '/school-admin'
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  const { response, user } = await updateSession(request)

  const isPortalLoginPage = PORTAL_LOGIN_PATHS.includes(pathname)
  const isProtected = !isPortalLoginPage && PROTECTED_PATHS.some((path) => pathname.startsWith(path))
  const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path))

  if (isProtected && !user) {
    const loginUrl = new URL(loginPathFor(pathname), request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Already signed in and revisiting a dedicated login page — bounce into
  // the portal itself; its own layout re-verifies the real role/tenant
  // type and redirects again if it doesn't actually match.
  if (isPortalLoginPage && user) {
    return NextResponse.redirect(new URL(portalHomeFor(pathname), request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
