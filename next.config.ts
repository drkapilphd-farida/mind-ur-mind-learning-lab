import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
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
