import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { APP_DOMAIN_HEADER, resolveAppDomain, type AppDomain } from '@/lib/domains/appDomain'

const PROTECTED_PATHS = ['/dashboard', '/labs', '/practice', '/progress', '/settings', '/admin', '/preview', '/parent-dashboard', '/school-admin', '/partner-admin']
const AUTH_PATHS = ['/login', '/signup']

// Domain Split™ — checked independently of PROTECTED_PATHS/auth state,
// since /unified-quantum-session-preview is intentionally login-optional
// today (anonymous visitors already degrade gracefully there). Ordered
// most-specific-first: /labs/quantum-speed-reading/journey must be
// checked before the broader /labs/quantum-speed-reading catch-all.
const DOMAIN_ROUTES: { prefix: string; domain: AppDomain }[] = [
  // habit-only
  { prefix: '/labs/quantum-speed-reading/journey', domain: 'habit' },
  { prefix: '/unified-quantum-session-preview', domain: 'habit' },
  // app-only
  { prefix: '/preview', domain: 'app' },
  { prefix: '/parent-dashboard', domain: 'app' },
  { prefix: '/progress', domain: 'app' },
  { prefix: '/library', domain: 'app' },
  { prefix: '/masterclasses', domain: 'app' },
  { prefix: '/document-studio', domain: 'app' },
  { prefix: '/labs/visual-intelligence', domain: 'app' },
  { prefix: '/labs/quantum-speed-reading', domain: 'app' }, // catch-all, checked last
]

function domainGuardRedirect(appDomain: AppDomain, pathname: string, request: NextRequest): NextResponse | null {
  const match = DOMAIN_ROUTES.find((route) => pathname.startsWith(route.prefix))
  if (match && match.domain !== appDomain) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return null
}

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
  // Behind Vercel's edge network (or any reverse proxy), the `Host`
  // header on the request the middleware actually sees can be the
  // proxy's own internal routing host, not what the visitor typed —
  // `x-forwarded-host` preserves the original public-facing host.
  // Mirrors the exact same fallback appDomain.ts's own getRequestOrigin()
  // already uses, for the same reason.
  const appDomain = resolveAppDomain(request.headers.get('x-forwarded-host') ?? request.headers.get('host'))

  const { response: sessionResponse, user } = await updateSession(request)

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

  const domainRedirect = domainGuardRedirect(appDomain, pathname, request)
  if (domainRedirect) return domainRedirect

  // Forward the resolved domain to Server Components via `headers()` —
  // the officially documented pattern is cloning into a new Headers
  // instance and passing it to NextResponse.next({ request: { headers } }),
  // never mutating `request.headers` in place (undocumented behavior we
  // don't want this to depend on). Since this builds a NEW response
  // rather than reusing `sessionResponse`, updateSession's refreshed
  // Supabase auth cookies (the only thing it ever sets on its own
  // response — see lib/supabase/middleware.ts) are copied across
  // explicitly so a session refresh here is never silently dropped.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(APP_DOMAIN_HEADER, appDomain)
  const finalResponse = NextResponse.next({ request: { headers: requestHeaders } })
  sessionResponse.cookies.getAll().forEach((cookie) => finalResponse.cookies.set(cookie))

  return finalResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
