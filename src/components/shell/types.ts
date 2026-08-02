import type { ShellIconName } from './iconRegistry'

// `icon` is a serializable string key, not a component reference — nav
// items are authored in a plain data module (e.g. app/preview/navConfig.ts)
// that a Server Component layout imports and passes down as a prop to
// the 'use client' AppShell/ShellNavLinks. Passing an actual component
// reference (a function) across that server→client boundary as a prop
// is a hard React Server Components error ("Functions cannot be passed
// directly to Client Components"); a string key sidesteps it entirely —
// the actual icon component is resolved from `iconRegistry` only inside
// client code (see ShellNavLinks.tsx).
export type ShellNavItem = {
  href: string
  label: string
  icon: ShellIconName
}
