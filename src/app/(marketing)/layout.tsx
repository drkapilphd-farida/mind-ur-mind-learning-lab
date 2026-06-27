import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background sticky top-0 z-40 flex h-14 items-center border-b px-6">
        <Link href="/" className="mr-6 text-sm font-semibold tracking-tight">
          Mind Ur Mind Learning Lab™
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/courses"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Courses
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user !== null ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-8 text-center">
        <p className="text-muted-foreground text-sm">
          © 2026 Mind Ur Mind Learning Lab™. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
