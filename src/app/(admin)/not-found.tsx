import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-muted-foreground text-5xl font-bold">404</p>
      <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground mt-2 max-w-xs text-sm">
        This admin page doesn&apos;t exist or has been moved.
      </p>
      <Button asChild className="mt-6">
        <Link href="/admin">Back to admin overview</Link>
      </Button>
    </div>
  )
}
