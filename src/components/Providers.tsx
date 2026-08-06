'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { useState } from 'react'

type ProvidersProps = {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps): React.JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  )

  return (
    // Required by nuqs (useQueryState/useQueryStates) anywhere in the
    // app — first real consumer is TenantsTableClient.tsx's URL-held
    // search/filter/sort state, per the constitution's own
    // nuqs-for-URL-state convention. Wraps everything else so any future
    // page can use nuqs without adding its own adapter.
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        {/* Real app-wide dark mode — the CSS tokens for it already existed
            (globals.css's `.dark` block, DESIGN_SYSTEM.md's own "dark mode is
            already fully token-complete, even though no UI toggle exists yet")
            with no way to actually turn it on until ThemeToggle. attribute="class"
            matches globals.css's `.dark` selector; RootLayout's <html> already
            has suppressHydrationWarning, next-themes' own documented
            requirement for this pattern. sonner.tsx's Toaster already called
            useTheme() expecting this provider to exist — this also fixes that
            previously-inert wiring, not just the new dashboard toggle. */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </NuqsAdapter>
  )
}
