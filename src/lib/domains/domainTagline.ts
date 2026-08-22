import type { AppDomain } from './appDomain'

// Deliberately its own module, separate from appDomain.ts — that file has
// a module-scope `import { headers } from 'next/headers'`, which Next.js
// forbids in any module a Client Component imports a real (non-type)
// export from, even an export that itself never touches headers(). Topbar.tsx
// is 'use client' and needs this function, so it has to live somewhere
// `next/headers`-free. Pure and synchronous — safe from both Server and
// Client Components alike.
//
// Single source of truth for the subtitle shown next to the "Quantum
// Mind" wordmark across dashboard chrome, auth pages, and the legacy
// marketing chrome — never invented separately per call site.
export function getDomainTagline(appDomain: AppDomain): string {
  return appDomain === 'habit' ? 'Quantum Mindset & Habit Builder™' : 'AI Reading & Document Intelligence™'
}
