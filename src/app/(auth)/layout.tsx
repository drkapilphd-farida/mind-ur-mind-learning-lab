import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="bg-muted/40 flex min-h-screen flex-col">
      <header className="bg-background flex h-14 items-center border-b px-6">
        <Link href="/" className="font-semibold tracking-tight">
          Quantum Mind Learning Lab™
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  )
}
