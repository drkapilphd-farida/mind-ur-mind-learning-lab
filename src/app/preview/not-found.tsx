import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-5xl font-bold text-muted-foreground">404</p>
      <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button asChild className="mt-6">
        <Link href="/preview/dashboard">Go to dashboard</Link>
      </Button>
    </div>
  )
}
