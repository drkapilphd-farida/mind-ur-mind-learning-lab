import type { NextConfig } from 'next'

// The Supabase project origin is read from the same env var the client
// SDK itself uses, so the CSP always matches whichever project a given
// deploy is actually wired to — never a hardcoded project ref that would
// silently go stale after a project change. Falls back to a same-origin-
// only policy (breaks nothing further than "no Supabase project
// configured" already would) if the var is ever unset at build time.
function supabaseOrigin(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (url === undefined || url === '') return null
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

// Content-Security-Policy — the one header this app didn't have.
// script-src/style-src keep 'unsafe-inline' rather than the stricter
// nonce-based pattern: a nonce has to be generated per-request in
// middleware.ts and threaded through, which is a cross-cutting change to
// a file with real, already-tested auth/redirect logic — out of scope
// for "update next.config.ts," and not worth the regression risk on an
// app this size without being asked for it specifically. Every other
// directive here IS strict: no third-party script/frame/object
// injection, connect-src pinned to real known origins only, no
// framing by another site. object-src/base-uri/form-action close off
// the classic CSP-bypass corners that 'unsafe-inline' alone doesn't
// protect against.
//
// Razorpay: no script is loaded client-side today (Subscribe buttons are
// plain <a> links to Razorpay's own hosted checkout — a full-page
// navigation needs no CSP allowance at all). The checkout.razorpay.com /
// api.razorpay.com / lumberjack.razorpay.com entries below are Razorpay's
// own documented requirements for their embeddable Checkout.js widget,
// added proactively so adopting that widget later doesn't require
// another CSP change.
//
// YouTube: the /reviews success-stories page embeds the real Success
// Stories playlist via youtube-nocookie.com's videoseries iframe — the
// privacy-enhanced embed domain YouTube itself documents for sites that
// don't want the embed to set cookies before playback starts.
function buildContentSecurityPolicy(): string {
  const isDev = process.env.NODE_ENV !== 'production'
  const supabase = supabaseOrigin()

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    // 'unsafe-eval' only in dev — Next.js's dev-mode HMR/source-map
    // pipeline needs it; the production bundle does not.
    'script-src': ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : []), 'https://checkout.razorpay.com'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', ...(supabase ? [supabase] : [])],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", ...(supabase ? [supabase, supabase.replace('https://', 'wss://')] : []), 'https://api.razorpay.com', 'https://lumberjack.razorpay.com'],
    'frame-src': ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com', 'https://www.youtube-nocookie.com'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'self'"],
  }

  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: buildContentSecurityPolicy() },
]

const nextConfig: NextConfig = {
  // pdfjs-dist (PDF text extraction, src/core/universal-learning-engine/
  // extraction/extractors/extractPDF.ts) optionally loads @napi-rs/canvas
  // at runtime — a native binary — as its Node.js polyfill source for
  // DOMMatrix/Path2D/ImageData (see node_modules/pdfjs-dist/legacy/build/
  // pdf.mjs's own `require("@napi-rs/canvas")` inside a try/catch). Left
  // to webpack's default bundling, that dynamic require of a native
  // module is exactly the pattern Vercel's serverless build can silently
  // fail to trace/include — present in local node_modules, missing from
  // the deployed function, producing "ReferenceError: DOMMatrix is not
  // defined" only in production. `serverExternalPackages` is Next.js's
  // documented fix for native-binary/Node-API dependencies: it opts these
  // packages out of webpack bundling entirely (real `require()` against
  // node_modules at runtime instead), which is what lets Vercel's own
  // file-tracing correctly find and include the native binary.
  serverExternalPackages: ['pdfjs-dist', '@napi-rs/canvas'],

  // Belt-and-suspenders alongside serverExternalPackages above:
  // serverExternalPackages controls webpack bundling behavior, but
  // Vercel's separate file-tracing step (deciding which node_modules
  // files actually ship with the deployed function) can still miss a
  // native `.node` binary reached only through a dynamic `require()` a
  // few layers down (pdfjs-dist → @napi-rs/canvas). This forces it in
  // explicitly for the one route that needs it, rather than trusting
  // tracing heuristics for a dependency this deep.
  outputFileTracingIncludes: {
    '/api/quantum-documents/transform': ['./node_modules/@napi-rs/canvas*/**/*'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // @supabase/supabase-js reads process.version for internal version detection.
  // Defining it as an empty string in Edge Runtime builds eliminates the non-fatal
  // "Node.js API used in Edge Runtime" warning without affecting functionality.
  webpack(config, { nextRuntime, webpack }) {
    if (nextRuntime === 'edge') {
      config.plugins = [
        ...(config.plugins ?? []),
        new webpack.DefinePlugin({ 'process.version': JSON.stringify('') }),
      ]
    }
    return config
  },
}

export default nextConfig
